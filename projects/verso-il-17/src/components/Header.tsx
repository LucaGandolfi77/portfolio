import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Music, Pause, Sun } from 'lucide-react';
import { EVENT, TEAM } from '../data/event';
import { RollerSkate } from './RollerSkate';
import { Sparkles } from './Sparkles';
import { Tricolore } from './Tricolore';

interface HeaderProps {
  /** Frase ambientale del giorno, scelta in modo deterministico. */
  ambientLine: string;
  isDark: boolean;
  onToggleTheme: () => void;
  musicAvailable: boolean;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  onWheelTap: () => void;
  sparkling: boolean;
  /** true il giorno della gara: l'intestazione si accende. */
  isEventDay: boolean;
}

/**
 * Intestazione emozionale: identità della squadra, titolo, illustrazione del
 * pattino e i due controlli (tema e musica) sempre raggiungibili col pollice.
 */
export function Header({
  ambientLine,
  isDark,
  onToggleTheme,
  musicAvailable,
  musicPlaying,
  onToggleMusic,
  onWheelTap,
  sparkling,
  isEventDay,
}: HeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className={`header ${isEventDay ? 'header--event' : ''}`}>
      <Sparkles count={10} seed={3} variant="local" className="header__sparkles" />

      <motion.div
        className="header__crest"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <Tricolore />
        <span className="header__crest-text">
          <strong>{TEAM.name}</strong>
          <span className="header__crest-country">{TEAM.country}</span>
        </span>
      </motion.div>

      <div className="header__top">
        <motion.div
          className="header__title"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h1 className="header__heading">Verso il 17 ottobre</h1>

          <p className="header__subtitle">
            Il diario segreto della squadra, verso i {EVENT.name} di {EVENT.discipline.toLowerCase()}{' '}
            in {EVENT.place}.
          </p>
        </motion.div>

        <div className="header__controls">
          <motion.button
            type="button"
            className="iconbtn"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Passa al tema chiaro' : 'Passa al tema notte'}
            whileTap={{ scale: 0.9 }}
          >
            {isDark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </motion.button>

          {musicAvailable && (
            <motion.button
              type="button"
              className={`iconbtn ${musicPlaying ? 'iconbtn--active' : ''}`}
              onClick={onToggleMusic}
              aria-label={musicPlaying ? 'Metti in pausa la colonna sonora' : 'Avvia la colonna sonora'}
              aria-pressed={musicPlaying}
              whileTap={{ scale: 0.9 }}
            >
              {musicPlaying ? (
                <Pause size={19} aria-hidden="true" />
              ) : (
                <Music size={19} aria-hidden="true" />
              )}
              {musicPlaying && <span className="iconbtn__pulse" aria-hidden="true" />}
            </motion.button>
          )}
        </div>
      </div>

      <div className="header__skate">
        <RollerSkate
          size={132}
          onWheelTap={onWheelTap}
          sparkling={sparkling}
          className="header__skate-svg"
        />
      </div>

      <motion.p
        className="header__ambient"
        key={ambientLine}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {ambientLine}
      </motion.p>
    </header>
  );
}
