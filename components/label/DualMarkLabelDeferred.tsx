"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type DualMarkLabel from "./DualMarkLabel";

type Props = ComponentProps<typeof DualMarkLabel>;

// bwip-js is ~1MB of client JS; the product detail page only needs it for the
// mid-page barcode preview, so the library is code-split out of the initial
// route bundle and fetched alongside hydration instead. `ssr: false` matches
// DualMarkLabel's own behavior exactly: it already gates renders on
// useHydrated() (the bwip-js SVG output differs between Node SSR and browser,
// which is why the component renders null pre-hydration), so a no-SSR load
// changes nothing visually — the preview appears at the same moment it does
// today, just without 1MB in the initial payload.
const DualMarkLabelLazy = dynamic(() => import("./DualMarkLabel"), {
  ssr: false,
});

/** Deferred-loading wrapper for the dual-mark barcode preview. */
export default function DualMarkLabelDeferred(props: Props) {
  return <DualMarkLabelLazy {...props} />;
}