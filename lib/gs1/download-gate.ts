/**
 * Fail-closed download gate (brief §8): download/print affordances are
 * enabled ONLY when the server-side per-generation decode verification
 * passed. Pure so the contract is unit-testable without rendering.
 */
export function isDownloadEnabled(
  verified: boolean,
  hydrated: boolean
): boolean {
  return verified && hydrated;
}
