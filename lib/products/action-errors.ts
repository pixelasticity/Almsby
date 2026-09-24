/**
 * Shared resolution for Server Action error codes → i18n message keys.
 *
 * Server Actions return stable error codes ("authRequired", "saveFailed", …)
 * rather than user-facing copy; client forms resolve a code to a next-intl
 * message key via their form-local table (i18n namespaces differ between
 * forms), so every action-backed form resolves errors through one path — and
 * unknown/absent codes land on the form's explicit fallback instead of
 * leaking a raw key to `t()` (next-intl throws on an unknown key).
 *
 * Two shapes, chosen per form:
 * - rename table (Record) — when the key differs from the code, e.g.
 *   GtinImportForm's `saveFailed` → `gtinErrorSave`;
 * - allowlist (array) — when codes map 1:1 to keys inside the form's own
 *   namespace; an identity Record would only pretend a rename happens.
 */

/** Narrow to the allowlist shape once, instead of casting at each use site. */
function isCodeList(
  keyMap: Record<string, string> | readonly string[]
): keyMap is readonly string[] {
  return Array.isArray(keyMap);
}

export function resolveActionErrorKey(
  errKey: string | undefined,
  keyMap: Record<string, string> | readonly string[],
  fallback: string
): string {
  if (!errKey) return fallback;
  if (isCodeList(keyMap)) return keyMap.includes(errKey) ? errKey : fallback;
  return keyMap[errKey] ?? fallback;
}