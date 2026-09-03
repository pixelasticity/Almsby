import styles from "@/styles/landing.module.css";
import { CheckIcon } from "@/components/icons";
import { getTranslations } from "next-intl/server";

// Deterministic QR-style matrix for the decorative barcode (same every render).
function generateBarcodeMatrix(): number[][] {
  const size = 21;
  const m: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const drawFinder = (sr: number, sc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        m[sr + r][sc + c] = edge || core ? 1 : 0;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);
  for (let i = 8; i <= 12; i++) {
    m[6][i] = i % 2 === 0 ? 1 : 0;
    m[i][6] = i % 2 === 0 ? 1 : 0;
  }
  for (let r = 14; r <= 18; r++) {
    for (let c = 14; c <= 18; c++) {
      const dr = Math.abs(r - 16), dc = Math.abs(c - 16);
      m[r][c] = dr === 2 || dc === 2 || (dr === 0 && dc === 0) ? 1 : 0;
    }
  }
  let seed = 0xdeadbeef;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };
  const fixed = (r: number, c: number) =>
    (r <= 8 && c <= 8) || (r <= 8 && c >= 13) || (r >= 13 && c <= 8) ||
    r === 6 || c === 6 || (r >= 14 && r <= 18 && c >= 14 && c <= 18);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!fixed(r, c)) m[r][c] = rand() > 0.44 ? 1 : 0;
    }
  }
  return m;
}

const BARCODE_MATRIX = generateBarcodeMatrix();
const CELL = 5;
const BARCODE_SIZE = 21 * CELL;

// Hand-authored accent cells collapsed into one <path> node (same reason
// as BARCODE_MATRIX_PATH): one node instead of ~150.
const BARCODE_ART_PATH =
  "M50.4 .5h4.4v4.4h-4.4ZM40.4 5.5h4.4v4.4h-4.4ZM50.4 5.5h4.4v4.4h-4.4ZM55.4 5.5h4.4v4.4h-4.4ZM60.4 5.5h4.4v4.4h-4.4ZM55.4 10.5h4.4v4.4h-4.4ZM40.4 15.5h4.4v4.4h-4.4ZM45.4 15.5h4.4v4.4h-4.4ZM50.4 15.5h4.4v4.4h-4.4ZM60.4 15.5h4.4v4.4h-4.4ZM50.4 20.5h4.4v4.4h-4.4ZM40.4 25.5h4.4v4.4h-4.4ZM55.4 25.5h4.4v4.4h-4.4ZM60.4 25.5h4.4v4.4h-4.4ZM40.4 30.4h4.4v4.4h-4.4ZM50.4 30.4h4.4v4.4h-4.4ZM60.4 30.4h4.4v4.4h-4.4ZM45.4 35.4h4.4v4.4h-4.4ZM.5 40.4h4.4v4.4h-4.4ZM5.5 40.4h4.4v4.4h-4.4ZM10.5 40.4h4.4v4.4h-4.4ZM15.5 40.4h4.4v4.4h-4.4ZM20.5 40.4h4.4v4.4h-4.4ZM30.4 40.4h4.4v4.4h-4.4ZM35.4 40.4h4.4v4.4h-4.4ZM40.4 40.4h4.4v4.4h-4.4ZM45.4 40.4h4.4v4.4h-4.4ZM55.4 40.4h4.4v4.4h-4.4ZM65.4 40.4h4.4v4.4h-4.4ZM75.4 40.4h4.4v4.4h-4.4ZM85.4 40.4h4.4v4.4h-4.4ZM95.4 40.4h4.4v4.4h-4.4ZM.5 45.4h4.4v4.4h-4.4ZM5.5 45.4h4.4v4.4h-4.4ZM15.5 45.4h4.4v4.4h-4.4ZM20.5 45.4h4.4v4.4h-4.4ZM25.5 45.4h4.4v4.4h-4.4ZM35.4 45.4h4.4v4.4h-4.4ZM40.4 45.4h4.4v4.4h-4.4ZM50.4 45.4h4.4v4.4h-4.4ZM75.4 45.4h4.4v4.4h-4.4ZM80.4 45.4h4.4v4.4h-4.4ZM85.4 45.4h4.4v4.4h-4.4ZM90.4 45.4h4.4v4.4h-4.4ZM95.4 45.4h4.4v4.4h-4.4ZM100.3 45.4h4.4v4.4h-4.4ZM30.4 50.4h4.4v4.4h-4.4ZM35.4 50.4h4.4v4.4h-4.4ZM50.4 50.4h4.4v4.4h-4.4ZM60.4 50.4h4.4v4.4h-4.4ZM65.4 50.4h4.4v4.4h-4.4ZM90.4 50.4h4.4v4.4h-4.4ZM95.4 50.4h4.4v4.4h-4.4ZM.5 55.4h4.4v4.4h-4.4ZM20.5 55.4h4.4v4.4h-4.4ZM40.4 55.4h4.4v4.4h-4.4ZM55.4 55.4h4.4v4.4h-4.4ZM60.4 55.4h4.4v4.4h-4.4ZM65.4 55.4h4.4v4.4h-4.4ZM80.4 55.4h4.4v4.4h-4.4ZM85.4 55.4h4.4v4.4h-4.4ZM90.4 55.4h4.4v4.4h-4.4ZM20.5 60.4h4.4v4.4h-4.4ZM25.5 60.4h4.4v4.4h-4.4ZM30.4 60.4h4.4v4.4h-4.4ZM45.4 60.4h4.4v4.4h-4.4ZM70.4 60.4h4.4v4.4h-4.4ZM80.4 60.4h4.4v4.4h-4.4ZM85.4 60.4h4.4v4.4h-4.4ZM100.3 60.4h4.4v4.4h-4.4ZM40.4 65.4h4.4v4.4h-4.4ZM55.4 65.4h4.4v4.4h-4.4ZM65.4 65.4h4.4v4.4h-4.4ZM70.4 65.4h4.4v4.4h-4.4ZM75.4 65.4h4.4v4.4h-4.4ZM80.4 65.4h4.4v4.4h-4.4ZM85.4 65.4h4.4v4.4h-4.4ZM90.4 65.4h4.4v4.4h-4.4ZM100.3 65.4h4.4v4.4h-4.4ZM40.4 70.4h4.4v4.4h-4.4ZM55.4 70.4h4.4v4.4h-4.4ZM60.4 70.4h4.4v4.4h-4.4ZM75.4 70.4h4.4v4.4h-4.4ZM90.4 70.4h4.4v4.4h-4.4ZM95.4 70.4h4.4v4.4h-4.4ZM45.4 75.4h4.4v4.4h-4.4ZM65.4 75.4h4.4v4.4h-4.4ZM80.4 75.4h4.4v4.4h-4.4ZM85.4 75.4h4.4v4.4h-4.4ZM90.4 75.4h4.4v4.4h-4.4ZM95.4 75.4h4.4v4.4h-4.4ZM40.4 80.4h4.4v4.4h-4.4ZM50.4 80.4h4.4v4.4h-4.4ZM60.4 80.4h4.4v4.4h-4.4ZM70.4 80.4h4.4v4.4h-4.4ZM80.4 80.4h4.4v4.4h-4.4ZM85.4 80.4h4.4v4.4h-4.4ZM40.4 85.4h4.4v4.4h-4.4ZM65.4 85.4h4.4v4.4h-4.4ZM70.4 85.4h4.4v4.4h-4.4ZM75.4 85.4h4.4v4.4h-4.4ZM80.4 85.4h4.4v4.4h-4.4ZM90.4 85.4h4.4v4.4h-4.4ZM95.4 85.4h4.4v4.4h-4.4ZM40.4 90.4h4.4v4.4h-4.4ZM50.4 90.4h4.4v4.4h-4.4ZM55.4 90.4h4.4v4.4h-4.4ZM60.4 90.4h4.4v4.4h-4.4ZM65.4 90.4h4.4v4.4h-4.4ZM75.4 90.4h4.4v4.4h-4.4ZM90.4 90.4h4.4v4.4h-4.4ZM40.4 95.4h4.4v4.4h-4.4ZM45.4 95.4h4.4v4.4h-4.4ZM50.4 95.4h4.4v4.4h-4.4ZM55.4 95.4h4.4v4.4h-4.4ZM65.4 95.4h4.4v4.4h-4.4ZM75.4 95.4h4.4v4.4h-4.4ZM80.4 95.4h4.4v4.4h-4.4ZM90.4 95.4h4.4v4.4h-4.4ZM40.4 100.3h4.4v4.4h-4.4ZM60.4 100.3h4.4v4.4h-4.4ZM65.4 100.3h4.4v4.4h-4.4ZM70.4 100.3h4.4v4.4h-4.4ZM75.4 100.3h4.4v4.4h-4.4ZM80.4 100.3h4.4v4.4h-4.4ZM85.4 100.3h4.4v4.4h-4.4ZM95.4 100.3h4.4v4.4h-4.4Z";

// One precomputed <path> instead of ~200 <rect> nodes: identical cells, a
// fraction of the SSR'd HTML. The old rx=0.3 corner rounding is dropped —
// imperceptible at 5px cell size.
const BARCODE_MATRIX_PATH = (() => {
  let d = "";
  for (let r = 0; r < BARCODE_MATRIX.length; r++) {
    for (let c = 0; c < BARCODE_MATRIX[r].length; c++) {
      if (!BARCODE_MATRIX[r][c]) continue;
      const x = c * CELL + 0.3;
      const y = r * CELL + 0.3;
      d += `M${x} ${y}h${CELL - 0.6}v${CELL - 0.6}h-${CELL - 0.6}Z`;
    }
  }
  return d;
})();

function SmallBarcode() {
  return (
    <div className={styles.barcodeBox} aria-hidden="true" style={{ width: BARCODE_SIZE, height: BARCODE_SIZE }}>
      <svg width={BARCODE_SIZE} height={BARCODE_SIZE} viewBox={`0 0 ${BARCODE_SIZE} ${BARCODE_SIZE}`} style={{ display: "block" }}>
        <path d={BARCODE_MATRIX_PATH} fill="var(--neutral-900)" />
      </svg>
      <svg width={BARCODE_SIZE} height={BARCODE_SIZE} viewBox={`0 0 ${BARCODE_SIZE} ${BARCODE_SIZE}`} style={{ display: "block" }}>
        <path d={BARCODE_ART_PATH} fill="var(--neutral-900)" />
        <g>
          <rect fill="var(--neutral-900)" x="10.1" y="10.1" width="15" height="15"/>
          <path fill="var(--neutral-900)" d="M.1.1v35h35V.1H.1ZM30.1,30.1H5.1V5.1h25v25Z"/>
        </g>
        <g>
          <rect fill="var(--neutral-900)" x="80" y="10.1" width="15" height="15"/>
          <path fill="var(--neutral-900)" d="M70,.1v35h35V.1h-35ZM100,30.1h-25V5.1h25v25Z"/>
        </g>
        <g>
          <rect fill="var(--neutral-900)" x="10.1" y="80" width="15" height="15"/>
          <path fill="var(--neutral-900)" d="M.1,70v35h35v-35H.1ZM30.1,100H5.1v-25h25v25Z"/>
        </g>
      </svg>
      <div className={styles.scanLine} />
    </div>
  );
}

async function ProductPassportCard() {
  const t = await getTranslations("landing");
  const rows = [
    { label: t("cardRowMadeOf"), value: t("cardRowMadeOfValue") },
    { label: t("cardRowMadeIn"), value: "Porto, Portugal" },
    { label: t("cardRowEndOfLife"), value: t("cardRowEndOfLifeValue") },
  ];
  return (
    <div className={styles.passportFloat}>
      <div className={`${styles.floatBadge} ${styles.floatTop}`}>
        <div className={styles.badgeGreenCheck}>
          <CheckIcon />
        </div>
        <span className={styles.badgeLabel}>{t("cardBadge")}</span>
      </div>
      <div className={`${styles.floatBadge} ${styles.floatBottom}`}>
        <span className={styles.badgeEmoji} aria-hidden="true">🌿</span>
        <div>
          <p className={styles.badgeMetaLabel}>{t("cardFootprintLabel")}</p>
          <p className={styles.badgeMetaValue}>{t("cardFootprintValue")}</p>
        </div>
      </div>
      <div className={styles.passportCard}>
        <div className={styles.passportHeader}>
          <div className={styles.passportEmoji}>🧥</div>
          <div className={styles.passportNameWrap}>
            <p className={styles.passportName}>{t("cardProduct")}</p>
            <p className={styles.passportSub}>{t("cardCollection")}</p>
          </div>
          <span className={styles.passportBadgeTag}>{t("cardDppReady")}</span>
        </div>
        <div className={styles.barcodeWell}>
          <SmallBarcode />
        </div>
        <div className={styles.passportRows}>
          {rows.map(({ label, value }) => (
            <div key={label} className={styles.passportRow}>
              <span className={styles.passportRowLabel}>{label}</span>
              <span className={styles.passportRowValue}>{value}</span>
            </div>
          ))}
        </div>
        <div className={styles.passportFooter}>
          <span className={styles.passportGtin}>{t("cardGtin")}</span>
          <span className={styles.verifiedTag}>
            <span className={styles.verifiedDot} />
            {t("cardVerified")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductPassportCard;

