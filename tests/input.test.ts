import { describe, expect, it } from "vitest";
import { isValidEmail } from "@/lib/input";

describe("isValidEmail", () => {
  it("accepts pragmatic address shapes", () => {
    expect(isValidEmail("you@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.example.co.uk")).toBe(true);
    expect(isValidEmail("a@b.io")).toBe(true);
  });

  it("rejects missing or malformed parts", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("nope@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false); // no TLD
    expect(isValidEmail("a b@example.com")).toBe(false); // whitespace
    expect(isValidEmail("")).toBe(false);
  });
});
