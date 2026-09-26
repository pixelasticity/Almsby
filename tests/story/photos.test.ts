import { describe, expect, it, vi } from "vitest";

// The gate reads the R2 public domain through env (a lazy getter), so each test
// pins the environment it is asserting against — same seam as storage.test.ts.
vi.mock("@/lib/env", () => ({
  env: { r2PublicDomain: "images.example.test" },
}));

import {
  MAX_PHOTO_CAPTION_LENGTH,
  PHOTO_ROLES,
  isPhotoRole,
  normalizeStoryPhotos,
  photoAltText,
  storyPhotoUrlPrefix,
  validateStoryPhotos,
} from "@/lib/story/photos";
import { MAX_STORY_PHOTOS } from "@/lib/story/photoTypes";

const PREFIX = "https://images.example.test/story-photos/prod_1/";
const U1 = `${PREFIX}uuid-1-raw.jpg`;
const U2 = `${PREFIX}uuid-2-detail.jpg`;

/** Silences the fail-loud logging while asserting it happened. */
function captureLogs() {
  return vi.spyOn(console, "error").mockImplementation(() => {});
}

describe("storyPhotoUrlPrefix", () => {
  it("is our own R2 host under the story-photos directory", () => {
    expect(storyPhotoUrlPrefix()).toBe(
      "https://images.example.test/story-photos/"
    );
  });
});

describe("PHOTO_ROLES / isPhotoRole", () => {
  it("is the five narrative roles, in the order a story tells itself", () => {
    expect(PHOTO_ROLES).toEqual([
      "materials",
      "process",
      "details",
      "makers",
      "in_use",
    ]);
  });

  it("recognises exactly those", () => {
    for (const role of PHOTO_ROLES) expect(isPhotoRole(role)).toBe(true);
    for (const bad of ["cover", "MATERIALS", "in_use ", "", null, undefined, 3]) {
      expect(isPhotoRole(bad)).toBe(false);
    }
  });
});

describe("validateStoryPhotos (write path)", () => {
  it("accepts structured photos with role and caption", () => {
    expect(
      validateStoryPhotos([
        { url: U1, role: "materials", caption: "Undyed merino" },
        { url: U2 },
      ])
    ).toEqual({
      ok: true,
      photos: [
        { url: U1, role: "materials", caption: "Undyed merino" },
        { url: U2 },
      ],
    });
  });

  it("trims the caption and omits empty fields rather than storing ''", () => {
    // "no role chosen" and "role: ''" must not be two states in the database.
    expect(validateStoryPhotos([{ url: U1, role: "", caption: "   " }])).toEqual({
      ok: true,
      photos: [{ url: U1 }],
    });
  });

  it("accepts a caption at exactly the limit", () => {
    const caption = "a".repeat(MAX_PHOTO_CAPTION_LENGTH);
    expect(validateStoryPhotos([{ url: U1, caption }])).toEqual({
      ok: true,
      photos: [{ url: U1, caption }],
    });
  });

  it("upgrades a legacy bare URL instead of failing the save", () => {
    // A maker's tab opened before the deploy keeps sending the old shape;
    // rejecting a save we can upgrade ourselves would be our bug, not theirs.
    expect(validateStoryPhotos([U1])).toEqual({ ok: true, photos: [{ url: U1 }] });
  });

  it("treats null/undefined as 'no photos', not an error", () => {
    expect(validateStoryPhotos(null)).toEqual({ ok: true, photos: [] });
    expect(validateStoryPhotos(undefined)).toEqual({ ok: true, photos: [] });
    expect(validateStoryPhotos([])).toEqual({ ok: true, photos: [] });
  });

  it("collapses duplicates by URL, keeping the first (richer) entry", () => {
    expect(
      validateStoryPhotos([{ url: U1, role: "process" }, { url: U1 }])
    ).toEqual({ ok: true, photos: [{ url: U1, role: "process" }] });
  });

  it("rejects an off-domain URL and names it for the log", () => {
    const result = validateStoryPhotos([{ url: "https://evil.example/track.gif" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/could not be verified/);
      expect(result.offending).toContain("https://evil.example/track.gif");
    }
  });

  it("rejects a same-host URL outside the story-photos directory", () => {
    const result = validateStoryPhotos([
      { url: "https://images.example.test/other/x.jpg" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("rejects scheme tricks (javascript:, data:, protocol-relative, http:)", () => {
    for (const bad of [
      "javascript:alert(1)",
      "data:image/svg+xml;base64,PHN2Zz4=",
      "//images.example.test/story-photos/prod_1/x.jpg",
      "http://images.example.test/story-photos/prod_1/x.jpg",
    ]) {
      expect(validateStoryPhotos([{ url: bad }]).ok).toBe(false);
    }
  });

  it("rejects an unknown role with role-specific copy", () => {
    const result = validateStoryPhotos([{ url: U1, role: "cover" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/category/);
      expect(result.offending).toBe("role: cover");
    }
  });

  it("rejects an over-long caption with the limit in the message", () => {
    const result = validateStoryPhotos([
      { url: U1, caption: "x".repeat(MAX_PHOTO_CAPTION_LENGTH + 1) },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/160 characters/);
  });

  it("rejects non-object entries and a non-array payload", () => {
    for (const bad of [42, null, true]) {
      expect(validateStoryPhotos([bad]).ok).toBe(false);
    }
    const notArray = validateStoryPhotos(U1);
    expect(notArray.ok).toBe(false);
    if (!notArray.ok) expect(notArray.offending).toMatch(/non-array/);
  });

  it("enforces the photo cap", () => {
    const tooMany = Array.from({ length: MAX_STORY_PHOTOS + 1 }, (_, i) => ({
      url: `${PREFIX}${i}.jpg`,
    }));
    const result = validateStoryPhotos(tooMany);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/up to 12 photos/);
  });
});

describe("normalizeStoryPhotos (read path)", () => {
  it("returns [] for a non-array value and says so", () => {
    const log = captureLogs();
    try {
      expect(normalizeStoryPhotos("nope")).toEqual([]);
      expect(normalizeStoryPhotos(null)).toEqual([]);
      expect(normalizeStoryPhotos(undefined)).toEqual([]);
      // Only the non-array case is a problem worth reporting.
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      log.mockRestore();
    }
  });

  it("upgrades legacy bare URLs to objects with no role", () => {
    // No invented claim: the gallery renders no badge for these rather than
    // guessing what the photo shows.
    expect(normalizeStoryPhotos([U1, U2])).toEqual([{ url: U1 }, { url: U2 }]);
  });

  it("drops an untrusted URL and logs it — a foreign resource never renders", () => {
    const log = captureLogs();
    try {
      const result = normalizeStoryPhotos([
        { url: "https://evil.example/track.gif", role: "process" },
        { url: U2, role: "makers" },
      ]);
      expect(result).toEqual([{ url: U2, role: "makers" }]);
      expect(log).toHaveBeenCalledTimes(1);
      expect(String(log.mock.calls[0][0])).toMatch(/evil\.example/);
    } finally {
      log.mockRestore();
    }
  });

  it("keeps a photo whose role is unknown, dropping only the role", () => {
    const log = captureLogs();
    try {
      expect(normalizeStoryPhotos([{ url: U1, role: "cover" }])).toEqual([
        { url: U1 },
      ]);
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      log.mockRestore();
    }
  });

  it("keeps a photo whose caption is over-long, dropping only the caption", () => {
    const log = captureLogs();
    try {
      expect(
        normalizeStoryPhotos([
          {
            url: U1,
            role: "details",
            caption: "x".repeat(MAX_PHOTO_CAPTION_LENGTH + 1),
          },
        ])
      ).toEqual([{ url: U1, role: "details" }]);
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      log.mockRestore();
    }
  });

  it("drops entries of the wrong shape", () => {
    const log = captureLogs();
    try {
      expect(normalizeStoryPhotos([42, null, [], { role: "process" }])).toEqual([]);
      expect(log).toHaveBeenCalledTimes(4);
    } finally {
      log.mockRestore();
    }
  });

  it("collapses duplicates so the same image cannot render twice", () => {
    expect(
      normalizeStoryPhotos([{ url: U1, role: "process" }, { url: U1 }])
    ).toEqual([{ url: U1, role: "process" }]);
  });

  it("shows the first N rather than throwing when a row breaks the cap", () => {
    const log = captureLogs();
    try {
      const over = Array.from({ length: MAX_STORY_PHOTOS + 3 }, (_, i) => ({
        url: `${PREFIX}${i}.jpg`,
      }));
      const result = normalizeStoryPhotos(over);
      expect(result).toHaveLength(MAX_STORY_PHOTOS);
      expect(result[0].url).toBe(`${PREFIX}0.jpg`);
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      log.mockRestore();
    }
  });
});

describe("photoAltText — the most specific description wins", () => {
  it("prefers the maker's caption, trimmed", () => {
    expect(
      photoAltText(
        { url: U1, role: "process", caption: "  Hands at the loom  " },
        "Process",
        "fallback"
      )
    ).toBe("Hands at the loom");
  });

  it("falls back to the role label when there is no caption", () => {
    expect(photoAltText({ url: U1, role: "makers" }, "Makers", "fallback")).toBe(
      "Makers"
    );
  });

  it("falls back to generic copy for a legacy photo with neither", () => {
    expect(photoAltText({ url: U1 }, undefined, "Product photo 3")).toBe(
      "Product photo 3"
    );
  });

  it("ignores a whitespace-only caption", () => {
    expect(photoAltText({ url: U1, caption: "   " }, "Details", "fallback")).toBe(
      "Details"
    );
  });
});
