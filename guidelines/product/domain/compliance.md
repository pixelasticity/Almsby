---
id: domain-compliance
type: domain_definition
authority: engineering
status: active
---

# Compliance

## Definition

Compliance is the set of applicable product, standards, regulatory, and data requirements that Almsby must help a user satisfy.

## Role in Almsby

Compliance is an important entry point for Almsby.

It is not necessarily the destination of the product experience.

The product should solve the immediate compliance problem well while allowing the resulting digital product identity to support useful experiences beyond compliance.

## Compliance is contextual

Whether a Product satisfies a requirement can depend on:

- Product category
- Applicable regulation
- Applicable standard
- Jurisdiction
- Required data
- Verification state
- Effective dates
- Other relevant conditions

Therefore, compliance should not be modeled as simply “fields are populated.”

## Compliance status

Almsby should distinguish between having information and having verified compliance.

A Product must not be represented as compliant merely because expected fields have values.

## Authority

Detailed regulatory and standards requirements belong in:

`guidelines/engineering/compliance/`

Those documents are authoritative for applicable hard constraints.

This domain definition describes the product concept of compliance; it does not replace those requirements.

## UX implication

Users should be helped through compliance without being required to become regulatory experts.

When a requirement matters, explain what is needed and why in understandable language.
