import { TRICOLORE } from '../data/event';

interface TricoloreProps {
  /** 'stripe' per la striscia sottile, 'chip' per la bandierina compatta. */
  variant?: 'stripe' | 'chip';
  className?: string;
}

/**
 * Il tricolore, sempre in formato discreto: una striscia sottile o una
 * bandierina minima. Mai un blocco di colore pieno — deve stare dentro
 * l'estetica crema e rosa dell'app senza gridare.
 */
export function Tricolore({ variant = 'chip', className }: TricoloreProps) {
  if (variant === 'stripe') {
    return (
      <span className={`tricolore tricolore--stripe ${className ?? ''}`} aria-hidden="true">
        {TRICOLORE.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </span>
    );
  }

  return (
    <span
      className={`tricolore tricolore--chip ${className ?? ''}`}
      role="img"
      aria-label="Bandiera italiana"
    >
      {TRICOLORE.map((color) => (
        <span key={color} style={{ background: color }} />
      ))}
    </span>
  );
}
