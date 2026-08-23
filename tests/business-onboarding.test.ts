import { describe, expect, it } from "vitest";
import { validateBusinessOnboarding } from "@/lib/products/business-onboarding";

describe("business onboarding", () => {
  const valid = {
    name: "Acme Goods Co.",
    industryCategory: "apparel",
    operatingCountry: "US",
    currency: "USD",
  };

  it("accepts a complete valid onboarding", () => {
    const r = validateBusinessOnboarding(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.name).toBe("Acme Goods Co.");
    expect(r.data.industryCategory).toBe("apparel");
    expect(r.data.operatingCountry).toBe("US");
    expect(r.data.currency).toBe("USD");
  });

  it("rejects a missing business name", () => {
    const r = validateBusinessOnboarding({ ...valid, name: "" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("Enter a business name to continue.");
  });

  it("rejects a too-short business name", () => {
    const r = validateBusinessOnboarding({ ...valid, name: "A" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe(
      "Business names must be at least 2 characters long."
    );
  });

  it("rejects a missing category", () => {
    const r = validateBusinessOnboarding({ ...valid, industryCategory: "" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe(
      "Select an industry category to customize your workspace tools."
    );
  });

  it("rejects a missing country and currency", () => {
    const r = validateBusinessOnboarding({
      ...valid,
      operatingCountry: "",
      currency: "",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("Select your primary operating country.");
  });
});