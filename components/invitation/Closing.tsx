import Image from "next/image";
import ribbonsArt from "@/assets/art/ribbons.webp";
import { event, type Copy } from "@/content/invitation";
import { Reveal } from "./Reveal";
import styles from "./Closing.module.css";

export function DressCode({ t }: { t: Copy }) {
  return (
    <section className={styles.dress} aria-labelledby="dress-title">
      <Reveal className={styles.head}>
        <h2 id="dress-title" className={styles.title}>
          {t.dress.title}
        </h2>
        <p className={styles.code}>{t.dress.code}</p>
      </Reveal>
      <Reveal className={styles.ribbons} variant="fade" delay={0.15}>
        <Image src={ribbonsArt} alt="" sizes="(max-width: 480px) 100vw, 480px" className={styles.ribbonsImg} aria-hidden="true" />
      </Reveal>
    </section>
  );
}

export function Footer({ t }: { t: Copy }) {
  const { first, second } = event.couple;
  return (
    <footer className={styles.footer}>
      <Reveal>
        <p className={styles.monogram} aria-label={`${first} & ${second}`}>
          <span>{first[0]}</span>
          <span className={styles.amp}>&amp;</span>
          <span>{second[0]}</span>
        </p>
        <p className={styles.line}>{t.footer.line}</p>
        <p className={styles.date}>{t.footer.date}</p>
      </Reveal>
    </footer>
  );
}
