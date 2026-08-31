/**
 * Shared resolution for Server Action error codes → i18n message keys.
 *
 * Server Actions return stable error codes ("authRequired", "saveFailed", …)
 * rather than user-facing copy; client forms map a code to a next-intl message
 * key via their form-local table (i18n namespaces differ between forms). This
 * helper dedups the "code → key → fallback" lookup so every action-backed form
 * resolves errors through one path — and unknown/absent codes land on the
 * form's explicit fallback instead of leaking a raw key to `t()` (next-intl
 * throws on an unknown key).
 */
export function resolveActionErrorKey(
  errKey: string | undefined,
  keyMap: Record<string, string>,
  fallback: string
): string {
  return errKey ? (keyMap[errKey] ?? fallback) : fallback;
}