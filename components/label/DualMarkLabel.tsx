"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
  renderLegacyBarcode,
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
 * Dual-marked GS1 label (#6 + #9): the same product is carried by a GS1
 * Digital Link QR (full resolver URI), a GS1 DataMatrix (AI(01)+GTIN + "GS1"
 * caption), and the legacy EAN-13 linear mark (brief §7 requires the legacy
 * barcode "rendered alongside" — derived from the same GTIN; the slot is
 * skipped entirely when the GTIN has no legacy derivation, e.g. a non-zero
 * indicator digit).
 *
 * The 2D symbols are REFERENTIALLY equivalent (same GTIN / same product) —
 * not cryptographically so: no signing, hashing, or verification anywhere.
 *
 * All symbols are rendered strictly (crisp modules, no rounded cells) with
 * quiet zones baked into the SVG. Sized independently (DataMatrix may be
 * smaller). Label geometry targets X-dimension >= 0.35mm at print (#9).
 */
export default function DualMarkLabel({
  gtin14,
  legacyNote,
}: {
  gtin14: string;
  /**
   * Pre-translated explanation rendered when the legacy slot is absent for a
   * *known* reason (#45 — non-zero GS1 indicator digit has no EAN-13
   * equivalent). Omitted for invalid/missing GTINs, which stay silent.
   */
  legacyNote?: string;
}) {
  const hydrated = useHydrated();

  const { qr, dm, legacy } = useMemo(() => {
    if (!hydrated) return { qr: null, dm: null, legacy: null };
    const qr = renderDigitalLinkQr(gtin14);
    const dm = renderGs1DataMatrix(gtin14);
    const legacy = renderLegacyBarcode(gtin14);
    return { qr, dm, legacy };
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
        {legacy && (
          <div
            className={styles.legacySlot}
            dangerouslySetInnerHTML={{ __html: legacy.svg }}
          />
        )}
        {!legacy && legacyNote && hydrated && (
          <p className={styles.legacyNote}>{legacyNote}</p>
        )}
      </div>
      <p className={styles.uri}>{qr.uri}</p>
    </div>
  );
}