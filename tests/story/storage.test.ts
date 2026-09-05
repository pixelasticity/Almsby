import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the S3 client AND env BEFORE importing the module under test, so the
// upload path can be exercised without real R2 credentials. The mock captures
// every constructed S3Client so tests can drive resolution/rejection.
const constructedClients: Array<{ send: ReturnType<typeof vi.fn> }> = [];
vi.mock("@aws-sdk/client-s3", () => {
  class S3Client {
    send: ReturnType<typeof vi.fn>;
    constructor() {
      this.send = vi.fn();
      constructedClients.push(this);
    }
  }
  return {
    PutObjectCommand: class PutObjectCommand {
      constructor(public input: unknown) {}
    },
    S3Client,
  };
});
vi.mock("@/lib/env", () => ({
  env: {
    r2AccountId: "acct",
    r2AccessKeyId: "key",
    r2SecretAccessKey: "secret",
    r2BucketName: "bucket",
    r2PublicDomain: "images.example.test",
  },
}));

import {
  validatePhotoFile,
  uploadStoryPhoto,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
} from "@/lib/story/storage";

function file(over: Partial<{ bytes: Uint8Array; filename: string; contentType: string }> = {}) {
  return {
    bytes: new Uint8Array([1, 2, 3]),
    filename: "hero.jpg",
    contentType: "image/jpeg",
    ...over,
  };
}

// The upload module caches its S3 client across calls (getR2Client). The FIRST
// upload constructs it; later uploads reuse the same instance. So the "last"
// constructed client IS the module's singleton for the whole file — the second
// test reuses the first test's client, and we set its send mock directly.
function singletonClient() {
  if (!constructedClients.length) throw new Error("No S3Client was constructed");
  return constructedClients[0];
}

describe("validatePhotoFile (validation layer)", () => {
  it("accepts a valid JPEG", () => {
    const r = validatePhotoFile(file());
    expect(r.contentType).toBe("image/jpeg");
    expect(r.filename).toMatch(/\.jpg$/);
    // non-alphanumeric sanitized
    expect(validatePhotoFile(file({ filename: "my hero photo!.jpg" })).filename).toBe(
      "my-hero-photo-.jpg"
    );
  });

  it("accepts every allowlisted type", () => {
    for (const t of ALLOWED_PHOTO_TYPES) {
      expect(validatePhotoFile(file({ contentType: t })).contentType).toBe(t);
    }
  });

  it("rejects an unlisted content type", () => {
    expect(() => validatePhotoFile(file({ contentType: "application/pdf" }))).toThrow(
      /Unsupported image type/
    );
  });

  it("rejects empty bytes", () => {
    expect(() => validatePhotoFile(file({ bytes: new Uint8Array(0) }))).toThrow(/empty/);
  });

  it("rejects oversized photos", () => {
    expect(() =>
      validatePhotoFile(file({ bytes: new Uint8Array(MAX_PHOTO_BYTES + 1) }))
    ).toThrow(/larger than 5 MB/);
  });
});

describe("uploadStoryPhoto (upload layer, fail-loud)", () => {
  // NOTE: we do NOT clear constructedClients here — the module caches one S3
  // client for the whole file (getR2Client singleton), so the first upload
  // constructs it and later tests reuse that same instance. Clearing the list
  // would orphan the singleton from the tests.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the object to the story-photos key and returns a public URL", async () => {
    const url = await uploadStoryPhoto({ ...file(), productId: "prod_1" });
    expect(url).toMatch(/^https:\/\/images\.example\.test\/story-photos\/prod_1\//);
    expect(url).toMatch(/\.jpg$/);

    const cmd = singletonClient().send.mock.calls[0][0];
    expect(cmd.input.Bucket).toBe("bucket");
    expect(cmd.input.Key).toContain("story-photos/prod_1/");
    expect(cmd.input.Key).toMatch(/\.jpg$/);
  });

  it("propagates an S3 send failure uncaught (fail-loud, never a fake URL)", async () => {
    singletonClient().send.mockRejectedValue(new Error("S3 not reachable"));
    await expect(
      uploadStoryPhoto({ ...file(), productId: "prod_1" })
    ).rejects.toThrow("S3 not reachable");
  });
});