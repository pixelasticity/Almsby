/**
 * Schema.org Product structured data for published story pages
 * (Phase 2 brief §6 / architecture doc Section 6, Layer 1 — AI & crawler
 * legibility).
 *
 * Split in two on purpose: `buildProductJsonLd` is pure field mapping (the
 * brief's contract, testable without a payload), and `serializeJsonLd` owns
 * the escaping that makes the `<script>` tag safe. Nothing else may produce
 * that string.
 */

/** Structural seam — matches the Product fields StoryPageInclude carries. */
export type JsonLdProduct = {
  name: string;
  brand?: string | null;
  countryOfOrigin?: string | null;
  materialComposition?: string | null;
  gtin?: { gtinValue: string } | null;
};

export type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  brand?: { "@type": "Brand"; name: string };
  gtin14?: string;
  countryOfOrigin?: string;
  material?: string;
};

/**
 * Maps Product columns to the brief §6 shape.
 *
 * Unset fields are OMITTED, never emitted as null or "": "no origin stated" is
 * a different claim from "origin is empty" — the same distinction
 * PassportSummary makes by rendering "not set" / "—" — and schema.org
 * validators read null as malformed rather than absent. Whitespace-only values
 * are treated as unset for the same reason.
 *
 * `gtin14` comes straight from the stored GTIN row: the route looked that row
 * up BY its 14-digit value, so normalizing here would imply a tolerance the
 * lookup doesn't have.
 */
export function buildProductJsonLd(product: JsonLdProduct): ProductJsonLd {
  const jsonLd: ProductJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
  };

  const brand = product.brand?.trim();
  if (brand) jsonLd.brand = { "@type": "Brand", name: brand };

  if (product.gtin?.gtinValue) jsonLd.gtin14 = product.gtin.gtinValue;

  const origin = product.countryOfOrigin?.trim();
  if (origin) jsonLd.countryOfOrigin = origin;

  const material = product.materialComposition?.trim();
  if (material) jsonLd.material = material;

  return jsonLd;
}

/**
 * JSON-LD text for a `<script type="application/ld+json">` element.
 *
 * Every `<` becomes `\u003c` so no field value can terminate the element: a
 * product name containing `</script><script>alert(1)</script>` would otherwise
 * close the tag and inject markup. `\u003c` is a valid JSON escape, so a parser
 * reads back the original character — only the raw bytes change, never the
 * data.
 *
 * This is the ONE sanctioned `dangerouslySetInnerHTML` in the story path, and
 * it is not the thing brief §9 forbids: no story HTML is rendered through it
 * (the payload is built from Product columns and never from the TipTap body,
 * so the bounded-schema guarantee is untouched) and it produces no DOM — it is
 * data for machines. Every serialization must go through here; the hostile-
 * input case is pinned in tests/story/json-ld.test.ts.
 */
export function serializeJsonLd(jsonLd: unknown): string {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}
