import { describe, expect, it, vi } from "vitest";
import {
  getProductWithStoryByGtin,
  type ProductStoryDb,
  type StoryPageInclude,
} from "@/lib/story/queries";

/** Structural stub — only the method the query touches, no full PrismaClient. */
function makeDb(): { db: ProductStoryDb; findFirst: ReturnType<typeof vi.fn> } {
  const findFirst = vi.fn();
  const db = { product: { findFirst } } as unknown as ProductStoryDb;
  return { db, findFirst };
}

describe("getProductWithStoryByGtin", () => {
  it("queries the product by GTIN value with storyPage + gtin included", async () => {
    const { db, findFirst } = makeDb();
    findFirst.mockResolvedValue({
      id: "prod_1",
      name: "Merino Crew Neck",
      businessId: "biz_1",
      brand: "Studio",
      status: "active",
      gtin: { gtinValue: "00012345678905" },
      storyPage: { headline: "Our signature knit" },
    } as unknown as StoryPageInclude);

    const result = await getProductWithStoryByGtin("00012345678905", db);

    expect(findFirst).toHaveBeenCalledWith({
      where: { gtin: { gtinValue: "00012345678905" } },
      include: { storyPage: true, gtin: true },
    });
    expect(result?.name).toBe("Merino Crew Neck");
    expect(result?.storyPage?.headline).toBe("Our signature knit");
  });

  it("returns null when no product owns the GTIN", async () => {
    const { db, findFirst } = makeDb();
    findFirst.mockResolvedValue(null);
    const result = await getProductWithStoryByGtin("00012345678905", db);
    expect(result).toBeNull();
  });
});