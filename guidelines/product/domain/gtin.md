---
id: domain-gtin
type: domain_definition
authority: product
status: active
---

# GTIN

## Definition

A GTIN (Global Trade Item Number) is a standardized identifier associated with a trade item within the GS1 system.

Within Almsby, a GTIN identifies the Product for relevant product-identity and barcode workflows.

## GTIN is not

A GTIN is not:

- The barcode image
- The Digital Link URI
- The public Story Page
- The Product Story
- The Product itself

These concepts may be associated with the GTIN but remain distinct.

## Almsby responsibilities

Almsby may help users:

- Add or import GTINs
- Validate GTINs
- Associate GTINs with Products
- Use GTINs in Digital Link workflows
- Produce scannable barcode carriers

## Integrity

GTIN validation is important because incorrect identifiers can produce downstream failures.

Almsby should not silently alter a user's identifier to make it appear valid.

## UX implication

Users should generally be able to work with their Product first and encounter GTIN terminology when the identifier becomes relevant.
