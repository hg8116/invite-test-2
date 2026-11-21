"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copy, event } from "@/content/invitation";
import { Celebration } from "./Celebration";
import { DressCode, Footer } from "./Closing";
import { Controls } from "./Controls";
import { Countdown } from "./Countdown";
import { Day } from "./Day";
import { Envelope } from "./Envelope";
import { Hero } from "./Hero";
import { createMusicPlayer, type MusicPlayer } from "./music";
import { Story } from "./Story";
import { setLang, useLang } from "./useLang";
import styles from "./Invitation.module.css";

type Phase = "sealed" | "opening" | "open";

// Choreography (ms after the tap) — keep in sync with Envelope.module.css.
const HERO_REVEAL_AT = 2300;
const ENVELOPE_DONE_AT = 3350;

export function Invitation() {
  const lang = useLang();
  const t = copy[lang];
  const [phase, setPhase] = useState<Phase>("sealed");
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const player = useRef<MusicPlayer | null>(null);
  const timers = useRef<number[]>([]);

  // Keep the page pinned to the top while the envelope is closed.
  useEffect(() => {
    const root = document.documentElement;
    if (phase === "open") {
      root.removeAttribute("data-locked");
      return;
    }
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    root.setAttribute("data-locked", "");
    window.scrollTo(0, 0);
  }, [phase]);

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const getPlayer = useCallback(() => {
    player.current ??= createMusicPlayer(event.music.src, event.music.volume);
    return player.current;
  }, []);

  const startMusic = useCallback(() => {
    try {
      getPlayer()
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } catch {
      setPlaying(false);
    }
  }, [getPlayer]);

  const open = useCallback(() => {
    if (phase !== "sealed") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("opening");
    // Must run inside the tap handler so browsers allow audio playback.
    startMusic();
    timers.current.push(
      window.setTimeout(() => setHeroRevealed(true), reduce ? 150 : HERO_REVEAL_AT),
      window.setTimeout(() => setPhase("open"), reduce ? 650 : ENVELOPE_DONE_AT),
    );
  }, [phase, startMusic]);

  const toggleSound = useCallback(() => {
    const p = getPlayer();
    if (p.playing) {
      p.pause();
      setPlaying(false);
    } else {
      startMusic();
    }
  }, [getPlayer, startMusic]);

  return (
    <div className={styles.page}>
      {phase !== "open" && (
        <Envelope phase={phase === "sealed" ? "sealed" : "opening"} label={t.envelope.open} hint={t.envelope.hint} onOpen={open} />
      )}

      <main inert={phase !== "open"}>
        <Hero t={t} revealed={heroRevealed} nextId="countdown" />
        <Countdown t={t} id="countdown" />
        <Story t={t} />
        <Celebration t={t} />
        <Day t={t} />
        <DressCode t={t} />
        <Footer t={t} />
      </main>

      <Controls t={t} visible={phase === "open"} lang={lang} onLang={setLang} playing={playing} onToggleSound={toggleSound} />
    </div>
  );
}
