import Image from "next/image";
import type { CSSProperties } from "react";
import heroArt from "@/assets/art/hero.webp";
import heroFgArt from "@/assets/art/hero-fg.webp";
import cardArt from "@/assets/art/card.webp";
import sprigArt from "@/assets/art/sprig.webp";
import { event, type Copy } from "@/content/invitation";
import styles from "./Hero.module.css";

interface Props {
  t: Copy;
  revealed: boolean;
  nextId: string;
}

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Hero({ t, revealed, nextId }: Props) {
  const h = t.hero;
  return (
    <section className={styles.hero} data-revealed={revealed} aria-label={`${event.couple.first} ${h.and} ${event.couple.second}`}>
      <div className={styles.bg} aria-hidden="true">
        <Image
          src={heroArt}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          loading="eager"
          placeholder="blur"
          className={styles.bgImg}
        />
      </div>

      <div className={styles.card}>
        <Image src={cardArt} alt="" fill sizes="340px" className={styles.cardImg} aria-hidden="true" />
        <div className={styles.content}>
          <h1 className={styles.names}>
            <span className={styles.item} style={i(0)}>
              {event.couple.first}
            </span>
            <span className={`${styles.amp} ${styles.item}`} style={i(1)}>
              {h.and}
            </span>
            <span className={styles.item} style={i(2)}>
              {event.couple.second}
            </span>
          </h1>

          <p className={`${styles.invite} ${styles.item}`} style={i(3)}>
            {h.invite[0]}
            <br />
            {h.invite[1]}
          </p>

          <div className={`${styles.date} ${styles.item}`} style={i(4)}>
            <Image src={sprigArt} alt="" className={`${styles.sprig} ${styles.sprigLeft}`} sizes="80px" />
            <p className={styles.dateText}>
              <span className={styles.small}>{h.month}</span>
              <span className={styles.day}>{h.day}</span>
              <span className={styles.small}>{h.weekday}</span>
              <span className={styles.small}>{h.year}</span>
            </p>
            <Image src={sprigArt} alt="" className={styles.sprig} sizes="80px" />
          </div>

          <p className={`${styles.heldAt} ${styles.item}`} style={i(5)}>
            {h.heldAt}
          </p>
          <p className={`${styles.place} ${styles.item}`} style={i(6)}>
            {h.place}
          </p>
        </div>
      </div>

      {/* villa & blossom branch overlap the card, like a collage */}
      <div className={styles.fg} aria-hidden="true">
        <Image src={heroFgArt} alt="" fill sizes="(max-width: 480px) 100vw, 480px" loading="eager" className={styles.bgImg} />
      </div>

      <a className={styles.scroll} href={`#${nextId}`} aria-label={h.scroll}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
