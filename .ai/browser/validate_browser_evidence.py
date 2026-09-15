#!/usr/bin/env python3
"""Deterministic Step 14 browser-evidence validator.

The validator verifies browser evidence; it never runs the browser and never
judges UX/visual quality. It fails closed when required evidence is absent,
ambiguous, stale, malformed, or attributed to another run.
"""
from __future__ import annotations
import argparse, json, sys
from datetime import datetime, timezone
from pathlib import Path
import yaml

VALID_RESULTS = {"passed", "failed", "blocked", "unknown"}
SCHEMA_VERSION = "1.0"
REQUIRED_KEYS = {
    "schema_version", "run_id", "scenario_id", "provider", "route",
    "viewport", "started_at", "finished_at", "result", "artifacts", "assertions",
}
REQUIRED_ARTIFACT_KINDS = {
    "render": {"screenshot"},
    "primary-interaction": set(),
    "accessibility": set(),
    "responsive-mobile": {"screenshot"},
    "responsive-desktop": {"screenshot"},
    "error-state": {"screenshot"},
    "empty-state": {"screenshot"},
    "i18n": {"screenshot"},
}

def parse_time(value):
    if not isinstance(value, str) or not value:
        return None
    try:
        value = value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(value)
        if dt.tzinfo is None:
            return None
        return dt.astimezone(timezone.utc)
    except ValueError:
        return None

def load_json(p):
    with p.open(encoding="utf-8") as f:
        return json.load(f)

def safe_target(run: Path, rel: str) -> Path | None:
    if not isinstance(rel, str) or not rel:
        return None
    try:
        target = (run / rel).resolve()
        target.relative_to(run.resolve())
        return target
    except ValueError:
        return None

def load_catalog(run: Path):
    catalog_path = run.parents[2] / ".ai" / "browser" / "scenarios.yaml"
    if not catalog_path.is_file():
        return None, f"scenario catalog missing: {catalog_path}"
    try:
        with catalog_path.open(encoding="utf-8") as f:
            data = yaml.safe_load(f)
    except Exception as exc:
        return None, f"invalid scenario catalog: {exc}"
    if not isinstance(data, dict) or data.get("schema_version") != SCHEMA_VERSION:
        return None, "unsupported scenario catalog schema"
    catalog = data.get("scenario_catalog")
    if not isinstance(catalog, dict):
        return None, "scenario catalog has no scenario_catalog mapping"
    return catalog, None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", required=True)
    ap.add_argument("--required", nargs="*", default=None)
    ap.add_argument("--output")
    a = ap.parse_args()

    run = Path(a.run).resolve()
    errors, warnings, scenarios = [], [], []
    if not run.exists():
        errors.append("run directory does not exist")
    catalog, catalog_error = load_catalog(run) if run.exists() else (None, None)
    if catalog_error:
        errors.append(catalog_error)
        catalog = {}

    required = a.required
    if required is None:
        state_path = run / "project.yaml"
        if state_path.is_file():
            try:
                with state_path.open(encoding="utf-8") as f:
                    state = yaml.safe_load(f) or {}
                required = ((state.get("browserVerification") or {}).get("requiredScenarios") or [])
            except Exception as exc:
                errors.append(f"cannot read browserVerification.requiredScenarios: {exc}")
                required = []
        else:
            errors.append("project.yaml is missing; required browser scenarios cannot be established")
            required = []

    if len(set(required)) != len(required):
        errors.append("duplicate required scenario declaration")
    unknown_required = sorted(set(required) - set(catalog))
    for sid in unknown_required:
        errors.append(f"required scenario is not catalogued: {sid}")

    config_path = run.parents[2] / ".ai" / "browser" / "config.yaml"
    try:
        with config_path.open(encoding="utf-8") as f:
            browser_config = yaml.safe_load(f) or {}
        max_age = int(((browser_config.get("freshness") or {}).get("max_age_seconds", 86400)))
        require_current_run = bool(((browser_config.get("freshness") or {}).get("require_current_run", True)))
    except Exception as exc:
        errors.append(f"invalid browser config: {exc}")
        max_age = 86400
        require_current_run = True

    root = run / "evidence" / "browser"
    if not root.exists():
        errors.append("browser evidence directory missing")

    records = []
    if root.exists():
        for p in sorted(root.rglob("*.json")):
            try:
                d = load_json(p)
            except Exception as exc:
                errors.append(f"invalid JSON: {p.relative_to(run)}: {exc}")
                continue
            missing = REQUIRED_KEYS - set(d)
            if missing:
                errors.append(f"missing required keys: {p.relative_to(run)}: {sorted(missing)}")
                continue
            if d.get("schema_version") != SCHEMA_VERSION:
                errors.append(f"unsupported evidence schema: {p.relative_to(run)}")
            if d.get("run_id") != run.name:
                errors.append(f"run_id mismatch: {p.relative_to(run)}")
            sid = d.get("scenario_id")
            if sid not in catalog:
                errors.append(f"scenario is not catalogued: {p.relative_to(run)} -> {sid}")
            if d.get("provider") != "playwright":
                warnings.append(f"non-standard browser provider: {p.relative_to(run)} -> {d.get('provider')}")
            if not isinstance(d.get("route"), str) or not d["route"].startswith("/"):
                errors.append(f"invalid route: {p.relative_to(run)}")
            vp = d.get("viewport", {})
            if not isinstance(vp, dict) or not isinstance(vp.get("width"), int) or not isinstance(vp.get("height"), int) or vp["width"] < 1 or vp["height"] < 1:
                errors.append(f"invalid viewport: {p.relative_to(run)}")
            started, finished = parse_time(d["started_at"]), parse_time(d["finished_at"])
            if not started or not finished:
                errors.append(f"invalid timestamps: {p.relative_to(run)}")
            elif finished < started:
                errors.append(f"finish precedes start: {p.relative_to(run)}")
            elif finished > datetime.now(timezone.utc):
                errors.append(f"finished_at is in the future: {p.relative_to(run)}")

            artifacts = d.get("artifacts")
            assertions = d.get("assertions")
            if not isinstance(artifacts, list) or not isinstance(assertions, list):
                errors.append(f"artifacts/assertions must be arrays: {p.relative_to(run)}")
                artifacts, assertions = [], []

            kinds = set()
            for art in artifacts:
                if not isinstance(art, dict) or not art.get("kind") or not art.get("path"):
                    errors.append(f"malformed artifact entry: {p.relative_to(run)}")
                    continue
                kinds.add(art["kind"])
                target = safe_target(run, art["path"])
                if target is None:
                    errors.append(f"artifact escapes run: {p.relative_to(run)} -> {art.get('path')}")
                elif not target.is_file():
                    errors.append(f"missing/non-file artifact: {p.relative_to(run)} -> {art.get('path')}")
                elif target.stat().st_size < 1:
                    errors.append(f"empty artifact: {p.relative_to(run)} -> {art.get('path')}")

            assertion_results = []
            for assertion in assertions:
                if not isinstance(assertion, dict) or not assertion.get("id") or assertion.get("result") not in {"passed", "failed", "unknown"}:
                    errors.append(f"malformed assertion entry: {p.relative_to(run)}")
                else:
                    assertion_results.append(assertion["result"])

            if d.get("result") == "passed" and any(r != "passed" for r in assertion_results):
                errors.append(f"scenario marked passed with non-passing assertion: {p.relative_to(run)}")

            # A passed scenario must have at least one independently meaningful
            # assertion; otherwise "passed" can become a vacuous claim.
            if d.get("result") == "passed" and not assertion_results:
                errors.append(f"passed scenario has no assertions: {p.relative_to(run)}")

            expected_kinds = REQUIRED_ARTIFACT_KINDS.get(sid, set())
            missing_kinds = expected_kinds - kinds
            if d.get("result") == "passed" and missing_kinds:
                errors.append(f"passed scenario missing artifact kinds {sorted(missing_kinds)}: {p.relative_to(run)}")

            records.append((p, d))

    by = {}
    for p, d in records:
        by.setdefault(d.get("scenario_id"), []).append((p, d))

    # Determine the run creation time from project.yaml when available.
    state_path = run / "project.yaml"
    run_created = None
    if state_path.is_file():
        try:
            with state_path.open(encoding="utf-8") as f:
                state = yaml.safe_load(f) or {}
            run_created = parse_time(state.get("createdAt"))
        except Exception as exc:
            errors.append(f"cannot parse run createdAt: {exc}")

    for p, d in records:
        started = parse_time(d.get("started_at"))
        if require_current_run and run_created and started and started < run_created:
            errors.append(f"browser evidence predates run creation: {p.relative_to(run)}")
        age = (datetime.now(timezone.utc) - parse_time(d["finished_at"])).total_seconds() if parse_time(d.get("finished_at")) else None
        if age is not None and age > max_age:
            errors.append(f"browser evidence is stale (>{max_age}s): {p.relative_to(run)}")

    for sid in required:
        if sid not in catalog:
            scenarios.append({"id": sid, "status": "invalid"})
            continue
        rs = by.get(sid, [])
        if not rs:
            errors.append(f"required scenario missing: {sid}")
            scenarios.append({"id": sid, "status": "missing"})
            continue
        if len(rs) == 1:
            d = rs[0][1]
            if d.get("result") != "passed":
                errors.append(f"required scenario not passed: {sid}")
                scenarios.append({"id": sid, "status": d.get("result")})
            else:
                scenarios.append({"id": sid, "status": "passed", "records": 1})
            continue

        selected = [(p, d) for p, d in rs if d.get("selected") is True]
        if len(selected) != 1:
            errors.append(f"scenario has multiple records without exactly one selected final result: {sid}")
            scenarios.append({"id": sid, "status": "ambiguous", "records": len(rs)})
            continue
        d = selected[0][1]
        if d.get("result") != "passed":
            errors.append(f"selected final scenario result is not passed: {sid}")
            scenarios.append({"id": sid, "status": d.get("result"), "records": len(rs)})
        else:
            scenarios.append({"id": sid, "status": "passed", "records": len(rs)})

    status = "BLOCKED" if errors else ("WARN" if warnings else "PASS")
    report = {
        "schema_version": SCHEMA_VERSION,
        "run_id": run.name,
        "status": status,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "required_scenarios": required,
        "scenarios": scenarios,
        "errors": errors,
        "warnings": warnings,
    }
    out = Path(a.output) if a.output else run / "browser-validation-report.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(status)
    for e in errors:
        print(f"ERROR: {e}")
    return 0 if status == "PASS" else 2

if __name__ == "__main__":
    sys.exit(main())
