import { beforeEach, describe, expect, it, vi } from "vitest";

// Action-level seams: the modules the studio actions depend on at runtime.
// Mocking them pins the INVARIANTS — invalidation happens after a committed
// write and never after a rejected one — without a live DB or Next runtime.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({
  getCurrentUser: vi.fn(),
  requireAuth: vi.fn(),
}));
vi.mock("@/lib/products/queries", () => ({ getOwnedProduct: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));

import { publishStoryAction, saveStoryAction } from "@/app/(dashboard)/products/[id]/studio/actions";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { getOwnedProduct } from "@/lib/products/queries";
import { getDb } from "@/lib/db";

const DOC = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }],
};
const HOSTILE_DOC = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "click",
          marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
        },
      ],
    },
  ],
};

const upsert = vi.fn();
const STORY_PATHS: [string, string][] = [
  ["/(public)/s/[gtin]", "page"],
  ["/s/[gtin]", "page"],
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue({ id: "user_1" } as never);
  vi.mocked(getOwnedProduct).mockResolvedValue({ id: "prod_1" } as never);
  upsert.mockResolvedValue({});
  vi.mocked(getDb).mockReturnValue({
    storyPage: { upsert } as never,
  } as never);
});

function expectCacheCleared() {
  for (const [path, type] of STORY_PATHS) {
    expect(revalidatePath).toHaveBeenCalledWith(path, type);
  }
}

function expectCacheNotCleared() {
  expect(revalidatePath).not.toHaveBeenCalled();
}

describe("saveStoryAction", () => {
  it("commits the upsert, then clears the story page cache", async () => {
    const state = await saveStoryAction("prod_1", DOC, "A headline");
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledTimes(1);
    expectCacheCleared();
    // Invalidation is strictly ordered AFTER the write.
    expect(upsert.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(revalidatePath).mock.invocationCallOrder[0]
    );
  });

  it("does NOT clear the cache when the write fails (keeps the good page)", async () => {
    upsert.mockRejectedValueOnce(new Error("db down"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const state = await saveStoryAction("prod_1", DOC, null);
      expect(state.error).toMatch(/Could not save the story/);
      expectCacheNotCleared();
    } finally {
      log.mockRestore();
    }
  });

  it("allows a headlineless draft save (only publish is headline-gated)", async () => {
    const state = await saveStoryAction("prod_1", DOC, null);
    expect(state).toEqual({});
    expectCacheCleared();
  });

  it("rejects an unsafe link before any write or cache clear", async () => {
    const state = await saveStoryAction("prod_1", HOSTILE_DOC, "A headline");
    expect(state.error).toMatch(/not allowed/);
    expect(upsert).not.toHaveBeenCalled();
    expectCacheNotCleared();
  });

  it("rejects unauthenticated saves before any write or cache clear", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const state = await saveStoryAction("prod_1", DOC, null);
    expect(state.error).toMatch(/signed in/);
    expect(upsert).not.toHaveBeenCalled();
    expectCacheNotCleared();
  });
});

describe("publishStoryAction", () => {
  it("commits with published: true, then clears the story page cache", async () => {
    const state = await publishStoryAction("prod_1", DOC, "A headline", true);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: "prod_1" },
        create: expect.objectContaining({ published: true }),
        update: expect.objectContaining({ published: true }),
      })
    );
    expectCacheCleared();
  });

  it("refuses to publish without a headline — before write or cache clear", async () => {
    for (const headline of [null, "", "   "]) {
      vi.clearAllMocks();
      upsert.mockResolvedValue({});
      vi.mocked(getDb).mockReturnValue({ storyPage: { upsert } } as never);
      const state = await publishStoryAction("prod_1", DOC, headline, true);
      expect(state.error).toBe("A headline is required to publish a story.");
      expect(upsert).not.toHaveBeenCalled();
      expectCacheNotCleared();
    }
  });

  it("unpublish (published: false) also busts the cache", async () => {
    const state = await publishStoryAction("prod_1", DOC, "A headline", false);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ published: false }),
      })
    );
    expectCacheCleared();
  });
});
