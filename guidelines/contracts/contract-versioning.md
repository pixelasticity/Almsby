# Contract Versioning

**Contract ID:** `contract-versioning`
**Schema version:** `1.0`

The AI system will consume these contracts programmatically. A documentation change can therefore become a runtime change.

## Rules

### Machine-readable contracts

Every YAML contract must include:

```yaml
schema_version: "major.minor"
```

### Compatibility

- Patch-level editorial changes that do not alter semantics require no schema change.
- Backward-compatible additions may increment the minor version.
- Removal, renaming, changed meaning, changed requiredness, or changed state semantics requires a major version.
- Consumers must declare the contract versions they support.

### Unsupported versions

Agents and deterministic infrastructure must fail explicitly on unsupported major versions.

They must not guess how a new schema should be interpreted.

### Contract change procedure

1. Identify all consumers.
2. Run the Change Impact Protocol.
3. Update contract and consumers together when possible.
4. Add/update schema validation.
5. Test state transitions and completion gates.
6. Document migration notes for breaking changes.
7. Retain the previous contract version when a staged migration is required.

## Consumer rule

`.ai/` should treat contracts as authoritative inputs, not copy their logic into multiple prompts.

Where practical:

- load the contract;
- validate it;
- derive behavior from it;
- record the contract version in run state.

This minimizes drift between documentation and execution.
