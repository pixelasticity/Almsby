import { describe, expect, it, vi } from "vitest";

// The gate reads the R2 public domain through env (a lazy getter), so each test
// pins the environment it is asserting against — same seam as storage.test.ts.
vi.mock("@/lib/env", () => ({
  env: { r2PublicDomain: "images.example.test" },
}));

import {
  storyPhotoUrlPrefix,
  validateStoryPhotos,
} from "@/lib/story/photos";
import { MAX_STORY_PHOTOS } from "@/lib/story/photoTypes";

const OK_1 = "https://images.example.test/story-photos/prod_1/uuid-1-hero.jpg";
const OK_2 = "https://images.example.test/story-photos/prod_1/uuid-2-detail.jpg";

describe("storyPhotoUrlPrefix", () => {
  it("is our own R2 host under the story-photos directory", () => {
    expect(storyPhotoUrlPrefix()).toBe(
      "https://images.example.test/story-photos/"
    );
  });
});

describe("validateStoryPhotos", () => {
  it("accepts and preserves a list of URLs this system produced", () => {
    const result = validateStoryPhotos([OK_1, OK_2]);
    expect(result).toEqual({ ok: true, photos: [OK_1, OK_2] });
  });

  it("treats null/undefined as 'no photos', not as an error", () => {
    // A story saved before photos existed must still be saveable.
    expect(validateStoryPhotos(null)).toEqual({ ok: true, photos: [] });
    expect(validateStoryPhotos(undefined)).toEqual({ ok: true, photos: [] });
    expect(validateStoryPhotos([])).toEqual({ ok: true, photos: [] });
  });

  it("collapses duplicates so the same image cannot render twice", () => {
    expect(validateStoryPhotos([OK_1, OK_2, OK_1])).toEqual({
      ok: true,
      photos: [OK_1, OK_2],
    });
  });

  it("rejects an off-domain URL and names it for the log", () => {
    const result = validateStoryPhotos([OK_1, "https://evil.example/track.gif"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/could not be verified/);
      expect(result.offending).toBe("https://evil.example/track.gif");
    }
  });

  it("rejects a same-host URL outside the story-photos directory", () => {
    // Same domain is not enough: only the directory uploads are written to.
    const result = validateStoryPhotos([
      "https://images.example.test/other-bucket/x.jpg",
    ]);
    expect(result.ok).toBe(false);
  });

  it("rejects scheme tricks (javascript:, data:, protocol-relative)", () => {
    for (const bad of [
      "javascript:alert(1)",
      "data:image/svg+xml;base64,PHN2Zz4=",
      "//images.example.test/story-photos/prod_1/x.jpg",
      "http://images.example.test/story-photos/prod_1/x.jpg",
    ]) {
      expect(validateStoryPhotos([bad]).ok).toBe(false);
    }
  });

  it("rejects non-string entries", () => {
    for (const bad of [42, { url: OK_1 }, null, ["nested"]]) {
      expect(validateStoryPhotos([bad]).ok).toBe(false);
    }
  });

  it("rejects a non-array payload (never a thrown error)", () => {
    const result = validateStoryPhotos(OK_1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.offending).toMatch(/non-array/);
  });

  it("enforces the photo cap", () => {
    const tooMany = Array.from(
      { length: MAX_STORY_PHOTOS + 1 },
      (_, i) => `https://images.example.test/story-photos/prod_1/${i}.jpg`
    );
    const result = validateStoryPhotos(tooMany);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/up to 12 photos/);
  });
});
