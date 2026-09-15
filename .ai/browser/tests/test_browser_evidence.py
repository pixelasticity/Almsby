import json
import subprocess
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from datetime import datetime, timezone

SCRIPT = Path(__file__).parents[1] / "validate_browser_evidence.py"

def make_run():
    td = TemporaryDirectory()
    root = Path(td.name)
    run = root / ".ai" / "runs" / "run-1"
    b = run / "evidence" / "browser"
    b.mkdir(parents=True)
    (root / ".ai" / "browser").mkdir(parents=True)
    (root / ".ai" / "browser" / "config.yaml").write_text(
        'schema_version: "1.0"\nfreshness:\n  max_age_seconds: 86400\n  require_current_run: true\n',
        encoding="utf-8",
    )
    (root / ".ai" / "browser" / "scenarios.yaml").write_text(
        'schema_version: "1.0"\nscenario_catalog:\n  render:\n    purpose: render\n    evidence: [navigation, screenshot]\n  accessibility:\n    purpose: a11y\n    evidence: [accessibility_snapshot, accessibility_assertions]\n',
        encoding="utf-8",
    )
    shot = b / "screenshots" / "home.png"
    shot.parent.mkdir()
    shot.write_bytes(b"png")
    now = datetime.now(timezone.utc).isoformat()
    d = {
        "schema_version": "1.0", "run_id": "run-1", "scenario_id": "render",
        "provider": "playwright", "route": "/", "viewport": {"width": 1280, "height": 800},
        "started_at": now, "finished_at": now, "result": "passed",
        "artifacts": [{"kind": "screenshot", "path": "evidence/browser/screenshots/home.png"}],
        "assertions": [{"id": "navigation", "result": "passed"}],
    }
    (b / "render.json").write_text(json.dumps(d), encoding="utf-8")
    (run / "project.yaml").write_text(
        f'schemaVersion: "1.2"\ncreatedAt: "{now}"\n', encoding="utf-8"
    )
    return td, run

class BrowserEvidenceTests(unittest.TestCase):
    def test_passes(self):
        td, run = make_run()
        try:
            r = subprocess.run([sys.executable, str(SCRIPT), "--run", str(run), "--required", "render"], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        finally:
            td.cleanup()

    def test_missing_required_blocks(self):
        td, run = make_run()
        try:
            r = subprocess.run([sys.executable, str(SCRIPT), "--run", str(run), "--required", "render", "accessibility"], capture_output=True, text=True)
            self.assertEqual(r.returncode, 2)
            self.assertIn("required scenario missing: accessibility", r.stdout)
        finally:
            td.cleanup()

    def test_failed_assertion_blocks(self):
        td, run = make_run()
        try:
            p = run / "evidence/browser/render.json"
            d = json.loads(p.read_text())
            d["assertions"][0]["result"] = "failed"
            p.write_text(json.dumps(d))
            r = subprocess.run([sys.executable, str(SCRIPT), "--run", str(run), "--required", "render"], capture_output=True, text=True)
            self.assertEqual(r.returncode, 2)
            self.assertIn("non-passing assertion", r.stdout)
        finally:
            td.cleanup()

    def test_escaping_artifact_blocks(self):
        td, run = make_run()
        try:
            p = run / "evidence/browser/render.json"
            d = json.loads(p.read_text())
            d["artifacts"][0]["path"] = "../outside.png"
            p.write_text(json.dumps(d))
            r = subprocess.run([sys.executable, str(SCRIPT), "--run", str(run), "--required", "render"], capture_output=True, text=True)
            self.assertEqual(r.returncode, 2)
            self.assertIn("escapes run", r.stdout)
        finally:
            td.cleanup()

    def test_duplicate_results_require_selection(self):
        td, run = make_run()
        try:
            p = run / "evidence/browser/render.json"
            d = json.loads(p.read_text())
            d["attempt"] = 1
            p.rename(run / "evidence/browser/render-1.json")
            d["attempt"] = 2
            (run / "evidence/browser/render-2.json").write_text(json.dumps(d))
            r = subprocess.run([sys.executable, str(SCRIPT), "--run", str(run), "--required", "render"], capture_output=True, text=True)
            self.assertEqual(r.returncode, 2)
            self.assertIn("multiple records", r.stdout)
        finally:
            td.cleanup()

    def test_catalog_unknown_blocks(self):
        td, run = make_run()
        try:
            p = run / "evidence/browser/render.json"
            d = json.loads(p.read_text())
            d["scenario_id"] = "invented"
            p.write_text(json.dumps(d))
            r = subprocess.run([sys.executable, str(SCRIPT), "--run", str(run), "--required", "invented"], capture_output=True, text=True)
            self.assertEqual(r.returncode, 2)
            self.assertIn("not catalogued", r.stdout)
        finally:
            td.cleanup()

if __name__ == "__main__":
    unittest.main(verbosity=2)
