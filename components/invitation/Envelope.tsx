"use client";

import Image from "next/image";
import type { KeyboardEvent } from "react";
import envelopeArt from "@/assets/art/envelope.webp";
import paperArt from "@/assets/art/paper.webp";
import ribbonArt from "@/assets/art/ribbon.webp";
import bowArt from "@/assets/art/bow.webp";
import styles from "./Envelope.module.css";

export type EnvelopePhase = "sealed" | "opening";

interface Props {
  phase: EnvelopePhase;
  label: string;
  hint: string;
  onOpen: () => void;
}

const SIZES = "(max-width: 480px) 100vw, 480px";

function Art({ preload = false }: { preload?: boolean }) {
  return (
    <Image
      src={envelopeArt}
      alt=""
      fill
      sizes={SIZES}
      preload={preload}
      placeholder="blur"
      className={styles.art}
      draggable={false}
    />
  );
}

export function Envelope({ phase, label, hint, onOpen }: Props) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={styles.envelope}
      data-phase={phase}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        {/* inside of the envelope (shadowed lining, hero shows through) */}
        <div className={styles.interior} />

        {/* front pocket, split in two so it can part like doors */}
        <div className={`${styles.pocketShadow} ${styles.left}`}>
          <div className={`${styles.pocket} ${styles.pocketLeft}`}>
            <Art preload />
          </div>
        </div>
        <div className={`${styles.pocketShadow} ${styles.right}`}>
          <div className={`${styles.pocket} ${styles.pocketRight}`}>
            <Art />
          </div>
        </div>

        {/* top flap: painted outside, paper lining inside */}
        <div className={styles.flap}>
          <div className={styles.flapFrontShadow}>
            <div className={styles.flapFront}>
              <Art />
              <span className={styles.flapShade} />
            </div>
          </div>
          <div className={styles.flapBack} style={{ backgroundImage: `url(${paperArt.src})` }} />
        </div>

        {/* silk ribbon & bow */}
        <div className={styles.ribbon} aria-hidden="true">
          <span className={`${styles.strap} ${styles.strapTop}`} style={{ backgroundImage: `url(${ribbonArt.src})` }} />
          <span className={`${styles.strap} ${styles.strapBottom}`} style={{ backgroundImage: `url(${ribbonArt.src})` }} />
          <Image src={bowArt} alt="" className={styles.bow} sizes="300px" draggable={false} />
        </div>
      </div>

      <p className={styles.hint} aria-hidden="true">
        <span>{hint}</span>
      </p>
    </div>
  );
}
