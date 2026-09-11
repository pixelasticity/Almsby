# `.ai/` — agent-operational tooling

This folder holds things an AI agent *does* while working in this repo.
It is not a spec source — that's `/guidelines/`. It is not the behavioral
contract — that's `/AGENTS.md`. If you're unsure where something belongs:

| Question | Lives in |
|---|---|
| "What are we building, and why?" | `/guidelines/*.md` |
| "How must an agent behave in this repo?" | `/AGENTS.md` |
| "What's the step-by-step for a recurring task?" | `.ai/workflows/` |
| "How do we test that an agent actually follows the rules above?" | `.ai/evaluations/` |
| "What's machine-readable enough for tooling to enforce automatically?" | `.ai/config/` |

## What's deliberately *not* here

`agents/`, `runs/`, and `state/` were considered and left out on purpose:

- **`agents/`** — this repo is worked by one general-purpose coding agent, not
  several distinct personas. A persona-file folder would be ceremony with no
  payoff right now. Revisit only if that changes (e.g. a dedicated
  compliance-auditor agent gets introduced).
- **`runs/`** — agent execution logs are ephemeral and can get large. Committing
  them to git puts prompt/output history in permanent blame history in a
  *compliance-critical* codebase — exactly where that's least desirable. If an
  audit trail is ever needed, it belongs in CI artifacts or an external log
  store, not version control.
- **`state/`** — cross-session tracking should stay deliberate and minimal, in
  the style of `guidelines/phase1-dod-status.md` — a single owned file someone
  updates on purpose, not an open folder agents write into freely.

If a real need for any of these shows up, add the specific file that need
requires — not the folder speculatively.

## Source-of-truth precedence

If anything in `.ai/` ever conflicts with `AGENTS.md` or `/guidelines/`, those
two win. Files here should always point back to the source doc rather than
restate it, so there's exactly one place each rule actually lives.
