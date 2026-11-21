import type { ReactNode } from "react";
import styles from "./OrnateFrame.module.css";

// Fine line-art frame: a double rule with leafy corner scrolls, a bow at the
// top and bottom and a sprig on each side. All strokes use currentColor.

function Leaf({ x, y, a, s = 1 }: { x: number; y: number; a: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path d="M0 0C3 -3.6 8.5 -3.6 12 0C8.5 3.6 3 3.6 0 0Z" />
      <path d="M1.5 0H10" />
    </g>
  );
}

function Corner() {
  return (
    <svg className={styles.corner} viewBox="0 0 90 90" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* scroll at the corner */}
        <path d="M16 46C10 30 18 14 36 12" />
        <path d="M22 44C18 32 24 22 36 19" />
        <path d="M12 12C20 8 26 16 20 20C16 23 12 18 16 16" />
        {/* vine along the top */}
        <path d="M36 12C48 9 58 15 70 11C76 9 82 10 88 12" />
        <Leaf x={44} y={11} a={-35} />
        <Leaf x={52} y={13} a={30} s={0.9} />
        <Leaf x={61} y={12} a={-30} s={0.85} />
        <Leaf x={70} y={11} a={25} s={0.75} />
        {/* vine down the side */}
        <path d="M16 46C13 58 18 68 12 80C11 83 11 86 12 88" />
        <Leaf x={15} y={52} a={125} />
        <Leaf x={15} y={60} a={55} s={0.9} />
        <Leaf x={15} y={69} a={120} s={0.85} />
        <Leaf x={13} y={77} a={60} s={0.75} />
        <circle cx="27" cy="27" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="31" cy="24" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="24" cy="31" r="1.2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function Bow() {
  return (
    <svg className={styles.bow} viewBox="0 0 170 40" aria-hidden="true">
      <rect x="40" y="13" width="90" height="14" fill="var(--frame-bg)" />
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* loops */}
        <path d="M85 20C78 10 64 8 62 15C60 22 74 24 85 20Z" />
        <path d="M85 20C92 10 106 8 108 15C110 22 96 24 85 20Z" />
        <path d="M85 20C80 26 76 32 72 36" />
        <path d="M85 20C90 26 94 32 98 36" />
        <ellipse cx="85" cy="20" rx="3" ry="2.6" />
        {/* sprigs */}
        <path d="M60 18C48 22 36 16 22 20C16 21 10 20 4 18" />
        <path d="M110 18C122 22 134 16 148 20C154 21 160 20 166 18" />
        <Leaf x={52} y={20} a={200} />
        <Leaf x={44} y={18} a={150} s={0.9} />
        <Leaf x={35} y={18} a={205} s={0.85} />
        <Leaf x={26} y={19} a={150} s={0.75} />
        <Leaf x={118} y={20} a={-20} />
        <Leaf x={126} y={18} a={30} s={0.9} />
        <Leaf x={135} y={18} a={-25} s={0.85} />
        <Leaf x={144} y={19} a={30} s={0.75} />
      </g>
    </svg>
  );
}

function Sprig() {
  return (
    <svg className={styles.sprig} viewBox="0 0 30 110" aria-hidden="true">
      <rect x="9" y="10" width="12" height="90" fill="var(--frame-bg)" />
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4C12 24 18 40 15 56C12 72 18 88 15 106" />
        <Leaf x={15} y={14} a={-60} s={0.9} />
        <Leaf x={15} y={24} a={-120} s={0.9} />
        <Leaf x={15} y={36} a={-55} />
        <Leaf x={15} y={48} a={-125} />
        <Leaf x={15} y={62} a={55} />
        <Leaf x={15} y={74} a={125} />
        <Leaf x={15} y={86} a={60} s={0.9} />
        <Leaf x={15} y={96} a={120} s={0.9} />
        <circle cx="15" cy="56" r="1.8" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function OrnateFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      <span className={styles.rules} aria-hidden="true" />
      <span className={`${styles.cornerWrap} ${styles.tl}`}>
        <Corner />
      </span>
      <span className={`${styles.cornerWrap} ${styles.tr}`}>
        <Corner />
      </span>
      <span className={`${styles.cornerWrap} ${styles.bl}`}>
        <Corner />
      </span>
      <span className={`${styles.cornerWrap} ${styles.br}`}>
        <Corner />
      </span>
      <span className={`${styles.bowWrap} ${styles.top}`}>
        <Bow />
      </span>
      <span className={`${styles.bowWrap} ${styles.bottom}`}>
        <Bow />
      </span>
      <span className={`${styles.sprigWrap} ${styles.leftSide}`}>
        <Sprig />
      </span>
      <span className={`${styles.sprigWrap} ${styles.rightSide}`}>
        <Sprig />
      </span>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
