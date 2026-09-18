/**
 * main.js — Countdown to San Dunén
 *
 * Orchestrazione dell'app: stato, timer di mezzanotte, interazioni, easter egg.
 * JavaScript puro, nessuna build, nessuna dipendenza.
 */
import {
  AMBIENT_LINES,
  APP_NAME,
  FESTA,
  FOOTER_LINES,
  SANTO,
  TEAM,
  TRICOLORE,
} from './data/event.js';
import { EGG_LINES, LOCKED_LINES } from './data/messages.js';
import {
  findToday,
  formatDayLong,
  getCalendarDays,
  getCalendarWindow,
  getCountdownParts,
  getTargetDate,
  isBeforeWindow,
  isPastTarget,
  offsetLabel,
  startOfDay,
} from './utils/dates.js';
import { qs } from './utils/dom.js';
import { readJson, readString, writeJson, writeString } from './utils/storage.js';

import { createCalendar } from './ui/calendar.js';
import { createCelebration } from './ui/celebration.js';
import { createCountdown } from './ui/countdown.js';
import { initDecorations, mountGlitter } from './ui/decorations.js';
import { createEggs } from './ui/eggs.js';
import { initFesta } from './ui/festa.js';
import { createInstallHint } from './ui/install.js';
import { initIntro } from './ui/intro.js';
import { createModal } from './ui/modal.js';
import { createMusic } from './ui/music.js';
import { initPercorso } from './ui/percorso.js';
import { createTheme } from './ui/theme.js';
import { createToast } from './ui/toast.js';
import { registerServiceWorker } from './pwa.js';

const OPENED_KEY = 'sd.openedDays.v1';
const FINALE_SEEN_KEY = 'sd.finaleSeen.v1';
const STARS_KEY = 'sd.stars.v1';

/* ------------------------------------------------------------------ avvio */

initDecorations();
initIntro();
initPercorso();
initFesta();

const theme = createTheme();
const music = createMusic();
const eggs = createEggs();
const toast = createToast();
const install = createInstallHint();
const countdown = createCountdown({ TRICOLORE });

const glitterHost = mountGlitter();
eggs.onChange(() => {
  glitterHost.hidden = !eggs.isGlitterActive();
});

const pick = (list, now) => {
  const day = Math.floor(startOfDay(now).getTime() / 86_400_000);
  return list[day % list.length] ?? list[0];
};

/** Le caselle già aperte, salvate come chiavi "YYYY-MM-DD". */
const opened = new Set(
  (() => {
    const raw = readJson(OPENED_KEY, []);
    return Array.isArray(raw) ? raw.filter((k) => typeof k === 'string') : [];
  })(),
);
const starsFound = new Set(readJson(STARS_KEY, []));

/* ------------------------------------------------------ testi dell'identità */

qs('#app-title').textContent = APP_NAME;
qs('#team-name').textContent = FESTA.città;
qs('#team-country').textContent = FESTA.giorno;
qs('#app-subtitle').textContent =
  `Trenta giorni di attesa per ${SANTO.nome}, patrono di ${FESTA.città}. Otto tappe in bicicletta, un tendone e un Duomo.`;

const crestFlag = qs('.header__crest .tricolore');
crestFlag.replaceChildren(
  ...TRICOLORE.map((c) => Object.assign(document.createElement('span'), { style: `background:${c}` })),
);
const footerStripe = qs('.footer__tricolore');
footerStripe.replaceChildren(
  ...TRICOLORE.map((c) => Object.assign(document.createElement('span'), { style: `background:${c}` })),
);

/* ------------------------------------------------------- stato e ridisegno */

let now = new Date();
let days = [];
let today = undefined;
let countdownParts = getCountdownParts(now);

function refreshState() {
  now = new Date();
  days = getCalendarDays(now);
  today = findToday(now);
  countdownParts = getCountdownParts(now, getTargetDate(now));
}

function renderStaticTexts() {
  qs('#ambient').textContent = pick(AMBIENT_LINES, now);
  qs('#footer-line').textContent = pick(FOOTER_LINES, now);

  const readCount = opened.size;
  const meta = qs('#footer-meta');
  const totale = days.length;
  meta.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--wine)"><path d="M12 20.3S3.8 15.2 3.8 9.4a4.4 4.4 0 0 1 8.2-2.1 4.4 4.4 0 0 1 8.2 2.1c0 5.8-8.2 10.9-8.2 10.9z"/></svg><span>${
    readCount === 1
      ? `1 casella letta su ${totale}`
      : readCount > 0
        ? `${readCount} caselle lette su ${totale}`
        : `Nessuna casella aperta: la prima ti aspetta`
  }</span>`;

  const eggsLine = qs('#footer-eggs');
  const found = eggs.foundCount();
  eggsLine.hidden = found === 0;
  eggsLine.textContent = found === 1 ? '1 segreto trovato 🤫' : `${found} segreti trovati 🤫`;

  qs('#header').classList.toggle('header--event', countdownParts.isTargetDay);
}

function renderCalendar() {
  calendar.render(days, now, opened);
}

function renderCountdown() {
  const target = getTargetDate(now);
  const start = getCalendarWindow(now).start;
  countdown.update(countdownParts, {
    today,
    archived: isPastTarget(now),
    before: isBeforeWindow(now),
    nextLabel: formatDayLong({
      dayOfMonth: 9,
      monthLongLabel: 'ottobre',
      year: target.getFullYear(),
    }) + ` ${target.getFullYear()}`,
    startLabel: formatDayLong({
      dayOfMonth: start.getDate(),
      monthLongLabel: ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'][start.getMonth()],
      year: start.getFullYear(),
    }),
  });
}

function renderAll() {
  renderStaticTexts();
  renderCountdown();
  renderCalendar();
}

/* ------------------------------------------------------------- interazioni */

const calendar = createCalendar({
  initialStars: [...starsFound],
  onOpen: (day) => modal.open(day, opened.has(day.key)),
  onLocked: (day) => {
    const line = LOCKED_LINES[Math.floor(Math.random() * LOCKED_LINES.length)] ?? LOCKED_LINES[0];
    const mancano = -day.offset;
    const quando =
      mancano > 1
        ? `Mancano ${mancano} giorni a questa casella.`
        : 'Arriva domani.';
    const nuovoSegreto = !eggs.has('peek');
    toast.show(nuovoSegreto ? `${line} ${quando} ${EGG_LINES[2]}` : `${line} ${quando}`);
    eggs.discover('peek');
  },
  onHiddenStar: (day) => {
    eggs.discover('star');
    starsFound.add(day.offset);
    writeJson(STARS_KEY, [...starsFound]);
    toast.show(`Stellina trovata nella casella ${offsetLabel(day.offset)}. ⭐`, 'high');
    renderStaticTexts();
  },
});

const modal = createModal({
  onRead: (day) => {
    if (opened.has(day.key)) return;
    opened.add(day.key);
    writeJson(OPENED_KEY, [...opened].sort());
    renderCalendar();
    renderStaticTexts();
  },
  onOpenChange: (isOpen) => {
    if (isOpen) install.hide();
  },
});

const celebration = createCelebration({
  TRICOLORE,
  onOpenChange: (isOpen) => {
    if (isOpen) install.hide();
  },
});

/* ------------------------------------------------------------------- tempo */

let midnightTimer = 0;
function scheduleMidnight() {
  const current = new Date();
  const nextDay = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 1, 0);
  window.clearTimeout(midnightTimer);
  midnightTimer = window.setTimeout(() => {
    refreshState();
    renderAll();
    maybeCelebrate();
    scheduleMidnight();
  }, nextDay.getTime() - current.getTime());
}

function onVisible() {
  if (document.visibilityState !== 'visible') return;
  refreshState();
  renderAll();
  maybeCelebrate();
  scheduleMidnight();
}

document.addEventListener('visibilitychange', onVisible);
window.addEventListener('focus', onVisible);

/*
 * Rete di sicurezza per iOS: quando la pagina viene ripristinata dalla cache di
 * navigazione (bfcache) può conservare una classe di blocco dello scroll rimasta
 * appesa. Se non c'è nessuna modale o celebrazione aperta, va ripulita.
 */
window.addEventListener('pageshow', () => {
  const aperto = document.querySelector(
    '.modal:not(.modal--leaving), .celebration:not(.celebration--leaving)',
  );
  if (!aperto) document.body.classList.remove('is-locked');
});

// Il countdown ticka ogni secondo, allineato al confine del secondo.
countdown.start(() => {
  const fresh = new Date();
  const parts = getCountdownParts(fresh, getTargetDate(fresh));
  const dayChanged = startOfDay(fresh).getTime() !== startOfDay(now).getTime();

  if (dayChanged) {
    refreshState();
    renderAll();
    maybeCelebrate();
    return;
  }

  countdownParts = parts;
  const target = getTargetDate(fresh);
  countdown.update(parts, {
    today,
    archived: isPastTarget(fresh),
    before: isBeforeWindow(fresh),
    nextLabel: `9 ottobre ${target.getFullYear()}`,
    startLabel: '9 settembre',
  });
  qs('#header').classList.toggle('header--event', parts.isTargetDay);
});

/* ------------------------------------------------------------ gran finale */

function maybeCelebrate() {
  if (!countdownParts.isTargetDay) return;
  if (readString(FINALE_SEEN_KEY) === '1') return;
  window.setTimeout(() => {
    celebration.open({ readCount: opened.size, totalCount: days.length });
    writeString(FINALE_SEEN_KEY, '1');
    eggs.discover('finale');
  }, 900);
}

/* -------------------------------------------------------- easter egg bici */

qs('#bike')?.addEventListener('click', () => {
  if (eggs.registerWheelTap()) {
    toast.show(EGG_LINES[1], 'high');
    renderStaticTexts();
  }
});

/* ---------------------------------------------------------------- avvio UI */

refreshState();
renderAll();
glitterHost.hidden = true;
window.setTimeout(() => install.show(), 2600);

// Service worker: abilita l'uso offline dopo la prima visita.
registerServiceWorker();

maybeCelebrate();
scheduleMidnight();
window.setTimeout(() => qs('#boot')?.remove(), 200);

// Esposto per debug e per i test in browser.
window.__sd = {
  getState: () => ({ now, days, today, opened: [...opened], countdown: countdownParts }),
  openDay: (offset) => {
    const day = days.find((d) => d.offset === offset);
    if (day) modal.open(day, opened.has(day.key));
  },
  celebration,
  TEAM,
};
