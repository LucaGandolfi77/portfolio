import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

/** PRNG deterministico: le posizioni delle stelline sono stabili tra un render e l'altro. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SparklesProps {
  /** Quante stelline disegnare. Su reduced-motion vengono mostrate statiche. */
  count?: number;
  seed?: number;
  /** Area coperta: "screen" per il fondale, "local" per dentro una card. */
  variant?: 'screen' | 'local' | 'glitter';
  className?: string;
}

const GLITTER_CHARS = ['✦', '✧', '·', '✩', '˚'];

/**
 * Campo di stelline decorative.
 *
 * Solo `transform` + `opacity` animati (compositing GPU), nessun canvas e nessun
 * elemento in più del necessario: è ciò che tiene lo scroll fluido su iPhone.
 * Con `prefers-reduced-motion` le stelline restano ma non si muovono.
 */
export function Sparkles({ count = 14, seed = 7, variant = 'screen', className }: SparklesProps) {
  const prefersReducedMotion = useReducedMotion();

  const stars = useMemo(() => {
    const rand = mulberry32(seed * 9973 + count);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 6 + rand() * (variant === 'glitter' ? 16 : 11),
      delay: rand() * 6,
      duration: 3.4 + rand() * 4,
      opacity: 0.18 + rand() * (variant === 'glitter' ? 0.6 : 0.4),
      char: GLITTER_CHARS[Math.floor(rand() * GLITTER_CHARS.length)] ?? '✦',
    }));
  }, [count, seed, variant]);

  return (
    <div className={`sparkles sparkles--${variant} ${className ?? ''}`} aria-hidden="true">
      {stars.map((star) => {
        const style = {
          left: `${star.left}%`,
          top: `${star.top}%`,
          fontSize: `${star.size}px`,
          '--star-opacity': star.opacity,
          '--star-delay': `${star.delay}s`,
          '--star-duration': `${star.duration}s`,
        } as CSSProperties;

        if (prefersReducedMotion) {
          return (
            <span key={star.id} className="sparkle sparkle--static" style={style}>
              {star.char}
            </span>
          );
        }

        return (
          <motion.span
            key={star.id}
            className="sparkle"
            style={style}
            animate={{ opacity: [0, star.opacity, 0], scale: [0.6, 1, 0.6], y: [0, -6, 0] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {star.char}
          </motion.span>
        );
      })}
    </div>
  );
}

interface LightTrailProps {
  /** Ogni quanto passa la scia (ms). Di default 22 secondi: rara e discreta. */
  intervalMs?: number;
}

/**
 * Traiettoria luminosa che attraversa lo schermo ogni tanto, come una curva
 * lasciata dalle ruote sulla pista. Puramente decorativa e non interattiva.
 */
export function LightTrail({ intervalMs = 22000 }: LightTrailProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;

  return (
    <div className="trail" aria-hidden="true">
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="trail__svg">
        <motion.path
          d="M-20 150 C 80 80, 160 190, 240 120 S 380 60, 430 110"
          fill="none"
          stroke="url(#trailGradient)"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 0.75, 0] }}
          transition={{ duration: 7, repeat: Infinity, repeatDelay: intervalMs / 1000, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="trailGradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="var(--gold-soft)" />
            <stop offset="100%" stopColor="var(--ribbon)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
