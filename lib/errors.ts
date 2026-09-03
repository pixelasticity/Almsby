/**
 * Collapse an unknown thrown value into one user-safe message string.
 *
 * Fail-loud discipline (root cause of the signup `{}` bug): Server Actions must
 * never forward an unvalidated upstream message to the UI. When the provider
 * returns an opaque error, supabase-js builds the AuthError.message by falling
 * back to `JSON.stringify(responseBody)` — so something visibly wrong (e.g. a
 * misconfigured SMTP provider) surfaces to the user as the literal string `{}`
 * instead of a usable signal. The UI can't render meaning from that, and
 * support has nothing to search on.
 *
 * This helper extracts a real message when one exists and substitutes a stable
 * `fallback` for the degenerate literals that carry no signal. Callers SHOULD
 * also `console.error` the original error (server logs) — this function is
 * purely about what the user sees.
 */

/** Literal messages that render as garbage and carry no actionable signal. */
const DEGENERATE_MESSAGES = new Set([
  "",
  "{}",
  "[object Object]",
  "null",
  "undefined",
]);

export function toErrorMessage(error: unknown, fallback: string): string {
  let message = "";
  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    const candidate = (error as { message: unknown }).message;
    if (typeof candidate === "string") message = candidate;
  }

  const normalized = message.trim();
  return DEGENERATE_MESSAGES.has(normalized)
    ? fallback
    : normalized || fallback;
}