"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
} from "@/lib/gs1/barcode";
import styles from "./DualMarkLabel.module.css";

// Stable references so useSyncExternalStore never resubscribes.
const emptySubscribe = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

/**
 * True only after client hydration.
 *
 * The barcode renderers use bwip-js, whose output can differ between the
 * browser and Node SSR. Rendering during SSR produced empty server HTML, then
 * the client painted the barcode (a flash), then the hydration mismatch
 * collapsed it. useSyncExternalStore is the hydration-safe "mounted": server
 * and first client paint agree (both false), then React re-renders once
 * hydration completes — with no setState-in-effect cascading renders.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, getHydrated, getServerHydrated);
}

/**
 * Dual-marked GS1 label (#6): the same product is carried by a GS1 Digital Link
 * QR (full resolver URI) and a GS1 DataMatrix (AI(01)+GTIN + "GS1" caption).
 * The two symbols are REFERENTIALLY equivalent (same GTIN / same product) —
 * not cryptographically so: no signing, hashing, or verification anywhere.
 *
 * Both symbols are rendered strictly (crisp modules, no rounded cells) with
 * quiet zones baked into the SVG. Sized independently (DataMatrix may be
 * smaller). Label geometry targets X-dimension >= 0.35mm at print (#9).
 */
export default function DualMarkLabel({
  gtin14,
}: {
  gtin14: string;
}) {
  const hydrated = useHydrated();

  const { qr, dm } = useMemo(() => {
    if (!hydrated) return { qr: null, dm: null };
    const qr = renderDigitalLinkQr(gtin14);
    const dm = renderGs1DataMatrix(gtin14);
    return { qr, dm };
  }, [gtin14, hydrated]);

  if (!qr || !dm) return null;

  return (
    <div className={styles.label}>
      <div className={styles.symbols}>
        <div
          className={styles.qrSlot}
          dangerouslySetInnerHTML={{ __html: qr.svg }}
        />
        <figure className={styles.dmSlot}>
          <div dangerouslySetInnerHTML={{ __html: dm }} />
          <figcaption className={styles.dmCaption}>GS1</figcaption>
        </figure>
      </div>
      <p className={styles.uri}>{qr.uri}</p>
    </div>
  );
}