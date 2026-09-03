/**
 * Exact-size print page (#9, brief §7: "PDF (print-ready, sized for common
 * label formats)").
 *
 * Browser "Save as PDF" on this route produces a true-to-size vector PDF:
 * the @page rule sets the exact sheet size in mm and every symbol is sized
 * from the requested X-dimension (floor enforced in code via print-size).
 * The physical print test (§10.3) is what validates the end-to-end output —
 * on-screen correctness is necessary, not sufficient.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { toGtin14 } from "@/lib/gs1/gtin";
import {
  renderDigitalLinkQr,
  renderGs1DataMatrix,
  renderLegacyBarcode,
  QR_QUIET_MODULES,
  DM_QUIET_MODULES,
  EAN_QUIET_LEFT_MODULES,
  EAN_QUIET_RIGHT_MODULES,
} from "@/lib/gs1/barcode";
import {
  MIN_X_DIMENSION_MM,
  labelLayout,
  parseViewBox,
  type SymbolGeometry,
} from "@/lib/gs1/print-size";
import { verifyBarcode, warmBarcodeVerifier } from "@/lib/gs1/verify";
import PrintButton from "@/components/label/PrintButton";

export const metadata: Metadata = { robots: { index: false } };

export default async function ProductLabelPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ x?: string }>;
}) {
  const { id } = await params;
  const { x: xParam } = await searchParams;
  const t = await getTranslations("products");
  const user = await getCurrentUser();
  if (!user) notFound();

  // Floor enforced in code: a hand-typed URL cannot print below it.
  const parsedX = Number(xParam);
  const xMm = Number.isFinite(parsedX) ? parsedX : MIN_X_DIMENSION_MM;
  if (xMm < MIN_X_DIMENSION_MM || xMm > 3) notFound();

  let gtin14: string | null = null;
  let name = "";
  try {
    const db = getDb();
    const product = await db.product.findFirst({
      where: { id, business: { ownerId: user.id } },
      include: { gtin: true },
    });
    if (!product || !product.gtin) notFound();
    name = product.name;
    gtin14 = toGtin14(product.gtin.gtinValue);
  } catch (error) {
    console.error("[label-print] page load failed", id, error);
    notFound();
  }

  await warmBarcodeVerifier();
  const verification = gtin14 ? await verifyBarcode(gtin14) : null;
  const verified =
    verification !== null &&
    verification.qr.ok &&
    verification.dm.ok &&
    verification.legacy.ok;

  const qr = verified && gtin14 ? renderDigitalLinkQr(gtin14) : null;
  const dm = verified && gtin14 ? renderGs1DataMatrix(gtin14) : null;
  const legacy = verified && gtin14 ? renderLegacyBarcode(gtin14) : null;
  if (!qr || !dm) notFound();

  const geometries: SymbolGeometry[] = [
    {
      viewBoxWidth: parseVB(qr.svg).w,
      viewBoxHeight: parseVB(qr.svg).h,
      quietLeft: QR_QUIET_MODULES,
      quietRight: QR_QUIET_MODULES,
    },
    {
      viewBoxWidth: parseVB(dm).w,
      viewBoxHeight: parseVB(dm).h,
      quietLeft: DM_QUIET_MODULES,
      quietRight: DM_QUIET_MODULES,
    },
    ...(legacy
      ? [
          {
            viewBoxWidth: parseVB(legacy.svg).w,
            viewBoxHeight: parseVB(legacy.svg).h,
            quietLeft: EAN_QUIET_LEFT_MODULES,
            quietRight: EAN_QUIET_RIGHT_MODULES,
          },
        ]
      : []),
  ];
  const layout = labelLayout(xMm, geometries);

  const sized = (svg: string, index: number) => {
    const vb = parseVB(svg);
    const item = layout.items[index];
    return { svg, widthMm: item.widthMm, heightMm: (xMm * vb.h) };
  };
  const symbols = [
    sized(qr.svg, 0),
    sized(dm, 1),
    ...(legacy ? [sized(legacy.svg, 2)] : []),
  ];

  return (
    <>
      {/* Exact sheet size — the mechanism that makes "Save as PDF" produce a
          print-true artifact. Browsers that honor @page (Chrome, Edge, Safari)
          output exact mm; the §10.3 physical test validates the real result. */}
      <style>{`@page { size: ${layout.widthMm.toFixed(2)}mm ${layout.heightMm.toFixed(2)}mm; margin: 0; }`}</style>
      <div className="noPrint" style={{ padding: 24 }}>
        <Link href={`/products/${id}/label`}>← {t("backToProducts")}</Link>
        <p style={{ margin: "8px 0", fontSize: 13 }}>
          {t("labelPrintExactHint", {
            width: layout.widthMm.toFixed(1),
            height: layout.heightMm.toFixed(1),
          })}
        </p>
        <PrintButton />
      </div>
      <div
        style={{
          width: `${layout.widthMm}mm`,
          padding: "4mm",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "3mm",
        }}
      >
        <div
          style={{
            fontSize: "3.2mm",
            fontWeight: 700,
            lineHeight: 1.2,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", gap: "6mm", alignItems: "flex-end" }}>
          {symbols.map((s, i) => (
            <div
              key={i}
              style={{ width: `${s.widthMm}mm`, height: `${s.heightMm}mm`, lineHeight: 0 }}
              dangerouslySetInnerHTML={{ __html: s.svg }}
            />
          ))}
        </div>
        <div style={{ fontSize: "2.4mm", wordBreak: "break-all", lineHeight: 1.3 }}>
          {qr.uri}
        </div>
      </div>
    </>
  );
}

/** Throwing wrapper over print-size's parseViewBox: every symbol here has just
 *  passed decode verification, so a missing viewBox is a crash-worthy bug,
 *  not a case to silently skip. */
function parseVB(svg: string): { w: number; h: number } {
  const vb = parseViewBox(svg);
  if (!vb) throw new Error("barcode SVG missing viewBox");
  return vb;
}
