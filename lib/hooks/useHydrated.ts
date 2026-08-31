"use client";

import { useSyncExternalStore } from "react";

// Stable references so useSyncExternalStore never resubscribes.
const emptySubscribe = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

/**
 * True only after client hydration.
 *
 * Hydration-safe "mounted" flag: server and first client paint agree (both
 * false), then React re-renders once hydration completes — with no
 * setState-in-effect cascading renders. Used where server and client output
 * must agree on first paint, e.g. the bwip-js barcode renderers, whose SSR
 * output can differ from the client render and collapse under a hydration
 * mismatch (previously produced empty server HTML, then a flash, then no
 * barcode).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, getHydrated, getServerHydrated);
}