/**
 * Sunset Compass — Compass + GPS + Device Orientation
 */
window.Compass = (function() {
  let heading = 0;
  let gpsPos = null;
  let watchId = null;
  let orientListener = null;
  let onHeadingChange = null;

  function startOrientation(callback) {
    onHeadingChange = callback;

    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') bindOrientation(callback);
      }).catch(() => {});
    } else {
      bindOrientation(callback);
    }
  }

  function bindOrientation(callback) {
    let last = 0;
    orientListener = (e) => {
      let h = 0;
      if (e.webkitCompassHeading !== undefined) {
        h = e.webkitCompassHeading; // iOS
      } else if (e.alpha !== null) {
        h = (360 - e.alpha) % 360; // Android
      }
      const now = Date.now();
      if (now - last > 50) { // throttle ~20fps
        heading = h;
        callback(h);
        last = now;
      }
    };
    window.addEventListener('deviceorientationabsolute', orientListener, true);
    // Fallback if absolute not supported
    window.addEventListener('deviceorientation', orientListener, true);
  }

  function stopOrientation() {
    if (orientListener) {
      window.removeEventListener('deviceorientationabsolute', orientListener, true);
      window.removeEventListener('deviceorientation', orientListener, true);
      orientListener = null;
    }
  }

  function startGPS(callback) {
    if (!navigator.geolocation) return;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        gpsPos = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy };
        callback(gpsPos);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  function stopGPS() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  }

  function getPosition() { return gpsPos; }
  function getHeading() { return heading; }

  function compassPoint(deg) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  function formatCoord(lat, lon) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir} ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }

  function renderCompassSVG(svgEl, sunAz, sunAlt, obsAz, obsAlt, currentHeading) {
    const size = 400;
    const cx = size / 2, cy = size / 2;
    const r = 170;

    let svg = '';

    // Outer circle
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#333" stroke-width="2"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r+20}" fill="none" stroke="#222" stroke-width="1"/>`;

    // Degree ticks
    for (let i = 0; i < 360; i += 10) {
      const isMajor = i % 30 === 0;
      const len = isMajor ? 12 : 6;
      const rad = (i - 90) * Math.PI / 180;
      const x1 = cx + (r - len) * Math.cos(rad);
      const y1 = cy + (r - len) * Math.sin(rad);
      const x2 = cx + r * Math.cos(rad);
      const y2 = cy + r * Math.sin(rad);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isMajor ? '#e8d8c0' : '#555'}" stroke-width="${isMajor ? 2 : 1}"/>`;
    }

    // Cardinal labels
    const labels = [{a:0,t:'N',c:'#ff6b35'},{a:90,t:'E',c:'#e8d8c0'},{a:180,t:'S',c:'#e8d8c0'},{a:270,t:'W',c:'#e8d8c0'}];
    labels.forEach(l => {
      const rad = (l.a - 90) * Math.PI / 180;
      const x = cx + (r + 12) * Math.cos(rad);
      const y = cy + (r + 12) * Math.sin(rad);
      svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${l.c}" font-size="14" font-weight="700">${l.t}</text>`;
    });

    // Inner glow
    svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="#f0a030" opacity="0.3"/>`;

    // Sun arc (arc from current heading - 90 to current heading + 90)
    const headingRad = (-currentHeading + 90) * Math.PI / 180;
    const sunRelativeAz = sunAz - currentHeading;
    const sunRad = (sunRelativeAz - 90) * Math.PI / 180;
    const sunR = r - 30;
    const sunX = cx + sunR * Math.cos(sunRad);
    const sunY = cy + sunR * Math.sin(sunRad);

    if (sunAlt > -6) {
      // Sun position
      const opacity = sunAlt > 0 ? 1 : Math.max(0, 1 + sunAlt / 6);
      svg += `<circle cx="${sunX}" cy="${sunY}" r="16" fill="#f0a030" opacity="${opacity * 0.3}"/>`;
      svg += `<circle cx="${sunX}" cy="${sunY}" r="10" fill="#f0a030" opacity="${opacity}"/>`;
      svg += `<text x="${sunX}" y="${sunY + 1}" text-anchor="middle" dominant-baseline="central" fill="#0a0a14" font-size="10" font-weight="700">☀</text>`;
      svg += `<text x="${sunX}" y="${sunY + 24}" text-anchor="middle" fill="#f0a030" font-size="9" font-weight="600">${Math.round(sunAlt)}°</text>`;
    }

    // Horizon line
    const relHorizon = -currentHeading;
    const hRad1 = (relHorizon - 90 - 40) * Math.PI / 180;
    const hRad2 = (relHorizon - 90 + 40) * Math.PI / 180;
    const hx1 = cx + (r - 50) * Math.cos(hRad1);
    const hy1 = cy + (r - 50) * Math.sin(hRad1);
    const hx2 = cx + (r - 50) * Math.cos(hRad2);
    const hy2 = cy + (r - 50) * Math.sin(hRad2);
    svg += `<line x1="${hx1}" y1="${hy1}" x2="${hx2}" y2="${hy2}" stroke="#3a2a1a" stroke-width="3" stroke-dasharray="6,4" opacity="0.6"/>`;

    // Obstacles
    if (obsAz !== undefined && obsAlt !== undefined) {
      const obsRelAz = obsAz - currentHeading;
      const obsRad = (obsRelAz - 90) * Math.PI / 180;
      const obsR = r - 30;
      const obsX = cx + obsR * Math.cos(obsRad);
      const obsY = cy + obsR * Math.sin(obsRad);
      svg += `<circle cx="${obsX}" cy="${obsY}" r="8" fill="none" stroke="#ff6b35" stroke-width="2"/>`;
      svg += `<text x="${obsX}" y="${obsY + 1}" text-anchor="middle" dominant-baseline="central" fill="#ff6b35" font-size="7" font-weight="700">✕</text>`;
      svg += `<text x="${obsX}" y="${obsY + 18}" text-anchor="middle" fill="#ff6b35" font-size="8">${Math.round(obsAlt)}°</text>`;
    }

    // Heading indicator (top triangle)
    svg += `<polygon points="${cx},${cy-r-4} ${cx-6},${cy-r-14} ${cx+6},${cy-r-14}" fill="#f0a030"/>`;

    svgEl.innerHTML = svg;
  }

  return {
    startOrientation, stopOrientation,
    startGPS, stopGPS,
    getPosition, getHeading,
    compassPoint, formatCoord,
    renderCompassSVG
  };
})();
