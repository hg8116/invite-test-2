"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import frameArt from "@/assets/art/frame.webp";
import { event, type Copy } from "@/content/invitation";
import { Reveal } from "./Reveal";
import styles from "./Countdown.module.css";

// A clock store that ticks once per second; the server snapshot is null so
// the markup hydrates cleanly and the real numbers appear right after.
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

const TARGET = Math.floor(Date.parse(event.start) / 1000);

function split(nowSec: number | null) {
  if (nowSec === null) return null;
  const s = Math.max(0, TARGET - nowSec);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
  };
}

export function Countdown({ t, id }: { t: Copy; id: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const parts = split(now);
  const c = t.countdown;
  const unit = (key: keyof Copy["countdown"]["units"], n: number | undefined) => c.units[key][n === 1 ? 0 : 1];
  const fmt = (n: number | undefined) => (n === undefined ? "–" : String(n));

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <Reveal className={styles.head}>
        <h2 id={`${id}-title`} className={styles.title}>
          {c.title}
        </h2>
        <p className={styles.until}>{c.until}</p>
      </Reveal>

      <Reveal className={styles.frame} variant="zoom" delay={0.1}>
        <Image src={frameArt} alt="" fill sizes="(max-width: 480px) 82vw, 390px" className={styles.frameImg} aria-hidden="true" />
        <div className={styles.values} role="timer" aria-live="off">
          <p className={`${styles.unit} ${styles.days}`}>
            <span className={styles.num}>{fmt(parts?.days)}</span>
            <span className={styles.label}>{unit("days", parts?.days)}</span>
          </p>
          <p className={styles.unit}>
            <span className={styles.num}>{fmt(parts?.hours)}</span>
            <span className={styles.label}>{unit("hours", parts?.hours)}</span>
          </p>
          <p className={styles.unit}>
            <span className={styles.num}>{fmt(parts?.minutes)}</span>
            <span className={styles.label}>{unit("minutes", parts?.minutes)}</span>
          </p>
          <p className={styles.unit}>
            <span className={styles.num}>{fmt(parts?.seconds)}</span>
            <span className={styles.label}>{unit("seconds", parts?.seconds)}</span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
