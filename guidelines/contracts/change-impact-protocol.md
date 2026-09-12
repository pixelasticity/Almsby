# Change Impact Protocol

**Contract ID:** `change-impact`
**Schema version:** `1.0`

The purpose of impact analysis is to prevent a seemingly local change from silently changing product behavior, domain truth, design language, compliance behavior, or evidence standards.

## Required output

Before implementation, the PM should produce:

```yaml
impact:
  level: 0 | 1 | 2 | 3
  surfaces:
    - ...
  authorities:
    - ...
  dependencies:
    - ...
  protocols:
    - ...
  risks:
    - ...
  escalation:
    required: true | false
    reason: ...
```

## Level 0 — Local implementation

Examples:

- isolated refactor;
- test-only modification;
- non-semantic typo/copy correction;
- internal cleanup with no behavioral impact.

Required:

- scope check;
- applicable automated checks.

## Level 1 — User-facing behavior

Examples:

- form interaction;
- validation;
- navigation;
- empty/error state;
- story editing behavior;
- copy that changes user interpretation.

Required:

- UX consideration;
- browser verification;
- accessibility where UI changes;
- applicable quality evidence.

## Level 2 — Cross-cutting experience

Examples:

- shared components;
- design-system changes;
- navigation foundations;
- public story templates;
- localization infrastructure;
- shared interaction patterns.

Required:

- explicit design brief;
- dependency analysis;
- UX review;
- visual review when applicable;
- browser/accessibility/responsive evidence;
- regression checks across affected consumers.

## Level 3 — High-risk product/technical behavior

Examples:

- GTIN allocation/validation;
- barcode generation/rendering;
- Digital Link resolver;
- compliance logic;
- database invariants;
- identity routing;
- consequential AI decisions;
- changes affecting physical output.

Required:

- explicit plan;
- relevant specialist review;
- automated verification;
- required browser/physical evidence;
- human gate where repository policy requires it.

## Impact analysis procedure

### Step 1 — Identify the change

Record:

- requested outcome;
- proposed files;
- known dependencies;
- affected user flows;
- affected public/private surfaces.

### Step 2 — Trace authority

Search for applicable:

- Constitution principles;
- Product Decisions;
- domain invariants;
- UX patterns;
- design-system rules;
- hard compliance requirements;
- delivery acceptance criteria;
- quality protocols.

### Step 3 — Find blast radius

Consider:

- direct consumers;
- shared components;
- public routes;
- database/data contracts;
- APIs;
- localization;
- AI prompts/contracts;
- tests;
- evidence protocols;
- physical workflows.

### Step 4 — Identify invalidation

Ask whether the change invalidates:

- a product decision;
- a domain invariant;
- a UX pattern;
- a visual-system assumption;
- a compliance interpretation;
- an automated test;
- a physical verification protocol;
- an existing completion gate.

If yes, escalate the impact level.

### Step 5 — Select evidence

Select every applicable quality protocol.

An omitted protocol requires an applicability reason.

### Step 6 — Determine approval

Identify whether the change requires:

- PM coordination only;
- specialist review;
- product decision;
- human gate;
- compliance review;
- physical verification.

### Step 7 — Record before implementation

The implementation agent consumes the impact classification.

If implementation reveals a materially larger blast radius, it must return to impact analysis rather than continuing under the old classification.

## Escalation triggers

Escalate when:

- authoritative sources conflict;
- a hard constraint is uncertain;
- scope is ambiguous;
- a high-risk surface is affected;
- a Product Decision appears obsolete;
- a domain invariant may change;
- required evidence cannot be produced;
- repeated implementation attempts fail;
- a design choice materially changes user behavior;
- a supposedly local change affects multiple consumers.

## Principle

Impact analysis is not bureaucracy for its own sake.

It is a control against hidden coupling and accidental product decisions.
