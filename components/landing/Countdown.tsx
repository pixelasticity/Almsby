"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "@/styles/landing.module.css";

const LAUNCH_AT = Date.parse("2026-12-01T00:00:00Z");

type Time = { days: number; hours: number; minutes: number; seconds: number };

function calc(target: number): Time {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function Countdown() {
  const [t, setT] = useState<Time>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const tr = useTranslations("countdown");

  useEffect(() => {
    const tick = () => setT(calc(LAUNCH_AT));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.countdown} role="timer" aria-live="off">
      <CountBox value={t.days} label={tr("days")} />
      <span className={styles.countdownSep}>:</span>
      <CountBox value={t.hours} label={tr("hours")} />
      <span className={styles.countdownSep}>:</span>
      <CountBox value={t.minutes} label={tr("minutes")} />
      <span className={styles.countdownSep}>:</span>
      <CountBox value={t.seconds} label={tr("seconds")} />
    </div>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.countBoxWrap}>
      <div className={styles.countBox}>
        <span className={styles.countValue}>{String(value).padStart(2, "0")}</span>
      </div>
      <span className={styles.countLabel}>{label}</span>
    </div>
  );
}
