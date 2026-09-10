---
id: domain-digital-link
type: domain_definition
authority: product
status: active
---

# Digital Link

## Definition

A GS1 Digital Link is a standardized web-oriented representation of a product identifier.

Within Almsby's domain model, the Digital Link provides the connection between a product identity represented in a physical carrier and the digital experience that can be resolved from it.

## Relationship to the Product

The Digital Link represents an identifier in a web-oriented form.

It is associated with a Product through the Product's relevant identifier, such as a GTIN.

## Relationship to the Barcode

A barcode is a physical carrier.

A Digital Link is digital information that may be encoded in that carrier.

Therefore:

```text
Product
   ↓
GTIN / product identity
   ↓
Digital Link
   ↓
Barcode carrier
   ↓
Physical scan
```

The exact encoding and symbol format are governed by the applicable GS1 requirements and engineering implementation.

## Relationship to the public experience

A Digital Link can resolve to a digital experience associated with the identified Product.

That experience may be a Story Page or another product-related destination.

The Digital Link and the destination experience are separate concepts.

## UX implication

Users should not generally need to construct Digital Link URIs manually.

Almsby should manage the technical representation while making the resulting behavior understandable.

## Integrity

Digital Link behavior must preserve the identity of the intended Product.

A resolver must not silently send a scan to an unrelated product or destination.
