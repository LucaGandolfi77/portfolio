/* People Simulator — bootstrap, map and orchestration */
import { STATES, ACTIVITIES, EVENTS } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, save, setSetting, toggleFavorite, saveScenario } from './storage.js';
import { Simulator } from './engine.js';
import { stateProfile, hourlySeries, USA, DB } from './model.js';
import { loadTopology, mixColor } from './geo.js';
import { renderFavorites, ui, esc } from './ui.js';

const $ = id => document.getElementById(id);
const sim = new Simulator({ onChange: render });
let features = [], d3ready = false, projection = null, pathGen = null;
let selected = profile.lastState || null;
let compare = null, scenarioOpen = false;

function render(s) {
  if (!s) return;
  const series = hourlySeries(selected, s.time, sim.event, 24);
  ui.renderSnapshot(s, series);
  ui.renderEvent(sim.event);
  $('playBtn').innerHTML = (sim.running ? '⏸ ' + t('pause') : '▶ ' + t('play'));
  $('speedBtn').textContent = sim.speed + '×';
  if (d3ready && window.d3) {
    const svg = window.d3.select('#map-wrap svg');
    svg.selectAll('path.state').attr('fill', function () {
      const name = this.dataset.name;
      const st = stateProfile(name, sim.time, sim.event);
      return mixColor(st.mix);
    }).classed('selected', function () { return this.dataset.name === selected; });
  }
}

async function loadMap() {
  if (!window.d3 || !window.topojson) { $('loading').textContent = 'Map libraries unavailable'; return; }
  d3ready = true;
  const d3 = window.d3;
  const res = await fetch('./data/us-states-10m.json');
  const us = await res.json();
  const VB = [975, 610];
  projection = d3.geoAlbersUsa().fitSize(VB, us);
  pathGen = d3.geoPath().projection(projection);
  features = loadTopology(us, projection, pathGen);
  const svg = d3.select('#map-wrap').append('svg').attr('viewBox', `0 0 ${VB[0]} ${VB[1]}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const g = svg.append('g');
  g.selectAll('path.state').data(features).join('path')
    .attr('class', 'state')
    .attr('data-name', d => d.id)
    .attr('d', d => d.path)
    .attr('fill', '#141d33')
    .on('click', (ev, d) => { ev.stopPropagation(); selectState(selected === d.id ? null : d.id); });
  svg.on('click', () => selectState(null));
  const zoom = d3.zoom().scaleExtent([1, 12]).on('zoom', ev => g.attr('transform', ev.transform));
  svg.call(zoom).on('dblclick.zoom', null);
  $('loading').style.display = 'none';
  render(sim.recompute(selected));
}

function selectState(name) {
  selected = name || null;
  profile.lastState = selected; save();
  renderFavorites();
  render(sim.recompute(selected));
}

function setEvent(id) { sim.setEvent(id); }
function play() { sim.toggle(); render(sim.state); }
function speed() {
  const speeds = [1, 4, 20, 60];
  const i = speeds.indexOf(sim.speed);
  sim.setSpeed(speeds[(i + 1) % speeds.length]);
  render(sim.state);
}
function favorite() {
  if (!selected) { ui.toast(t('state')); return; }
  const added = toggleFavorite(selected);
  ui.toast(added ? t('favorites') : t('cancel'));
  renderFavorites();
}
function compareStates() {
  const other = STATES.filter(s => s[0] !== selected)[Math.floor(Math.random() * 49)][0];
  const a = stateProfile(selected, sim.time, sim.event);
  const b = stateProfile(other, sim.time, sim.event);
  const rows = Object.keys(a.mix).sort((x, y) => b.mix[y] - b.mix[x]).slice(0, 6)
    .map(k => {
      const act = ACTIVITIES.find(x => x.id === k);
      return `<div class="bar-row"><span>${act?.icon || ''}</span><b>${act?.[getLang()] || k}</b>
        <span>${a.mix[k]}% vs ${b.mix[k]}%</span></div>`;
    }).join('');
  ui.modal(`${selected || t('national')} ↔ ${other}`, `<p>${rows}</p>`, [{ label: t('ok'), primary: true }]);
}
function scenario() {
  const vals = Object.entries(EVENTS).map(([_, e]) => `<option value="${e.id}">${e.icon} ${e[getLang()]}</option>`).join('');
  ui.modal(t('scenario'), `<p>${t('events')}</p><select id="sc-event">${vals}</select>
    <p class="hint">${t('tutorialText')}</p>`, [
    { label: t('cancel') },
    { label: t('ok'), primary: true, fn: () => {
      const ev = $('sc-event')?.value || 'none';
      sim.setEvent(ev);
      saveScenario({ event: ev, state: selected, time: sim.time.toISOString() });
      render(sim.state);
    } }
  ]);
}

initLang(detect());
ui.initUI({
  play, speed,
  stepHour: () => { sim.step(); render(sim.state); },
  stepDay: () => { sim.stepDay(); render(sim.state); },
  reset: () => selectState(null),
  selectState,
  setEvent,
  favorite, compare: compareStates, scenario,
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  render: () => render(sim.state)
});
$('eventSelect').innerHTML = EVENTS.map(e => `<option value="${e.id}">${e.icon} ${e[getLang()]}</option>`).join('');
sim.speed = profile.settings.speed || 4;
sim.event = profile.settings.event || 'none';
render(sim.recompute(selected));

let last = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!last) last = now;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  sim.update(dt);
  if (sim.tickCount % 8 === 0) render(sim.state);
}
requestAnimationFrame(frame);
loadMap().catch(e => { $('loading').innerHTML = `<span style="color:#f87171">${esc(e.message)}</span>`; });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
