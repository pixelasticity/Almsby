import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOwnedBusiness, getOwnedProduct } from "@/lib/products/queries";

// Mock the Prisma delegate surface; queries.ts only touches these two.
const { productFindFirst, businessFindFirst } = vi.hoisted(() => ({
  productFindFirst: vi.fn(),
  businessFindFirst: vi.fn(),
}));

// cache() outside a React render is environment-dependent — treat wrappers
// as plain functions so tests assert scoping/projection, not memoization.
vi.mock("react", () => ({ cache: <T,>(fn: T) => fn }));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    product: { findFirst: productFindFirst },
    business: { findFirst: businessFindFirst },
  }),
}));

describe("getOwnedProduct", () => {
  beforeEach(() => {
    productFindFirst.mockReset().mockResolvedValue(null);
  });

  it("scopes the lookup to the owner and projects only displayed fields", async () => {
    await getOwnedProduct("prod_1", "user_1");
    expect(productFindFirst).toHaveBeenCalledWith({
      where: { id: "prod_1", business: { ownerId: "user_1" } },
      select: {
        name: true,
        brand: true,
        status: true,
        gtin: { select: { gtinValue: true } },
      },
    });
  });

  it("returns null for a missing or foreign product", async () => {
    await expect(getOwnedProduct("nope", "user_1")).resolves.toBeNull();
  });

  it("returns the product row when owned", async () => {
    const row = { name: "Tee", brand: null, status: "draft", gtin: null };
    productFindFirst.mockResolvedValue(row);
    await expect(getOwnedProduct("prod_1", "user_1")).resolves.toBe(row);
  });
});

describe("getOwnedBusiness", () => {
  beforeEach(() => {
    businessFindFirst.mockReset().mockResolvedValue(null);
  });

  it("scopes the lookup to the owner", async () => {
    await getOwnedBusiness("user_2");
    expect(businessFindFirst).toHaveBeenCalledWith({
      where: { ownerId: "user_2" },
    });
  });

  it("returns null while onboarding is pending", async () => {
    await expect(getOwnedBusiness("user_2")).resolves.toBeNull();
  });
});
