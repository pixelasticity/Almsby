/**
 * Restrict a user-supplied redirect target (`?next=…`) to a safe relative
 * path. Single source of truth for sign-in and the email-confirmation route.
 *
 * Accepts only paths that start with exactly one "/" (so "/products" passes;
 * "/foo//bar" is fine too). Rejects:
 *  - protocol-relative URLs ("//evil.com") — would leave the site,
 *  - backslash variants ("/\evil.com") — browsers normalize "\" to "/", so
 *    the naive startsWith("/") check alone is an open-redirect bypass,
 *  - control characters (header-injection hygiene).
 * Anything else falls back to `fallback`.
 */
export function sanitizeRedirectPath(
  next: string | null | undefined,
  fallback = "/dashboard"
): string {
  const value = typeof next === "string" ? next : "";
  const safe =
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(value);
  return safe ? value : fallback;
}
