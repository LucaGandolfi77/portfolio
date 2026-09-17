import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { INTRO_LINES } from '../data/messages';

interface IntroProps {
  onDone: () => void;
}

/** Quanto resta a schermo l'intro, uscita compresa. */
const INTRO_MS = 1450;
const EXIT_MS = 420;

/**
 * Animazione di apertura: la traiettoria si disegna, il pattino scivola,
 * il titolo appare. Dura poco più di un secondo e non blocca l'app, che è
 * già montata dietro (questa schermata non intercetta alcun tocco).
 *
 * La smontatura è volutamente interna e deterministica: prima si dissolve,
 * poi avvisa il genitore di toglierla dall'albero. Così non dipendiamo mai
 * dalla conclusione di un'exit animation.
 */
export function Intro({ onDone }: IntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [line] = useState(() => INTRO_LINES[Math.floor(Math.random() * INTRO_LINES.length)] ?? '');
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    const hold = window.setTimeout(finish, prefersReducedMotion ? 350 : INTRO_MS);
    return () => window.clearTimeout(hold);
  }, [finish, prefersReducedMotion]);

  useEffect(() => {
    if (!leaving) return;
    const gone = window.setTimeout(onDone, prefersReducedMotion ? 60 : EXIT_MS);
    return () => window.clearTimeout(gone);
  }, [leaving, onDone, prefersReducedMotion]);

  return (
    <motion.div
      className="intro"
      aria-hidden="true"
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: prefersReducedMotion ? 0.05 : EXIT_MS / 1000, ease: 'easeOut' }}
    >
      <span className="intro__glow" />
      <svg className="intro__trail" viewBox="0 0 300 160" fill="none">
        <motion.path
          d="M-10 120 C 60 40, 130 150, 200 80 S 290 30, 320 70"
          stroke="var(--gold-soft)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray="4 7"
          initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.15, ease: 'easeInOut' }}
        />
      </svg>

      <motion.div
        className="intro__skate"
        initial={prefersReducedMotion ? { opacity: 1 } : { x: '-38vw', y: 18, opacity: 0, rotate: -6 }}
        animate={{ x: '0vw', y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <svg viewBox="0 0 64 44" width="72" height="50" role="presentation">
          <circle cx="16" cy="34" r="6" fill="var(--ribbon)" />
          <circle cx="32" cy="34" r="6" fill="var(--lavender)" />
          <circle cx="48" cy="34" r="6" fill="var(--ice)" />
          <path
            d="M20 8 h24 a6 6 0 0 1 6 6 v10 a5 5 0 0 1 -5 5 h-30 a5 5 0 0 1 -5 -5 v-10 a6 6 0 0 1 6 -6 z"
            fill="var(--skate-mid)"
            stroke="var(--gold-soft)"
            strokeWidth="1.2"
          />
          <rect x="20" y="6" width="24" height="4" rx="2" fill="var(--cream)" />
        </svg>
      </motion.div>

      <motion.p
        className="intro__line"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {line}
      </motion.p>
    </motion.div>
  );
}
