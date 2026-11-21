import Image, { type StaticImageData } from "next/image";
import tileArt from "@/assets/art/tile.webp";
import drinks from "@/assets/art/icon-drinks.webp";
import arch from "@/assets/art/icon-arch.webp";
import cocktail from "@/assets/art/icon-cocktail.webp";
import dinner from "@/assets/art/icon-dinner.webp";
import cake from "@/assets/art/icon-cake.webp";
import dance from "@/assets/art/icon-dance.webp";
import disco from "@/assets/art/icon-disco.webp";
import moon from "@/assets/art/icon-moon.webp";
import { event, type Copy, type IconName } from "@/content/invitation";
import { Reveal } from "./Reveal";
import styles from "./Day.module.css";

const ICONS: Record<IconName, StaticImageData> = { drinks, arch, cocktail, dinner, cake, dance, disco, moon };

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21.2C11.6 21.2 1 14.6 1 7.4 1 3.8 3.7 1 7 1c2.1 0 3.9 1.1 5 2.8C13.1 2.1 14.9 1 17 1c3.3 0 6 2.8 6 6.4 0 7.2-10.6 13.8-11 13.8Z" />
    </svg>
  );
}

export function Day({ t }: { t: Copy }) {
  const d = t.day;
  const highlight = Number(t.hero.day);
  return (
    <section className={styles.section} aria-labelledby="day-title">
      <Reveal className={styles.head}>
        <h2 id="day-title" className={styles.title}>
          {d.title}
        </h2>
        <p className={styles.meta}>
          <span>{d.program}</span>
          <span className={styles.sep} aria-hidden="true" />
          <span>{d.date}</span>
        </p>
        <p className={styles.intro}>{d.intro}</p>
      </Reveal>

      <Reveal className={styles.calendar} delay={0.1}>
        {event.calendarDays.map((day) =>
          day === highlight ? (
            <span key={day} className={styles.today}>
              <Heart className={styles.todayHeart} />
              <span className={styles.todayNum}>{day}</span>
            </span>
          ) : (
            <span key={day} className={styles.dayNum}>
              {day}
            </span>
          ),
        )}
      </Reveal>

      <ol className={styles.timeline}>
        {event.program.map((item, i) => (
          <Reveal as="li" key={item.time} className={styles.row} delay={0.05} variant="up">
            <div className={styles.text} data-side={i % 2 ? "right" : "left"}>
              <time className={styles.time}>{item.time}</time>
              <span className={styles.label}>{d.items[i]}</span>
            </div>
            <span className={styles.marker} data-last={i === event.program.length - 1}>
              <Heart className={styles.markerHeart} />
            </span>
            <div className={styles.icon} data-side={i % 2 ? "left" : "right"}>
              <Image src={ICONS[item.icon]} alt="" sizes="88px" className={styles.iconImg} />
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal className={styles.tile} variant="zoom">
        <Image src={tileArt} alt="" sizes="(max-width: 480px) 80vw, 380px" className={styles.tileImg} aria-hidden="true" />
      </Reveal>
    </section>
  );
}
