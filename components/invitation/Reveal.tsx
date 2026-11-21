"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./Reveal.module.css";

// One shared observer for every revealable element on the page.
const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function observe(el: Element, cb: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callbacks.get(entry.target)?.();
          observer?.unobserve(entry.target);
          callbacks.delete(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );
  callbacks.set(el, cb);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    callbacks.delete(el);
  };
}

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "fade" | "zoom";
  as?: "div" | "p" | "h2" | "li" | "section";
  style?: CSSProperties;
}

export function Reveal({ children, className, delay = 0, variant = "up", as: Tag = "div", style }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observe(el, () => setShown(true));
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${styles.reveal} ${className ?? ""}`}
      data-shown={shown}
      data-variant={variant}
      style={{ ...style, "--delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
