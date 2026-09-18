import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CalendarGrid } from './components/CalendarGrid';
import { Celebration } from './components/Celebration';
import { Countdown } from './components/Countdown';
import { Header } from './components/Header';
import { InstallHint } from './components/InstallHint';
import { Intro } from './components/Intro';
import { MessageModal } from './components/MessageModal';
import { RollerSkate } from './components/RollerSkate';
import { LightTrail, Sparkles } from './components/Sparkles';
import { Toast } from './components/Toast';
import { Tricolore } from './components/Tricolore';

import { AMBIENT_LINES, FOOTER_LINES } from './data/event';
import { EVENT, TEAM } from './data/event';
import { EGG_LINES, LOCKED_LINES, findMessage } from './data/messages';
import { useCountdown } from './hooks/useCountdown';
import { useEggs } from './hooks/useEggs';
import { useInstallHint } from './hooks/useInstallHint';
import { useMusic } from './hooks/useMusic';
import { useOpenedDays } from './hooks/useOpenedDays';
import { useTheme } from './hooks/useTheme';
import {
  findToday,
  getCalendarDays,
  getTargetDate,
  isPastTarget,
  startOfDay,
  type CalendarDay,
} from './utils/dates';
import { safeReadString, safeWriteString } from './utils/storage';

/** Caselle che nascondono una stellina easter egg. */
const HIDDEN_STAR_DAYS = [7, 16, 24];

const FINALE_SEEN_KEY = 'verso17.finaleSeen.v1';

/** Frase ambientale stabile per tutta la giornata (cambia a mezzanotte). */
function pickAmbientLine(now: Date): string {
  const day = Math.floor(startOfDay(now).getTime() / 86_400_000);
  return AMBIENT_LINES[day % AMBIENT_LINES.length] ?? AMBIENT_LINES[0]!;
}

export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [introDone, setIntroDone] = useState(false);
  const [openDay, setOpenDay] = useState<CalendarDay | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; priority: 'normal' | 'high' } | null>(null);

  const countdown = useCountdown();
  const { opened, isOpened, markOpened } = useOpenedDays();
  const { isDark, toggleTheme } = useTheme();
  const eggs = useEggs();
  const foundEggs = eggs.found;
  const music = useMusic();
  const install = useInstallHint();

  const target = useMemo(() => getTargetDate(now), [now]);
  const archived = isPastTarget(now);
  const days = useMemo(() => getCalendarDays(now), [now]);
  const today = useMemo(() => findToday(now), [now]);
  const ambientLine = useMemo(() => pickAmbientLine(now), [now]);
  const footerLine = useMemo(
    () => FOOTER_LINES[Math.floor(startOfDay(now).getTime() / 86_400_000) % FOOTER_LINES.length] ?? FOOTER_LINES[0]!,
    [now],
  );

  const nextTargetLabel = useMemo(() => `17 ottobre ${target.getFullYear()}`, [target]);

  /* ---------------------------------------------------------------- tempo */

  // Riallinea la data al ritorno in foreground e allo scoccare della mezzanotte:
  // è così che una casella si "sblocca" da sola mentre l'app è aperta.
  useEffect(() => {
    const refresh = () => setNow(new Date());

    let midnightTimer = 0;
    const scheduleMidnight = () => {
      const current = new Date();
      const nextDay = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate() + 1,
        0,
        0,
        1,
        0,
      );
      window.clearTimeout(midnightTimer);
      midnightTimer = window.setTimeout(() => {
        refresh();
        scheduleMidnight();
      }, nextDay.getTime() - current.getTime());
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        scheduleMidnight();
      }
    };

    scheduleMidnight();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  /*
   * Rete di sicurezza per iOS: quando la pagina viene ripristinata dalla cache
   * di navigazione (bfcache) può conservare una classe di blocco dello scroll
   * rimasta appesa, e la pagina non si muove più. Se non c'è nessuna modale o
   * celebrazione aperta, lo stato di blocco non ha motivo di esistere.
   */
  useEffect(() => {
    const onPageShow = () => {
      const aperto = document.querySelector(
        '.modal:not(.modal--leaving), .celebration:not(.celebration--leaving)',
      );
      if (!aperto) document.body.classList.remove('is-locked');
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  /*
   * Rete di sicurezza per iOS: quando la pagina viene ripristinata dalla cache di
   * navigazione (bfcache) può conservare una classe di blocco dello scroll rimasta
   * appesa, e la pagina non si muove più. Se non c'è nessuna modale o celebrazione
   * aperta, lo stato di blocco non ha motivo di esistere.
   */
  useEffect(() => {
    const onPageShow = () => {
      const aperto = document.querySelector(
        '.modal:not(.modal--leaving), .celebration:not(.celebration--leaving)',
      );
      if (!aperto) document.body.classList.remove('is-locked');
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // La musica si mette in pausa quando l'app va in background.
  useEffect(() => {
    const onVisibility = () => music.handleVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [music]);

  /* ------------------------------------------------------------ interazioni */

  /**
   * Un solo toast alla volta, con un ordine di priorità:
   *  - 'high'  -> gli easter egg e le stelline, che non devono essere sovrascritti;
   *  - 'normal' -> messaggi nati da un tocco dell'utente (es. casella bloccata) o decorativi.
   * Un messaggio 'normal' non può scavalcare un 'high' ancora a schermo.
   */
  const showToast = useCallback((text: string, priority: 'normal' | 'high' = 'normal') => {
    setToast((current) =>
      current?.priority === 'high' && priority === 'normal' ? current : { text, priority },
    );
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleLocked = useCallback(
    (day: CalendarDay) => {
      const line = LOCKED_LINES[Math.floor(Math.random() * LOCKED_LINES.length)] ?? LOCKED_LINES[0]!;
      const remaining = day.index - (today?.index ?? 0);
      const when =
        remaining > 1
          ? `Mancano ${remaining} giorni a questa casella.`
          : remaining === 1
            ? 'Arriva domani.'
            : 'Non è ancora il suo momento.';
      // La frase "curiosona" è un segreto: si svela solo la prima volta.
      const isNewSecret = !foundEggs.includes('peek');
      showToast(isNewSecret ? `${line} ${when} ${EGG_LINES[3]!}` : `${line} ${when}`);
      eggs.discover('peek');
    },
    [eggs, foundEggs, showToast, today],
  );

  const handleOpen = useCallback((day: CalendarDay) => {
    setOpenDay(day);
  }, []);

  // Chiusure stabili: identità costante tra i render (l'app si aggiorna ogni secondo).
  const closeDay = useCallback(() => setOpenDay(null), []);
  const closeCelebration = useCallback(() => setCelebrationOpen(false), []);
  const openCelebration = useCallback(() => setCelebrationOpen(true), []);

  const handleHiddenStar = useCallback(
    (day: CalendarDay) => {
      eggs.discover('star');
      showToast(`Stellina trovata nella casella ${String(day.index).padStart(2, '0')}. ⭐`, 'high');
    },
    [eggs, showToast],
  );

  const handleRead = useCallback(
    (day: CalendarDay) => {
      markOpened(day.key);
    },
    [markOpened],
  );

  const handleWheelTap = useCallback(() => {
    eggs.registerWheelTap();
  }, [eggs]);

  // Annuncio degli easter egg. La modalità glitter è l'unica scoperta che non
  // nasce da un tocco "parlante", quindi è l'unica che si annuncia da qui.
  const { glitterActive } = eggs;
  useEffect(() => {
    if (!glitterActive) return;
    showToast(EGG_LINES[2]!, 'high');
  }, [glitterActive, showToast]);

  /* ------------------------------------------------------------- gran finale */

  // Il 17 ottobre la celebrazione parte da sola, una volta per dispositivo.
  useEffect(() => {
    if (!countdown.isTargetDay) return;
    if (safeReadString(FINALE_SEEN_KEY) === '1') return;
    const timer = window.setTimeout(() => {
      setCelebrationOpen(true);
      safeWriteString(FINALE_SEEN_KEY, '1');
      eggs.discover('finale');
    }, 900);
    return () => window.clearTimeout(timer);
  }, [countdown.isTargetDay, eggs]);

  useEffect(() => {
    if (eggs.glitterActive) document.body.classList.add('glitter-mode');
    else document.body.classList.remove('glitter-mode');
    return () => document.body.classList.remove('glitter-mode');
  }, [eggs.glitterActive]);

  const readCount = opened.length;
  const finaleMessage = findMessage(days.length, days.length);

  return (
    <div className="app">
      <a className="skip-link" href="#calendario">
        Salta al calendario
      </a>

      <div className="backdrop" aria-hidden="true">
        <span className="backdrop__blob backdrop__blob--one" />
        <span className="backdrop__blob backdrop__blob--two" />
        <span className="backdrop__blob backdrop__blob--three" />
        <Sparkles count={18} seed={11} variant="screen" />
        <LightTrail />
      </div>

      {/* L'intro si toglie da sola dall'albero quando ha finito: nessun exit
          animation da attendere, quindi nessun rischio che resti invisibile
          a coprire la pagina. */}
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}

      <main className="shell" id="calendario">
        <Header
          ambientLine={ambientLine}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          musicAvailable={music.isAvailable}
          musicPlaying={music.isPlaying}
          onToggleMusic={music.toggle}
          onWheelTap={handleWheelTap}
          sparkling={eggs.glitterActive}
          isEventDay={countdown.isTargetDay}
        />

        <Countdown
          parts={countdown}
          today={today}
          isArchived={archived}
          nextTargetLabel={nextTargetLabel}
        />

        <CalendarGrid
          days={days}
          openedKeys={opened}
          now={now}
          hasHiddenStar={(index) => HIDDEN_STAR_DAYS.includes(index)}
          onOpen={handleOpen}
          onLocked={handleLocked}
          onHiddenStar={handleHiddenStar}
        />

        {countdown.isTargetDay && finaleMessage && (
          <motion.section
            className="finale-teaser"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="finale-teaser__skate">
              <RollerSkate size={78} onWheelTap={handleWheelTap} sparkling={eggs.glitterActive} />
            </div>
            <p className="finale-teaser__team">
              <strong>{TEAM.name}</strong> · {TEAM.country}
            </p>
            <p>
              {EVENT.name} · {EVENT.place}. Le caselle sono tutte qui, adesso: rileggile quando
              vuoi, il diario resta tuo.
            </p>
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={openCelebration}
            >
              Rivivi il momento ✨
            </button>
          </motion.section>
        )}

        <footer className="footer">
          <Tricolore variant="stripe" className="footer__tricolore" />
          <p className="footer__line">{footerLine}</p>
          <p className="footer__meta">
            <Heart size={12} aria-hidden="true" />
            <span>
              {readCount > 0
                ? `${readCount} ${readCount === 1 ? 'casella letta' : 'caselle lette'} finora`
                : 'Nessuna casella aperta: la prima ti aspetta'}
            </span>
          </p>
          {eggs.foundCount > 0 && (
            <p className="footer__eggs">
              {eggs.foundCount === 1
                ? '1 segreto trovato 🤫'
                : `${eggs.foundCount} segreti trovati 🤫`}
            </p>
          )}
        </footer>
      </main>

      <MessageModal
        day={openDay}
        isAlreadyRead={openDay ? isOpened(openDay.key) : false}
        totalDays={days.length}
        onClose={closeDay}
        onRead={handleRead}
      />

      <Celebration
        open={celebrationOpen}
        onClose={closeCelebration}
        readCount={readCount}
        totalCount={days.length}
      />

      <InstallHint
        visible={install.visible && introDone && !openDay && !celebrationOpen}
        platform={install.platform}
        onDismiss={install.dismiss}
        onInstall={() => void install.install()}
      />

      <Toast message={toast?.text ?? null} onDismiss={dismissToast} />
    </div>
  );
}
