import Countdown from "@/components/landing/Countdown";
import WaitlistForm from "@/components/landing/WaitlistForm";
import styles from "@/styles/landing.module.css";

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

function ProductPassportCard() {
  const rows = [
    { label: "Made of", value: "82% recycled wool" },
    { label: "Made in", value: "Porto, Portugal" },
    { label: "End of life", value: "Repairable · take-back" },
  ];
  return (
    <div className={styles.passportFloat}>
      <div className={`${styles.floatBadge} ${styles.floatTop}`}>
        <div className={styles.badgeGreenCheck}>
          <CheckIcon />
        </div>
        <span className={styles.badgeLabel}>ESPR-ready</span>
      </div>
      <div className={`${styles.floatBadge} ${styles.floatBottom}`}>
        <span className={styles.badgeEmoji}>🌿</span>
        <div>
          <p className={styles.badgeMetaLabel}>Carbon footprint</p>
          <p className={styles.badgeMetaValue}>2.3 kg CO₂e</p>
        </div>
      </div>
      <div className={styles.passportCard}>
        <div className={styles.passportHeader}>
          <div className={styles.passportEmoji}>🧥</div>
          <div className={styles.passportNameWrap}>
            <p className={styles.passportName}>Merino Crew Neck</p>
            <p className={styles.passportSub}>Autumn Collection 2026</p>
          </div>
          <span className={styles.passportBadgeTag}>DPP Ready</span>
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
          <span className={styles.passportGtin}>GS1 · 01234567890128</span>
          <span className={styles.verifiedTag}>
            <span className={styles.verifiedDot} />
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15v4" />
      <path d="M12 10v9" />
      <path d="M17 6v13" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <LayersIcon />,
    bg: "#dcfce7",
    fg: "#16a34a",
    title: "Your 2D Barcode, Ready to Print",
    body: "A GS1 Digital Link QR code, dual-marked alongside your legacy barcode — print-ready in seconds.",
  },
  {
    icon: <ZapIcon />,
    bg: "#fef9c3",
    fg: "#ca8a04",
    title: "Passport-Ready Story Pages",
    body: "Every product gets a free, brandable story page — with the material, sourcing, and care fields the EU textile passport will need.",
  },
  {
    icon: <PlugIcon />,
    bg: "#ede9fe",
    fg: "#7c3aed",
    title: "No GS1 Jargon, Ever",
    body: "Guided setup in plain language — we help you get a GS1 prefix, or import the GTINs you already have.",
  },
  {
    icon: <BarsIcon />,
    bg: "#ffedd5",
    fg: "#ea580c",
    title: "Compliance Dashboard",
    body: "A plain-language am-I-ready-yet view — Sunrise 2027 and DPP status, per product, in one glance.",
  },
];

const EU_DEADLINES = [
  {
    emoji: "🔋",
    category: "Batteries",
    year: "Feb 2027",
    note: "Mandatory — the first passport category",
    badge: "In effect",
    cardBg: "#f0fdf4",
    cardBorder: "1px solid rgba(22,163,74,0.30)",
    badgeBg: "#16a34a",
    badgeFg: "#ffffff",
  },
  {
    emoji: "👕",
    category: "Textiles",
    year: "2028+",
    note: "Rules being finalized — makers like you are next",
    badge: "Your category",
    cardBg: "#fef9ee",
    cardBorder: "1px solid rgba(245,158,11,0.35)",
    badgeBg: "#f59e0b",
    badgeFg: "#ffffff",
  },
  {
    emoji: "🧵",
    category: "And beyond",
    year: "Soon",
    note: "Furniture, electronics, metals follow in waves",
    badge: "Phased",
    cardBg: "rgba(255,255,255,0.7)",
    cardBorder: "1px solid rgba(0,0,0,0.08)",
    badgeBg: "#e5e7eb",
    badgeFg: "#4b5563",
  },
];

export default function PublicHomePage() {
  return (
    <div className={styles.root}>
      <header className={styles.nav}>
        <div className={styles.navBrand}>
          <div className={styles.logoBox}>
            <div className={styles.logoGrid}>
              {[1, 1, 1, 1, 0, 1, 1, 1, 1].map((v, i) => (
                <div key={i} className={styles.logoCell} style={{ background: v ? "#fff" : "transparent" }} />
              ))}
            </div>
          </div>
          <span className={styles.brandName}>Almsby</span>
        </div>
        <div className={styles.launchNote}>
          <span className={styles.pulseDot} />
          Launching December 2026
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.heroBadge}>
              <span className={styles.pulseDot} />
              GS1 Sunrise 2027 · EU Digital Product Passports
            </span>
            <h1 className={styles.heroTitle}>
              One barcode for the scanner.{" "}
              <span className={styles.heroAccent}>A story for the customer.</span>
            </h1>
            <p className={styles.heroSub}>
              Almsby brings Sunrise 2027 barcodes and EU Digital Product Passports together in
              one gentle workflow — no GS1 jargon, no compliance consultants. Just a barcode
              your retailer accepts, and a story your customers love to scan.
            </p>
            <Countdown />
            <WaitlistForm />
          </div>
          <div className={styles.heroVisual}>
            <ProductPassportCard />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.panel}>
            <div className={styles.timelineGrid}>
              <div>
                <h2 className={styles.timelineTitle}>The passport clock is already ticking.</h2>
                <p className={styles.timelineBody}>
                  The EU central passport registry went live in July 2026 — this is not a rumor,
                  it is running infrastructure. Almsby handles the barcode and the passport
                  together, so you are ready for whichever wave comes first.
                </p>
              </div>
              <div className={styles.deadlineGrid}>
                {EU_DEADLINES.map((d, i) => (
                  <div key={d.category} className={styles.deadlineCard} style={{ background: d.cardBg, border: d.cardBorder, animationDelay: `${0.08 * i}s` }}>
                    <div className={styles.deadlineTop}>
                      <span className={styles.deadlineEmoji}>{d.emoji}</span>
                      <span className={styles.deadlineBadge} style={{ background: d.badgeBg, color: d.badgeFg }}>
                        {d.badge}
                      </span>
                    </div>
                    <p className={styles.deadlineYear}>{d.year}</p>
                    <p className={styles.deadlineCategory}>{d.category}</p>
                    <p className={styles.deadlineNote}>{d.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.featureHeader}>
            <p className={styles.featureEyebrow}>Everything you need</p>
            <h2 className={styles.featureTitle}>One platform. Zero compliance anxiety.</h2>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map(({ icon, bg, fg, title, body }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: bg, color: fg }}>
                  {icon}
                </div>
                <h3 className={styles.featureCardTitle}>{title}</h3>
                <p className={styles.featureCardBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerText}>© 2026 Almsby · Every product has a story.</span>
        <div className={styles.footerBadge}>
          <span className={styles.pulseDot} />
          Built on GS1 Digital Link
        </div>
      </footer>
    </div>
  );
}
