"use client";

import { useMemo } from "react";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
  renderLegacyBarcode,
} from "@/lib/gs1/barcode";
import { useHydrated } from "@/lib/hooks/useHydrated";
import styles from "./DualMarkLabel.module.css";

/**
 * Shows the barcode grid only after client hydration: the bwip-js renderers'
 * output can differ between the browser and Node SSR, which previously
 * produced empty server HTML, then a flash, then a hydration mismatch that
 * collapsed the barcode. useHydrated (lib/hooks/useHydrated) is the
 * hydration-safe "mounted" gate.
 */

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