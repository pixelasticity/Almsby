import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Layers, Zap, Plug, BarChart2 } from "lucide-react";

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

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function useCountdown(target: Date): Countdown {
  const calc = (): Countdown => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [val, setVal] = useState<Countdown>(calc);
  useEffect(() => {
    const id = setInterval(() => setVal(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return val;
}

function SmallBarcode() {
  const matrix = useMemo(() => generateBarcodeMatrix(), []);
  const cell = 5;
  const sz = 21 * cell;

  return (
    <div className="relative overflow-hidden rounded-sm" style={{ width: sz, height: sz }}>
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} className="block">
        {matrix.map((row, r) =>
          row.map((v, c) =>
            v ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell + 0.3}
                y={r * cell + 0.3}
                width={cell - 0.6}
                height={cell - 0.6}
                fill="#1c1c1e"
                rx={0.3}
              />
            ) : null
          )
        )}
      </svg>
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 2,
          background: "linear-gradient(90deg, transparent 0%, #16a34a 35%, rgba(22,163,74,0.9) 50%, #16a34a 65%, transparent 100%)",
          top: 0,
        }}
        animate={{ y: [0, sz, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
      />
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
    <div className="relative mt-8 mr-8">
      {/* Floating EU badge */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -right-5 z-20 flex items-center gap-1.5 bg-white rounded-2xl px-3 py-2"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
      >
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
        <span className="text-xs font-bold text-gray-800 whitespace-nowrap">ESPR-ready</span>
      </motion.div>

      {/* Floating carbon badge */}
      <motion.div
        animate={{ y: [3, -3, 3] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-5 -left-6 z-20 flex items-center gap-2 bg-white rounded-2xl px-3 py-2"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
      >
        <span className="text-lg leading-none">🌿</span>
        <div>
          <p className="text-[9px] text-gray-400 leading-none mb-0.5 whitespace-nowrap">Carbon footprint</p>
          <p className="text-xs font-bold text-green-600 leading-none">2.3 kg CO₂e</p>
        </div>
      </motion.div>

      {/* Card */}
      <div
        className="bg-white rounded-3xl p-5 w-80"
        style={{ boxShadow: "0 8px 40px rgba(22, 163, 74, 0.14), 0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
            🧥
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">Merino Crew Neck</p>
            <p className="text-xs text-gray-400 mt-0.5">Autumn Collection 2026</p>
          </div>
          <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            DPP Ready
          </span>
        </div>

        {/* Barcode */}
        <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-center mb-4">
          <SmallBarcode />
        </div>

        {/* Passport data */}
        <div className="space-y-2.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">{label}</span>
              <span className="text-[11px] font-semibold text-gray-700">{value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[9px] text-gray-300 font-mono tracking-tight">GS1 · 01234567890128</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-green-600 font-semibold">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="min-w-[56px] px-3 py-2.5 bg-white rounded-2xl text-center"
        style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <span className="block text-2xl md:text-3xl font-bold leading-none tabular-nums text-foreground font-display">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

const LAUNCH = new Date("2026-12-01T00:00:00Z");

// Name of the Netlify Forms form — must match the hidden static form in index.html.
const NETLIFY_FORM_NAME = "coming-soon";

const FEATURES = [
  {
    Icon: Layers,
    title: "Your 2D Barcode, Ready to Print",
    body: "A GS1 Digital Link QR code, dual-marked alongside your legacy barcode — print-ready in seconds.",
    bg: "#dcfce7",
    fg: "#16a34a",
  },
  {
    Icon: Zap,
    title: "Passport-Ready Story Pages",
    body: "Every product gets a free, brandable story page — with the material, sourcing, and care fields the EU's textile passport will need.",
    bg: "#fef9c3",
    fg: "#ca8a04",
  },
  {
    Icon: Plug,
    title: "No GS1 Jargon, Ever",
    body: "Guided setup in plain language — we help you get a GS1 prefix, or import the GTINs you already have.",
    bg: "#ede9fe",
    fg: "#7c3aed",
  },
  {
    Icon: BarChart2,
    title: "Compliance Dashboard",
    body: "A plain-language \"am I ready yet\" view — Sunrise 2027 and DPP status, per product, in one glance.",
    bg: "#ffedd5",
    fg: "#ea580c",
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

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown(LAUNCH);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailValue = String(formData.get("email") ?? "").trim();
    if (!emailValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Enter a valid email to get early access.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Honeypot filled in? It's a bot — silently pretend success.
      if (!String(formData.get("bot-field") ?? "")) {
        const body = new URLSearchParams();
        formData.forEach((value, key) => body.append(key, String(value)));
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        if (!res.ok) throw new Error(`Netlify form submission failed (${res.status})`);
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Soft mesh gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 62% 55% at 6% 8%, rgba(196,224,183,0.30) 0%, transparent 62%)",
            "radial-gradient(ellipse 55% 50% at 96% 90%, rgba(255,232,206,0.45) 0%, transparent 60%)",
            "radial-gradient(ellipse 45% 50% at 60% 18%, rgba(199,235,221,0.28) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary"
          >
            <div
              className="grid gap-[2.5px]"
              style={{ gridTemplateColumns: "repeat(3, 5px)", gridTemplateRows: "repeat(3, 5px)" }}
            >
              {[1, 1, 1, 1, 0, 1, 1, 1, 1].map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "1px",
                    background: v ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <span className="text-lg font-bold text-foreground font-display">
            Almsby
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Launching December 2026
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-6 items-center">

          {/* Left: copy */}
          <div className="flex flex-col gap-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "#dcfce7", color: "#15803d" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              GS1 Sunrise 2027 · EU Digital Product Passports
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="space-y-4"
            >
              <h1
                className="text-4xl md:text-5xl xl:text-[3.25rem] font-bold leading-[1.1] tracking-tight font-display"
              >
                One barcode for the
                <br />
                scanner. <span className="text-primary">A story for the customer.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-[500px]">
                Almsby brings Sunrise 2027 barcodes and EU Digital Product Passports together in
                one gentle workflow — no GS1 jargon, no compliance consultants. Just a barcode
                your retailer accepts, and a story your customers love to scan.
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="flex items-start gap-2"
            >
              <CountBox value={days} label="Days" />
              <span className="text-xl font-bold text-muted-foreground/50 mt-2.5">:</span>
              <CountBox value={hours} label="Hours" />
              <span className="text-xl font-bold text-muted-foreground/50 mt-2.5">:</span>
              <CountBox value={minutes} label="Min" />
              <span className="text-xl font-bold text-muted-foreground/50 mt-2.5">:</span>
              <CountBox value={seconds} label="Sec" />
            </motion.div>

            {/* Email form */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.21 }}
              className="space-y-2"
            >
              {submitted ? (
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  {"You're in! We'll reach out before launch."}
                </div>
              ) : (
                <form
                  name={NETLIFY_FORM_NAME}
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-2 max-w-[440px]"
                >
                  <input type="hidden" name="form-name" value={NETLIFY_FORM_NAME} />
                  <input
                    type="text"
                    name="bot-field"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 bg-white rounded-2xl text-sm outline-none transition-all"
                    style={{
                      border: error
                        ? "1.5px solid #ef4444"
                        : focused
                        ? "1.5px solid #16a34a"
                        : "1.5px solid rgba(0,0,0,0.1)",
                      boxShadow: focused && !error ? "0 0 0 3px rgba(22,163,74,0.12)" : "none",
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-1.5 px-5 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-2xl hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Signing you up…" : "Get Early Access"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
              {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
              {!submitted && !error && (
                <p className="text-xs text-muted-foreground">
                  Launching December 2026 — early access includes a launch discount. No spam, ever.
                </p>
              )}
            </motion.div>
          </div>

          {/* Right: product passport card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex items-center justify-center lg:justify-end pb-8 pr-8"
          >
            <ProductPassportCard />
          </motion.div>
        </div>
      </section>

      {/* ── EU DPP Timeline ── */}
      <section className="relative z-10 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div
            className="bg-white rounded-[2rem] px-6 md:px-12 py-12 md:py-14"
            style={{
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 10px 45px rgba(22, 163, 74, 0.07), 0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">

              <div className="lg:w-1/2 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  The EU mandate is real — and rolling out
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug font-display">
                  It's already rolling out.
                  <br />
                  <span className="text-primary">Your category is next.</span>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  There's no single DPP deadline — the EU is phasing Digital Product Passports in
                  category by category. Batteries are mandatory from February 2027, textiles are
                  next as the rules finalize, and more categories follow in waves. Build it once
                  now, and you're compliant whenever yours lands — no scrambling.
                </p>
                <p className="text-xs text-muted-foreground/75 leading-relaxed max-w-md">
                  The EU's central passport registry went live in July 2026 — this isn't a rumor,
                  it's running infrastructure. Almsby handles the barcode and the passport
                  together, so you're ready for whichever wave comes first.
                </p>
              </div>

              <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {EU_DEADLINES.map(
                  ({ emoji, category, year, note, badge, cardBg, cardBorder, badgeBg, badgeFg }, i) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i }}
                      className="rounded-2xl p-4 flex flex-col"
                      style={{ background: cardBg, border: cardBorder }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{emoji}</span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: badgeBg, color: badgeFg }}
                        >
                          {badge}
                        </span>
                      </div>
                      <p className="text-2xl font-bold leading-none text-foreground font-display">
                        {year}
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-1.5">{category}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{note}</p>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Everything you need
          </p>
          <h2 className="text-2xl md:text-3xl font-bold font-display">
            One platform. Zero compliance anxiety.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ Icon, title, body, bg, fg }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-5 transition-shadow hover:shadow-lg"
              style={{
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color: fg }} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5 leading-snug font-display">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
      >
        <span className="text-xs font-medium text-muted-foreground">
          © 2026 Almsby · Every product has a story.
        </span>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Built on GS1 Digital Link
        </div>
      </footer>
    </div>
  );
}