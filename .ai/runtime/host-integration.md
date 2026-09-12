# PM Host Integration

## Required behavior

Any host that launches Almsby's Project Manager must implement this sequence:

```text
request
  │
  ▼
create run id
  │
  ▼
prepare_pm_context
  │
  ├── FAIL → do not launch PM
  │
  └── PASS
        │
        ▼
  load pm-contract-bundle.md
  load pm-context.md
  load project.yaml
        │
        ▼
     launch PM
```

## Initial PM context

The host should provide the PM with:

1. the user's task/request;
2. `.ai/runs/<run-id>/pm-context.md`;
3. `.ai/runs/<run-id>/pm-contract-bundle.md`;
4. `.ai/runs/<run-id>/project.yaml`;
5. the repository's applicable product/engineering/UX source material.

The contract bundle is generated from authoritative files after their hashes are pinned. It is a startup snapshot, not a new source of truth.

## Model-host neutrality

Do not encode model-specific CLI assumptions into the `.ai` contract system. A Qwen Code adapter, another local runner, or a future orchestrator may implement this host boundary differently.

The only required semantic interface is:

- deterministic preflight must pass;
- PM receives the generated startup context;
- contract pins are verified before continuing after relevant changes.

## Failure handling

If preflight fails, the host should surface the exact runtime error and stop. It must not silently fall back to a prompt-only PM launch.

If pin verification fails during a run, pause execution and route the change through the Change Impact Protocol and Contract Versioning rules.
