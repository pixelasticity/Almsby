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
// Photo URLs are validated against our R2 host, which comes from env.
vi.mock("@/lib/env", () => ({
  env: { r2PublicDomain: "images.example.test" },
}));
// The storage layer owns the AWS SDK and its own tests; here we pin the
// ACTION's behavior around it (gates, error mapping, no DB write).
vi.mock("@/lib/story/storage", () => ({
  validatePhotoFile: vi.fn(),
  uploadStoryPhoto: vi.fn(),
}));

import {
  publishStoryAction,
  saveStoryAction,
  uploadStoryPhotoAction,
} from "@/app/(dashboard)/products/[id]/studio/actions";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { getOwnedProduct } from "@/lib/products/queries";
import { getDb } from "@/lib/db";
import { uploadStoryPhoto, validatePhotoFile } from "@/lib/story/storage";
import { MAX_STORY_PHOTOS } from "@/lib/story/photoTypes";

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
const PHOTO_PREFIX = "https://images.example.test/story-photos/prod_1/";
const PHOTO_1 = {
  url: `${PHOTO_PREFIX}uuid-1-raw.jpg`,
  role: "materials",
  caption: "Undyed merino, straight off the carder",
};
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
    const state = await saveStoryAction("prod_1", DOC, "A headline", [PHOTO_1]);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledTimes(1);
    // The photo association is persisted HERE, with the rest of the story.
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ photos: [PHOTO_1] }),
        update: expect.objectContaining({ photos: [PHOTO_1] }),
      })
    );
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
      const state = await saveStoryAction("prod_1", DOC, null, []);
      expect(state.error).toMatch(/Could not save the story/);
      expectCacheNotCleared();
    } finally {
      log.mockRestore();
    }
  });

  it("allows a headlineless draft save (only publish is headline-gated)", async () => {
    const state = await saveStoryAction("prod_1", DOC, null, []);
    expect(state).toEqual({});
    expectCacheCleared();
  });

  it("rejects an unsafe link before any write or cache clear", async () => {
    const state = await saveStoryAction("prod_1", HOSTILE_DOC, "A headline", []);
    expect(state.error).toMatch(/not allowed/);
    expect(upsert).not.toHaveBeenCalled();
    expectCacheNotCleared();
  });

  it("rejects unauthenticated saves before any write or cache clear", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const state = await saveStoryAction("prod_1", DOC, null, []);
    expect(state.error).toMatch(/signed in/);
    expect(upsert).not.toHaveBeenCalled();
    expectCacheNotCleared();
  });
});

describe("publishStoryAction", () => {
  it("commits with published: true, then clears the story page cache", async () => {
    const state = await publishStoryAction("prod_1", DOC, "A headline", true, [PHOTO_1]);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: "prod_1" },
        create: expect.objectContaining({ published: true, photos: [PHOTO_1] }),
        update: expect.objectContaining({ published: true, photos: [PHOTO_1] }),
      })
    );
    expectCacheCleared();
  });

  it("refuses to publish without a headline — before write or cache clear", async () => {
    for (const headline of [null, "", "   "]) {
      vi.clearAllMocks();
      upsert.mockResolvedValue({});
      vi.mocked(getDb).mockReturnValue({ storyPage: { upsert } } as never);
      const state = await publishStoryAction("prod_1", DOC, headline, true, []);
      expect(state.error).toBe("A headline is required to publish a story.");
      expect(upsert).not.toHaveBeenCalled();
      expectCacheNotCleared();
    }
  });

  it("unpublish (published: false) also busts the cache", async () => {
    const state = await publishStoryAction("prod_1", DOC, "A headline", false, []);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ published: false }),
      })
    );
    expectCacheCleared();
  });
});

describe("saveStoryAction — photo gate", () => {
  it("rejects an off-domain photo URL before any write or cache clear", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const state = await saveStoryAction("prod_1", DOC, "A headline", [
        { url: "https://evil.example/track.gif" },
      ]);
      expect(state.error).toMatch(/could not be verified/);
      expect(upsert).not.toHaveBeenCalled();
      expectCacheNotCleared();
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it("rejects an unknown photo role with role-specific copy", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const state = await saveStoryAction("prod_1", DOC, "A headline", [
        { url: `${PHOTO_PREFIX}x.jpg`, role: "cover" },
      ]);
      expect(state.error).toMatch(/category/);
      expect(upsert).not.toHaveBeenCalled();
      expectCacheNotCleared();
    } finally {
      log.mockRestore();
    }
  });

  it("stores a legacy bare URL as a structured photo", async () => {
    // A tab left open across a deploy still sends the old shape; that save must
    // succeed, and what lands in the column is structured either way.
    const state = await saveStoryAction("prod_1", DOC, "A headline", [
      `${PHOTO_PREFIX}legacy.jpg`,
    ]);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          photos: [{ url: `${PHOTO_PREFIX}legacy.jpg` }],
        }),
      })
    );
  });

  it("refuses more photos than the cap", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const many = Array.from(
        { length: MAX_STORY_PHOTOS + 1 },
        (_, index) => ({ url: `${PHOTO_PREFIX}${index}.jpg` })
      );
      const state = await saveStoryAction("prod_1", DOC, "A headline", many);
      expect(state.error).toMatch(/up to 12 photos/);
      expect(upsert).not.toHaveBeenCalled();
      expectCacheNotCleared();
    } finally {
      log.mockRestore();
    }
  });

  it("treats an absent photo list as 'no photos', not an error", async () => {
    // A story saved before photos existed must stay saveable.
    const state = await saveStoryAction("prod_1", DOC, "A headline", null);
    expect(state).toEqual({});
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ photos: [] }),
      })
    );
  });
});

describe("uploadStoryPhotoAction", () => {
  function form(file?: File) {
    const data = new FormData();
    if (file) data.append("file", file);
    return data;
  }
  const jpeg = () => {
    const file = new File([new Uint8Array([1, 2, 3])], "hero.jpg", {
      type: "image/jpeg",
    });
    // jsdom's File predates Blob.arrayBuffer in this environment; a real Server
    // Action receives an undici File in production, which implements it.
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    return file;
  };

  it("requires a signed-in session", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const state = await uploadStoryPhotoAction("prod_1", form(jpeg()));
    expect(state.ok).toBe(false);
    if (!state.ok) expect(state.error).toMatch(/signed in/);
    expect(uploadStoryPhoto).not.toHaveBeenCalled();
  });

  it("requires ownership of the product", async () => {
    vi.mocked(getOwnedProduct).mockResolvedValue(null);
    const state = await uploadStoryPhotoAction("prod_1", form(jpeg()));
    expect(state).toEqual({ ok: false, error: "Product not found." });
    expect(uploadStoryPhoto).not.toHaveBeenCalled();
  });

  it("rejects a request carrying no file", async () => {
    const state = await uploadStoryPhotoAction("prod_1", form());
    expect(state.ok).toBe(false);
    expect(uploadStoryPhoto).not.toHaveBeenCalled();
  });

  it("returns the stored URL and writes nothing to the database", async () => {
    vi.mocked(uploadStoryPhoto).mockResolvedValue(PHOTO_1.url);
    const state = await uploadStoryPhotoAction("prod_1", form(jpeg()));
    expect(state).toEqual({ ok: true, url: PHOTO_1.url });
    expect(validatePhotoFile).toHaveBeenCalled();
    // Upload-on-select, persist-on-save: an upload never touches the DB.
    expect(upsert).not.toHaveBeenCalled();
    expectCacheNotCleared();
  });

  it("maps a validation failure to storage's user-safe message", async () => {
    vi.mocked(validatePhotoFile).mockImplementationOnce(() => {
      throw new Error("The uploaded image is larger than 5 MB.");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const state = await uploadStoryPhotoAction("prod_1", form(jpeg()));
      expect(state).toEqual({
        ok: false,
        error: "The uploaded image is larger than 5 MB.",
      });
      expect(uploadStoryPhoto).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it("fails loud and generically when storage itself fails", async () => {
    vi.mocked(uploadStoryPhoto).mockRejectedValue(
      new Error("S3 not reachable: credentials expired")
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const state = await uploadStoryPhotoAction("prod_1", form(jpeg()));
      expect(state).toEqual({
        ok: false,
        error: "Could not upload the photo. Please try again.",
      });
      // Internals stay in the log, never in the maker's message.
      if (!state.ok) expect(state.error).not.toMatch(/S3|credentials/);
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
