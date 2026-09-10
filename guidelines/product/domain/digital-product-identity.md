# Digital Product Identity

### Definition

A Digital Product Identity is the digital representation and connection of a physical Product to standardized identification and digital information.

It connects the product's physical identity with digital experiences that can be accessed from that identity.

### Components

Depending on the product and applicable capabilities, the identity may involve:

* Product
* GTIN
* Digital Link
* Barcode
* Public digital experiences
* Product information
* Story
* Compliance information
* Digital Product Passport information

### Important distinction

The Digital Product Identity is the **conceptual relationship**.

It is not synonymous with any one implementation artifact.

A URL, barcode, database record, or Story Page may participate in the identity without being the identity itself.

### UX implication

Users should not normally have to construct or understand the identity architecture manually.

Almsby should make the relationship understandable through the product experience.

---

# Domain relationship

```text
Business
   │
   └── Product
         │
         └── GTIN
               │
               └── Digital Product Identity
```

The remaining concepts attach to this identity without replacing it.
