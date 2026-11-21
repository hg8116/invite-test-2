"use client";

import { useSyncExternalStore } from "react";
import { LANGS, type Lang } from "@/content/invitation";

// The chosen language is remembered in localStorage (with an in-memory
// fallback). useSyncExternalStore keeps the server HTML in English and
// switches right after hydration when another language was saved.
const KEY = "invitation-lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    current = null;
    cb();
  };
  listeners.add(cb);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Lang {
  if (current) return current;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved && (LANGS as string[]).includes(saved)) return saved as Lang;
  } catch {
    // storage unavailable
  }
  return "en";
}

const getServerSnapshot = (): Lang => "en";

export function setLang(lang: Lang) {
  current = lang;
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    // storage unavailable (e.g. private mode) — the in-memory value is used
  }
  listeners.forEach((cb) => cb());
}

export function useLang() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
