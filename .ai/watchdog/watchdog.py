#!/usr/bin/env python3
"""Deterministic watchdog for Almsby AI runs.

The watchdog verifies machine-observable run integrity and evidence. It never
makes semantic product decisions and never mutates project.yaml.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover
    print("ERROR: PyYAML is required by the Almsby watchdog", file=sys.stderr)
    raise SystemExit(4)

SCHEMA_VERSION = "1.0"
EVENTS = "watchdog-events.jsonl"
CHECKPOINT = "watchdog-checkpoint.json"
REPORT_JSON = "watchdog.json"
REPORT_YAML = "watchdog.yaml"
CONFIG_COPY = "watchdog-config.yaml"

EXIT_PASS = 0
EXIT_BLOCKED = 2
EXIT_USAGE = 3
EXIT_INTERNAL = 4


def now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_time(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        v = value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(v)
        if dt.tzinfo is None:
            return None
        return dt.astimezone(timezone.utc)
    except ValueError:
        return None


def load_yaml(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def write_yaml(path: Path, data: Any) -> None:
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def run_dir(repo: Path, run_id: str) -> Path:
    # Run IDs are intentionally constrained to avoid traversal.
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", run_id):
        raise ValueError("invalid run-id")
    return repo / ".ai" / "runs" / run_id


def load_state(run: Path) -> dict[str, Any]:
    p = run / "project.yaml"
    if not p.is_file():
        raise ValueError(f"missing state: {p}")
    data = load_yaml(p)
    if not isinstance(data, dict):
        raise ValueError("project.yaml must contain a mapping")
    return data


def load_watchdog_config(repo: Path, run: Path) -> dict[str, Any]:
    source = repo / ".ai" / "watchdog" / "config.yaml"
    local = run / CONFIG_COPY
    if local.exists():
        cfg = load_yaml(local)
    else:
        if not source.is_file():
            raise ValueError(f"missing watchdog config: {source}")
        cfg = load_yaml(source)
        write_yaml(local, cfg)
    if not isinstance(cfg, dict) or cfg.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("unsupported watchdog config schema")
    return cfg


def append_event(run: Path, event_type: str, agent: str, **extra: Any) -> None:
    record = {"at": iso(now()), "eventType": event_type, "agent": agent}
    record.update(extra)
    with (run / EVENTS).open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, sort_keys=True) + "\n")


def load_events(run: Path) -> list[dict[str, Any]]:
    p = run / EVENTS
    if not p.exists():
        return []
    result = []
    for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as e:
            raise ValueError(f"malformed watchdog event line {i}: {e}")
        if not isinstance(item, dict):
            raise ValueError(f"watchdog event line {i} must be an object")
        result.append(item)
    return result


def safe_path(run: Path, raw: Any) -> Path | None:
    if not isinstance(raw, str) or not raw:
        return None
    candidate = (run / raw).resolve()
    try:
        candidate.relative_to(run.resolve())
    except ValueError:
        return None
    return candidate


def check_state_shape(state: dict[str, Any], run_id: str, config: dict[str, Any]) -> list[dict[str, Any]]:
    checks = []
    def add(cid, status, message, **extra):
        checks.append({"id": cid, "status": status, "message": message, **extra})

    required = ["schemaVersion", "id", "objective", "status", "phase", "contracts", "tasks", "artifacts", "decisions"]
    missing = [k for k in required if k not in state]
    add("state.required_fields", "PASS" if not missing else "BLOCKED",
        "required state fields present" if not missing else f"missing fields: {', '.join(missing)}")
    if missing:
        return checks

    if state.get("id") != run_id:
        add("state.run_id", "BLOCKED", f"state id {state.get('id')!r} does not match run {run_id!r}")
    else:
        add("state.run_id", "PASS", "run id matches")

    statuses = {"planning", "in_progress", "ready_for_review", "approved", "blocked", "cancelled"}
    phases = {"preflight", "planning", "designing", "implementing", "verifying", "critiquing", "recovering", "human_review"}
    if state.get("status") not in statuses:
        add("state.status", "BLOCKED", f"illegal status: {state.get('status')!r}")
    else:
        add("state.status", "PASS", f"status={state['status']}")
    if state.get("phase") not in phases:
        add("state.phase", "BLOCKED", f"illegal phase: {state.get('phase')!r}")
    else:
        add("state.phase", "PASS", f"phase={state['phase']}")

    contracts = state.get("contracts")
    if not isinstance(contracts, dict) or not isinstance(contracts.get("hashes", {}), dict):
        add("state.contracts", "BLOCKED", "contract hash map is missing or malformed")
    else:
        add("state.contracts", "PASS", "contract hash map is present")

    if not isinstance(state.get("tasks"), list) or not isinstance(state.get("artifacts"), dict) or not isinstance(state.get("decisions"), list):
        add("state.collections", "BLOCKED", "tasks/artifacts/decisions have invalid types")
    else:
        add("state.collections", "PASS", "tasks/artifacts/decisions have valid container types")

    applicability = state.get("applicability")
    if not isinstance(applicability, dict):
        add("state.applicability", "UNKNOWN", "PM has not recorded semantic applicability decisions")
    else:
        expected = config.get("applicability_fields", {})
        missing_app = [k for k in expected if k not in applicability]
        bad_app = [k for k, v in applicability.items() if v not in (True, False, "unknown")]
        if missing_app:
            add("state.applicability", "UNKNOWN", f"missing applicability decisions: {', '.join(missing_app)}")
        elif bad_app:
            add("state.applicability", "BLOCKED", f"invalid applicability values: {', '.join(bad_app)}")
        else:
            add("state.applicability", "PASS", "applicability decisions are explicit")

    for field in ("createdAt", "lastHeartbeatAt", "lastMeaningfulProgressAt"):
        if field in state:
            dt = parse_time(state[field])
            if not dt:
                add(f"state.timestamp.{field}", "BLOCKED", f"invalid timestamp in {field}")
            else:
                future = (dt - now()).total_seconds()
                if future > float(config.get("clock_skew_seconds", 120)):
                    add(f"state.timestamp.{field}", "BLOCKED", f"{field} is too far in the future")
                else:
                    add(f"state.timestamp.{field}", "PASS", f"{field} is parseable")
    if "createdAt" in state and "lastMeaningfulProgressAt" in state:
        a, b = parse_time(state["createdAt"]), parse_time(state["lastMeaningfulProgressAt"])
        if a and b and b < a:
            add("state.progress_order", "BLOCKED", "meaningful progress predates run creation")
        else:
            add("state.progress_order", "PASS", "progress ordering is sane")

    attempts = state.get("attempts", {})
    if not isinstance(attempts, dict) or any(not isinstance(v, int) or isinstance(v, bool) or v < 0 for v in attempts.values()):
        add("state.attempts", "BLOCKED", "attempt counters must be non-negative integers")
    else:
        add("state.attempts", "PASS", "attempt counters are valid")

    return checks


def load_transition_config(repo: Path) -> dict[str, Any]:
    return load_yaml(repo / ".ai" / "watchdog" / "state-transition.yaml")


def check_transition(run: Path, state: dict[str, Any], transitions: dict[str, Any]) -> dict[str, Any]:
    cp_path = run / CHECKPOINT
    current = {"status": state.get("status"), "phase": state.get("phase"), "stateHash": sha256(run / "project.yaml")}
    if not cp_path.exists():
        cp_path.write_text(json.dumps(current, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        return {"id": "transition.initial", "status": "PASS", "message": "initial state checkpoint created"}
    previous = json.loads(cp_path.read_text(encoding="utf-8"))
    ps, cs = previous.get("status"), current.get("status")
    allowed = transitions.get("transitions", {}).get(ps, [])
    if ps != cs and cs not in allowed:
        return {"id": "transition.status", "status": "BLOCKED", "message": f"illegal observed status transition: {ps} -> {cs}"}

    phase_order = transitions.get("phase_order", [])
    pp, cp = previous.get("phase"), current.get("phase")
    if pp != cp:
        if cp == "recovering" or pp == "recovering":
            pass
        elif pp in phase_order and cp in phase_order:
            pi, ci = phase_order.index(pp), phase_order.index(cp)
            if ci < pi or ci > pi + 1:
                return {"id": "transition.phase", "status": "BLOCKED", "message": f"illegal observed phase jump: {pp} -> {cp}"}
        else:
            return {"id": "transition.phase", "status": "BLOCKED", "message": f"unknown observed phase transition: {pp} -> {cp}"}
    cp_path.write_text(json.dumps(current, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return {"id": "transition.observed", "status": "PASS", "message": f"observed state transition is legal: {ps}/{pp} -> {cs}/{cp}"}


def check_activity(state: dict[str, Any], events: list[dict[str, Any]], config: dict[str, Any]) -> list[dict[str, Any]]:
    checks = []
    t = now()
    hb = parse_time(state.get("lastHeartbeatAt"))
    prog = parse_time(state.get("lastMeaningfulProgressAt"))
    if hb is None:
        checks.append({"id": "activity.heartbeat", "status": "UNKNOWN", "message": "no valid lastHeartbeatAt in state"})
    else:
        age = (t - hb).total_seconds()
        limit = int(config.get("heartbeat_timeout_seconds", 900))
        status = "PASS" if age <= limit else "BLOCKED"
        checks.append({"id": "activity.heartbeat", "status": status, "message": f"heartbeat age={int(age)}s limit={limit}s"})
    if prog is None:
        checks.append({"id": "activity.progress", "status": "UNKNOWN", "message": "no valid lastMeaningfulProgressAt in state"})
    else:
        age = (t - prog).total_seconds()
        limit = int(config.get("progress_timeout_seconds", 1800))
        status = "PASS" if age <= limit else "BLOCKED"
        checks.append({"id": "activity.progress", "status": status, "message": f"meaningful-progress age={int(age)}s limit={limit}s"})

    if events:
        bad = [i + 1 for i, e in enumerate(events) if not parse_time(e.get("at")) or not e.get("eventType")]
        checks.append({"id": "activity.event_ledger", "status": "BLOCKED" if bad else "PASS", "message": "event ledger is structurally valid" if not bad else f"malformed event lines: {bad}"})
    else:
        checks.append({"id": "activity.event_ledger", "status": "UNKNOWN", "message": "no watchdog event ledger exists"})
    return checks


def check_artifacts(repo: Path, run: Path, state: dict[str, Any], artifact_map: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
    checks = []
    artifacts = state.get("artifacts", {})
    evidence_ids = {r.get("id") for r in state.get("evidence", []) if isinstance(r, dict)}
    if not isinstance(artifacts, dict):
        return [{"id": "artifacts.state", "status": "BLOCKED", "message": "artifacts must be a mapping"}]

    required_ids = []
    for name, record in artifacts.items():
        if isinstance(record, dict) and record.get("required") is True:
            required_ids.append(name)

    # The PM must make applicability explicit, but the authoritative artifact map
    # determines which baseline artifact names are expected for that applicability.
    applicability = state.get("applicability", {}) if isinstance(state.get("applicability"), dict) else {}
    expected = set()
    amap = artifact_map.get("artifact_map", {}) if isinstance(artifact_map, dict) else {}
    expected.update(amap.get("planning", {}).get("required", []))
    if applicability.get("ui_or_ux_changes") is True:
        expected.update(amap.get("design", {}).get("required_when_ui_or_ux_changes", []))
        expected.update(amap.get("verification", {}).get("required_for_ui_work", []))
    if applicability.get("code_changes") is True:
        expected.update(amap.get("implementation", {}).get("required_when_code_changes", []))
    if applicability.get("physical_scan") is True:
        expected.add("physical-scan-evidence.yaml")
    if applicability.get("i18n") is True:
        expected.add("i18n-evidence.yaml")
    if applicability.get("compliance") is True:
        expected.add("compliance-evidence.yaml")
    if state.get("status") in {"ready_for_review", "approved"} or state.get("phase") in {"critiquing", "human_review"}:
        expected.update(amap.get("review", {}).get("required", []))
        expected.update(amap.get("completion", {}).get("required", []))

    for name in sorted(expected):
        rec = artifacts.get(name)
        if not isinstance(rec, dict) or rec.get("required") is not True:
            checks.append({"id": f"artifact.required.{name}", "status": "BLOCKED", "message": f"baseline-required artifact {name} is not explicitly required by PM state"})

    status_bad = {"unknown", "failed", "blocked"}
    for name, record in artifacts.items():
        if not isinstance(record, dict):
            checks.append({"id": f"artifact.{name}", "status": "BLOCKED", "message": "artifact record must be a mapping"})
            continue
        path = safe_path(run, record.get("path")) if record.get("path") else None
        if record.get("path") and path is None:
            checks.append({"id": f"artifact.{name}.path", "status": "BLOCKED", "message": "artifact path escapes the run directory"})
        elif record.get("path") and not path.exists():
            checks.append({"id": f"artifact.{name}.exists", "status": "BLOCKED" if record.get("required") else "WARN", "message": "declared artifact path does not exist"})
        elif record.get("status") in status_bad:
            checks.append({"id": f"artifact.{name}.status", "status": "BLOCKED" if record.get("required") else "WARN", "message": f"artifact status={record.get('status')}"})
        elif record.get("status") == "verified" and not record.get("evidence") and record.get("required"):
            checks.append({"id": f"artifact.{name}.evidence", "status": "BLOCKED", "message": "verified required artifact has no evidence references"})
        elif record.get("required") and record.get("evidence") and any(e not in evidence_ids for e in record.get("evidence", [])):
            missing_evidence = [e for e in record.get("evidence", []) if e not in evidence_ids]
            checks.append({"id": f"artifact.{name}.evidence", "status": "BLOCKED", "message": f"artifact references missing evidence ids: {missing_evidence}"})
        else:
            checks.append({"id": f"artifact.{name}", "status": "PASS", "message": f"artifact {name} is structurally valid"})

    return checks


def check_evidence(run: Path, state: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
    checks = []
    evidence = state.get("evidence", [])
    if evidence is None:
        evidence = []
    if not isinstance(evidence, list):
        return [{"id": "evidence.container", "status": "BLOCKED", "message": "state.evidence must be an array"}]

    seen = set()
    for idx, rec in enumerate(evidence):
        cid = f"evidence.{idx}"
        if not isinstance(rec, dict):
            checks.append({"id": cid, "status": "BLOCKED", "message": "evidence record must be an object"})
            continue
        missing = [k for k in ["id", "kind", "status", "createdAt", "producer", "method", "result", "requirement"] if not rec.get(k)]
        if missing:
            checks.append({"id": cid, "status": "BLOCKED", "message": f"missing evidence fields: {', '.join(missing)}"})
            continue
        if rec["id"] in seen:
            checks.append({"id": cid, "status": "BLOCKED", "message": f"duplicate evidence id: {rec['id']}"})
            continue
        seen.add(rec["id"])
        created = parse_time(rec["createdAt"])
        if not created:
            checks.append({"id": cid, "status": "BLOCKED", "message": "invalid evidence timestamp"})
            continue
        if rec["status"] == "passed":
            age = (now() - created).total_seconds()
            max_age = int(config.get("artifact_evidence_max_age_seconds", 2592000))
            if age > max_age:
                checks.append({"id": cid + ".freshness", "status": "BLOCKED", "message": f"passed evidence is stale: age={int(age)}s limit={max_age}s"})
                continue
            path_raw = rec.get("path")
            if not path_raw and not config.get("external_evidence_allowed", False):
                checks.append({"id": cid, "status": "BLOCKED", "message": "passed evidence has no local path and external evidence is disabled"})
                continue
            if path_raw:
                p = safe_path(run, path_raw)
                if p is None or not p.exists():
                    checks.append({"id": cid, "status": "BLOCKED", "message": "passed evidence references a missing/out-of-run file"})
                    continue
        checks.append({"id": cid, "status": "PASS" if rec["status"] == "passed" else "WARN", "message": f"evidence status={rec['status']}"})
    return checks


def check_contracts(repo: Path, run: Path) -> dict[str, Any]:
    script = repo / ".ai" / "runtime" / "verify_contract_pin.py"
    if not script.is_file():
        return {"id": "contracts.pin", "status": "BLOCKED", "message": "contract pin verifier is missing"}
    proc = subprocess.run([sys.executable, str(script), "--repo-root", str(repo), "--run-id", run.name], capture_output=True, text=True)
    out = (proc.stdout + proc.stderr).strip().replace("\n", " | ")
    return {"id": "contracts.pin", "status": "PASS" if proc.returncode == 0 else "BLOCKED", "message": out or f"pin verifier exit={proc.returncode}"}


def overall(checks: list[dict[str, Any]]) -> str:
    if any(c["status"] == "BLOCKED" for c in checks):
        return "BLOCKED"
    if any(c["status"] == "UNKNOWN" for c in checks):
        return "UNKNOWN"
    if any(c["status"] == "WARN" for c in checks):
        return "WARN"
    return "PASS"


def init_run(repo: Path, run_id: str) -> int:
    run = run_dir(repo, run_id)
    run.mkdir(parents=True, exist_ok=True)
    cfg = load_watchdog_config(repo, run)
    state = load_state(run)
    if not (run / EVENTS).exists():
        (run / EVENTS).write_text("", encoding="utf-8")
    created_checkpoint = not (run / CHECKPOINT).exists()
    if created_checkpoint:
        current = {"status": state.get("status"), "phase": state.get("phase"), "stateHash": sha256(run / "project.yaml")}
        (run / CHECKPOINT).write_text(json.dumps(current, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        append_event(run, "watchdog_initialized", "watchdog", stateHash=sha256(run / "project.yaml"), configSchema=cfg.get("schema_version"))
    print(f"WATCHDOG_INITIALIZED={run}")
    return EXIT_PASS


def heartbeat(repo: Path, run_id: str, agent: str, meaningful: bool, reason: str | None) -> int:
    run = run_dir(repo, run_id)
    state = load_state(run)
    timestamp = iso(now())
    if meaningful:
        append_event(run, "meaningful_progress", agent, reason=reason or "unspecified", stateHash=sha256(run / "project.yaml"))
    else:
        append_event(run, "heartbeat", agent, reason=reason or "heartbeat")
    # State timestamps are updated by the host/runner, not by the watchdog.
    print(f"EVENT_RECORDED={timestamp}")
    return EXIT_PASS


def check(repo: Path, run_id: str) -> int:
    run = run_dir(repo, run_id)
    cfg = load_watchdog_config(repo, run)
    state = load_state(run)
    artifact_map = load_yaml(repo / ".ai" / "contracts" / "artifact-map.yaml")
    transitions = load_transition_config(repo)
    events = load_events(run)

    checks = check_state_shape(state, run_id, cfg)
    checks.append(check_transition(run, state, transitions))
    checks.extend(check_activity(state, events, cfg))
    checks.extend(check_artifacts(repo, run, state, artifact_map, cfg))
    checks.extend(check_evidence(run, state, cfg))
    checks.append(check_contracts(repo, run))

    result = overall(checks)
    report = {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "checkedAt": iso(now()),
        "overall": result,
        "checks": checks,
        "escalation": {
            "required": result in {"BLOCKED", "UNKNOWN"},
            "reason": "deterministic watchdog checks did not establish a safe state" if result in {"BLOCKED", "UNKNOWN"} else None,
        },
    }
    (run / REPORT_JSON).write_text(json.dumps(report, indent=2, sort_keys=False) + "\n", encoding="utf-8")
    write_yaml(run / REPORT_YAML, report)
    print(f"WATCHDOG_RESULT={result}")
    for c in checks:
        if c["status"] in {"BLOCKED", "UNKNOWN", "WARN"}:
            print(f"{c['status']}: {c['id']}: {c['message']}")
    return EXIT_PASS if result in {"PASS", "WARN"} else EXIT_BLOCKED


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Almsby deterministic run watchdog")
    sub = p.add_subparsers(dest="command", required=True)
    for name in ("init", "heartbeat", "progress", "check"):
        sp = sub.add_parser(name)
        sp.add_argument("--repo-root", required=True)
        sp.add_argument("--run-id", required=True)
        if name in {"heartbeat", "progress"}:
            sp.add_argument("--agent", required=True)
            sp.add_argument("--reason")
    return p


def main() -> int:
    try:
        args = parser().parse_args()
        repo = Path(args.repo_root).resolve()
        if args.command == "init":
            return init_run(repo, args.run_id)
        if args.command == "heartbeat":
            return heartbeat(repo, args.run_id, args.agent, False, args.reason)
        if args.command == "progress":
            return heartbeat(repo, args.run_id, args.agent, True, args.reason)
        return check(repo, args.run_id)
    except ValueError as e:
        print(f"BLOCKED: {e}", file=sys.stderr)
        return EXIT_BLOCKED
    except FileNotFoundError as e:
        print(f"BLOCKED: missing required file: {e}", file=sys.stderr)
        return EXIT_BLOCKED
    except Exception as e:
        print(f"INTERNAL WATCHDOG ERROR: {type(e).__name__}: {e}", file=sys.stderr)
        return EXIT_INTERNAL


if __name__ == "__main__":
    raise SystemExit(main())
