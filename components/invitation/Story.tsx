import Image from "next/image";
import cloudsArt from "@/assets/art/story-clouds.webp";
import fountainArt from "@/assets/art/fountain.webp";
import type { Copy } from "@/content/invitation";
import { Reveal } from "./Reveal";
import styles from "./Story.module.css";

export function Story({ t }: { t: Copy }) {
  const s = t.story;
  return (
    <section className={styles.section} aria-labelledby="story-title">
      <div className={styles.sky}>
        <Reveal variant="fade" className={styles.clouds}>
          <Image src={cloudsArt} alt="" sizes="(max-width: 480px) 100vw, 480px" className={styles.cloudsImg} aria-hidden="true" />
        </Reveal>
        <Reveal className={styles.titleWrap} delay={0.15}>
          <h2 id="story-title" className={styles.title}>
            {s.title}
          </h2>
        </Reveal>
      </div>

      <div className={styles.text}>
        {s.paragraphs.map((p, i) => (
          <Reveal as="p" key={i} delay={i * 0.06} className={styles.paragraph}>
            {p}
          </Reveal>
        ))}
        <Reveal as="p" className={styles.signature} delay={0.1}>
          <span>{s.signature}</span>
        </Reveal>
      </div>

      <div className={styles.fountain} aria-hidden="true">
        <Image src={fountainArt} alt="" sizes="(max-width: 480px) 100vw, 480px" className={styles.fountainImg} />
      </div>
    </section>
  );
}
