import hashlib
import json
import shutil
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2].parents[0]
WATCHDOG = ROOT / '.ai' / 'watchdog' / 'watchdog.py'
MANIFEST = ROOT / '.ai' / 'contracts' / 'manifest.yaml'


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


class WatchdogTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix='almsby-watchdog-'))
        shutil.copytree(ROOT / '.ai', self.tmp / '.ai')
        contracts = self.tmp / 'guidelines' / 'contracts'
        contracts.mkdir(parents=True)
        names = [
            'design-brief.md', 'definition-of-done.yaml', 'review-rubric.md',
            'agent-capability-matrix.yaml', 'change-impact-protocol.md', 'contract-versioning.md'
        ]
        for n in names:
            (contracts / n).write_text('schema_version: "1.0"\n', encoding='utf-8')
        self.run = self.tmp / '.ai' / 'runs' / 'test-run'
        self.run.mkdir(parents=True)
        hashes = {n: digest(contracts / n) for n in names}
        ctx = {
            'contracts': {
                n.rsplit('.', 1)[0].replace('-', '_'): {'path': f'guidelines/contracts/{n}', 'sha256': h}
                for n, h in hashes.items()
            }
        }
        (self.run / 'pm-context.json').write_text(json.dumps(ctx), encoding='utf-8')
        now = utc_now()
        for n in ['brief.md', 'contract-preflight.md', 'impact-assessment.md']:
            (self.run / n).write_text('# fixture\n', encoding='utf-8')
        (self.run / 'final-review.yaml').write_text('result: pass\n', encoding='utf-8')
        (self.run / 'critique.md').write_text('# critique\n', encoding='utf-8')
        state = {
            'schemaVersion': '1.2', 'id': 'test-run', 'objective': 'test',
            'status': 'ready_for_review', 'phase': 'human_review',
            'createdAt': now, 'lastHeartbeatAt': now, 'lastMeaningfulProgressAt': now,
            'contracts': {'manifestVersion': '1.0', 'pinned': {}, 'hashes': hashes, 'applicability': {}},
            'applicability': {'ui_or_ux_changes': False, 'code_changes': False, 'physical_scan': False, 'i18n': False, 'compliance': False},
            'tasks': [], 'decisions': [],
            'artifacts': {
                'brief.md': {'required': True, 'status': 'present', 'path': 'brief.md'},
                'contract-preflight.md': {'required': True, 'status': 'present', 'path': 'contract-preflight.md'},
                'impact-assessment.md': {'required': True, 'status': 'present', 'path': 'impact-assessment.md'},
                'project.yaml': {'required': True, 'status': 'present', 'path': 'project.yaml'},
                'final-review.yaml': {'required': True, 'status': 'verified', 'path': 'final-review.yaml', 'evidence': ['ev-1']},
                'critique.md': {'required': True, 'status': 'verified', 'path': 'critique.md', 'evidence': ['ev-1']},
            },
            'evidence': [{
                'id': 'ev-1', 'kind': 'review', 'status': 'passed', 'createdAt': now,
                'producer': 'critic', 'method': 'fixture review', 'result': 'pass',
                'requirement': 'completion review evidence', 'path': 'final-review.yaml'
            }],
            'attempts': {}
        }
        import yaml
        (self.run / 'project.yaml').write_text(yaml.safe_dump(state, sort_keys=False), encoding='utf-8')

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def run_watchdog(self):
        return subprocess.run(['python', str(WATCHDOG), 'check', '--repo-root', str(self.tmp), '--run-id', 'test-run'], text=True, capture_output=True)

    def test_healthy_run_passes(self):
        # Initialize checkpoint first; the run is already at its observed starting state.
        p = subprocess.run(['python', str(WATCHDOG), 'init', '--repo-root', str(self.tmp), '--run-id', 'test-run'], text=True, capture_output=True)
        self.assertEqual(p.returncode, 0, p.stdout + p.stderr)
        p = self.run_watchdog()
        self.assertEqual(p.returncode, 0, p.stdout + p.stderr)
        self.assertIn('WATCHDOG_RESULT=PASS', p.stdout)

    def test_path_escape_is_blocked(self):
        import yaml
        state = yaml.safe_load((self.run / 'project.yaml').read_text())
        state['artifacts']['evil'] = {'required': True, 'status': 'present', 'path': '../outside.txt'}
        (self.run / 'project.yaml').write_text(yaml.safe_dump(state, sort_keys=False))
        subprocess.run(['python', str(WATCHDOG), 'init', '--repo-root', str(self.tmp), '--run-id', 'test-run'], capture_output=True)
        p = self.run_watchdog()
        self.assertEqual(p.returncode, 2)
        self.assertIn('escapes the run directory', p.stdout)

    def test_missing_required_evidence_is_blocked(self):
        import yaml
        state = yaml.safe_load((self.run / 'project.yaml').read_text())
        state['evidence'] = []
        (self.run / 'project.yaml').write_text(yaml.safe_dump(state, sort_keys=False))
        subprocess.run(['python', str(WATCHDOG), 'init', '--repo-root', str(self.tmp), '--run-id', 'test-run'], capture_output=True)
        p = self.run_watchdog()
        # Required artifacts reference an evidence ID that no longer exists.
        self.assertEqual(p.returncode, 2, p.stdout + p.stderr)
        self.assertIn('references missing evidence ids', p.stdout)


    def test_stale_heartbeat_is_blocked(self):
        import yaml
        state = yaml.safe_load((self.run / 'project.yaml').read_text())
        state['lastHeartbeatAt'] = '2020-01-01T00:00:00Z'
        (self.run / 'project.yaml').write_text(yaml.safe_dump(state, sort_keys=False))
        subprocess.run(['python', str(WATCHDOG), 'init', '--repo-root', str(self.tmp), '--run-id', 'test-run'], capture_output=True)
        p = self.run_watchdog()
        self.assertEqual(p.returncode, 2)
        self.assertIn('activity.heartbeat', p.stdout)

    def test_illegal_status_transition_is_blocked(self):
        subprocess.run(['python', str(WATCHDOG), 'init', '--repo-root', str(self.tmp), '--run-id', 'test-run'], capture_output=True)
        import yaml
        state = yaml.safe_load((self.run / 'project.yaml').read_text())
        state['status'] = 'planning'
        state['phase'] = 'planning'
        (self.run / 'project.yaml').write_text(yaml.safe_dump(state, sort_keys=False))
        p = self.run_watchdog()
        self.assertEqual(p.returncode, 2)
        self.assertIn('illegal observed status transition', p.stdout)

    def test_contract_drift_is_blocked(self):
        subprocess.run(['python', str(WATCHDOG), 'init', '--repo-root', str(self.tmp), '--run-id', 'test-run'], capture_output=True)
        target = self.tmp / 'guidelines' / 'contracts' / 'design-brief.md'
        target.write_text(target.read_text() + 'drift\n', encoding='utf-8')
        p = self.run_watchdog()
        self.assertEqual(p.returncode, 2)
        self.assertIn('contract drift detected', p.stdout)


if __name__ == '__main__':
    unittest.main(verbosity=2)
