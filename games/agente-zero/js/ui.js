/* ============================================================
   Agente Zero — menu screens as HTML strings
   ------------------------------------------------------------
   Pure functions of (translator, state): main.js puts the markup
   in the panel and handles the data-act buttons.
   ============================================================ */
import { MODES, TIMED_SECONDS, WORD } from './modes.js';
import { CHAPTERS, missionId, chapterStars, totalStars, chapterUnlocked, missionUnlocked, STARS_PER_CHAPTER } from './career.js';
import { LOOKS, ITEMS, SLOTS, MEDALS, levelOf, xpForLevel, isUnlocked } from './state.js';

const ICONS = { training: '🎯', career: '🏆', timed: '⏱️', three: '🛒', zero: '🔤', daily: '📅' };

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const btn = (act, label, cls = '', extra = '') => `<button type="button" class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;
const head = (t, title) => `<header class="sc-head">${btn('home', '‹', 'icon', `aria-label="${esc(t('back'))}"`)}<h2>${esc(title)}</h2></header>`;
export const starRow = (n) => `<span class="stars" role="img" aria-label="${n}/3">${[0, 1, 2].map((i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;

export function goalText(t, m) {
  return t(`goal.${m.type}`, {
    n: m.stars[0], s: m.shots, t: m.type === 'clock' ? m.time : m.clock,
  });
}

export function home(t, state, seed) {
  const lv = levelOf(state.xp);
  const a = xpForLevel(lv), b = xpForLevel(lv + 1);
  const best = {
    timed: state.best.timed, three: state.best.three, daily: state.daily[seed] ?? 0,
  };
  const note = (id) => {
    if (id === 'career') return `★ ${totalStars(state.stars)}/108`;
    if (id in best) return best[id] ? `${esc(t('hud.best'))} ${best[id]}` : '';
    if (id === 'zero') return state.zero.won ? `🏅 ${state.zero.won}` : '';
    return '';
  };
  return `<div class="home">
    <h1><span>AGENTE</span><b>ZERO</b></h1>
    <p class="tagline">${esc(t('tagline'))}</p>
    <div class="levelbar" title="XP ${state.xp}"><span>${esc(t('levelN', { n: lv }))}</span><i><u style="width:${Math.round(((state.xp - a) / (b - a)) * 100)}%"></u></i></div>
    <div class="modes">${MODES.map((id) => `<button type="button" class="mode" data-act="mode" data-id="${id}">
      <span class="mi" aria-hidden="true">${ICONS[id]}</span><strong>${esc(t(`modes.${id}`))}</strong><small>${esc(t(`modeDesc.${id}`))}</small><em>${note(id)}</em></button>`).join('')}</div>
    <nav class="tools">
      ${btn('wardrobe', `👕<span>${esc(t('wardrobe'))}</span>`)}
      ${btn('stats', `📊<span>${esc(t('stats'))}</span>`)}
      ${btn('medals', `🏅<span>${esc(t('medals'))}</span>`)}
      ${btn('howto', `❓<span>${esc(t('howto'))}</span>`)}
      ${btn('settings', `⚙️<span>${esc(t('settings'))}</span>`)}
    </nav>
    <p class="credits">${esc(t('credits'))}</p>
  </div>`;
}

export function career(t, lang, state, open) {
  const stars = state.stars;
  return `${head(t, t('modes.career'))}<p class="muted">★ ${totalStars(stars)} / 108</p>
  ${CHAPTERS.map((c, ci) => {
    const free = chapterUnlocked(stars, ci);
    const isOpen = free && open === ci;
    return `<section class="chapter ${free ? '' : 'locked'}">
      <button type="button" class="chapter-head" data-act="chapter" data-c="${ci}" aria-expanded="${isOpen}" ${free ? '' : 'disabled'}>
        <small>${esc(t('chapter', { n: ci + 1 }))} · ${esc(c.op[lang])}</small><strong>${free ? '' : '🔒 '}${esc(c.name[lang])}</strong><em>★ ${chapterStars(stars, ci)}/18</em></button>
      ${!free ? `<p class="muted">${esc(t('needStars', { n: ci * STARS_PER_CHAPTER }))}</p>` : ''}
      ${isOpen ? `<p class="story">${esc(c.intro[lang])}</p><ol class="missions">${c.missions.map((m, mi) => {
        const ok = missionUnlocked(stars, ci, mi);
        return `<li><button type="button" class="mission" data-act="brief" data-c="${ci}" data-m="${mi}" ${ok ? '' : 'disabled'}>
          <span class="num">${ok ? mi + 1 : '🔒'}</span><span class="goal">${esc(goalText(t, m))}${m.wind ? ' 🚩' : ''}${m.moving ? ' ↔️' : ''}${m.defender ? ' 🧤' : ''}</span>${starRow(stars[missionId(ci, mi)] || 0)}</button></li>`;
      }).join('')}</ol>` : ''}
    </section>`;
  }).join('')}`;
}

export function brief(t, lang, ci, mi) {
  const c = CHAPTERS[ci], m = c.missions[mi];
  const extras = [m.wind ? '🚩' : '', m.moving ? '↔️' : '', m.defender ? '🧤' : ''].join(' ').trim();
  return `<div class="card"><small>${esc(c.op[lang])} · ${esc(t('mission', { n: mi + 1 }))}</small>
    <h2>${esc(goalText(t, m))}</h2>
    <p class="thresholds">★ ${m.stars[0]} &nbsp; ★★ ${m.stars[1]} &nbsp; ★★★ ${m.stars[2]}</p>
    ${extras ? `<p class="extras">${extras}</p>` : ''}
    <div class="row">${btn('career', esc(t('back')))}${btn('mission', esc(t('start')), 'primary', `data-c="${ci}" data-m="${mi}"`)}</div></div>`;
}

export function result(t, match, summary, reward, hasNext) {
  const id = summary.id;
  let title = t('result.over');
  if (id === 'career') title = t(summary.won ? 'result.win' : 'result.lose');
  if (id === 'zero') title = t(summary.won ? 'result.zeroWin' : 'result.zeroLose');
  const letters = (n) => [...WORD].map((l, i) => `<i class="${i < n ? 'on' : ''}">${l}</i>`).join('');
  const big = id === 'zero' ? '' : id === 'career'
    ? starRow(summary.stars)
    : `<p class="big">${summary.score}</p>`;
  const unlocked = reward.unlocked.map((u) => { const [slot, item] = u.split(':'); return `${t(`look.${slot}`)}: ${t(`lookNames.${slot}.${item}`)}`; });
  return `<div class="card result"><h2>${esc(title)}</h2>${big}
    ${id === 'zero' ? `<div class="letters"><p><b>${esc(t('hud.you'))}</b>${letters(summary.letters.you)}</p><p><b>${esc(t('hud.cpu'))}</b>${letters(summary.letters.cpu)}</p></div>` : ''}
    ${id === 'career' && match.spec.type === 'duel' ? `<p>${esc(t('hud.you'))} ${summary.makes} – ${summary.rivalScore} ${esc(t('hud.rival'))}</p>` : ''}
    <p class="muted">${esc(t('line.makes', { m: summary.makes, a: summary.attempts }))} · ${esc(t('line.swishes', { n: summary.swishes }))} · ${esc(t('line.streak', { n: summary.bestStreak }))}</p>
    <ul class="news">
      ${reward.newBest ? `<li class="hot">🎉 ${esc(t('result.newBest'))}</li>` : ''}
      ${reward.xp ? `<li>+${reward.xp} ${esc(t('xp'))}</li>` : ''}
      ${reward.levelUp ? `<li class="hot">⬆️ ${esc(t('result.levelUp', { n: reward.level }))}</li>` : ''}
      ${reward.medals.map((m) => `<li>🏅 ${esc(t(`medal.${m}`))}</li>`).join('')}
      ${unlocked.map((u) => `<li>🔓 ${esc(t('result.unlocked'))} — ${esc(u)}</li>`).join('')}
    </ul>
    <div class="row">${btn('home', esc(t('menu')))}${btn('retry', esc(t('retry')), hasNext ? '' : 'primary')}${hasNext ? btn('next', esc(t('next')), 'primary') : ''}</div></div>`;
}

export function pause(t) {
  return `<div class="card"><h2>${esc(t('pause'))}</h2><div class="col">
    ${btn('resume', esc(t('resume')), 'primary')}${btn('retry', esc(t('retry')))}${btn('settings', esc(t('settings')))}${btn('quit', esc(t('quit')))}</div></div>`;
}

export function howto(t) {
  return `${head(t, t('howto'))}<ul class="howto">${t('howtoText').map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
}

export function wardrobe(t, state) {
  const row = (slot, list) => `<fieldset><legend>${esc(t(`look.${slot}`))}</legend><div class="chips">${list.map((item) => {
    const id = typeof item === 'string' ? item : item.id;
    const open = typeof item === 'string' || isUnlocked(state, item);
    const why = open ? '' : item.level ? t('look.needLevel', { n: item.level }) : t('look.needMedal', { m: t(`medal.${item.medal}`) });
    return `<button type="button" class="chip" data-act="look" data-slot="${slot}" data-id="${id}" aria-pressed="${state.look[slot] === id}" ${open ? '' : 'disabled'}>${open ? '' : '🔒 '}${esc(t(`lookNames.${slot}.${id}`))}${why ? `<small>${esc(why)}</small>` : ''}</button>`;
  }).join('')}</div></fieldset>`;
  return `${head(t, t('wardrobe'))}<canvas id="preview" width="440" height="560" aria-hidden="true"></canvas>
    ${Object.entries(LOOKS).map(([s, l]) => row(s, l)).join('')}${SLOTS.map((s) => row(s, ITEMS[s])).join('')}`;
}

export function stats(t, state) {
  const s = state.stats;
  const pct = (m, a) => (a ? `${Math.round((m / a) * 100)}%` : '–');
  const rows = [
    ['shots', s.shots], ['pct', pct(s.makes, s.shots)], ['swishes', s.swishes], ['bank', s.bank], ['rim', s.rim], ['airballs', s.airballs], ['threes', s.threes], ['bestStreak', s.bestStreak],
    ['timed', state.best.timed], ['three', state.best.three], ['zero', `${state.zero.won} / ${state.zero.lost}`],
  ];
  const map = ['deep', 'three', 'mid', 'near'].map((r) => `<tr><th scope="row">${esc(t(`zones.${r}`))}</th>${['l', 'c', 'r'].map((side) => {
    const [a, m] = s.zones[`${r}-${side}`] || [0, 0];
    const k = a ? m / a : 0;
    return `<td style="background:${a ? `rgba(211,24,47,${(0.18 + k * 0.8).toFixed(2)})` : 'transparent'}"><b>${pct(m, a)}</b><small>${a ? `${m}/${a}` : ''}</small></td>`;
  }).join('')}</tr>`).join('');
  return `${head(t, t('stats'))}${s.shots ? '' : `<p class="muted">${esc(t('stat.empty'))}</p>`}
    <table class="heat"><thead><tr><td></td>${['l', 'c', 'r'].map((x) => `<th scope="col">${esc(t(`zones.${x}`))}</th>`).join('')}</tr></thead><tbody>${map}</tbody></table>
    <dl class="statlist">${rows.map(([k, v]) => `<div><dt>${esc(t(`stat.${k}`))}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}

export function medals(t, state) {
  return `${head(t, t('medals'))}<p class="muted">${state.medals.length} / ${MEDALS.length}</p>
    <ul class="medals">${MEDALS.map((m) => `<li class="${state.medals.includes(m.id) ? 'on' : ''}"><span aria-hidden="true">${state.medals.includes(m.id) ? '🏅' : '○'}</span>${esc(t(`medal.${m.id}`))}</li>`).join('')}</ul>`;
}

export function settingsScreen(t, lang, s, inMatch, asking) {
  const seg = (key, options, value) => `<fieldset><legend>${esc(t(`set.${key}`))}</legend><div class="chips">${options.map(([v, label]) =>
    `<button type="button" class="chip" data-act="set" data-key="${key}" data-v="${v}" aria-pressed="${String(value) === String(v)}">${esc(label)}</button>`).join('')}</div></fieldset>`;
  const onoff = (key) => seg(key, [[true, t('set.on')], [false, t('set.off')]], s[key]);
  return `<header class="sc-head">${btn(inMatch ? 'paused' : 'home', '‹', 'icon', `aria-label="${esc(t('back'))}"`)}<h2>${esc(t('settings'))}</h2></header>
    ${seg('lang', [['it', 'Italiano'], ['en', 'English']], lang)}
    ${seg('control', [['swipe', t('set.swipe')], ['hold', t('set.hold')]], s.control)}
    ${seg('diff', [['easy', t('set.easy')], ['normal', t('set.normal')], ['hard', t('set.hard')]], s.diff)}
    ${onoff('sound')}${onoff('music')}${onoff('vibrate')}${onoff('guide')}${onoff('motion')}${onoff('contrast')}${onoff('bigtext')}
    ${inMatch ? '' : asking
      ? `<div class="card danger"><p>${esc(t('set.resetAsk'))}</p><div class="row">${btn('reset-no', esc(t('back')))}${btn('reset-yes', esc(t('set.resetYes')), 'primary')}</div></div>`
      : btn('reset-ask', esc(t('set.reset')), 'quiet')}`;
}

export const TIMED_LABEL = TIMED_SECONDS;
