import { CAST } from '../game/story';
import { dateLabel, PHASE_LABEL, phaseOf, seasonOf, upcoming, type SeasonEvent } from '../game/calendar';
import { formatClock, formatMoney, type SaveData } from '../game/save';
import { WEATHER_LABEL, type WeatherKind } from '../world/weather';

/* The in-game phone: story, calendar, contacts, collection. */

export type PhoneTab = 'storia' | 'calendario' | 'contatti' | 'collezione';

export interface PhoneData {
  missions: Array<{ title: string; chapter: string; state: 'fatta' | 'attuale' | 'futura' }>;
  day: number;
  hours: number;
  weather: WeatherKind;
  events: SeasonEvent[];
  save: SaveData;
  santiniTotal: number;
  storyDone: number;
}

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function renderPhone(tab: PhoneTab, d: PhoneData): string {
  let html = '';
  if (tab === 'storia') {
    let chapter = '';
    for (const m of d.missions) {
      if (m.chapter !== chapter) {
        chapter = m.chapter;
        html += `${html.includes('<ul>') ? '</ul>' : ''}<h3>${esc(chapter)}</h3><ul>`;
      }
      html += `<li class="${m.state === 'fatta' ? 'done' : m.state === 'attuale' ? 'now' : ''}">${esc(m.title)}${m.state === 'attuale' ? ' <span class="muted">· segnale blu</span>' : ''}</li>`;
    }
    return html + '</ul>';
  }
  if (tab === 'calendario') {
    const season = seasonOf(d.day);
    html += `<h3>${esc(dateLabel(d.day))}</h3><p>${esc(PHASE_LABEL[phaseOf(d.hours, season)])} · ${formatClock(d.hours)} · ${esc(WEATHER_LABEL[d.weather])}</p>`;
    if (d.events.length) html += `<h3>Adesso</h3><ul>${d.events.map((e) => `<li class="now"><b>${esc(e.name)}</b> · ${esc(e.place.name)}<br><span class="muted">${esc(e.blurb)}</span></li>`).join('')}</ul>`;
    html += `<h3>Prossimi eventi</h3><ul>${upcoming(d.day, d.hours, 4)
      .map((u) => `<li><b>${esc(u.event.name)}</b> · ${esc(dateLabel(u.day))}, dalle ${u.event.from}:00<br><span class="muted">${esc(u.event.place.name)}</span></li>`)
      .join('')}</ul>`;
    return html;
  }
  if (tab === 'contatti') {
    html += '<ul>';
    for (const c of Object.values(CAST)) {
      if (c.id === 'dario') continue;
      html += `<li><span class="who" style="color:${c.color}">●</span> <span class="who">${esc(c.name)}</span> <span class="muted">${esc(c.role)}</span><br>${esc(c.bio)}</li>`;
    }
    return html + '</ul>';
  }
  const s = d.save;
  html += `<h3>Santini</h3><p>${s.santini.length}/${d.santiniTotal} trovati · €50 ciascuno. Sono vicino ai luoghi famosi della città.</p>`;
  html += `<h3>Statistiche</h3><ul><li>Soldi: ${formatMoney(s.money)}</li><li>Lavori extra: ${s.jobs}</li><li>Missioni della storia: ${d.storyDone}/12</li><li>Fermato dalla polizia: ${s.busted} volte</li>${s.bestRace ? `<li>Corsa migliore: ${s.bestRace} s</li>` : ''}</ul>`;
  return html;
}
