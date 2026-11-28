/* ============================================================
   Shake Me — menu screens as HTML strings (pure functions)
   ============================================================ */
import { RECIPES, RECIPE, CATEGORIES } from './data/recipes.js';
import { BY_ID } from './data/ingredients.js';
import { GLASSES, GARNISH } from './data/bar.js';
import { NIGHTS, NIGHT_MENU, CUSTOMERS, tierOf, PASS } from './service.js';
import { stepsOf, doseText } from './steps.js';
import { glassSVG, personSVG, TOBIA } from './render/art.js';
import { totalStars } from './state.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const btn = (act, label, cls = '', extra = '') => `<button type="button" class="btn ${cls}" data-act="${act}" ${extra}>${label}</button>`;
const head = (t, title, back = 'home') => `<header class="sc-head">${btn(back, '‹', 'icon', `aria-label="${esc(t('back'))}"`)}<h2>${esc(title)}</h2></header>`;
export const stars = (n, of = 3) => `<span class="stars" role="img" aria-label="${n}/${of}">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;
export const glassName = (id, lang) => GLASSES.find((g) => g.id === id)?.[lang] ?? id;
export const customer = (id) => CUSTOMERS.find((c) => c.id === id);

export function gate(t, closed) {
  return `<div class="card center"><p class="age">18+</p><h2>${esc(t('gate.title'))}</h2><p>${esc(t(closed ? 'gate.closed' : 'gate.text'))}</p>
    ${closed ? '' : `<div class="col">${btn('adult-yes', esc(t('gate.yes')), 'primary')}${btn('adult-no', esc(t('gate.no')))}</div>`}</div>`;
}

export function home(t, state, nextNight) {
  const modes = [
    ['night', '🌙', t('night', { n: nextNight + 1 })],
    ['school', '🎓', ''],
    ['memory', '🧠', state.memory ? `★ ${state.memory}` : ''],
    ['daily', '📅', ''],
    ['book', '📖', `${Object.keys(state.made).length}/${RECIPES.length}`],
  ];
  return `<div class="home">
    <div class="logo"><span>Shake</span><b>Me</b></div>
    <div class="tobia">${personSVG(TOBIA)}</div>
    <p class="tagline">${esc(t('tagline'))}</p>
    <div class="modes">${modes.map(([id, icon, note]) => `<button type="button" class="mode" data-act="mode" data-id="${id}">
      <span class="mi" aria-hidden="true">${icon}</span><strong>${esc(t(`modes.${id}`))}</strong><small>${esc(t(`modeDesc.${id}`))}</small>${note ? `<em>${esc(note)}</em>` : ''}</button>`).join('')}</div>
    <nav class="tools">${btn('howto', `❓ ${esc(t('howto'))}`)}${btn('settings', `⚙️ ${esc(t('settings'))}`)}</nav>
    <p class="credits">${esc(t('credits'))}</p>
  </div>`;
}

export function nights(t, state) {
  let open = true;
  const rows = Array.from({ length: NIGHTS }, (_, n) => {
    const s = state.nights[n];
    const here = open;
    open = here && (s || 0) > 0;
    const tier = tierOf(n);
    const names = NIGHT_MENU[n].map((id) => RECIPE[id].name).join(' · ');
    return `<li><button type="button" class="night ${here ? '' : 'locked'}" data-act="night" data-n="${n}" ${here ? '' : 'disabled'}>
      <span class="num">${here ? n + 1 : '🔒'}</span>
      <span class="what"><strong>${esc(t('night', { n: n + 1 }))} <span class="tier ${tier}">${esc(t(`tier.${tier}`))}</span></strong>
      <small>${here ? esc(names) : esc(t('needPrev'))}</small></span>${stars(s || 0)}</button></li>`;
  }).join('');
  return `${head(t, t('modes.night'))}<p class="muted">★ ${totalStars(state)} / ${NIGHTS * 3}</p><ol class="nights">${rows}</ol>`;
}

export function picker(t, lang, state, filter = 'all', query = '', act = 'pick') {
  const q = query.trim().toLowerCase();
  const list = RECIPES.filter((r) => (filter === 'all' || r.cat === filter) && (!q || r.name.toLowerCase().includes(q)));
  const tabs = ['all', ...CATEGORIES].map((c) => `<button type="button" class="chip" data-act="filter" data-f="${c}" aria-pressed="${filter === c}">${esc(c === 'all' ? t('book.all') : t(`cats.${c}`))}</button>`).join('');
  return `<div class="chips scroll">${tabs}</div>
    <input class="search" type="search" data-search placeholder="${esc(t('search').replace('ingrediente', 'cocktail').replace('ingredient', 'cocktail'))}" value="${esc(query)}" aria-label="${esc(t('search'))}">
    <ul class="recipes">${list.map((r) => `<li><button type="button" class="recipe-row" data-act="${act}" data-id="${r.id}">
      <span class="mini">${glassSVG(r.glass[0], { uid: 'm' + r.id, pours: [], label: '' })}</span>
      <span class="what"><strong>${esc(r.name)}</strong><small>${esc(r.ings.filter((l) => !l.optional).map((l) => BY_ID[l.ids[0]].name[lang]).slice(0, 4).join(', '))}</small></span>
      ${state.made[r.id] ? stars(starsFor(state.best[r.id])) : '<span class="dot">·</span>'}</button></li>`).join('')}</ul>`;
}

const starsFor = (score) => [55, 75, 90].filter((s) => score >= s).length;

export function school(t, lang, state, filter, query) {
  return `${head(t, t('modes.school'))}${picker(t, lang, state, filter, query, 'pick')}`;
}

export function book(t, lang, state, filter, query) {
  return `${head(t, t('modes.book'))}${picker(t, lang, state, filter, query, 'detail')}`;
}

export function detail(t, lang, state, id) {
  const r = RECIPE[id];
  const made = state.made[id];
  return `${head(t, r.name, 'book')}
    <div class="detail">
      <div class="big-glass">${glassSVG(r.glass[0], { uid: 'd' + id, pours: r.ings.filter((l) => !l.optional).map((l, n) => ({ id: l.ids[0], amount: l.unit === 'some' ? 20 : l.amount, unit: l.unit === 'some' ? 'ml' : l.unit, n })), ice: r.ice === '*' ? 'cubes' : r.ice, rim: r.rim && !r.rimOptional, garnish: r.garnish.filter((g) => !g.optional).map((g) => g.ids[0]), label: r.name })}</div>
      <p class="badge">${esc(t(r.iba ? 'book.iba' : 'book.zero'))} · ${esc(t(`cats.${r.cat}`))}</p>
      <p class="muted">${made ? `${esc(t('book.made', { n: made }))} · ${esc(t('book.best', { n: state.best[id] }))}` : esc(t('book.never'))}</p>
      <h3>${esc(t('book.ings'))}</h3><ul class="ings">${r.ings.map((l) => `<li>${esc(doseText(l, lang))}</li>`).join('')}</ul>
      <p><b>${esc(t('book.glass'))}:</b> ${esc(r.glass.map((g) => glassName(g, lang)).join(' / '))} · <b>${esc(t('book.ice'))}:</b> ${esc(r.ice === '*' ? '—' : t(`ice.${r.ice}`))}</p>
      <h3>${esc(t('book.steps'))}</h3><ol class="steps">${stepsOf(r, lang).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      ${btn('pick', esc(t('book.make')), 'primary wide', `data-id="${id}"`)}
    </div>`;
}

export function howto(t) {
  return `${head(t, t('howto'))}<ol class="howto">${t('howtoText').map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
    <p class="muted">${['easy', 'medium', 'hard'].map((k) => `<b>${esc(t(`tier.${k}`))}</b>: ${esc(t(`tierDesc.${k}`))}`).join('<br>')}</p>`;
}

export function settingsScreen(t, lang, s, asking, back = 'home') {
  const seg = (key, options, value) => `<fieldset><legend>${esc(t(`set.${key}`))}</legend><div class="chips">${options.map(([v, label]) =>
    `<button type="button" class="chip" data-act="set" data-key="${key}" data-v="${v}" aria-pressed="${String(value) === String(v)}">${esc(label)}</button>`).join('')}</div></fieldset>`;
  const onoff = (key) => seg(key, [[true, t('set.on')], [false, t('set.off')]], s[key]);
  return `${head(t, t('settings'), back)}
    ${seg('lang', [['it', 'Italiano'], ['en', 'English']], lang)}
    ${onoff('sound')}${onoff('music')}${onoff('sensor')}${onoff('bigtext')}${onoff('motion')}
    ${back !== 'home' ? '' : asking
      ? `<div class="card danger"><p>${esc(t('set.resetAsk'))}</p><div class="row">${btn('reset-no', esc(t('back')))}${btn('reset-yes', esc(t('set.resetYes')), 'primary')}</div></div>`
      : btn('reset-ask', esc(t('set.reset')), 'quiet')}`;
}

const DEF = {
  it: {
    missing: 'Manca: {i}', extra: 'In più: {i}', doseHigh: 'Troppo {i}: {got} invece di {want}', doseLow: 'Poco {i}: {got} invece di {want}',
    tool: 'Attrezzo: serviva {want}', noAction: 'Tecnica dimenticata: {a}', actionShort: '{a}: troppo poco', actionLong: '{a}: troppo, annacquato', noIce: 'Senza ghiaccio nell’attrezzo',
    muddle: 'Andava pestato', place: '{i} nel posto sbagliato', top: '{i} va aggiunto per ultimo nel bicchiere', float: '{i} va versato per ultimo, senza mescolare', rinse: '{i} va nel bicchiere vuoto, all’inizio',
    glass: 'Bicchiere: serviva {want}', ice: 'Ghiaccio: serviva {want}', garnishMissing: 'Guarnizione mancante: {g}', garnishExtra: 'Guarnizione in più: {g}', rimMissing: 'Manca il bordo di {r}', rimWrong: 'Bordo: serviva {r}', rimExtra: 'Il bordo non va',
  },
  en: {
    missing: 'Missing: {i}', extra: 'Extra: {i}', doseHigh: 'Too much {i}: {got} instead of {want}', doseLow: 'Not enough {i}: {got} instead of {want}',
    tool: 'Tool: it needed the {want}', noAction: 'Forgot to {a}', actionShort: '{a}: too short', actionLong: '{a}: too long, watery', noIce: 'No ice in the tool',
    muddle: 'It needed muddling', place: '{i} in the wrong place', top: '{i} goes in last, in the glass', float: '{i} goes in last, unstirred', rinse: '{i} goes in the empty glass first',
    glass: 'Glass: it needed the {want}', ice: 'Ice: it needed {want}', garnishMissing: 'Missing garnish: {g}', garnishExtra: 'Extra garnish: {g}', rimMissing: 'Missing {r} rim', rimWrong: 'Rim: it needed {r}', rimExtra: 'No rim on this one',
  },
};

export function defectText(lang, d, names) {
  const tpl = DEF[lang][d.key] || d.key;
  return tpl.replace('{i}', names.ing(d.ing))
    .replace('{got}', names.dose(d.got, d.unit))
    .replace('{want}', d.key.startsWith('dose') ? names.dose(d.want, d.unit) : names.thing(d.want, d.key))
    .replace('{a}', names.action(d.action))
    .replace('{g}', names.garnish(d.garnish))
    .replace('{r}', names.rim(d.rim));
}

export function result(t, lang, recipe, res, info, line, names, buttons) {
  const max = { ing: 35, dose: 25, tech: 15, glass: 15, garnish: 10 };
  const bars = Object.entries(max).map(([k, m]) => `<div class="part"><span>${esc(t(`result.parts.${k}`))}</span><i><u style="width:${Math.round((res.parts[k] / m) * 100)}%"></u></i><b>${Math.round(res.parts[k])}/${m}</b></div>`).join('');
  const mood = res.stars >= 2 ? 'smile' : res.stars === 1 ? 'wow' : 'sad';
  return `<div class="card result" data-stars="${res.stars}">
    <p class="kicker">${esc(recipe.name)}</p>
    <p class="score"><b>${res.score}</b><small>/100</small></p>${stars(res.stars)}
    <div class="verdict"><span class="face">${personSVG({ ...TOBIA, mood })}</span><p>${esc(line)}</p></div>
    ${info.first ? `<p class="news">📖 ${esc(t('result.first'))}</p>` : info.newBest ? `<p class="news">🎉 ${esc(t('result.best'))}</p>` : ''}
    <div class="parts">${bars}</div>
    ${res.defects.length ? `<ul class="defects">${res.defects.slice(0, 5).map((d) => `<li>${esc(defectText(lang, d, names))}</li>`).join('')}</ul>` : ''}
    <details><summary>${esc(t('result.correct'))}</summary><ul class="ings">${recipe.ings.map((l) => `<li>${esc(doseText(l, lang))}</li>`).join('')}</ul><ol class="steps">${stepsOf(recipe, lang).map((s) => `<li>${esc(s)}</li>`).join('')}</ol></details>
    <div class="row">${buttons}</div></div>`;
}

export function nightEnd(t, night, res, scores, orders) {
  return `<div class="card center"><h2>${esc(t('result.nightDone'))}</h2><p class="kicker">${esc(t('night', { n: night + 1 }))}</p>
    <p class="score"><b>${res.avg}</b><small>${esc(t('result.avg'))}</small></p>${stars(res.stars)}
    <p class="${res.passed ? 'news' : 'muted'}">${esc(res.passed ? t('result.passed') : t('result.failed', { n: res.pass ?? PASS }))}</p>
    <ul class="tally">${orders.map((o, i) => `<li><span>${esc(RECIPE[o.recipe].name)}</span><b>${scores[i] ?? '—'}</b></li>`).join('')}</ul>
    <div class="row">${btn('home', esc(t('menu')))}${btn('night-retry', esc(t('retry')))}${res.passed && night + 1 < NIGHTS ? btn('night-next', esc(t('next')), 'primary') : ''}</div></div>`;
}

export function dailyEnd(t, total, best, scores, orders) {
  return `<div class="card center"><h2>${esc(t('modes.daily'))}</h2>
    <p class="score"><b>${total}</b><small>/300</small></p>
    ${best ? `<p class="news">🎉 ${esc(t('result.best'))}</p>` : ''}
    <ul class="tally">${orders.map((o, i) => `<li><span>${esc(RECIPE[o.recipe].name)}</span><b>${scores[i] ?? '—'}</b></li>`).join('')}</ul>
    <div class="row">${btn('home', esc(t('menu')), 'primary')}</div></div>`;
}

export { GARNISH };
