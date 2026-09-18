/**
 * main.js — Road to Paraguay
 *
 * Orchestrazione dell'app: stato, timer di mezzanotte, interazioni, easter egg.
 * JavaScript puro, nessuna build, nessuna dipendenza: gli stessi file che si
 * aprono in locale sono quelli che finiscono su GitHub Pages.
 */
import { AMBIENT_LINES, APP_NAME, EVENT, FOOTER_LINES, TEAM, TRICOLORE } from './data/event.js';
import { EGG_LINES, LOCKED_LINES } from './data/messages.js';
import {
  findToday,
  getCalendarDays,
  getCountdownParts,
  getTargetDate,
  isPastTarget,
  startOfDay,
} from './utils/dates.js';
import { qs, tricolore } from './utils/dom.js';
import { readJson, readString, writeJson, writeString } from './utils/storage.js';

import { createCalendar } from './ui/calendar.js';
import { createCelebration } from './ui/celebration.js';
import { createCountdown } from './ui/countdown.js';
import { createEggs } from './ui/eggs.js';
import { initDecorations, mountGlitter } from './ui/decorations.js';
import { createInstallHint } from './ui/install.js';
import { initIntro } from './ui/intro.js';
import { createModal } from './ui/modal.js';
import { createMusic } from './ui/music.js';
import { createTheme } from './ui/theme.js';
import { createToast } from './ui/toast.js';
import { registerServiceWorker } from './pwa.js';

const OPENED_KEY = 'rtp.openedDays.v1';
const FINALE_SEEN_KEY = 'rtp.finaleSeen.v1';
const MISSING_STAR_KEY = 'rtp.stars.v1';

/* ------------------------------------------------------------------ avvio */

initDecorations();
initIntro();

const theme = createTheme();
const music = createMusic();
const eggs = createEggs();
const toast = createToast();
const install = createInstallHint();
const countdown = createCountdown({ TRICOLORE });

const glitterHost = mountGlitter();
let glitterVisible = false;
eggs.onChange(() => {
  const active = eggs.isGlitterActive();
  glitterHost.hidden = !active;
  glitterVisible = active;
});

/** Frase ambientale stabile per tutta la giornata (cambia a mezzanotte). */
const pickAmbient = (now) => {
  const day = Math.floor(startOfDay(now).getTime() / 86_400_000);
  return AMBIENT_LINES[day % AMBIENT_LINES.length] ?? AMBIENT_LINES[0];
};
const pickFooter = (now) => {
  const day = Math.floor(startOfDay(now).getTime() / 86_400_000);
  return FOOTER_LINES[day % FOOTER_LINES.length] ?? FOOTER_LINES[0];
};

/** Le caselle già aperte, salvate come chiavi "YYYY-MM-DD". */
function loadOpened() {
  const raw = readJson(OPENED_KEY, []);
  return new Set(Array.isArray(raw) ? raw.filter((k) => typeof k === 'string') : []);
}
let opened = loadOpened();
const starsFound = new Set(readJson(MISSING_STAR_KEY, []));

/* ------------------------------------------------------ testi dell'identità */

qs('#app-title').textContent = APP_NAME;
qs('#team-name').textContent = TEAM.name;
qs('#team-country').textContent = TEAM.country;
qs('#app-subtitle').textContent =
  `Il diario segreto della squadra, verso i ${EVENT.name} di ${EVENT.discipline.toLowerCase()} in ${EVENT.place}.`;

// La bandierina dell'header è in HTML: riempiamo le tre strisce.
const crestFlag = qs('.header__crest .tricolore');
crestFlag.replaceChildren(...TRICOLORE.map((c) => Object.assign(document.createElement('span'), { style: `background:${c}` })));
const footerStripe = qs('.footer__tricolore');
footerStripe.replaceChildren(...TRICOLORE.map((c) => Object.assign(document.createElement('span'), { style: `background:${c}` })));

/* ------------------------------------------------------- stato e ridisegno */

let now = new Date();
let days = [];
let today = undefined;

function refreshState() {
  now = new Date();
  days = getCalendarDays(now);
  today = findToday(now);
}

function renderStaticTexts() {
  qs('#ambient').textContent = pickAmbient(now);
  qs('#footer-line').textContent = pickFooter(now);

  const readCount = opened.size;
  const meta = qs('#footer-meta');
  meta.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--ribbon)"><path d="M12 20.3S3.8 15.2 3.8 9.4a4.4 4.4 0 0 1 8.2-2.1 4.4 4.4 0 0 1 8.2 2.1c0 5.8-8.2 10.9-8.2 10.9z"/></svg><span>${
    readCount === 1 ? '1 casella letta finora' : readCount > 0 ? `${readCount} caselle lette finora` : 'Nessuna casella aperta: la prima ti aspetta'
  }</span>`;

  const eggsLine = qs('#footer-eggs');
  const found = eggs.foundCount();
  eggsLine.hidden = found === 0;
  eggsLine.textContent = found === 1 ? '1 segreto trovato 🤫' : `${found} segreti trovati 🤫`;

  qs('#header').classList.toggle('header--event', countdownParts.isTargetDay);
}

function renderCalendar() {
  calendar.render(days, now, opened, starsFound);
}

function renderCountdown() {
  countdownParts = getCountdownParts(now, getTargetDate(now));

  const target = getTargetDate(now);
  const nextLabel = `17 ottobre ${target.getFullYear()}`;

  countdown.update(countdownParts, {
    today,
    archived: isPastTarget(now),
    nextLabel,
  });
}

let countdownParts = getCountdownParts(now);

function renderAll() {
  renderStaticTexts();
  renderCountdown();
  renderCalendar();
}

/* ------------------------------------------------------------- interazioni */

const calendar = createCalendar({
  initialStars: [...starsFound],
  onOpen: (day) => modal.open(day, days.length, opened.has(day.key)),
  onLocked: (day) => {
    const line = LOCKED_LINES[Math.floor(Math.random() * LOCKED_LINES.length)] ?? LOCKED_LINES[0];
    const remaining = day.index - (today?.index ?? 0);
    const when =
      remaining > 1
        ? `Mancano ${remaining} giorni a questa casella.`
        : remaining === 1
          ? 'Arriva domani.'
          : 'Non è ancora il suo momento.';
    // La frase "curiosona" è un segreto: si svela solo la prima volta.
    const isNewSecret = !eggs.has('peek');
    toast.show(isNewSecret ? `${line} ${when} ${EGG_LINES[3]}` : `${line} ${when}`);
    eggs.discover('peek');
  },
  onHiddenStar: (day) => {
    eggs.discover('star');
    starsFound.add(day.index);
    writeJson(MISSING_STAR_KEY, [...starsFound]);
    toast.show(`Stellina trovata nella casella ${String(day.index).padStart(2, '0')}. ⭐`, 'high');
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

// Riallinea la data al ritorno in primo piano e allo scoccare della mezzanotte:
// è così che una casella si "sblocca" da sola mentre l'app è aperta.
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
 * Rete di sicurezza per iOS: quando la pagina viene ripristinata dalla cache
 * di navigazione (bfcache) può conservare una classe di blocco dello scroll
 * rimasta appesa, e la pagina non si muove più. Se non c'è nessuna modale o
 * celebrazione aperta, lo stato di blocco non ha motivo di esistere.
 */
window.addEventListener('pageshow', () => {
  const qualcosaAperto =
    document.querySelector('.modal:not(.modal--leaving), .celebration:not(.celebration--leaving)');
  if (!qualcosaAperto) document.body.classList.remove('is-locked');
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
  countdown.update(parts, { today, archived: isPastTarget(fresh), nextLabel: `17 ottobre ${getTargetDate(fresh).getFullYear()}` });
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

/* --------------------------------------------------------- easter egg ruote */

let wheelTaps = 0;
qs('#skate')?.addEventListener('click', () => {
  wheelTaps += 1;
  const hit = eggs.registerWheelTap();
  if (hit) {
    toast.show(EGG_LINES[2], 'high');
    renderStaticTexts();
  } else if (wheelTaps === 3) {
    toast.show(EGG_LINES[0]);
  }
});

/* ---------------------------------------------------------------- avvio UI */

refreshState();
renderAll();

// La modalità glitter non si riattiva da sola al reload: serve un nuovo tap.
glitterHost.hidden = true;

// Il suggerimento di installazione compare dopo l'intro, non subito.
window.setTimeout(() => install.show(), 2600);

// Celebrazione se oggi è il gran giorno.
maybeCelebrate();
scheduleMidnight();

// L'app ha preso il controllo: via la schermata di avvio.
window.setTimeout(() => qs('#boot')?.remove(), 200);

// Service worker: abilita l'uso offline dopo la prima visita.
registerServiceWorker();

// Esposto per debug e per i test in browser.
window.__rtp = {
  getState: () => ({ now, days, today, opened: [...opened], countdown: countdownParts }),
  openDay: (index) => {
    const day = days.find((d) => d.index === index);
    if (day) modal.open(day, days.length, opened.has(day.key));
  },
  celebration,
};
