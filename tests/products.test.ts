import { describe, expect, it } from "vitest";
import { validateProductInput } from "@/lib/products/validate";

describe("products", () => {
  it("accepts a minimal valid product (name only)", () => {
    const r = validateProductInput({
      name: "Merino Crew Neck",
      brand: "",
      netContent: "",
      countryOfOrigin: "",
      materialComposition: "",
      status: "draft",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.name).toBe("Merino Crew Neck");
    expect(r.data.brand).toBeNull();
    expect(r.data.netContent).toBeNull();
    expect(r.data.countryOfOrigin).toBeNull();
    expect(r.data.materialComposition).toBeNull();
    expect(r.data.status).toBe("draft");
  });

  it("rejects a missing / blank name", () => {
    const r = validateProductInput({
      name: "   ",
      brand: "",
      netContent: "",
      countryOfOrigin: "",
      materialComposition: "",
      status: "draft",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.toLowerCase()).toContain("name");
  });

  it("trims whitespace and keeps populated optionals", () => {
    const r = validateProductInput({
      name: "  Tee  ",
      brand: " Studio ",
      netContent: " 350 ml ",
      countryOfOrigin: "",
      materialComposition: "100% Organic Cotton",
      status: "active",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.name).toBe("Tee");
    expect(r.data.brand).toBe("Studio");
    expect(r.data.netContent).toBe("350 ml");
    expect(r.data.materialComposition).toBe("100% Organic Cotton");
    expect(r.data.countryOfOrigin).toBeNull();
    expect(r.data.status).toBe("active");
  });

  it("falls back an unknown status to draft", () => {
    const r = validateProductInput({
      name: "Sock",
      brand: "",
      netContent: "",
      countryOfOrigin: "",
      materialComposition: "",
      status: "not-a-status",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.status).toBe("draft");
  });
});