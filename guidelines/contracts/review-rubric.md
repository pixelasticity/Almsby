# Design / UX / Visual Review Rubric

**Contract ID:** `review-rubric`
**Schema version:** `1.0`

The review system exists to answer:

> Is this experience good enough, coherent enough, and trustworthy enough to ship?

It is not a popularity contest and it is not a substitute for objective verification.

## Review protocol

Every review should:

1. state what was reviewed;
2. identify the intended outcome;
3. inspect evidence;
4. distinguish requirements from preferences;
5. identify defects;
6. assign severity;
7. recommend action;
8. state whether the issue blocks completion.

## Severity

### Critical — no ship

A defect that threatens:

- compliance;
- reliability;
- core product behavior;
- user control over consequential action;
- critical accessibility;
- data integrity;
- physical barcode correctness;
- truthful product state.

### High — normally blocks

A defect that materially harms the primary task or produces a serious, repeated UX/visual problem.

### Medium — should fix

A meaningful defect that does not make the primary task fail but reduces clarity, trust, efficiency, or coherence.

### Low — polish

A minor issue that can reasonably be deferred without undermining the experience.

## Scoring

Each applicable dimension may be scored:

- `0` unacceptable
- `1` significant defects
- `2` acceptable with minor issues
- `3` strong
- `4` exemplary

Scores summarize quality. They do not override critical failures.

## Dimension A — Product alignment

Ask:

- Does this advance the intended user outcome?
- Does it respect the Constitution?
- Does it preserve relevant Product Decisions?
- Does it accidentally introduce a new product policy?

Red flags:

- bureaucracy moved onto the user;
- expert terminology used where user language would work;
- consequential automation hidden;
- maker authorship diluted;
- configurability favored over usability without evidence.

## Dimension B — UX

Inspect:

- goal clarity;
- next-action clarity;
- cognitive load;
- information hierarchy;
- progressive disclosure;
- form burden;
- feedback;
- error recovery;
- state visibility;
- user control.

**Strong result:** a capable first-time user can understand what is happening and what to do next without needing product expertise.

## Dimension C — Visual

Inspect:

- hierarchy;
- composition;
- typography;
- spacing/rhythm;
- density;
- color roles;
- imagery;
- states;
- responsive composition;
- consistency.

Ask what the visual system is communicating and whether it communicates that intentionally.

"Modern", "clean", "premium", and "beautiful" are not evidence.

## Dimension D — Accessibility

Inspect:

- semantics;
- names and labels;
- heading structure;
- keyboard operation;
- focus;
- contrast;
- non-color communication;
- readable content;
- error/status communication.

Automation supports this review but does not replace human inspection.

## Dimension E — Responsive

Inspect:

- primary action retention;
- reflow;
- overflow;
- navigation;
- forms;
- tables/data;
- media;
- state visibility.

The mobile result should not merely be a shrunk desktop result.

## Dimension F — Maker voice

For maker-facing/story experiences:

- Does the maker remain the author?
- Does AI amplify rather than replace?
- Are generated claims grounded?
- Does the content remain specific?
- Does it avoid generic marketing voice?

## Dimension G — Trust

Inspect whether the interface accurately communicates:

- draft vs published;
- processing vs complete;
- success vs partial success;
- error vs warning;
- verified vs suggested;
- known vs inferred.

A beautiful false impression is a product defect.

## Dimension H — Coherence

Inspect the change against nearby product surfaces.

Ask:

- Does it reuse an established pattern for a good reason?
- If it differs, is there a product reason?
- Does it strengthen or fragment the design language?
- Does it introduce a one-off exception?

## Review output template

```yaml
review:
  surface:
  reviewer:
  evidence:
  scores:
    product_alignment:
    ux:
    visual:
    accessibility:
    responsive:
    maker_voice:
    trust:
    coherence:
  findings:
    - severity:
      dimension:
      finding:
      evidence:
      recommendation:
      blocks_completion:
  strengths:
  accepted_risks:
  final_recommendation: ship | iterate | block
```
