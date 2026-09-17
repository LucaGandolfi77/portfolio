import { motion, useReducedMotion } from 'framer-motion';

interface RollerSkateProps {
  /** Larghezza in px dell'illustrazione. */
  size?: number;
  className?: string;
  /** Le rotelle girano (leggermente) e reagiscono al tap. */
  animateWheels?: boolean;
  /** Tap sull'illustrazione: usato per l'easter egg delle rotelle. */
  onWheelTap?: () => void;
  /** true quando la modalità glitter è attiva: il pattino si accende. */
  sparkling?: boolean;
}

/**
 * Illustrazione vettoriale del pattino a rotelle, disegnata a mano.
 *
 * Niente clipart: forme semplici, palette coerente con l'app e rotelle che
 * ruotano con una sola animazione CSS trasformata (GPU friendly).
 */
export function RollerSkate({
  size = 96,
  className,
  animateWheels = true,
  onWheelTap,
  sparkling = false,
}: RollerSkateProps) {
  const prefersReducedMotion = useReducedMotion();
  const spin = animateWheels && !prefersReducedMotion;

  const wheel = (cx: number) => (
    <g className={spin ? 'skate-wheel' : undefined} style={{ transformOrigin: `${cx}px 96px` }}>
      <circle cx={cx} cy={96} r={9} fill="url(#wheelFill)" stroke="var(--gold-soft)" strokeWidth={1.4} />
      <circle cx={cx} cy={96} r={3.2} fill="var(--cream)" opacity={0.9} />
      <circle cx={cx - 2.6} cy={93.4} r={1.5} fill="#fff" opacity={0.75} />
    </g>
  );

  return (
    <motion.svg
      className={className}
      width={size}
      height={size * 0.86}
      viewBox="0 0 140 120"
      role="img"
      aria-label="Pattino artistico a rotelle"
      onClick={onWheelTap}
      style={{ overflow: 'visible', touchAction: 'manipulation' }}
      animate={sparkling && !prefersReducedMotion ? { rotate: [0, -2.5, 2.5, 0] } : undefined}
      transition={{ duration: 2.4, repeat: sparkling ? Infinity : 0, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="bootFill" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--skate-hi)" />
          <stop offset="55%" stopColor="var(--skate-mid)" />
          <stop offset="100%" stopColor="var(--skate-lo)" />
        </linearGradient>
        <linearGradient id="wheelFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--wheel-hi)" />
          <stop offset="100%" stopColor="var(--wheel-lo)" />
        </linearGradient>
        <linearGradient id="plateFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--gold)" />
          <stop offset="50%" stopColor="var(--gold-soft)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>

      {/* Traiettoria lasciata dalle ruote: una curva sottile e discreta */}
      <path
        d="M4 104 C 26 118, 54 112, 78 106 S 124 92, 138 100"
        fill="none"
        stroke="var(--gold-soft)"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray="3 6"
        opacity={0.7}
      />

      {/* Gambale */}
      <path
        d="M44 16 h40 a12 12 0 0 1 12 12 v30 a10 10 0 0 1 -10 10 h-52 a10 10 0 0 1 -10 -10 v-30 a12 12 0 0 1 12 -12 z"
        fill="url(#bootFill)"
        stroke="var(--gold-soft)"
        strokeWidth={1.4}
      />

      {/* Colletto e fiocco */}
      <rect x="44" y="14" width="44" height="7" rx="3.5" fill="var(--cream)" opacity={0.85} />
      <path
        d="M66 21 q -9 -8 -15 -1 q 5 5 15 4 z"
        fill="var(--ribbon)"
        stroke="var(--gold-soft)"
        strokeWidth={1}
      />
      <path
        d="M66 21 q 9 -8 15 -1 q -5 5 -15 4 z"
        fill="var(--ribbon)"
        stroke="var(--gold-soft)"
        strokeWidth={1}
      />
      <circle cx="66" cy="21.5" r="3" fill="var(--gold-soft)" />

      {/* Allacciatura */}
      <g stroke="var(--gold-soft)" strokeWidth={1.6} strokeLinecap="round" opacity={0.9}>
        <path d="M50 34 h30" />
        <path d="M50 43 h30" />
        <path d="M50 52 h30" />
      </g>

      {/* Punteruolo decorativo */}
      <path
        d="M24 68 h84 a6 6 0 0 1 6 6 v3 a4 4 0 0 1 -4 4 h-88 a4 4 0 0 1 -4 -4 v-3 a6 6 0 0 1 6 -6 z"
        fill="url(#plateFill)"
        opacity={0.95}
      />
      <path d="M108 74 l12 5 a3 3 0 0 1 1.4 4 l-1.6 3 a3 3 0 0 1 -4 1.2 l-9.4 -4.6 z" fill="url(#plateFill)" />

      {/* Ruote */}
      {wheel(40)}
      {wheel(72)}
      {wheel(100)}

      {/* Riflesso luce sul gambale */}
      <path d="M50 22 q -4 22 2 40" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.35} fill="none" />

      {/* Scintille quando la modalità glitter è attiva */}
      {sparkling && !prefersReducedMotion && (
        <g className="skate-sparkles">
          <path d="M20 34 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 z" fill="var(--gold-soft)" />
          <path d="M124 44 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 z" fill="var(--gold-soft)" />
        </g>
      )}
    </motion.svg>
  );
}
