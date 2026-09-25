import { describe, expect, it } from "vitest";
import { buildProductJsonLd, serializeJsonLd } from "@/lib/story/jsonLd";

const PRODUCT = {
  name: "Merino Crew Neck",
  brand: "Studio",
  countryOfOrigin: "Portugal",
  materialComposition: "100% merino wool",
  gtin: { gtinValue: "04006381333931" },
};

describe("buildProductJsonLd", () => {
  it("maps the brief §6 fields exactly", () => {
    expect(buildProductJsonLd(PRODUCT)).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Merino Crew Neck",
      brand: { "@type": "Brand", name: "Studio" },
      gtin14: "04006381333931",
      countryOfOrigin: "Portugal",
      material: "100% merino wool",
    });
  });

  it("keeps the name when everything else is unset (name is required)", () => {
    expect(buildProductJsonLd({ name: "Sample" })).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Sample",
    });
  });

  it("omits unset fields rather than claiming an empty value", () => {
    // An unstated origin is not the claim "origin is empty" — same distinction
    // PassportSummary draws by rendering "not set" instead of a blank.
    const jsonLd = buildProductJsonLd({
      name: "Sample",
      brand: null,
      countryOfOrigin: null,
      materialComposition: null,
      gtin: null,
    });
    expect(Object.keys(jsonLd)).not.toContain("brand");
    expect(Object.keys(jsonLd)).not.toContain("countryOfOrigin");
    expect(Object.keys(jsonLd)).not.toContain("material");
    expect(Object.keys(jsonLd)).not.toContain("gtin14");
  });

  it("treats whitespace-only values as unset", () => {
    const jsonLd = buildProductJsonLd({
      ...PRODUCT,
      brand: "   ",
      countryOfOrigin: " ",
    });
    expect(jsonLd.brand).toBeUndefined();
    expect(jsonLd.countryOfOrigin).toBeUndefined();
  });

  it("uses the stored GTIN value verbatim — the lookup had no tolerance", () => {
    const jsonLd = buildProductJsonLd(PRODUCT);
    expect(jsonLd.gtin14).toBe(PRODUCT.gtin.gtinValue);
  });
});

describe("serializeJsonLd — the script-tag safety boundary", () => {
  it("emits JSON that parses back to the same object", () => {
    const jsonLd = buildProductJsonLd(PRODUCT);
    expect(JSON.parse(serializeJsonLd(jsonLd))).toEqual(jsonLd);
  });

  it("neutralizes a </script> payload in any field", () => {
    const hostile = buildProductJsonLd({
      name: "</script><script>alert(1)</script>",
      brand: "Ben & Jerry's <b>",
      gtin: { gtinValue: "04006381333931" },
    });

    const out = serializeJsonLd(hostile);

    // Nothing that could close the element or open another one survives.
    expect(out).not.toContain("<");
    expect(out).not.toContain("</script");
    expect(out).not.toContain("<script");

    // ...and the data is intact: \u003c is an escape, not a mangle.
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
    expect(JSON.parse(out).brand.name).toBe("Ben & Jerry's <b>");
  });

  it("escapes angle brackets in nested values too", () => {
    const out = serializeJsonLd({ a: "<", b: { c: ["<", "ok"] } });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ a: "<", b: { c: ["<", "ok"] } });
  });
});
