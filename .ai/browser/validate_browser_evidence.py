#!/usr/bin/env python3
"""Deterministic Step 14 browser-evidence validator."""
from __future__ import annotations
import argparse, json, sys
import re
from datetime import datetime, timezone
from pathlib import Path

REQUIRED_KEYS = {"schema_version","run_id","scenario_id","provider","route","viewport","started_at","finished_at","result","artifacts","assertions"}
VALID_RESULTS={"passed","failed","blocked","unknown"}

def parse_time(s):
    return datetime.fromisoformat(s.replace("Z","+00:00"))

def load_json(p):
    with p.open(encoding="utf-8") as f: return json.load(f)

def safe_target(run: Path, rel: str) -> Path | None:
    try:
        target = (run / rel).resolve()
        target.relative_to(run)
        return target
    except ValueError:
        return None

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--run", required=True)
    ap.add_argument("--required", nargs="+", default=[])
    ap.add_argument("--output")
    a=ap.parse_args()
    run=Path(a.run).resolve(); root=run/"evidence"/"browser"
    errors=[]; warnings=[]; scenarios=[]
    if not run.exists(): errors.append("run directory does not exist")
    if not root.exists(): errors.append("browser evidence directory missing")
    records=[]
    if root.exists():
        for p in sorted(root.rglob("*.json")):
            try:
                d=load_json(p)
            except Exception as e:
                errors.append(f"invalid JSON: {p.relative_to(run)}: {e}"); continue
            if not REQUIRED_KEYS.issubset(d):
                errors.append(f"missing required keys: {p.relative_to(run)}")
                continue
            if d.get("run_id") != run.name: errors.append(f"run_id mismatch: {p.relative_to(run)}")
            if d.get("result") not in VALID_RESULTS: errors.append(f"invalid result: {p.relative_to(run)}")
            vp=d.get("viewport",{})
            if not isinstance(vp.get("width"),int) or not isinstance(vp.get("height"),int): errors.append(f"invalid viewport: {p.relative_to(run)}")
            try:
                if parse_time(d["finished_at"]) < parse_time(d["started_at"]): errors.append(f"finish precedes start: {p.relative_to(run)}")
            except Exception: errors.append(f"invalid timestamps: {p.relative_to(run)}")
            for art in d.get("artifacts",[]):
                rel=art.get("path","")
                target=safe_target(run, rel)
                if target is None: errors.append(f"artifact escapes run: {p.relative_to(run)} -> {rel}")
                elif not target.exists(): errors.append(f"missing artifact: {p.relative_to(run)} -> {rel}")
                elif target.stat().st_size < 1: errors.append(f"empty artifact: {p.relative_to(run)} -> {rel}")
            if d.get("result") == "passed" and any(x.get("result") != "passed" for x in d.get("assertions",[])):
                errors.append(f"scenario marked passed with non-passing assertion: {p.relative_to(run)}")
            records.append((p,d))
    by={}
    for p,d in records: by.setdefault(d.get("scenario_id"),[]).append((p,d))
    seen_required=set()
    for sid in a.required:
        if sid in seen_required:
            errors.append(f"duplicate required scenario declaration: {sid}")
            continue
        seen_required.add(sid)
        rs=by.get(sid,[])
        if not rs: errors.append(f"required scenario missing: {sid}"); scenarios.append({"id":sid,"status":"missing"}); continue
        passed=[x for x in rs if x[1].get("result")=="passed"]
        if not passed: errors.append(f"required scenario not passed: {sid}"); scenarios.append({"id":sid,"status":rs[-1][1].get("result")}); continue
        scenarios.append({"id":sid,"status":"passed","records":len(rs)})
    status="BLOCKED" if errors else ("WARN" if warnings else "PASS")
    report={"schema_version":"1.0","run_id":run.name,"status":status,"checked_at":datetime.now(timezone.utc).isoformat(),"scenarios":scenarios,"errors":errors,"warnings":warnings}
    out=Path(a.output) if a.output else run/"browser-validation-report.json"; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(status)
    for e in errors: print(f"ERROR: {e}")
    return 0 if status=="PASS" else 2
if __name__=="__main__": sys.exit(main())
