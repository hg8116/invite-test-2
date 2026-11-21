import Image from "next/image";
import estateArt from "@/assets/art/estate.webp";
import { event, type Copy } from "@/content/invitation";
import { OrnateFrame } from "./OrnateFrame";
import { Reveal } from "./Reveal";
import styles from "./Celebration.module.css";

export function Celebration({ t }: { t: Copy }) {
  const c = t.celebration;
  return (
    <>
      <section className={styles.section} aria-labelledby="celebration-title">
        <Reveal className={styles.head}>
          <h2 id="celebration-title" className={styles.title}>
            {c.title}
          </h2>
          <p className={styles.subtitle}>{c.subtitle}</p>
        </Reveal>

        <Reveal className={styles.frameWrap} delay={0.1} variant="zoom">
          <OrnateFrame>
            <h3 className={styles.venue}>{event.venue.name}</h3>
            <p className={styles.area}>{event.venue.area}</p>
            <p className={styles.description}>{c.description}</p>
            <p className={styles.date}>{c.date}</p>
            <p className={styles.time}>{c.time}</p>
            <a className={styles.map} href={event.venue.mapUrl} target="_blank" rel="noopener noreferrer">
              {c.map}
            </a>
          </OrnateFrame>
        </Reveal>
      </section>

      <div className={styles.estate} aria-hidden="true">
        <Image src={estateArt} alt="" sizes="(max-width: 480px) 100vw, 480px" className={styles.estateImg} />
      </div>
    </>
  );
}
