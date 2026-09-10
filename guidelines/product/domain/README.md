---
id: product-domain-model
type: domain_definition
authority: product
status: active
audience:
  - product
  - design
  - engineering
  - all_agents
derived_from:
  - product-constitution
review:
  required: true
---

# Almsby Domain Model

This directory defines the core concepts of Almsby in **product and business terms**.

The domain model is the shared conceptual vocabulary for the product. It exists so humans and AI agents can reason about Almsby consistently without inferring meaning from database tables, routes, components, or implementation details.

## What this is

These definitions describe:

- What a concept means to Almsby
- Why the concept exists
- How it relates to other concepts
- What must remain true about it
- What the user should understand about it
- Where technical terminology is relevant

These definitions are intentionally more stable than individual implementation details.

A database model may change. A route may change. A component may change. The underlying business concept should not silently change with them.

## What this is not

This directory is not:

- Prisma documentation
- A database schema
- An API specification
- A UI specification
- A GS1 technical specification
- A list of implementation classes
- A replacement for compliance requirements

Technical implementation belongs in `guidelines/engineering/`.

Regulatory and standards requirements belong in `guidelines/engineering/compliance/`.

User interaction guidance belongs in `guidelines/ux/`.

# Core concepts

## Business

The organization or maker using Almsby to manage products and their digital identities.

A Business may own or manage multiple Products.

See [`business.md`](./business.md).

## Product

A physical product represented within Almsby.

The Product is the primary object around which much of the Almsby experience is organized.

A Product may have:

- A GTIN
- A barcode
- A Digital Product Identity
- A Story
- Compliance-related information
- Product attributes
- A public digital experience

See [`product.md`](./product.md).

## GTIN

A Global Trade Item Number associated with a Product.

A GTIN is an identifier. It is not itself the barcode, public web page, or product story.

See [`gtin.md`](./gtin.md).

## Digital Product Identity

The digital identity that connects a physical Product to useful digital information and experiences.

It includes the relationship between the Product, its identifier, its Digital Link, and the digital experiences available through that identity.

See [`digital-product-identity.md`](./digital-product-identity.md).

## Barcode

A machine-readable symbol that physically represents information associated with a Product.

For Almsby, the barcode is an important physical-to-digital bridge. The generated symbol must be correct and reliably scannable using real hardware.

See [`barcode.md`](./barcode.md).

## Digital Link

A GS1 Digital Link URI provides a standardized web-oriented representation of a product identifier.

In Almsby's model, the Digital Link connects the product identity represented in a physical carrier with the digital experience that can be resolved from it.

See [`digital-link.md`](./digital-link.md).

## Story

The meaningful information and narrative associated with a Product.

A Story helps communicate why a Product exists and can make otherwise invisible aspects of the product visible to customers.

AI may help organize, clarify, and develop a Story, but should not replace the maker's voice with generic marketing language.

See [`story.md`](./story.md).

## Compliance

The set of product, standards, regulatory, and data requirements that Almsby must help a user satisfy.

Compliance is an important entry point for Almsby. It is not necessarily the destination of the product experience.

See [`compliance.md`](./compliance.md).

## Digital Product Passport

A structured digital record associated with a product that can provide information required or useful for product transparency, sustainability, regulatory compliance, and related purposes.

The exact requirements and scope may depend on the applicable product category, regulation, delegated act, standard, and implementation context.

See [`digital-product-passport.md`](./digital-product-passport.md).

# Relationships

At a high level:

```text
Business
   │
   └── owns/manages
          │
        Product
          │
          ├── has → GTIN
          │
          ├── has → Digital Product Identity
          │                 │
          │                 └── represented through → Digital Link
          │
          ├── has → Barcode
          │
          ├── has → Story
          │
          ├── has → Compliance information
          │
          └── may have → Digital Product Passport
```

The exact technical representation may change. The conceptual relationships should remain stable unless an explicit product decision changes them.

# Important distinctions

## Product ≠ GTIN

A Product is a business/product concept.

A GTIN is an identifier for a trade item.

A Product may have an associated GTIN, but the concepts are not interchangeable.

## GTIN ≠ Barcode

A GTIN is data.

A barcode is a machine-readable physical representation.

A barcode may encode a Digital Link containing a GTIN rather than simply representing the GTIN as a legacy numeric symbol.

## Barcode ≠ Digital Link

A barcode is a physical carrier.

A Digital Link is a standardized URI representation connecting an identifier to web-based information.

The barcode can carry a Digital Link.

## Digital Link ≠ Story Page

The Digital Link provides the standardized identity/resolution mechanism.

The Story Page is one digital experience that can be reached through that identity.

The two should not be treated as the same layer.

## Story ≠ Marketing Copy

A Story communicates meaningful information about the Product and why it exists.

It may support sales and customer connection, but its purpose is not simply to maximize conversion.

The maker's authorship and authenticity matter.

## Compliance ≠ Product Identity

Compliance requirements may determine information the Product needs to expose or maintain.

They do not define everything that the Product is.

Almsby's product identity can support experiences beyond compliance.

# Domain invariants

These are conceptual truths that implementation should preserve.

### Product-centered

Users should be able to work from the concept of their Product rather than needing to understand the underlying infrastructure.

### Identity integrity

A Product's identifiers must remain correctly associated with that Product.

### Physical/digital continuity

The physical barcode, product identity, Digital Link, and resulting digital experience must form a coherent chain.

### Scan reliability

A generated barcode must be suitable for real-world scanning, not merely visually plausible.

### Story ownership

The Product Story belongs to the maker/business.

AI assistance must preserve authorship.

### No duplicated authority

Where product information already has an authoritative source, downstream experiences should use that source rather than creating competing copies.

### Compliance truthfulness

Almsby must not represent a Product as compliant merely because some fields have been populated.

Compliance status must reflect the actual verification state and applicable requirements.

### Honest system state

The product should distinguish between:

- Not started
- In progress
- Validated
- Verified
- Published
- Failed
- Requires attention

The exact UI terminology may vary, but the underlying distinction must remain truthful.

# Domain boundaries

When introducing a new concept, first determine whether it is:

1. A business concept
2. A technical implementation concept
3. A UX concept
4. A regulatory/standards concept
5. A temporary implementation detail

Only durable business concepts belong here.

| Concept | Domain model? | Primary home |
|---|---:|---|
| Product | Yes | `product/domain/` |
| GTIN | Yes | `product/domain/` |
| Story | Yes | `product/domain/` |
| Digital Link | Yes | `product/domain/` |
| Prisma model | No | Engineering/code |
| React component | No | Code |
| Tiptap node | No | Engineering/delivery |
| Button style | No | `ux/design-system/` |
| Migration procedure | No | Engineering operations |
| Compliance requirement | Partially | Engineering/compliance |
| Scan test result | No | Quality evidence |

# Changing the domain model

Changing the definition of a core domain concept can have consequences across:

- Product
- UX
- Data
- APIs
- Public URLs
- Compliance
- AI behavior
- Documentation

If a proposed change alters the meaning or relationship of a core concept, check:

1. The Product Constitution
2. Existing product decisions
3. Strategy
4. Engineering constraints
5. Relevant compliance requirements
6. Existing implementation

If the change represents a new durable product decision, record that decision in `product/decisions/`.

# Guiding principle

The domain model exists to give every person and every agent working on Almsby the same answer to:

> **“What is this thing, and how does it relate to everything else?”**

When implementation details and conceptual meaning diverge, preserve the conceptual model and explicitly decide whether the implementation or the domain definition needs to change.
