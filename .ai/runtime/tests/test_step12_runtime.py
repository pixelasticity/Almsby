import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve()
AI_ROOT = HERE.parents[2]
REPO_ROOT = AI_ROOT.parent

class Step12RuntimeTests(unittest.TestCase):
    def make_fixture(self):
        td = Path(tempfile.mkdtemp(prefix='almsby-step12-'))
        shutil.copytree(REPO_ROOT / '.ai', td / '.ai')
        contracts = td / 'guidelines' / 'contracts'
        contracts.mkdir(parents=True)
        manifest = (td / '.ai/contracts/manifest.yaml').read_text()
        import re
        entries = re.findall(r'^  ([a-z0-9_]+):\n    file: \"([^\"]+)\"\n    version_source: \"([^\"]+)\"', manifest, re.M)
        for _, rel, source in entries:
            out = td / rel; out.parent.mkdir(parents=True, exist_ok=True)
            key = source.replace('_',' ')
            out.write_text(f'**{key.title()}:** 1.0\n\nFixture contract for runtime testing.\n')
        return td

    def test_preflight_generates_pm_bundle_and_pins(self):
        td = self.make_fixture()
        try:
            run_id = 'runtime-test'
            r = subprocess.run([
                'python', str(td/'.ai/runtime/prepare_pm_context.py'),
                '--repo-root', str(td), '--run-id', run_id,
                '--task', 'test task', '--objective', 'test objective'
            ], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            run = td/'.ai/runs'/run_id
            self.assertTrue((run/'project.yaml').exists())
            self.assertTrue((run/'pm-context.md').exists())
            self.assertTrue((run/'pm-contract-bundle.md').exists())
            context = json.loads((run/'pm-context.json').read_text())
            self.assertEqual(context['manifest_schema_version'], '1.0')
            self.assertEqual(len(context['contracts']), 6)
        finally:
            shutil.rmtree(td)

    def test_pin_verifier_blocks_drift(self):
        td = self.make_fixture()
        try:
            run_id = 'drift-test'
            pre = subprocess.run([
                'python', str(td/'.ai/runtime/prepare_pm_context.py'),
                '--repo-root', str(td), '--run-id', run_id,
                '--task', 'test task'
            ], capture_output=True, text=True)
            self.assertEqual(pre.returncode, 0, pre.stderr)
            target = td/'guidelines/contracts/design-brief.md'
            target.write_text(target.read_text() + '\nDRIFT\n')
            check = subprocess.run([
                'python', str(td/'.ai/runtime/verify_contract_pin.py'),
                '--repo-root', str(td), '--run-id', run_id
            ], capture_output=True, text=True)
            self.assertEqual(check.returncode, 2)
            self.assertIn('contract drift detected', check.stdout)
        finally:
            shutil.rmtree(td)

if __name__ == '__main__':
    unittest.main()
