# Design Brief Contract

**Contract ID:** `design-brief`
**Schema version:** `1.0`
**Purpose:** establish a shared, reviewable design intent before non-trivial UI/UX implementation begins.

A design brief is not a mood board and not a list of screens. It is the contract connecting:

**product intent → user problem → experience strategy → visual direction → implementation → evidence**

## 1. When a design brief is required

A design brief is required when a change:

- introduces a new user flow;
- materially changes an existing flow;
- creates a new public-facing experience;
- changes shared navigation or forms;
- changes a design-system foundation;
- introduces or materially changes AI-assisted interaction;
- changes how a consequential decision is presented;
- changes the information architecture of a meaningful surface;
- materially changes visual direction.

A lightweight brief may be used for small UI changes. Level 2/3 changes under the Change Impact Protocol require a complete brief.

## 2. Required structure

### Identity

```yaml
id:
title:
status: draft | ready_for_review | approved | superseded
owner:
created:
updated:
```

### Product context

```yaml
objective:
user:
user_job:
problem:
desired_outcome:
```

The objective describes the product outcome, not the implementation task.

Bad:
> Add a modal to edit the story.

Good:
> Let makers revise a story without losing authorship or accidentally publishing incomplete content.

### Source-of-truth references

The brief must link to the applicable:

- Constitution principles;
- Product Decisions;
- domain definitions;
- hard engineering/compliance constraints;
- delivery requirements;
- existing UX patterns;
- design-system foundations.

References should be specific enough that another agent can inspect them.

### Scope

```yaml
in_scope:
  - ...
out_of_scope:
  - ...
assumptions:
  - ...
open_questions:
  - ...
```

Out-of-scope items are important. They prevent implementation agents from expanding the task simply because adjacent improvements are visible.

## 3. Experience contract

The brief must explain:

### Primary user flow

Describe the happy path in user terms.

### Primary next action

Identify what the user should understand and do at each major step.

### Information hierarchy

Identify:

- must know now;
- useful now;
- available on demand;
- deliberately hidden/deferred.

### Progressive disclosure

Explain which complexity is deferred and when it becomes relevant.

The objective is not to hide meaning. It is to prevent unnecessary cognitive load.

### Automation and control

For each meaningful automated action:

```yaml
automation:
  action:
  benefit:
  consequence:
  explanation:
  user_control:
```

Consequential decisions should follow:

**Detect → Explain → Recommend → Approve**

where applicable.

### States

Specify meaningful states, including applicable:

- empty;
- loading;
- processing;
- draft;
- published;
- success;
- warning;
- error;
- unavailable;
- blocked.

For each state, describe what the user needs to know and what they can do next.

## 4. AI interaction contract

If AI participates, specify:

- what knowledge is provided to the model;
- what the AI is allowed to infer;
- what it may suggest;
- what it may change automatically;
- what requires approval;
- how uncertainty is exposed;
- how user authorship is preserved;
- how unsupported claims are prevented.

For maker storytelling, the default principle is:

> Amplify the maker's voice. Do not replace it.

## 5. Visual direction

The brief must communicate intent, not merely adjectives.

Cover:

- hierarchy;
- composition;
- density;
- typography;
- color;
- imagery/media;
- interaction states;
- responsive behavior;
- relationship to existing design-system foundations.

Avoid descriptions such as "modern" or "premium" without explaining what visible decisions those words imply.

## 6. Accessibility and internationalization

Record:

- semantic/keyboard considerations;
- focus behavior;
- error/status communication;
- contrast implications;
- responsive constraints;
- locale expansion risks;
- compliance-sensitive translation considerations.

## 7. Evidence plan

Select every applicable quality protocol.

At minimum, identify whether the change needs:

- automated checks;
- browser verification;
- accessibility verification;
- responsive verification;
- UX/product review;
- visual review;
- i18n verification;
- compliance review;
- physical scan verification.

## 8. Approval rules

`draft` means work is being explored.

`ready_for_review` means the required information is present but has not been approved.

`approved` means implementation may consume the brief.

An implementation agent must not treat `draft` as approved design intent.

If implementation discovers that the approved brief is impossible, unsafe, contradictory, or materially incomplete, it returns the issue to the PM rather than silently redefining the brief.

## 9. Completion criteria

A design brief is complete when:

- the user/job is clear;
- constraints are traceable;
- scope is explicit;
- major interaction decisions are explicit;
- meaningful states are covered;
- visual direction is coherent;
- evidence requirements are known;
- unresolved consequential decisions are surfaced;
- the brief has the required approval.

## 10. Anti-patterns

Do not:

- start with components instead of the user problem;
- use visual adjectives as design rationale;
- hide unresolved product decisions inside implementation;
- ask users for information the system can discover;
- let AI replace maker authorship;
- treat a screenshot as a complete design specification;
- use the brief to sneak unrelated scope into implementation.
