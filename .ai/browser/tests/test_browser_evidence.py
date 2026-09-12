import json, subprocess, sys, unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from datetime import datetime, timezone

SCRIPT=Path(__file__).parents[1]/"validate_browser_evidence.py"

def make_run(required=True):
    td=TemporaryDirectory(); root=Path(td.name); run=root/"run-1"; b=run/"evidence/browser"; b.mkdir(parents=True)
    shot=b/"screenshots/home.png"; shot.parent.mkdir(); shot.write_bytes(b"png")
    d={"schema_version":"1.0","run_id":"run-1","scenario_id":"render","provider":"playwright","route":"/","viewport":{"width":1280,"height":800},"started_at":datetime.now(timezone.utc).isoformat(),"finished_at":datetime.now(timezone.utc).isoformat(),"result":"passed","artifacts":[{"kind":"screenshot","path":"evidence/browser/screenshots/home.png"}],"assertions":[{"id":"navigation","result":"passed"}]}
    (b/"render.json").write_text(json.dumps(d)); return td,run

class BrowserEvidenceTests(unittest.TestCase):
    def test_passes(self):
        td,run=make_run();
        r=subprocess.run([sys.executable,str(SCRIPT),"--run",str(run),"--required","render"],capture_output=True,text=True); assert r.returncode==0; assert r.stdout.startswith("PASS"); td.cleanup()

    def test_missing_required_blocks(self):
        td,run=make_run();
        r=subprocess.run([sys.executable,str(SCRIPT),"--run",str(run),"--required","render","accessibility"],capture_output=True,text=True); assert r.returncode==2; assert "required scenario missing: accessibility" in r.stdout; td.cleanup()

    def test_failed_assertion_blocks(self):
        td,run=make_run(); p=run/"evidence/browser/render.json"; d=json.loads(p.read_text()); d["assertions"][0]["result"]="failed"; p.write_text(json.dumps(d))
        r=subprocess.run([sys.executable,str(SCRIPT),"--run",str(run),"--required","render"],capture_output=True,text=True); assert r.returncode==2; assert "non-passing assertion" in r.stdout; td.cleanup()

    def test_escaping_artifact_blocks(self):
        td,run=make_run(); p=run/"evidence/browser/render.json"; d=json.loads(p.read_text()); d["artifacts"][0]["path"]="../outside.png"; p.write_text(json.dumps(d));
        r=subprocess.run([sys.executable,str(SCRIPT),"--run",str(run),"--required","render"],capture_output=True,text=True); assert r.returncode==2; assert "escapes run" in r.stdout; td.cleanup()

if __name__ == "__main__":
    import unittest; unittest.main()
