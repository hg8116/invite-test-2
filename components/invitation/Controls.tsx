"use client";

import { LANGS, type Copy, type Lang } from "@/content/invitation";
import styles from "./Controls.module.css";

interface Props {
  t: Copy;
  visible: boolean;
  lang: Lang;
  onLang: (lang: Lang) => void;
  playing: boolean;
  onToggleSound: () => void;
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {on ? (
        <>
          <path d="M15.2 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.6 6.8a7.4 7.4 0 0 1 0 10.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <path d="M15.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Controls({ t, visible, lang, onLang, playing, onToggleSound }: Props) {
  const index = LANGS.indexOf(lang);
  return (
    <div className={styles.controls} data-visible={visible} inert={!visible}>
      <div className={styles.lang} role="group" aria-label={t.controls.language}>
        <span className={styles.thumb} style={{ transform: `translateX(${index * 100}%)` }} aria-hidden="true" />
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            className={styles.langBtn}
            aria-pressed={l === lang}
            lang={l}
            onClick={() => onLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.sound}
        aria-pressed={playing}
        aria-label={playing ? t.controls.soundOff : t.controls.soundOn}
        title={playing ? t.controls.soundOff : t.controls.soundOn}
        onClick={onToggleSound}
        data-playing={playing}
      >
        <SpeakerIcon on={playing} />
      </button>
    </div>
  );
}
