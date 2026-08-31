/**
 * Sunset Compass — Ghost Tracker
 * Timeline visualization of sun position for the next 12 hours
 */
window.Tracker = (function() {

  function generateTimeline(lat, lon, date) {
    const tzOffset = -date.getTimezoneOffset() / 60;
    const times = SunCalc.getSunTimes(lat, lon, date);

    const timeline = [];
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    // Generate for next 12 hours
    for (let h = 0; h < 12; h++) {
      const hourLocal = (currentHour + h) % 24;
      const hourUTC = hourLocal - tzOffset;

      const sunPos = SunCalc.getSunAtTime(lat, lon, date, hourUTC);
      const hourStr = `${String(Math.floor(hourLocal)).padStart(2, '0')}:00`;
      const minStr = h === 0 ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` : hourStr;

      // Determine event type
      let event = null;
      let eventClass = '';
      const sunsetH = times.sunset.hours + times.sunset.minutes / 60;
      const sunriseH = times.sunrise.hours + times.sunrise.minutes / 60;
      const goldenSetH = times.goldenSet.hours + times.goldenSet.minutes / 60;
      const goldenRiseH = times.goldenRise.hours + times.goldenRise.minutes / 60;
      const blueSetH = times.blueSet.hours + times.blueSet.minutes / 60;
      const blueRiseH = times.blueRise.hours + times.blueRise.minutes / 60;

      if (Math.abs(hourLocal - sunsetH) < 0.5) {
        event = '🌇 Tramonto';
        eventClass = 'sunset';
      } else if (Math.abs(hourLocal - goldenSetH) < 0.5 || Math.abs(hourLocal - goldenRiseH) < 0.5) {
        event = '✨ Golden Hour';
        eventClass = 'golden';
      } else if (Math.abs(hourLocal - blueSetH) < 0.5 || Math.abs(hourLocal - blueRiseH) < 0.5) {
        event = '🔵 Blue Hour';
        eventClass = 'blue';
      } else if (sunPos.altitude > 0 && hourLocal > goldenSetH && hourLocal < goldenSetH + 1) {
        event = '✨ Golden Hour';
        eventClass = 'golden';
      }

      // Check obstacles
      let belowObstacle = false;
      const savedObs = JSON.parse(localStorage.getItem('sunset_obstacles') || '[]');
      for (const obs of savedObs) {
        const azDiff = Math.abs(sunPos.azimuth - obs.azimuth);
        if (azDiff < 15 && sunPos.altitude < obs.altitude) {
          belowObstacle = true;
          break;
        }
      }

      timeline.push({
        hour: hourLocal,
        time: h === 0 ? minStr : hourStr,
        azimuth: sunPos.azimuth,
        altitude: sunPos.altitude,
        isNow: h === 0,
        isPast: h === 0 && false,
        event,
        eventClass,
        belowObstacle,
        compassPoint: Compass.compassPoint(sunPos.azimuth)
      });
    }

    return { timeline, times };
  }

  function renderTimeline(container, data) {
    const { timeline, times } = data;
    const maxAlt = 60;

    let html = '';

    // Sunset info
    html += `<div style="text-align:center;padding:6px;background:var(--card);border-radius:10px;margin-bottom:6px">
      <div style="font-size:10px;color:var(--dim)">TRAMONTO</div>
      <div style="font-size:18px;font-weight:800;color:var(--sun)">${times.sunset.string}</div>
      <div style="font-size:10px;color:var(--dim)">Alba: ${times.sunrise.string} · Sole: ${Math.round(times.declination)}° decl.</div>
    </div>`;

    timeline.forEach(t => {
      const altPercent = Math.max(0, Math.min(100, (t.altitude + 10) / (maxAlt + 10) * 100));
      const azPercent = (t.azimuth / 360) * 100;
      const barColor = t.altitude > 0
        ? `linear-gradient(90deg, #c08020, #f0a030)`
        : `linear-gradient(90deg, #333, #555)`;
      const textColor = t.altitude > 0 ? 'var(--txt)' : 'var(--dim)';

      html += `<div class="trail-row ${t.isNow ? 'now' : ''}">
        <div class="trail-time">${t.time}</div>
        <div class="trail-bar" style="position:relative">
          <div class="trail-bar-fill" style="width:${altPercent}%;background:${barColor}"></div>
          <div class="trail-bar-sun" style="left:${azPercent}%"></div>
        </div>
        <div class="trail-az" style="color:${textColor}">${Math.round(t.azimuth)}° ${t.compassPoint}</div>
        <div class="trail-alt" style="color:${t.altitude > 0 ? 'var(--sun)' : 'var(--dim)'}">${t.altitude > 0 ? '↑' : '↓'}${Math.abs(Math.round(t.altitude))}°</div>
        ${t.event ? `<div class="trail-event ${t.eventClass}">${t.event}</div>` : ''}
        ${t.belowObstacle ? '<div class="trail-event" style="background:rgba(255,107,53,.2);color:var(--accent)">🏔️ sotto</div>' : ''}
      </div>`;
    });

    container.innerHTML = html;
  }

  return { generateTimeline, renderTimeline };
})();
