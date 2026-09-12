#!/usr/bin/env python3
"""Deterministic contract preflight for Almsby AI runs.

Creates a run directory, validates the Step 11 contract wiring, pins contract
versions and SHA-256 hashes, and emits a compact PM context bundle.

This script deliberately does NOT decide product applicability or impact level.
Those are PM decisions. It only makes the authoritative inputs available and
fails closed when the contract system itself is unusable.
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys
from datetime import datetime, timezone
from pathlib import Path

EXPECTED_CONTRACTS = {
    "design_brief", "definition_of_done", "review_rubric",
    "agent_capability_matrix", "change_impact_protocol", "contract_versioning"
}

def utc_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def scalar(text: str, key: str) -> str | None:
    m = re.search(rf"(?im)^(?:\s*{re.escape(key).replace("_", "[_ ]")}:|\s*\*\*{re.escape(key).replace("_", "[_ ]")}:\*\*)\s*[\"']?([^\"'\n#]+?)[\"']?\s*$", text)
    return m.group(1).strip().strip("`") if m else None

def load_manifest(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    version = scalar(text, "schema_version")
    if version != "1.0":
        raise RuntimeError(f"Unsupported .ai contract manifest schema: {version!r}; expected 1.0")
    pattern = re.compile(
        r"(?ms)^  ([a-z0-9_]+):\n    file: \"([^\"]+)\"\n    version_source: \"([^\"]+)\""
    )
    contracts = {name: {"file": rel, "version_source": source} for name, rel, source in pattern.findall(text)}
    missing = sorted(EXPECTED_CONTRACTS - set(contracts))
    if missing:
        raise RuntimeError("Manifest missing required contract declarations: " + ", ".join(missing))
    for name, rec in contracts.items():
        rel = rec["file"]
        if not rel.startswith("guidelines/contracts/") or ".." in Path(rel).parts or Path(rel).is_absolute():
            raise RuntimeError(f"Unsafe contract path for {name}: {rel!r}")
    return {"schema_version": version, "contracts": contracts}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", default=".")
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--task", required=True)
    ap.add_argument("--objective", default="")
    args = ap.parse_args()
    root = Path(args.repo_root).resolve()
    ai = root / ".ai"
    guidelines = root / "guidelines"
    manifest_path = ai / "contracts/manifest.yaml"
    if not manifest_path.exists():
        raise SystemExit("BLOCKED: .ai/contracts/manifest.yaml is missing")
    if not (guidelines / "contracts").is_dir():
        raise SystemExit("BLOCKED: guidelines/contracts is missing")
    manifest = load_manifest(manifest_path)

    run = ai / "runs" / args.run_id
    run.mkdir(parents=True, exist_ok=False)
    versions = {}
    hashes = {}
    records = []
    for name, rec in manifest["contracts"].items():
        rel = rec["file"]
        version_key = rec["version_source"]
        p = root / rel
        if not p.exists():
            raise SystemExit(f"BLOCKED: required contract missing: {rel}")
        text = p.read_text(encoding="utf-8")
        ver = scalar(text, version_key)
        if not ver:
            raise SystemExit(f"BLOCKED: {rel} has no {version_key}")
        versions[name] = ver
        hashes[name] = sha256(p)
        records.append((name, rel, ver, hashes[name]))

    now = utc_now()
    preflight = run / "contract-preflight.md"
    lines = [
        "# Contract Preflight", "", f"- Run: `{args.run_id}`", f"- Created: `{now}`",
        "- Result: `PASS`", "", "## Task", "", args.task, "", "## Objective", "", args.objective or "(not separately supplied)",
        "", "## Pinned contracts", "", "| Contract | Source | Version | SHA-256 |", "|---|---|---|---|"
    ]
    for n, rel, ver, digest in records:
        lines.append(f"| `{n}` | `{rel}` | `{ver}` | `{digest}` |")
    lines += ["", "## Automatic checks", "", "- Contract manifest exists and has supported schema 1.0.",
              "- Every manifest contract maps to the expected authoritative file.",
              "- Every required contract exists and exposes its declared version field.",
              "- Contract content hashes were recorded to detect mid-run drift.",
              "", "## PM-owned decisions not automated here", "",
              "- Applicability of each contract requirement to this task.",
              "- Change-impact level and rationale.",
              "- Product/UX/engineering source-of-truth selection beyond the contract set.",
              "- Delegation and escalation decisions.", ""]
    preflight.write_text("\n".join(lines), encoding="utf-8")

    context = {
        "schema_version": "1.0",
        "run_id": args.run_id,
        "generated_at": now,
        "task": args.task,
        "objective": args.objective,
        "manifest_schema_version": manifest["schema_version"],
        "contracts": {n: {"path": rel, "version": ver, "sha256": digest} for n, rel, ver, digest in records},
        "next_pm_actions": [
            "Determine applicability; unknown is not equivalent to not_applicable.",
            "Classify change impact using change-impact-protocol.md.",
            "Derive required artifacts/evidence from design-brief and definition-of-done.",
            "Validate planned delegation against agent-capability-matrix.yaml.",
            "Record all decisions in project.yaml before substantive delegation.",
        ],
    }
    (run / "pm-context.json").write_text(json.dumps(context, indent=2) + "\n", encoding="utf-8")

    bundle = ["# PM Contract Bundle", "", f"Run: `{args.run_id}`", f"Generated: `{now}`", "",
              "This is a generated execution artifact. The canonical source remains the file shown in each contract header.",
              "The PM may use this bundle as startup context, but repository files remain authoritative if a discrepancy is detected.", ""]
    for name, rel, ver, digest in records:
        bundle += [f"## CONTRACT: {name}", "", f"Source: `{rel}`", f"Version: `{ver}`", f"SHA-256: `{digest}`", "", "```source"]
        bundle += (root / rel).read_text(encoding="utf-8").splitlines()
        bundle += ["```", ""]
    (run / "pm-contract-bundle.md").write_text("\n".join(bundle), encoding="utf-8")

    context["pm_contract_bundle"] = str((run / "pm-contract-bundle.md").relative_to(root))
    (run / "pm-context.json").write_text(json.dumps(context, indent=2) + "\n", encoding="utf-8")

    pm = ["# PM Preflight Context", "", f"Run: `{args.run_id}`", f"Task: {args.task}", "",
          "The deterministic preflight has PASSed. Startup context includes the generated `pm-contract-bundle.md`. Treat it as a convenience snapshot; the authoritative repository files remain canonical.", "", f"Contract bundle: `{run.relative_to(root) / 'pm-contract-bundle.md'}`", ""]
    for n, rel, ver, digest in records:
        pm.append(f"- `{n}` — `{rel}` — version `{ver}` — sha256 `{digest}`")
    pm += ["", "## Required PM sequence", "1. Determine applicability.", "2. Classify impact.",
           "3. Derive required artifacts/evidence.", "4. Validate delegation authority.",
           "5. Persist state before delegation.", "6. Escalate any conflict or uncertainty that exceeds authority.", ""]
    (run / "pm-context.md").write_text("\n".join(pm), encoding="utf-8")

    state = {
        "schemaVersion": "1.1", "id": args.run_id, "objective": args.objective or args.task,
        "status": "planning", "phase": "preflight",
        "contracts": {"manifestVersion": manifest["schema_version"], "pinned": versions,
                      "hashes": hashes, "applicability": {n: "unknown" for n in versions}},
        "impact": {"level": None, "rationale": "", "changed_surfaces": []},
        "tasks": [], "artifacts": {"contract-preflight.md": {"status": "verified", "path": str(preflight.relative_to(root)), "evidence": ["deterministic preflight"], "owner": "runtime"}},
        "decisions": [], "approval": {"required": True, "status": "pending"},
        "lastMeaningfulProgressAt": now, "attempts": {}
    }
    (run / "project.yaml").write_text(to_yaml(state), encoding="utf-8")
    print(json.dumps({"result":"PASS","run_id":args.run_id,"run_dir":str(run),"pm_context":str(run/'pm-context.md')}, indent=2))

def q(s):
    if s is None: return 'null'
    if isinstance(s, bool): return 'true' if s else 'false'
    if isinstance(s, (int,float)): return str(s)
    return json.dumps(s)

def to_yaml(obj, indent=0):
    # Tiny deterministic YAML emitter for this controlled state structure.
    out=[]; pad=' '*indent
    if isinstance(obj, dict):
        for k,v in obj.items():
            if isinstance(v, (dict,list)):
                out.append(f"{pad}{k}:")
                out.append(to_yaml(v, indent+2))
            else: out.append(f"{pad}{k}: {q(v)}")
    elif isinstance(obj,list):
        for v in obj:
            if isinstance(v,dict):
                first=True
                for k,x in v.items():
                    if first:
                        out.append(f"{pad}- {k}: {q(x) if not isinstance(x,(dict,list)) else ''}".rstrip())
                        first=False
                    else: out.append(f"{pad}  {k}: {q(x)}")
            else: out.append(f"{pad}- {q(v)}")
    return '\n'.join(out)

if __name__ == '__main__':
    try: main()
    except (OSError, RuntimeError, ValueError) as e:
        print(f"BLOCKED: {e}", file=sys.stderr); sys.exit(2)
