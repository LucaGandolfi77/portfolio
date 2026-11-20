/* Sunset Compass — vector instruments and dynamic sky rendering */

import { PHASES } from './config.js';
import { t } from './i18n.js';
import { compassPoint } from './compass.js';

const $ = id => document.getElementById(id);
const SIZE = 400;
const C = SIZE / 2;
const R = 168;

function polar(radius, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: C + radius * Math.cos(rad), y: C + radius * Math.sin(rad) };
}

/* ---------- dynamic theme ---------- */
export function applyTheme(phase, altitude) {
  const p = PHASES[phase] || PHASES.night;
  const root = document.documentElement.style;
  root.setProperty('--sky-1', p.sky[0]);
  root.setProperty('--sky-2', p.sky[1]);
  root.setProperty('--sky-3', p.sky[2]);
  root.setProperty('--sky-glow', p.glow);
  root.setProperty('--sky-accent', p.accent);
  root.setProperty('--sky-horizon', p.horizon);
  root.setProperty('--sky-txt', p.txt);
  root.setProperty('--sky-dim', p.dim);
  root.setProperty('--sky-card', p.card);
  root.setProperty('--sun-y', `${Math.max(2, Math.min(98, 50 - altitude))}%`);
  document.body.dataset.phase = phase;
}

/* ---------- stars ---------- */
export function createStars(container, count = 70) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const x = (i * 137.5) % 100;
    const y = (i * 61.8 + (i % 7) * 11) % 100;
    const size = i % 11 === 0 ? 2.5 : i % 4 === 0 ? 1.8 : 1.2;
    const delay = ((i * 0.37) % 4).toFixed(2);
    const dur = (2.5 + (i % 5) * 0.7).toFixed(1);
    html += `<i class="star" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
  }
  container.innerHTML = html;
}

/* ---------- compass ---------- */
export function renderCompass(svgEl, { sunAz, sunAlt, obstacle, heading, phase }) {
  const p = PHASES[phase] || PHASES.night;
  const accent = p.accent;
  let svg = `<defs>
    <radialGradient id="dial" cx="45%" cy="38%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,.13)"/>
      <stop offset="60%" stop-color="rgba(12,18,38,.32)"/>
      <stop offset="100%" stop-color="rgba(3,5,18,.72)"/>
    </radialGradient>
    <linearGradient id="bezel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,.42)"/>
      <stop offset="45%" stop-color="rgba(120,160,220,.10)"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity=".55"/>
    </linearGradient>
    <radialGradient id="sun">
      <stop offset="0%" stop-color="#fff8e0"/>
      <stop offset="45%" stop-color="#ffd166"/>
      <stop offset="100%" stop-color="#ff8c42"/>
    </radialGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  // bezel + glass
  svg += `<circle cx="${C}" cy="${C}" r="187" fill="url(#bezel)" opacity=".5"/>
          <circle cx="${C}" cy="${C}" r="181" fill="none" stroke="${accent}" stroke-opacity=".5" stroke-width="1.2"/>
          <circle cx="${C}" cy="${C}" r="${R + 10}" fill="url(#dial)" stroke="rgba(255,255,255,.12)" stroke-width="1"/>`;

  // ticks
  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 30 === 0;
    const medium = deg % 10 === 0;
    const len = major ? 15 : medium ? 9 : 5;
    const a = polar(R, deg), b = polar(R - len, deg);
    const color = major ? (deg === 0 ? accent : p.txt) : 'rgba(255,255,255,.35)';
    svg += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"
      stroke="${color}" stroke-opacity="${major ? 0.95 : 0.6}" stroke-width="${major ? 2.2 : 1}" stroke-linecap="round"/>`;
  }

  // cardinal points
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([label, deg]) => {
    const q = polar(R - 34, deg);
    svg += `<text x="${q.x.toFixed(1)}" y="${q.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central"
      fill="${deg === 0 ? accent : p.txt}" font-size="${deg === 0 ? 21 : 16}" font-weight="800"
      font-family="Inter,system-ui,sans-serif" opacity="${deg === 0 ? 1 : .75}">${label}</text>`;
  });

  // sun path arc (relative to heading)
  const pathStart = polar(R - 52, -76), pathEnd = polar(R - 52, 76);
  svg += `<path d="M ${pathStart.x.toFixed(1)} ${pathStart.y.toFixed(1)} A ${R - 52} ${R - 52} 0 0 1 ${pathEnd.x.toFixed(1)} ${pathEnd.y.toFixed(1)}"
    fill="none" stroke="${accent}" stroke-opacity=".28" stroke-width="1.5" stroke-dasharray="3 7"/>`;

  // horizon band
  const h1 = polar(R - 66, -46), h2 = polar(R - 66, 46);
  svg += `<line x1="${h1.x.toFixed(1)}" y1="${h1.y.toFixed(1)}" x2="${h2.x.toFixed(1)}" y2="${h2.y.toFixed(1)}"
    stroke="${p.horizon}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;

  // obstacle
  if (obstacle) {
    const o = polar(R - 30, obstacle.azimuth - heading);
    svg += `<circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="15" fill="none" stroke="#ff6b6b" stroke-opacity=".35" class="pulse-ring"/>
      <circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="8" fill="rgba(255,107,107,.2)" stroke="#ff6b6b" stroke-width="2"/>
      <text x="${o.x.toFixed(1)}" y="${(o.y + 1).toFixed(1)}" text-anchor="middle" dominant-baseline="central"
        fill="#ff6b6b" font-size="9" font-weight="800">✕</text>
      <text x="${o.x.toFixed(1)}" y="${(o.y + 23).toFixed(1)}" text-anchor="middle" fill="#ff6b6b" font-size="9">${Math.round(obstacle.altitude)}°</text>`;
  }

  // sun
  if (sunAlt > -7) {
    const s = polar(R - 30, sunAz - heading);
    const opacity = sunAlt > 0 ? 1 : Math.max(0.25, 1 + sunAlt / 7);
    svg += `<g opacity="${opacity}">
      <circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="26" fill="${accent}" opacity=".12" filter="url(#glow)"/>
      <circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="13" fill="url(#sun)" filter="url(#glow)"/>
      <circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="13" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>
    </g>
    <text x="${s.x.toFixed(1)}" y="${(s.y + 31).toFixed(1)}" text-anchor="middle" fill="#ffd166"
      font-size="10" font-weight="700">${Math.round(sunAlt)}° · ${compassPoint(sunAz)}</text>`;
  }

  // heading needle + hub
  svg += `<g filter="url(#glow)">
    <polygon points="${C},${C - R + 22} ${C - 8},${C - R + 4} ${C + 8},${C - R + 4}" fill="${accent}"/>
  </g>
  <line x1="${C}" y1="${C - R + 24}" x2="${C}" y2="${C + R - 24}" stroke="${accent}" stroke-opacity=".12" stroke-width="1"/>
  <circle cx="${C}" cy="${C}" r="23" fill="rgba(4,7,20,.85)" stroke="${accent}" stroke-opacity=".6" stroke-width="1.5"/>
  <text x="${C}" y="${C - 3}" text-anchor="middle" fill="${p.txt}" font-size="14" font-weight="800"
    font-family="ui-monospace,monospace">${String(Math.round(heading)).padStart(3, '0')}°</text>
  <text x="${C}" y="${C + 12}" text-anchor="middle" fill="${p.dim}" font-size="8" font-weight="700"
    font-family="Inter,system-ui,sans-serif" letter-spacing="1">HDG</text>`;

  svgEl.innerHTML = svg;
}

/* ---------- camera AR ---------- */
export function renderAR(svgEl, { points, obstacles, heading, phase, w, h }) {
  const p = PHASES[phase] || PHASES.night;
  const accent = p.accent;
  let svg = `<defs>
    <linearGradient id="path" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6b6b"/><stop offset="50%" stop-color="#ffd166"/><stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <filter id="arglow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  // viewfinder frame
  const m = 18, len = 26;
  const corners = [
    `M ${m} ${m + len} L ${m} ${m} L ${m + len} ${m}`,
    `M ${w - m - len} ${m} L ${w - m} ${m} L ${w - m} ${m + len}`,
    `M ${m} ${h - m - len} L ${m} ${h - m} L ${m + len} ${h - m}`,
    `M ${w - m - len} ${h - m} L ${w - m} ${h - m} L ${w - m} ${h - m - len}`
  ];
  corners.forEach(d => { svg += `<path d="${d}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>`; });
  svg += `<circle cx="${w / 2}" cy="${h / 2}" r="3" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1"/>
    <line x1="${w / 2 - 14}" y1="${h / 2}" x2="${w / 2 - 6}" y2="${h / 2}" stroke="rgba(255,255,255,.4)"/>
    <line x1="${w / 2 + 6}" y1="${h / 2}" x2="${w / 2 + 14}" y2="${h / 2}" stroke="rgba(255,255,255,.4)"/>`;

  // sun trajectory
  if (points.length > 1) {
    const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    svg += `<path d="${d}" fill="none" stroke="url(#path)" stroke-width="3" stroke-opacity=".75" stroke-dasharray="7 6" filter="url(#arglow)"/>`;
    points.forEach(pt => {
      if (pt.isNow) return;
      svg += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3" fill="#ffd166" opacity=".6"/>`;
    });
  }
  const now = points.find(p => p.isNow);
  if (now) {
    svg += `<circle cx="${now.x.toFixed(1)}" cy="${now.y.toFixed(1)}" r="26" fill="#ffd166" opacity=".16" filter="url(#arglow)"/>
      <circle cx="${now.x.toFixed(1)}" cy="${now.y.toFixed(1)}" r="11" fill="#ffd166" filter="url(#arglow)"/>
      <circle cx="${now.x.toFixed(1)}" cy="${now.y.toFixed(1)}" r="18" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" class="pulse-ring"/>
      <text x="${now.x.toFixed(1)}" y="${(now.y + 34).toFixed(1)}" text-anchor="middle" fill="#ffe6b0"
        font-size="10" font-weight="800">NOW · ${Math.round(now.alt)}°</text>`;
  }

  // obstacles
  obstacles.forEach(obs => {
    const pos = screenPos(obs.azimuth, obs.altitude, heading, w, h);
    if (!pos) return;
    svg += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="12" fill="rgba(255,107,107,.12)" stroke="#ff6b6b" stroke-width="1.5"/>
      <text x="${pos.x.toFixed(1)}" y="${(pos.y + 1).toFixed(1)}" text-anchor="middle" dominant-baseline="central"
        fill="#ff8c8c" font-size="10" font-weight="800">✕</text>
      <text x="${pos.x.toFixed(1)}" y="${(pos.y + 21).toFixed(1)}" text-anchor="middle" fill="#ff9f9f" font-size="9">${Math.round(obs.altitude)}°</text>`;
  });

  svgEl.innerHTML = svg;
}

function screenPos(az, alt, heading, w, h) {
  let rel = az - heading;
  rel = ((rel + 180) % 360 + 360) % 360 - 180;
  if (Math.abs(rel) > 30) return null;
  return { x: (rel / 30) * (w / 2) + w / 2, y: h - ((alt + 10) / 70) * h };
}

/* ---------- ghost tracker ---------- */
export function renderTimeline(container, data) {
  const { timeline, times } = data;
  let html = `<div class="trail-hero">
    <div class="trail-hero-label">${t('sunset')}</div>
    <div class="trail-hero-time">${times.sunset.string}</div>
    <div class="trail-hero-sub">${t('sunrise')} ${times.sunrise.string} · ${t('declination')} ${Math.round(times.declination)}°</div>
  </div>`;

  timeline.forEach(row => {
    const altPct = Math.max(0, Math.min(100, ((row.altitude + 10) / 70) * 100));
    const azPct = (row.azimuth / 360) * 100;
    const below = row.belowObstacle ? `<span class="event-pill danger">🏔 ${t('belowObstacle')}</span>` : '';
    const event = row.event ? `<span class="event-pill ${row.eventClass || ''}">${row.event}</span>` : '';
    const up = row.altitude > 0;
    html += `<div class="trail-row ${row.isNow ? 'now' : ''} ${up ? '' : 'down'}">
      <span class="trail-time">${row.time}</span>
      <div class="trail-track">
        <div class="trail-fill" style="width:${altPct}%"></div>
        <div class="trail-marker" style="left:${azPct}%"></div>
      </div>
      <span class="trail-data"><b>${Math.round(row.azimuth)}°</b> ${row.compassPoint}</span>
      <span class="trail-alt ${up ? 'up' : ''}">${up ? '↑' : '↓'}${Math.abs(Math.round(row.altitude))}°</span>
      <span class="trail-events">${event}${below}</span>
    </div>`;
  });
  container.innerHTML = html;
}

/* ---------- countdown ring ---------- */
export function setCountdownRing(el, ratio) {
  const circumference = 2 * Math.PI * 54;
  el.style.strokeDasharray = String(circumference);
  el.style.strokeDashoffset = String(circumference * (1 - Math.max(0, Math.min(1, ratio))));
}
