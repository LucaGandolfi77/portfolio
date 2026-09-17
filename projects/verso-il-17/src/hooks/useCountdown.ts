import { useEffect, useState } from 'react';
import { getCountdownParts, getTargetDate, type CountdownParts } from '../utils/dates';

/**
 * Countdown live verso il 17 ottobre, basato sull'orologio reale del dispositivo.
 *
 * Il tick è allineato al cambio di secondo per evitare lo sfarfallio tipico di
 * setInterval(1000) quando la pagina è in background o il timer deriva.
 */
export function useCountdown(): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(new Date()));

  useEffect(() => {
    let timeoutId: number;

    const tick = () => {
      const now = new Date();
      setParts(getCountdownParts(now, getTargetDate(now)));
      // Ri-allinea al prossimo confine di secondo.
      timeoutId = window.setTimeout(tick, 1000 - (now.getTime() % 1000));
    };

    tick();

    // Al ritorno in foreground ricalcola subito: il timer può essere stato sospeso da iOS.
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timeoutId);
        tick();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return parts;
}
