"use client";

import { useEffect, useMemo, useState } from "react";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
} from "@/lib/gs1/barcode";
import styles from "./DualMarkLabel.module.css";

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
  // These renderers use bwip-js, whose output differs between the browser and
  // Node SSR. Rendering during SSR produces empty server HTML, then the client
  // paints the barcode (a flash), then the hydration mismatch collapses it.
  // Defer rendering until after client mount so server + first client paint agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { qr, dm } = useMemo(() => {
    if (!mounted) return { qr: null, dm: null };
    const qr = renderDigitalLinkQr(gtin14);
    const dm = renderGs1DataMatrix(gtin14);
    return { qr, dm };
  }, [gtin14, mounted]);

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