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

function SmallBarcode() {
  return (
    <div className={styles.barcodeBox} style={{ width: BARCODE_SIZE, height: BARCODE_SIZE }}>
      <svg width={BARCODE_SIZE} height={BARCODE_SIZE} viewBox={`0 0 ${BARCODE_SIZE} ${BARCODE_SIZE}`} style={{ display: "block" }}>
        {BARCODE_MATRIX.map((row, r) =>
          row.map((v, c) =>
            v ? (
              <rect key={`${r}-${c}`} x={c * CELL + 0.3} y={r * CELL + 0.3} width={CELL - 0.6} height={CELL - 0.6} fill="var(--neutral-900)" rx={0.3} />
            ) : null
          )
        )}
      </svg>
      <svg width={BARCODE_SIZE} height={BARCODE_SIZE} viewBox={`0 0 ${BARCODE_SIZE} ${BARCODE_SIZE}`} style={{ display: "block" }}>
        <rect fill="var(--neutral-900)" x="50.4" y=".5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="5.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="5.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="5.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="5.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="10.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="15.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="45.4" y="15.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="15.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="15.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="20.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="25.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="25.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="25.5" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="30.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="30.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="30.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="45.4" y="35.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x=".5" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="5.5" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="10.5" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="15.5" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="20.5" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="30.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="35.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="45.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="40.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x=".5" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="5.5" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="15.5" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="20.5" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="25.5" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="35.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="100.3" y="45.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="30.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="35.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="50.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x=".5" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="20.5" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="55.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="20.5" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="25.5" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="30.4" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="45.4" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="70.4" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="100.3" y="60.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="70.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="100.3" y="65.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="70.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="70.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="70.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="70.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="70.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="70.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="45.4" y="75.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="75.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="75.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="75.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="75.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="75.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="80.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="80.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="80.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="70.4" y="80.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="80.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="80.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="70.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="85.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="90.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="45.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="50.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="55.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="90.4" y="95.4" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="40.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="60.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="65.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="70.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="75.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="80.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="85.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
        <rect fill="var(--neutral-900)" x="95.4" y="100.3" width={CELL - 0.6} height={CELL - 0.6} rx={0.3}/>
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
        <span className={styles.badgeEmoji}>🌿</span>
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

