'use client';

import styles from './AvatarBot.module.css';

export type AvatarState = 'idle' | 'thinking' | 'speaking';

type AvatarBotProps = {
  state?: AvatarState;
  size?: number;
};

// Every avatar shares the same gradient, so a constant id keeps server and
// client markup identical (a useId() value mismatches during hydration).
const gradientId = 'avatarBotGradient';

export default function AvatarBot({ state = 'idle', size = 64 }: AvatarBotProps) {
  const accent = `url(#${gradientId})`;

  return (
    <div className={`${styles.avatarBot} ${styles[state]}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ea8ff" />
            <stop offset="55%" stopColor="#9b7cff" />
            <stop offset="100%" stopColor="#d19bff" />
          </linearGradient>
        </defs>

        <circle className={styles.glowRing} cx="60" cy="66" r="46" />

        <line className={styles.antenna} x1="60" y1="34" x2="60" y2="18" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle className={styles.antennaTip} cx="60" cy="13" r="5" fill="#d19bff" />

        <rect className={styles.head} x="20" y="34" width="80" height="64" rx="22" fill="#0d1020" stroke={accent} strokeWidth="2.5" />

        <g className={styles.eyes}>
          <rect className={styles.eye} x="38" y="54" width="12" height="16" rx="6" fill={accent} />
          <rect className={styles.eye} x="70" y="54" width="12" height="16" rx="6" fill={accent} />
        </g>

        <path className={styles.mouthIdle} d="M46 82 Q60 90 74 82" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />

        <g className={styles.mouthSpeaking} fill={accent}>
          <rect className={styles.bar} x="44" y="78" width="5" height="10" rx="2.5" />
          <rect className={styles.bar} x="53" y="75" width="5" height="16" rx="2.5" />
          <rect className={styles.bar} x="62" y="77" width="5" height="12" rx="2.5" />
          <rect className={styles.bar} x="71" y="79" width="5" height="8" rx="2.5" />
        </g>
      </svg>
    </div>
  );
}
