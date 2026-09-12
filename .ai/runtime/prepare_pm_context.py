#!/usr/bin/env python3
"""Host-facing Step 12 entrypoint: preflight, then print the PM context path."""
import argparse, subprocess, sys
from pathlib import Path

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--repo-root',default='.'); ap.add_argument('--run-id',required=True); ap.add_argument('--task',required=True); ap.add_argument('--objective',default=''); a=ap.parse_args()
 root=Path(a.repo_root).resolve()
 cmd=[sys.executable,str(root/'.ai/runtime/contract_preflight.py'),'--repo-root',str(root),'--run-id',a.run_id,'--task',a.task,'--objective',a.objective]
 r=subprocess.run(cmd)
 if r.returncode!=0: return r.returncode
 print(f'PM_CONTEXT={root/".ai/runs"/a.run_id/"pm-context.md"}')
 print(f'PM_STATE={root/".ai/runs"/a.run_id/"project.yaml"}')
 print('PM_LAUNCH_ALLOWED=true')
 return 0
if __name__=='__main__': raise SystemExit(main())
