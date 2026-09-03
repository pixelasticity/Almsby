import Countdown from "@/components/landing/Countdown";
import WaitlistForm from "@/components/landing/WaitlistForm";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { BarsIcon, LayersIcon, PlugIcon, ZapIcon } from "@/components/icons";
import ProductPassportCard from "@/components/landing/ProductPassportCard";
import styles from "@/styles/landing.module.css";
import { getTranslations } from "next-intl/server";

const FEATURES = [
  {
    key: "feature1",
    icon: <LayersIcon />,
    bg: "#dcfce7",
    fg: "#16a34a",
  },
  {
    key: "feature2",
    icon: <ZapIcon />,
    bg: "#fef9c3",
    fg: "#ca8a04",
  },
  {
    key: "feature3",
    icon: <PlugIcon />,
    bg: "#ede9fe",
    fg: "#7c3aed",
  },
  {
    key: "feature4",
    icon: <BarsIcon />,
    bg: "#ffedd5",
    fg: "#ea580c",
  },
];

const EU_DEADLINES = [
  {
    key: "batteries",
    emoji: "🔋",
    cardBg: "var(--blue-100)",
    cardBorder: "1px solid var(--blue-200)",
    badgeBg: "var(--blue-600)",
    badgeFg: "var(--neutral-100)",
  },
  {
    key: "textiles",
    emoji: "👕",
    cardBg: "var(--gold-100)",
    cardBorder: "1px solid var(--gold-200)",
    badgeBg: "var(--gold-300)",
    badgeFg: "var(--neutral-700)",
  },
  {
    key: "beyond",
    emoji: "🧵",
    cardBg: "var(--card)",
    cardBorder: "1px solid var(--neutral-200)",
    badgeBg: "var(--neutral-200)",
    badgeFg: "var(--neutral-700)",
  },
];

export default async function PublicHomePage() {
  const t = await getTranslations("landing");
  const dl = await getTranslations("deadlines");
  const n = await getTranslations("nav");
  return (
    <div className={styles.root}>
      <header className={styles.nav}>
        <div className={styles.navBrand}>
          <div className={styles.logoBox} aria-hidden="true">
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
          {n("launchNote")}
        </div>
        <LocaleSwitcher />
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                {t("heroBadge")}
              </span>
              <h1 className={styles.heroTitle}>
                {t("heroTitleLine1")}{" "}
                <span className={styles.heroAccent}>{t("heroTitleAccent")}</span>
              </h1>
              <p className={styles.heroSub}>
                {t("heroSub")}
              </p>
            </div>
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
                <h2 className={styles.timelineTitle}>{t("timelineTitle")}</h2>
                <p className={styles.timelineBody}>{t("timelineBody")}</p>
              </div>
              <div className={styles.deadlineGrid}>
                {EU_DEADLINES.map((item, i) => (
                  <div key={item.key} className={styles.deadlineCard} style={{ background: item.cardBg, border: item.cardBorder, animationDelay: `${0.08 * i}s` }}>
                    <div className={styles.deadlineTop}>
                      <span className={styles.deadlineEmoji} aria-hidden="true">{item.emoji}</span>
                      <span className={styles.deadlineBadge} style={{ background: item.badgeBg, color: item.badgeFg }}>
                        {dl(`${item.key}Badge`)}
                      </span>
                    </div>
                    <p className={styles.deadlineYear}>{dl(`${item.key}Year`)}</p>
                    <p className={styles.deadlineCategory}>{dl(`${item.key}Category`)}</p>
                    <p className={styles.deadlineNote}>{dl(`${item.key}Note`)}</p>
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
            <p className={styles.featureEyebrow}>{t("featureEyebrow")}</p>
            <h2 className={styles.featureTitle}>{t("featureTitle")}</h2>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map(({ key, icon, bg, fg }) => (
              <div key={key} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: bg, color: fg }}>
                  {icon}
                </div>
                <h3 className={styles.featureCardTitle}>{t(`${key}Title`)}</h3>
                <p className={styles.featureCardBody}>{t(`${key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerText}>{t("footerText")}</span>
        <div className={styles.footerBadge}>
          <span className={styles.pulseDot} />
          {t("footerBadge")}
        </div>
      </footer>
    </div>
  );
}
