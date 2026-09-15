#!/usr/bin/env python3
"""Deterministic contract preflight for Almsby AI runs."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    print("BLOCKED: PyYAML is required by contract preflight", file=sys.stderr)
    raise SystemExit(2)

EXPECTED_CONTRACTS = {
    "design_brief", "definition_of_done", "review_rubric",
    "agent_capability_matrix", "change_impact_protocol", "contract_versioning",
}
MANIFEST_SCHEMA = "1.0"
RUN_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
MARKDOWN_VERSION_RE = re.compile(
    r"(?im)^\s*\*\*Schema version:\*\*\s*[\"'`]?([^\"'`\n#]+)"
)

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def extract_version(path: Path, source: str) -> str | None:
    text = path.read_text(encoding="utf-8")
    if source == "schema_version":
        try:
            data = yaml.safe_load(text)
        except yaml.YAMLError:
            data = None
        if isinstance(data, dict) and isinstance(data.get("schema_version"), (str, int, float)):
            return str(data["schema_version"])
        match = MARKDOWN_VERSION_RE.search(text)
        return match.group(1).strip() if match else None
    match = re.search(
        rf"(?im)^\s*\*\*{re.escape(source).replace('_', '[_ ]')}:\*\*\s*[\"'`]?([^\"'`\n#]+)",
        text,
    )
    return match.group(1).strip() if match else None

def load_manifest(path: Path) -> dict:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        raise RuntimeError(f"invalid contract manifest YAML: {exc}") from exc
    if not isinstance(data, dict) or data.get("schema_version") != MANIFEST_SCHEMA:
        raise RuntimeError(
            f"unsupported .ai contract manifest schema: "
            f"{data.get('schema_version') if isinstance(data, dict) else None!r}; expected {MANIFEST_SCHEMA}"
        )
    contracts = data.get("contracts")
    if not isinstance(contracts, dict):
        raise RuntimeError("manifest contracts must be a mapping")
    missing = sorted(EXPECTED_CONTRACTS - set(contracts))
    if missing:
        raise RuntimeError("manifest missing required contract declarations: " + ", ".join(missing))
    for name, rec in contracts.items():
        if not isinstance(rec, dict):
            raise RuntimeError(f"manifest contract {name!r} must be a mapping")
        rel = rec.get("file")
        if not isinstance(rel, str) or not rel.startswith("guidelines/contracts/"):
            raise RuntimeError(f"unsafe contract path for {name}: {rel!r}")
        candidate = Path(rel)
        if candidate.is_absolute() or ".." in candidate.parts:
            raise RuntimeError(f"unsafe contract path for {name}: {rel!r}")
        source = rec.get("version_source", "schema_version")
        if not isinstance(source, str) or not source:
            raise RuntimeError(f"invalid version_source for {name}")
    return {"schema_version": MANIFEST_SCHEMA, "contracts": contracts}

def to_yaml(obj, indent=0):
    out = []
    pad = " " * indent
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                out.append(f"{pad}{k}:")
                out.append(to_yaml(v, indent + 2))
            else:
                out.append(f"{pad}{k}: {json.dumps(v)}")
    elif isinstance(obj, list):
        for v in obj:
            if isinstance(v, dict):
                items = list(v.items())
                for i, (k, x) in enumerate(items):
                    prefix = f"{pad}- " if i == 0 else f"{pad}  "
                    if isinstance(x, (dict, list)):
                        out.append(f"{prefix}{k}:")
                        out.append(to_yaml(x, indent + 4))
                    else:
                        out.append(f"{prefix}{k}: {json.dumps(x)}")
            else:
                out.append(f"{pad}- {json.dumps(v)}")
    return "\n".join(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", default=".")
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--task", required=True)
    ap.add_argument("--objective", default="")
    args = ap.parse_args()

    if not RUN_ID_RE.fullmatch(args.run_id):
        raise SystemExit("BLOCKED: invalid run-id")

    root = Path(args.repo_root).resolve()
    ai = root / ".ai"
    guidelines = root / "guidelines"
    manifest_path = ai / "contracts" / "manifest.yaml"
    if not manifest_path.is_file():
        raise SystemExit("BLOCKED: .ai/contracts/manifest.yaml is missing")
    if not (guidelines / "contracts").is_dir():
        raise SystemExit("BLOCKED: guidelines/contracts is missing")

    manifest = load_manifest(manifest_path)
    records = []
    for name, rec in manifest["contracts"].items():
        rel = rec["file"]
        p = root / rel
        if not p.is_file():
            raise SystemExit(f"BLOCKED: required contract missing: {rel}")
        version = extract_version(p, rec["version_source"])
        if not version:
            raise SystemExit(f"BLOCKED: {rel} has no {rec['version_source']}")
        records.append((name, rel, version, sha256(p)))

    run = ai / "runs" / args.run_id
    if run.exists():
        raise SystemExit(f"BLOCKED: run already exists: {args.run_id}")
    run.mkdir(parents=True)

    now = utc_now()
    preflight = run / "contract-preflight.md"
    lines = [
        "# Contract Preflight", "", f"- Run: `{args.run_id}`", f"- Created: `{now}`",
        "- Result: `PASS`", "", "## Task", "", args.task, "",
        "## Objective", "", args.objective or "(not separately supplied)",
        "", "## Pinned contracts", "", "| Contract | Source | Version | SHA-256 |",
        "|---|---|---|---|",
    ]
    for name, rel, version, digest in records:
        lines.append(f"| `{name}` | `{rel}` | `{version}` | `{digest}` |")
    lines += [
        "", "## Automatic checks", "",
        "- Contract manifest exists and has supported schema 1.0.",
        "- Every required contract declaration is present and safely mapped.",
        "- Every required contract exists and exposes its declared version.",
        "- Contract content hashes were recorded to detect mid-run drift.",
        "", "## PM-owned decisions not automated here", "",
        "- Applicability of each contract requirement.",
        "- Change-impact level and rationale.",
        "- Product/UX/engineering source-of-truth selection beyond the contract set.",
        "- Delegation and escalation decisions.", "",
    ]
    preflight.write_text("\n".join(lines), encoding="utf-8")

    context = {
        "schema_version": "1.0",
        "run_id": args.run_id,
        "generated_at": now,
        "task": args.task,
        "objective": args.objective,
        "manifest_schema_version": manifest["schema_version"],
        "contracts": {
            n: {"path": rel, "version": version, "sha256": digest}
            for n, rel, version, digest in records
        },
        "next_pm_actions": [
            "Determine applicability; unknown is not equivalent to not_applicable.",
            "Classify change impact using change-impact-protocol.md.",
            "Derive required artifacts/evidence from design-brief and definition-of-done.",
            "Validate planned delegation against agent-capability-matrix.yaml.",
            "Record all decisions in project.yaml before substantive delegation.",
        ],
    }

    bundle = [
        "# PM Contract Bundle", "", f"Run: `{args.run_id}`", f"Generated: `{now}`", "",
        "Generated startup snapshot. The canonical source remains the repository file named in each section.",
        "",
    ]
    for name, rel, version, digest in records:
        bundle += [
            f"## CONTRACT: {name}", "", f"Source: `{rel}`", f"Version: `{version}`",
            f"SHA-256: `{digest}`", "", "```source",
        ]
        bundle += (root / rel).read_text(encoding="utf-8").splitlines()
        bundle += ["```", ""]

    (run / "pm-contract-bundle.md").write_text("\n".join(bundle), encoding="utf-8")
    context["pm_contract_bundle"] = str((run / "pm-contract-bundle.md").relative_to(root))
    (run / "pm-context.json").write_text(json.dumps(context, indent=2) + "\n", encoding="utf-8")

    pm = [
        "# PM Preflight Context", "", f"Run: `{args.run_id}`",
        f"Task: {args.task}", "",
        "Deterministic preflight PASSed. Use the generated bundle as startup context;",
        "authoritative repository files remain canonical.", "",
        f"Contract bundle: `{run.relative_to(root) / 'pm-contract-bundle.md'}`", "",
    ]
    for name, rel, version, digest in records:
        pm.append(f"- `{name}` — `{rel}` — version `{version}` — sha256 `{digest}`")
    pm += [
        "", "## Required PM sequence",
        "1. Determine applicability.",
        "2. Classify impact.",
        "3. Derive required artifacts/evidence.",
        "4. Validate delegation authority.",
        "5. Persist state before delegation.",
        "6. Escalate conflicts or uncertainty beyond authority.", "",
    ]
    (run / "pm-context.md").write_text("\n".join(pm), encoding="utf-8")

    state = {
        "schemaVersion": "1.2",
        "id": args.run_id,
        "objective": args.objective or args.task,
        "status": "planning",
        "phase": "preflight",
        "createdAt": now,
        "lastHeartbeatAt": now,
        "lastMeaningfulProgressAt": now,
        "contracts": {
            "manifestVersion": manifest["schema_version"],
            "pinned": {n: version for n, _, version, _ in records},
            "hashes": {n: digest for n, _, _, digest in records},
            "applicability": {n: "unknown" for n, _, _, _ in records},
        },
        "impact": {"level": None, "rationale": "", "changed_surfaces": []},
        "applicability": {
            "ui_or_ux_changes": "unknown",
            "code_changes": "unknown",
            "physical_scan": "unknown",
            "i18n": "unknown",
            "compliance": "unknown",
        },
        "tasks": [],
        "artifacts": {
            "contract-preflight.md": {
                "status": "verified",
                "required": True,
                "path": str(preflight.relative_to(root)),
                "owner": "runtime",
            }
        },
        "decisions": [],
        "evidence": [],
        "approval": {"required": True, "status": "pending"},
        "attempts": {},
        "browserVerification": {
            "requiredScenarios": [],
            "status": "not_required",
            "lastValidationReport": None,
        },
    }
    (run / "project.yaml").write_text(to_yaml(state) + "\n", encoding="utf-8")
    print(json.dumps({
        "result": "PASS", "run_id": args.run_id,
        "run_dir": str(run), "pm_context": str(run / "pm-context.md"),
    }, indent=2))

if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, ValueError) as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        sys.exit(2)
