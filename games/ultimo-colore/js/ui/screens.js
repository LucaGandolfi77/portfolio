/* ============================================================
   Ultimo Colore — menus, map, camp and journal as HTML (pure)
   ============================================================ */
import { NODES, NODE } from '../data/map.js';
import { HEROES, statsAt, ITEMS } from '../data/party.js';
import { MEMORIES, MEMORY, SLOTS, LEARN, TEACH_COST } from '../data/memories.js';
import { DIARY, SPEAKERS } from '../data/story.js';
import * as P from '../world/progress.js';
import { heroSVG, dogSVG } from '../render/sprites.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const btn = (act, label, cls = '', extra = '') => `<button type="button" class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;
const head = (t, title, back = 'map') => `<header class="sc-head">${btn(back, '‹', 'icon', `aria-label="${esc(t('back'))}"`)}<h2>${esc(title)}</h2></header>`;
const memName = (id, lang) => MEMORY[id][lang];
const memText = (id, lang) => MEMORY[id][lang === 'it' ? 'dit' : 'den'];

export const speakerName = (id, lang) => {
  const s = SPEAKERS[id];
  return !s ? '' : typeof s === 'string' ? s : s[lang];
};

export function title(t, save) {
  return `<div class="title">
    <h1><span>ULTIMO</span><b>COLORE</b></h1>
    <p class="tag">${esc(t('tagline'))}</p>
    <p class="act">${esc(t('act'))}</p>
    <div class="col">
      ${save ? btn('continue', `${esc(t('cont'))} <small>${esc(t('map.progress', { n: P.progressOf(save) }))}</small>`, 'primary') : ''}
      ${btn('new', esc(t('newGame')), save ? '' : 'primary')}
      ${btn('howto', esc(t('howto')))}
      ${btn('settings', esc(t('settings')))}
    </div>
    <p class="credits">${esc(t('credits'))}</p>
  </div>`;
}

export function difficulty(t, hasSave) {
  return `${head(t, t('diffTitle'), 'title')}
    ${hasSave ? `<p class="warn">${esc(t('overwrite'))}</p>` : ''}
    <div class="col">${['story', 'easy', 'normal', 'hard'].map((d) => btn('start', `<b>${esc(t(`diff.${d}`))}</b><small>${esc(t(`diffDesc.${d}`))}</small>`, `choice ${d === 'normal' ? 'primary' : ''}`, `data-d="${d}"`)).join('')}</div>`;
}

export function map(t, lang, s, art, selected) {
  const open = P.available(s);
  const done = new Set(s.done);
  const lines = NODES.flatMap((n) => n.next.map((to) => {
    const a = n.pos, b = NODE[to].pos;
    return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${done.has(n.id) && done.has(to) ? 'walked' : ''} ${NODE[to].optional || n.optional ? 'side' : ''}"/>`;
  })).join('');
  const icon = { story: '❖', battle: '⚔', boss: '♛', camp: '🏮' };
  const dots = NODES.map((n) => {
    const state = done.has(n.id) ? 'done' : open.includes(n.id) ? 'open' : 'locked';
    const usable = state === 'open' || (state === 'done' && n.type === 'camp');
    return `<button type="button" class="node ${state} ${n.type} ${selected === n.id ? 'sel' : ''}" style="left:${n.pos[0]}%;top:${n.pos[1]}%" data-act="node" data-id="${n.id}" ${usable ? '' : 'disabled'} aria-label="${esc(n.name[lang])}, ${esc(t(`map.${state === 'locked' ? 'locked' : state === 'done' ? 'done' : 'enter'}`))}">${state === 'locked' ? '·' : state === 'done' && n.type !== 'camp' ? '✓' : icon[n.type]}</button>`;
  }).join('');
  const sel = selected && NODE[selected];
  return `<div class="mapview">
    <div class="mapart"><div class="mapsheet" style="background-image:url('${art}')">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="roads" aria-hidden="true">${lines}</svg>${dots}</div></div>
    <div class="mapfoot">
      ${sel ? `<div class="nodecard"><div><small>${esc(t(`type.${sel.type}`))}${sel.optional ? ` · ${esc(t('map.optional'))}` : ''}</small><strong>${esc(sel.name[lang])}</strong></div>${btn('enter', esc(t('map.enter')), 'primary', `data-id="${sel.id}"`)}</div>` : ''}
      <nav class="mapnav">${btn('title', `⌂<span>${esc(t('menu'))}</span>`)}${btn('party', `👥<span>${esc(t('map.party'))}</span>`)}${btn('diary', `📖<span>${esc(t('map.diary'))}</span>`)}${btn('settings', `⚙<span>${esc(t('settings'))}</span>`)}</nav>
    </div></div>`;
}

export function dialogue(t, lang, beat, n, total) {
  if (beat.c) {
    return `<div class="talk choices">${beat.c.map((o, i) => btn('choose', esc(o[lang]), 'choice', `data-i="${i}"`)).join('')}</div>`;
  }
  const [who, it, en] = beat;
  const name = speakerName(who, lang);
  return `<button type="button" class="talk ${who === 'n' ? 'narration' : ''}" data-act="advance" data-who="${who}">
    ${who === 'n' ? '' : `<span class="who"><span class="face">${who === 'ombra' ? dogSVG() : heroSVG(who, { portrait: true })}</span><b>${esc(name)}</b></span>`}
    <span class="words">${esc(lang === 'it' ? it : en)}</span><span class="more" aria-hidden="true">▾</span></button>`;
}

export function rewards(t, lang, items, nextAct = 'map', label = null) {
  return `<div class="card center"><ul class="gains">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${btn(nextAct, esc(label || t('next')), 'primary')}</div>`;
}

export function camp(t, lang, s, campId, talks) {
  const left = P.talksLeft(s, campId);
  return `<div class="campview">
    <h2>${esc(NODE[campId].name[lang])}</h2>
    <div class="fire">${s.party.map((h) => `<span class="sit">${heroSVG(h, { label: HEROES[h].name })}</span>`).join('')}<span class="sit dogsit">${dogSVG()}</span></div>
    <p class="muted">${esc(left > 0 && talks.some((x) => !s.talks.includes(x.id)) ? t('camp.talksLeft', { n: left }) : t('camp.nothing'))}</p>
    <div class="col">
      ${talks.map((x) => { const had = s.talks.includes(x.id); return btn('talk', `💬 ${esc(x.title[lang])} <small>${esc(x.who.map((h) => HEROES[h].name).join(' · '))}${had ? ' ✓' : ''}</small>`, 'choice', `data-id="${x.id}" ${had || left <= 0 ? 'disabled' : ''}`); }).join('')}
      <div class="row">${btn('rest', `😴 ${esc(t('camp.rest'))}`)}</div>
      <div class="row">${btn('party', `✺ ${esc(t('camp.memories'))}`)}${btn('diary', `📖 ${esc(t('camp.diary'))}`)}</div>
      ${btn('leave', esc(t('camp.leave')), 'primary')}
    </div></div>`;
}

export function party(t, lang, s, hero, back, note = '') {
  const h = s.party.includes(hero) ? hero : s.party[0];
  const lv = P.level(s);
  const st = statsAt(h, lv);
  const worn = s.equipped[h] || [];
  const tabs = s.party.map((id) => `<button type="button" class="chip" data-act="hero" data-id="${id}" aria-pressed="${id === h}">${esc(HEROES[id].name)}</button>`).join('');
  const list = s.owned.length ? MEMORIES.filter((m) => s.owned.includes(m.id)).map((m) => {
    const on = worn.includes(m.id);
    const knows = P.knows(s, h, m.id);
    const other = P.holder(s, m.id);
    const uses = s.uses[h]?.[m.id] || 0;
    const sub = knows ? `★ ${t('party.learned')}` : other && other !== h ? t('party.taken', { h: HEROES[other].name }) : t('party.progress', { n: uses });
    return `<li class="${on ? 'on' : ''}"><button type="button" class="mem" data-act="mem" data-id="${m.id}" aria-pressed="${on}"><b>${esc(m[lang])}</b><span>${esc(memText(m.id, lang))}</span><small>${esc(sub)}</small></button>
      ${P.canTeach(s, h, m.id) ? btn('teach', esc(t('party.teach', { n: TEACH_COST })), 'small', `data-id="${m.id}"`) : ''}</li>`;
  }).join('') : `<li class="muted">${esc(t('party.none'))}</li>`;
  return `${head(t, t('party.title'), back)}
    <div class="chips">${tabs}</div>
    <div class="sheet-hero" style="--c:${HEROES[h].color}">
      <span class="big-face">${heroSVG(h, { portrait: true })}</span>
      <div><strong>${esc(HEROES[h].name)}</strong> <small>${esc(HEROES[h].role[lang])} · ${esc(t('party.level', { n: lv }))}</small>
      <p>${esc(t('party.hp'))} ${st.hp} · ${esc(t('party.atk'))} ${Math.round(st.atk)} · ${esc(t('party.spd'))} ${st.spd}</p>
      <p class="passive">${esc(HEROES[h].passive[lang])}</p></div></div>
    <h3>${esc(t('party.skills'))}</h3>
    <ul class="skills">${HEROES[h].skills.map((k) => `<li class="${k.lv > lv ? 'locked' : ''}"><b>${esc(k[lang])}</b> <small>${k.ap} PA</small><span>${esc(k.lv > lv ? t('party.locked', { n: k.lv }) : lang === 'it' ? k.dit : k.den)}</span></li>`).join('')}</ul>
    <h3>${esc(t('party.memories', { n: worn.length }))}</h3>
    <p class="muted">${esc(t('party.light', { n: s.light }))}</p>
    ${note ? `<p class="warn" role="status">${esc(note)}</p>` : ''}
    <ul class="mems">${list}</ul>`;
}

export function diary(t, lang, s, back) {
  return `${head(t, t('diary.title'), back)}
    ${s.diary.length ? s.diary.map((id) => `<article class="page"><h3>${esc(DIARY[id].title[lang])}</h3><p>${esc(DIARY[id][lang])}</p></article>`).join('') : `<p class="muted">${esc(t('diary.empty'))}</p>`}`;
}

export function end(t, lang, s) {
  const bonds = Object.entries(s.bonds).sort((a, b) => b[1] - a[1]);
  return `<div class="card center end"><h2>${esc(t('end.title'))}</h2><p>${esc(t('end.text'))}</p>
    ${bonds.length ? `<h3>${esc(t('end.bonds'))}</h3><ul class="bonds">${bonds.map(([pair, n]) => `<li><span>${esc(pair.split('-').map((h) => HEROES[h]?.name).join(' & '))}</span><b>${'♥'.repeat(Math.min(5, n))}</b></li>`).join('')}</ul>` : ''}
    <p class="muted">${esc(t('end.next'))}</p>
    <div class="col">${btn('party', esc(t('map.party')))}${btn('diary', esc(t('map.diary')))}${btn('title', esc(t('end.again')), 'primary')}</div></div>`;
}

export function howto(t, back) {
  return `${head(t, t('howto'), back)}<ol class="howto">${t('howtoText').map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`;
}

export function settingsScreen(t, lang, s, difficultyNow, back) {
  const seg = (key, options, value) => `<fieldset><legend>${esc(t(`set.${key}`))}</legend><div class="chips">${options.map(([v, label]) =>
    `<button type="button" class="chip" data-act="set" data-key="${key}" data-v="${v}" aria-pressed="${String(value) === String(v)}">${esc(label)}</button>`).join('')}</div></fieldset>`;
  const onoff = (key) => seg(key, [[true, t('set.on')], [false, t('set.off')]], s[key]);
  return `${head(t, t('settings'), back)}
    ${seg('lang', [['it', 'Italiano'], ['en', 'English']], lang)}
    ${difficultyNow ? seg('diff', ['story', 'easy', 'normal', 'hard'].map((d) => [d, t(`diff.${d}`)]), difficultyNow) : ''}
    ${onoff('autoParry')}${onoff('sound')}${onoff('music')}${onoff('motion')}${onoff('bigtext')}`;
}

export function defeat(t) {
  return `<div class="card center"><h2>${esc(t('lose.title'))}</h2><p>${esc(t('lose.text'))}</p>
    <div class="col">${btn('retry', esc(t('lose.retry')), 'primary')}${btn('retry-easier', esc(t('lose.easier')))}${btn('map', esc(t('lose.map')))}</div></div>`;
}

export { ITEMS, SLOTS, LEARN, memName };
