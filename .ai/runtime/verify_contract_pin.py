#!/usr/bin/env python3
"""Verify that authoritative contract files have not drifted from a run's pins."""
import argparse, hashlib, json, sys
from pathlib import Path

def digest(p):
 h=hashlib.sha256(); h.update(p.read_bytes()); return h.hexdigest()

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--repo-root',default='.'); ap.add_argument('--run-id',required=True); a=ap.parse_args()
 root=Path(a.repo_root).resolve(); run=root/'.ai/runs'/a.run_id
 ctx=json.loads((run/'pm-context.json').read_text())
 mismatches=[]
 for name, rec in ctx['contracts'].items():
  p=root/rec['path']
  if not p.exists(): mismatches.append((name,'missing')); continue
  got=digest(p)
  if got != rec['sha256']: mismatches.append((name,f"hash changed: {rec['sha256']} -> {got}"))
 if mismatches:
  print('BLOCKED: contract drift detected');
  for x in mismatches: print(f'- {x[0]}: {x[1]}')
  print('Re-preflight is required before continuing.')
  sys.exit(2)
 print('PASS: pinned contract content is unchanged')
if __name__=='__main__': main()
