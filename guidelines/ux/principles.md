---

id: ux-principles
type: ux_guideline
authority: ux
status: active
audience:

* product
* design
* engineering
* all_agents
  derived_from:
* product-constitution
  review:
  required: true

---

# Almsby UX Principles

These principles translate the **Product Constitution** into practical guidance for designing Almsby's user experience.

They are not a replacement for the Constitution.

When a UX decision conflicts with the Constitution, the Constitution wins.

These principles exist to help humans and agents answer a more practical question:

> **Given what Almsby believes, what should the experience actually do?**

---

## 1. Make complexity disappear, not understanding

The user should not need to understand the machinery behind Almsby in order to use it correctly.

GS1, GTINs, Digital Link, 2D barcodes, Digital Product Passports, compliance requirements, identifiers, and related infrastructure may be technically complex.

That complexity belongs in the product.

But hiding complexity does **not** mean hiding what matters.

The user should understand:

* What is happening
* Why it matters
* What the system found
* What the system recommends
* What changed
* What they need to decide
* What happens next

### Prefer

> “We found a valid product identifier.”

over:

> “GS1 Digital Link URI validation returned successfully.”

Expose technical terminology when it helps the user accomplish something, when it is required for a decision, or when the user explicitly wants the detail.

### Test

Ask:

> **Could the user accomplish this correctly without becoming an expert in the underlying technology?**

If not, reconsider the experience.

---

## 2. Always make the next step obvious

A user should rarely have to ask:

> “What am I supposed to do now?”

Every meaningful state should communicate an appropriate next action.

This includes:

* First-run experiences
* Empty states
* Forms
* Validation
* Compliance workflows
* AI interactions
* Publishing
* Errors
* Successful completion
* Waiting states

The next action does not always have to be a button.

It may be:

* A clear explanation
* A recommendation
* A question
* A confirmation
* A status change
* A piece of information the user needs before continuing

### Avoid

Interfaces where several actions have equal visual weight despite having very different importance.

### Test

At any point, ask:

> **If the user stops reading after one or two seconds, will they understand what they can or should do next?**

---

## 3. Automate work. Expose decisions.

Almsby should do as much work as it safely can.

Users should not be forced to perform mechanical tasks merely because the system could perform them itself.

But automation must not become a black box.

When a consequential decision is involved, use:

> **Detect → Explain → Recommend → Approve**

### Detect

Identify the relevant issue, opportunity, or change.

### Explain

Tell the user what was found in understandable language.

### Recommend

Offer a sensible recommendation and explain why.

### Approve

Give the user an appropriate opportunity to approve a consequential action.

The amount of explanation should match the consequence.

A minor formatting choice may not need a confirmation step.

Changing important product data should.

### Test

Ask:

> **Could the system safely do this without the user?**

If yes, automate it.

Then ask:

> **Would the user reasonably care that this happened or be responsible for its consequences?**

If yes, expose the decision.

---

## 4. Ask; don't interrogate

Forms are sometimes necessary.

They should not become the default interaction model simply because forms are easy to implement.

Whenever possible:

* Use information Almsby already has.
* Derive values from existing data.
* Validate as the user works.
* Ask only for information that is genuinely missing.
* Explain why information is needed.
* Group related questions logically.
* Avoid asking for information the system can discover or infer safely.

A user should feel that Almsby is **helping them complete a task**, not administering a questionnaire.

### For AI-assisted experiences

Prefer:

> “Tell me what inspired this piece.”

over:

> “Enter product inspiration.”

Prefer a small number of thoughtful prompts over a long list of fields.

### Test

For every requested piece of information, ask:

> **Why does Almsby need this?**

Then:

> **Could Almsby obtain or derive it another way?**

---

## 5. Start with the user's object, not the system's vocabulary

Users think about their products.

They think:

* “my shirt”
* “this chair”
* “the jacket I designed”
* “my collection”
* “the piece I made”

The platform may think in terms of:

* GTIN
* identifier
* resolver
* Digital Link
* barcode symbol
* compliance attributes

The interface should generally begin with the user's mental model.

Technical concepts should appear when they become useful.

### Prefer

> **Your product**

with supporting information about its identifier.

rather than making the user begin with:

> **Create GS1 Digital Link identity**

The technical model should support the user's task rather than define it.

---

## 6. Progressive disclosure over information dumping

Do not expose every piece of available information merely because it exists.

Reveal complexity progressively.

A useful hierarchy is:

1. **What matters now**
2. **What the user needs to understand**
3. **What the user may want to inspect**
4. **Technical detail for users who need it**

This is particularly important for compliance and infrastructure-related experiences.

A novice should be able to complete the task.

An expert should still be able to inspect the underlying detail.

These are not contradictory goals.

### Test

Ask:

> **Does this information help the user make a decision or accomplish the current task?**

If not, consider moving it deeper in the experience.

---

## 7. Good defaults; visible control

Almsby should make reasonable choices for users wherever possible.

The user should not have to configure everything.

But defaults should not become hidden decisions.

When a choice materially affects the outcome:

* Explain the choice when appropriate.
* Make the current value visible.
* Provide a reasonable way to change it.
* Do not hide important consequences.

The ideal experience often looks like:

> **“We've chosen X because Y. You can change this if you need to.”**

rather than:

> **“Configure everything yourself.”**

or:

> **“We decided everything for you.”**

---

## 8. Preserve agency

The user should remain the owner of their product, story, data, and important decisions.

This is particularly important when AI is involved.

AI should increase the user's capability without making the user feel displaced from their own work.

For the Craft-Obsessed Maker persona, this means:

> **Amplify the maker's voice. Do not replace it.**

AI may:

* Ask thoughtful questions
* Identify interesting details
* Organize information
* Suggest structures
* Improve clarity
* Offer interpretations
* Help turn knowledge into usable content

AI should not:

* Invent emotional meaning
* Manufacture personal history
* Replace the maker's voice
* Present generic marketing language as authentic storytelling
* Make consequential product decisions silently

### Test

Ask:

> **Does the user still feel that this is their product, their story, and their decision?**

---

## 9. Make invisible value visible

Physical products often contain value that is difficult to see.

For a maker, that value may include:

> craftsmanship → materials → labor → skill → decisions → inspiration → history

The customer may see only the finished object.

Almsby's storytelling experiences should help bridge that gap.

The goal is not to create a defensive justification for price.

The goal is to help someone understand:

> **Why this product exists.**

### Avoid

Turning every product story into a sales pitch.

### Prefer

Helping the maker communicate the details that make the product meaningful.

---

## 10. Beautiful is part of the product, not decoration

Almsby should feel considered and intentional.

Visual design should improve:

* Comprehension
* Hierarchy
* Confidence
* Emotional connection
* Discoverability
* Perceived quality
* Willingness to share

Beauty should not compensate for confusing interaction.

Likewise, usability should not be used as an excuse for an undifferentiated interface.

The goal is:

> **Useful, understandable, trustworthy, and worth caring about.**

### Avoid

“Modern SaaS” as a sufficient visual direction.

Generic cards, gradients, rounded containers, shadows, illustrations, or other visual conventions should have a reason for existing.

### Test

Ask:

> **If we removed the decoration, would the experience still work?**

If yes, that is fine.

Then ask:

> **Does the visual design add meaning, clarity, emotion, or confidence?**

If not, reconsider it.

---

## 11. Design for the whole state, not just the happy path

Every meaningful experience should account for its important states.

At minimum, consider:

* Initial
* Empty
* Loading
* Processing
* Success
* Partial success
* Validation failure
* Recoverable error
* Blocking error
* Permission/access limitation
* Draft
* Published
* Outdated/stale information
* User cancellation

The interface should tell the user:

1. What happened
2. Whether anything was changed
3. Whether their data is safe
4. What they can do next

### Avoid

Generic:

> “Something went wrong.”

### Prefer

An explanation appropriate to the actual failure, with a useful recovery path.

---

## 12. Errors should preserve trust

Errors are especially important for Almsby because some outputs exist in the physical world.

A barcode that looks correct but does not scan is not a cosmetic problem.

When something fails:

* Do not hide the failure.
* Do not pretend success.
* Do not silently substitute an unexpected result.
* Explain what can be explained.
* Give the user a recovery path.
* Preserve relevant work.
* Distinguish user-actionable problems from system failures.

For high-risk infrastructure, correctness takes precedence over cleverness.

### Test

Ask:

> **Would the user know whether they can safely continue?**

---

## 13. Communicate state honestly

Status should correspond to reality.

Do not tell users something is:

* Complete when it is still processing
* Compliant when it has not been verified
* Published when it is still a draft
* Saved when persistence failed
* Valid when validation has not completed

A trustworthy interface makes uncertainty visible when uncertainty exists.

This is particularly important for:

* Compliance
* Barcode generation
* Publishing
* AI processing
* External integrations
* Background jobs

### Prefer

> “Checking your barcode…”

then:

> “Verified — this barcode passed the automated checks.”

over immediately displaying:

> “Verified”

because the system expects verification to succeed.

---

## 14. Explain the reason behind requirements

When Almsby asks a user for something, the user should understand why.

This is particularly important for compliance.

Instead of:

> **Enter X**

prefer, when useful:

> **We need X because…**

The explanation should be concise and relevant.

Users should not need to understand the entire regulatory system before they can satisfy a requirement.

### Test

Ask:

> **Would the user understand why we are asking this without researching the subject themselves?**

---

## 15. Don't turn compliance into the identity of the product

Compliance may be the reason someone arrives.

It should not necessarily define the entire experience.

The product should solve the immediate compliance problem exceptionally well.

Then it can reveal additional value:

* Product stories
* Customer relationships
* Product information
* Provenance
* Product care
* Other useful digital experiences

The transition should feel natural rather than like an upsell trap.

### Avoid

Making storytelling feel like an advertisement attached to a compliance workflow.

### Prefer

Showing the user what their newly created digital product identity can actually do for them.

---

## 16. Respect the physical-to-digital transition

Almsby connects physical products with digital experiences.

The scan is therefore a critical transition:

> **physical object → digital identity → useful experience**

The digital experience should immediately make sense in relation to the physical object.

A person scanning a product should not feel like they have unexpectedly entered an unrelated marketing website.

The experience should answer:

> **Why did I scan this?**

and then deliver useful or meaningful value.

---

## 17. Design for trust before delight

Delight is valuable.

Trust is foundational.

When forced to choose, prioritize:

1. Correctness
2. Clarity
3. Predictability
4. User control
5. Accessibility
6. Efficiency
7. Emotional delight

This does not mean Almsby should be dry.

It means delight should be built on a trustworthy foundation.

A beautiful interface that lies about the state of a barcode is worse than an ordinary interface that tells the truth.

---

## 18. Accessibility is part of correctness

Accessibility is not a final polish pass.

A feature is not finished if people cannot reliably understand or operate it.

Consider accessibility during design and implementation:

* Semantic structure
* Keyboard operation
* Focus management
* Labels
* Error association
* Contrast
* Screen-reader comprehension
* Touch targets
* Motion
* Responsive layouts
* Zoom and text scaling

Accessibility requirements should be treated as part of the experience itself.

---

## 19. Design responsive behavior, not just responsive dimensions

A desktop interface should not simply shrink onto a phone.

Consider how:

* Information hierarchy changes
* Navigation changes
* Actions move
* Content reflows
* Tables transform
* Editing experiences simplify
* Visual storytelling changes
* Important controls remain reachable

Responsive behavior should preserve the user's goal, not merely the original layout.

---

## 20. Use consistency to reduce cognitive load

Consistency should exist where it helps users predict behavior.

Reuse:

* Terminology
* Interaction patterns
* Components
* Status language
* Error conventions
* Navigation behavior
* Visual hierarchy

But do not force every experience into the same component merely for consistency.

Consistency is valuable when the underlying meaning is the same.

---

## 21. Don't optimize for configuration

Almsby should not become powerful by making users configure everything.

Every configurable option has a cognitive cost.

Before adding a setting, ask:

> **Does the user actually need control over this?**

Then:

> **Can Almsby choose a good default?**

Then:

> **Is the benefit of exposing this choice worth the complexity it introduces?**

Prefer opinionated defaults with appropriate escape hatches over exhaustive configurability.

---

## 22. The AI should feel like a capable collaborator

AI interactions should feel purposeful rather than magical.

The user should understand:

* What the AI knows
* What it is doing
* What it needs
* What it produced
* What it inferred
* What remains uncertain
* What the user can change

AI should not create the impression of certainty it does not possess.

For creative work especially, the AI should help the user discover and articulate what they already know.

### Preferred interaction

> “You mentioned that the fabric came from a mill you've worked with for years. That's interesting because it gives the piece a sense of continuity. Want to include that?”

rather than:

> “Here's your brand story.”

The first preserves authorship.

---

## 23. Match interaction effort to user value

Every interaction has a cost.

That cost includes:

* Time
* Attention
* Reading
* Decisions
* Typing
* Navigation
* Learning

Do not ask users to perform work whose value they cannot understand.

Do not introduce a multi-step workflow where one step would suffice.

Do not optimize for fewer clicks at the expense of understanding.

The goal is not:

> **Minimum clicks.**

The goal is:

> **Minimum unnecessary effort.**

---

## 24. Design for confidence, not just completion

A user completing a workflow is not necessarily a successful outcome.

They should ideally finish knowing:

* What they accomplished
* Whether it worked
* What is now true
* What they may want to do next

For example, after creating a barcode, the meaningful outcome is not merely:

> “Barcode generated.”

It is closer to:

> “Your product identity is ready, the barcode has been verified, and here's what you can do next.”

Completion should produce confidence.

---

## 25. Every experience should pass the Constitution test

Before shipping a meaningful UX decision, ask:

### Complexity

> **Did we put unnecessary complexity in the user's head?**

### Next step

> **Is the next step obvious?**

### Automation

> **Did we automate work the system can safely perform?**

### Control

> **Did we preserve user understanding and control over consequential decisions?**

### Language

> **Are we speaking in language the user understands?**

### Transparency

> **Does the user know what happened and why?**

### Reliability

> **Can the user trust the result?**

### Predictability

> **Will the user be surprised by anything important?**

### Product value

> **Does this solve the user's actual problem?**

### Humanity

> **Does this respect the maker, their work, and their authorship?**

---

# UX Decision Heuristic

When there are multiple reasonable designs, prefer the one that:

1. Requires less unnecessary user effort.
2. Makes the next step clearer.
3. Automates safe mechanical work.
4. Exposes consequential decisions.
5. Uses understandable language.
6. Preserves user agency.
7. Gives honest feedback about system state.
8. Handles failure gracefully.
9. Reduces cognitive load without hiding important information.
10. Feels coherent with Almsby's product identity.
11. Works for the actual user's context rather than an imagined expert.
12. Makes the resulting product more useful, trustworthy, or meaningful.

If two designs remain equally good, prefer the simpler one.

---

# Anti-Patterns

The following should trigger scrutiny during design review.

### The expert interface

The UI exposes internal technical concepts because the system understands them.

### The configuration wall

The user must make many decisions before accomplishing a simple task.

### The mystery automation

The system changes important information without explaining what happened.

### The AI takeover

The AI produces polished output while making the user feel like an editor rather than the author.

### The questionnaire

The product asks for information without demonstrating why it is needed or whether it could obtain it another way.

### The compliance maze

The user must understand regulatory terminology to complete a regulatory task.

### The generic SaaS dashboard

A collection of cards, tables, buttons, and charts without a clear hierarchy or product-specific rationale.

### The decorative solution

Visual styling is used to make an unclear workflow appear more polished.

### The dead-end error

The user knows something failed but does not know what to do next.

### The false completion

The interface communicates success before the underlying operation has actually succeeded.

### The marketing interruption

A useful product experience is interrupted by promotional messaging that does not serve the user's immediate goal.

### The configurability trap

An option exists primarily because the product can expose it, rather than because users genuinely need it.

---

# Review Questions for Designers and Agents

Before considering a UX solution ready for implementation, answer:

### User

* Who is this for?
* What are they trying to accomplish?
* What do they already understand?
* What do they not need to understand?

### Flow

* What is the user's desired outcome?
* What is the next step at each state?
* Where could the experience remove effort?

### Automation

* What can Almsby safely do automatically?
* Which decisions require user involvement?
* Are consequential decisions explained before approval?

### Communication

* Is the language understandable?
* Does the user know why information is requested?
* Does the user understand what the system did?

### Trust

* Are system states truthful?
* Are errors recoverable?
* Could anything surprise the user in an important way?

### Agency

* Does the user remain in control?
* If AI is involved, does the user remain the author?

### Quality

* Is the experience accessible?
* Does it work responsively?
* Does it handle important non-happy-path states?
* Does it feel intentionally designed rather than assembled from generic patterns?

### Constitution

Finally:

> **Does this make the user's life easier while preserving their understanding and control?**

If the answer is no, reconsider the design.
