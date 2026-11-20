/* Sunset Compass — 12-hour solar ghost tracker (ES module) */

import { getSunTimes, getSunAtTime } from './sun.js';
import { compassPoint } from './compass.js';
import { t } from './i18n.js';
import { renderTimeline } from './render.js';

const hoursOf = time => time.hours + time.minutes / 60;

export function generateTimeline(lat, lon, date, obstacles = []) {
  const times = getSunTimes(lat, lon, date);
  const tzOffset = -date.getTimezoneOffset() / 60;
  const currentHour = date.getHours() + date.getMinutes() / 60;
  const timeline = [];

  const sunsetH = hoursOf(times.sunset);
  const sunriseH = hoursOf(times.sunrise);
  const goldenSetH = hoursOf(times.goldenSet);
  const goldenRiseH = hoursOf(times.goldenRise);
  const blueSetH = hoursOf(times.blueSet);
  const blueRiseH = hoursOf(times.blueRise);

  for (let h = 0; h < 12; h++) {
    const hourLocal = (currentHour + h) % 24;
    const hourUTC = hourLocal - tzOffset;
    const sunPos = getSunAtTime(lat, lon, date, hourUTC);
    const hourStr = `${String(Math.floor(hourLocal)).padStart(2, '0')}:00`;
    const time = h === 0
      ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      : hourStr;

    let event = null, eventClass = '';
    const near = (a, b) => Math.abs(a - b) < 0.5;
    if (near(hourLocal, sunsetH)) { event = t('sunset'); eventClass = 'sunset'; }
    else if (near(hourLocal, goldenSetH) || near(hourLocal, goldenRiseH)) { event = t('goldenHour'); eventClass = 'golden'; }
    else if (near(hourLocal, blueSetH) || near(hourLocal, blueRiseH)) { event = t('blueHour'); eventClass = 'blue'; }

    let belowObstacle = false;
    for (const obs of obstacles) {
      let diff = Math.abs(sunPos.azimuth - obs.azimuth);
      if (diff > 180) diff = 360 - diff;
      if (diff < 15 && sunPos.altitude < obs.altitude) { belowObstacle = true; break; }
    }

    timeline.push({
      time,
      azimuth: sunPos.azimuth,
      altitude: sunPos.altitude,
      isNow: h === 0,
      event, eventClass, belowObstacle,
      compassPoint: compassPoint(sunPos.azimuth)
    });
  }
  return { timeline, times };
}

export function update(container, lat, lon, obstacles) {
  const data = generateTimeline(lat, lon, new Date(), obstacles);
  renderTimeline(container, data);
  return data;
}
