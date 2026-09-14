/**
 * Shared helpers for the Story Studio.
 *
 * `toPlainJson` exists because React 19's Server Action serializer flags deeply
 * nested objects (TipTap docs with headings — doc → content[i] → attrs → level)
 * as "temporary client references" and throws "Cannot access toStringTag on the
 * server" when server-side code touches them. Re-parsing to plain JSON on the
 * client strips the markers so Server Actions receive a clean, serializable
 * value. Any StoryStudio handler passing content to a Server Action MUST run it
 * through this first (save AND publish — a missed call site is the bug).
 */

/** Deep-copies a value to plain JSON, stripping React serialization markers.
 *  null stays null; valid JSON values round-trip unchanged. */
export function toPlainJson<T>(value: T | null): T | null {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value)) as T;
}