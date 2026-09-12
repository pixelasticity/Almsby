# AI Runtime — Step 12

These utilities are deterministic infrastructure around the Project Manager.

## Commands

### `prepare_pm_context.py`

Creates a new run only after validating the contract manifest and all required contract sources. It writes:

- `project.yaml`
- `contract-preflight.md`
- `pm-context.md`
- `pm-context.json`
- `pm-contract-bundle.md`

Exit codes:

- `0` — PM launch may proceed;
- `2` — blocked; the host must not launch the PM.

### `verify_contract_pin.py`

Checks the SHA-256 pins captured at preflight. A changed/missing contract blocks continuation.

### `prepare_pm_context.py` vs. the PM

The runtime does not decide product meaning. It only guarantees that the PM starts with a coherent contract set.
