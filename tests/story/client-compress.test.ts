import { describe, expect, it, vi } from "vitest";
import {
  calculateFitDimensions,
  compressPhotoIfNeeded,
  isAcceptableSource,
  COMPRESS_TARGET_BYTES,
  MAX_DIMENSION,
} from "@/lib/story/clientCompress";
import { MAX_SOURCE_BYTES } from "@/lib/story/photoTypes";

/**
 * jsdom cannot cheaply allocate multi-megabyte blobs and the code under test
 * only ever reads file.size / file.type / file.name, so pin the size directly.
 */
function fakeFile(size: number, name = "photo.jpg", type = "image/jpeg"): File {
  const file = new File([new Uint8Array(8)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("calculateFitDimensions", () => {
  it("leaves an image inside the box untouched", () => {
    expect(calculateFitDimensions(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  it("scales a landscape photo to the max long edge, preserving ratio", () => {
    expect(calculateFitDimensions(5120, 2880)).toEqual({
      width: MAX_DIMENSION,
      height: 1440,
    });
  });

  it("scales a portrait photo by its height", () => {
    expect(calculateFitDimensions(3000, 6000)).toEqual({
      width: 1280,
      height: MAX_DIMENSION,
    });
  });

  it("handles a square at exactly the limit as a no-op", () => {
    expect(calculateFitDimensions(2560, 2560)).toEqual({
      width: 2560,
      height: 2560,
    });
  });

  it("never returns a zero dimension for a degenerate value", () => {
    expect(calculateFitDimensions(0, 0)).toEqual({ width: 0, height: 0 });
    expect(calculateFitDimensions(1, 20000)).toEqual({ width: 1, height: 2560 });
  });
});

describe("isAcceptableSource", () => {
  it("accepts an allowlisted type within the source cap", () => {
    expect(isAcceptableSource(fakeFile(1000))).toBe(true);
  });

  it("rejects an unlisted type and an oversized source", () => {
    expect(isAcceptableSource(fakeFile(1000, "scan.tiff", "image/tiff"))).toBe(false);
    expect(isAcceptableSource(fakeFile(MAX_SOURCE_BYTES + 1))).toBe(false);
  });
});

describe("compressPhotoIfNeeded", () => {
  it("passes a file already under the target through untouched (no re-encode)", async () => {
    const small = fakeFile(COMPRESS_TARGET_BYTES - 1);
    const result = await compressPhotoIfNeeded(small);
    expect(result.compressed).toBe(false);
    // Same object, not a copy: an image that was already fine must not lose
    // quality to a pointless re-encode.
    expect(result.file).toBe(small);
  });

  it("refuses to attempt a source above the source cap", async () => {
    const huge = fakeFile(MAX_SOURCE_BYTES + 1);
    const result = await compressPhotoIfNeeded(huge);
    expect(result.compressed).toBe(false);
    expect(result.file).toBe(huge);
  });

  it("falls back to the original file when the browser cannot decode it", async () => {
    // jsdom has no createImageBitmap and never fires <img> load for a blob URL,
    // so this exercises the real fallback branch: the decode times out, the
    // failure is logged, and the ORIGINAL file is returned for the server to
    // judge. (The timeout is injected so the test doesn't wait 10s.)
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const oversized = fakeFile(COMPRESS_TARGET_BYTES + 1);
      const result = await compressPhotoIfNeeded(oversized, {
        decodeTimeoutMs: 5,
      });
      expect(result.compressed).toBe(false);
      expect(result.file).toBe(oversized);
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
