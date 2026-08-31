(function(){
  const $ = id => document.getElementById(id);
  let mode = 'compass';
  let gpsPos = null;
  let heading = 0;
  let updateTimer = null;
  let arActive = false;

  // === STARS BACKGROUND ===
  function createStars() {
    const c = $('stars');
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 3 + 's';
      s.style.opacity = Math.random() * 0.5 + 0.1;
      c.appendChild(s);
    }
  }

  // === PERMISSIONS ===
  async function requestPermissions() {
    // GPS
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 });
        });
        gpsPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      } catch(e) {
        // Fallback: Milan
        gpsPos = { lat: 45.4642, lon: 9.1900 };
      }
    } else {
      gpsPos = { lat: 45.4642, lon: 9.1900 };
    }

    // Orientation (iOS needs user gesture)
    return true;
  }

  // === UI ===
  function showView(name) {
    ['view-perm','view-compass','view-camera','view-tracker'].forEach(id => {
      $(id).style.display = 'none';
    });
    if (name === 'perm') $('view-perm').style.display = '';
    else {
      $('view-main').style.display = '';
      $('view-' + name).style.display = name === 'compass' ? '' : name === 'camera' ? '' : '';
      if (name === 'tracker') $('view-tracker').style.display = '';
    }
  }

  function switchMode(m) {
    mode = m;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('on'));
    $('nav-' + m).classList.add('on');

    // Stop camera if leaving camera mode
    if (m !== 'camera' && arActive) {
      CameraAR.stop();
      arActive = false;
    }

    showView(m);

    if (m === 'camera') startCameraAR();
    if (m === 'tracker') updateTracker();
  }

  function updateClock() {
    const now = new Date();
    $('clock').textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function updateCountdown() {
    if (!gpsPos) return;
    const now = new Date();
    const times = SunCalc.getSunTimes(gpsPos.lat, gpsPos.lon, now);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const sunsetMinutes = times.sunset.hours * 60 + times.sunset.minutes;
    const diff = sunsetMinutes - nowMinutes;

    if (diff > 0) {
      const h = Math.floor(diff / 60);
      const m = Math.floor(diff % 60);
      $('cd-time').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      $('cd-sub').textContent = `Tramonto alle ${times.sunset.string}`;
    } else {
      $('cd-time').textContent = '🌙';
      const nextSunrise = times.sunrise.hours * 60 + times.sunrise.minutes;
      const toRise = (24 * 60 - nowMinutes) + nextSunrise;
      const rh = Math.floor(toRise / 60);
      const rm = Math.floor(toRise % 60);
      $('cd-sub').textContent = `Alba tra ${rh}h ${rm}m (${times.sunrise.string})`;
    }
  }

  function updateLocation() {
    if (gpsPos) {
      $('loc-text').textContent = Compass.formatCoord(gpsPos.lat, gpsPos.lon);
    }
  }

  // === COMPASS UPDATE ===
  function onHeading(h) {
    heading = h;
    if (mode === 'compass' && gpsPos) {
      const now = new Date();
      const sunPos = SunCalc.calcSunAzAlt(gpsPos.lat, gpsPos.lon, now);
      const obstacles = CameraAR.getObstacles();
      const nearestObs = findNearestObstacle(sunPos.azimuth, obstacles);
      Compass.renderCompassSVG($('compass-svg'), sunPos.azimuth, sunPos.altitude, nearestObs?.azimuth, nearestObs?.altitude, h);
    }
    if (mode === 'camera' && arActive) {
      updateAROverlay();
    }
  }

  function findNearestObstacle(sunAz, obstacles) {
    let nearest = null;
    let minDist = Infinity;
    obstacles.forEach(obs => {
      let diff = Math.abs(sunAz - obs.azimuth);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDist) { minDist = diff; nearest = obs; }
    });
    return minDist < 30 ? nearest : null;
  }

  // === CAMERA AR ===
  async function startCameraAR() {
    const ok = await CameraAR.start($('ar-video'), (obs) => {
      updateARInfo();
    });
    arActive = ok;
    if (!ok) {
      $('ar-tap').innerHTML = '<div style="text-align:center;padding:40px;color:var(--dim)">📷 Camera non disponibile<br><small>Abilita i permessi della fotocamera</small></div>';
    }
    updateARInfo();
  }

  function updateAROverlay() {
    if (!gpsPos || !arActive) return;
    const now = new Date();
    const sunPos = SunCalc.calcSunAzAlt(gpsPos.lat, gpsPos.lon, now);

    // Generate sun path for next 2 hours (every 10 min)
    const pathPoints = [];
    const tzOffset = -now.getTimezoneOffset() / 60;
    for (let m = -30; m <= 120; m += 10) {
      const future = new Date(now.getTime() + m * 60000);
      const futureUTC = future.getUTCHours() + future.getUTCMinutes() / 60;
      const sp = SunCalc.getSunAtTime(gpsPos.lat, gpsPos.lon, future, futureUTC);
      pathPoints.push({
        azimuth: sp.azimuth,
        altitude: sp.altitude,
        time: future.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        isNow: m === 0
      });
    }

    // Get screen dimensions from SVG
    const svgRect = $('ar-svg').getBoundingClientRect();
    const w = svgRect.width || 400;
    const h = svgRect.height || 400;

    CameraAR.drawSunPath($('ar-svg'), pathPoints, heading, w, h);

    // Update info badges
    $('ar-sun-info').textContent = `☀️ ${Math.round(sunPos.altitude)}° ${Compass.compassPoint(sunPos.azimuth)}`;
    const obs = CameraAR.getObstacles();
    $('ar-horizon-info').textContent = `🏔️ ${obs.length} ostacol${obs.length === 1 ? 'o' : 'i'}`;
  }

  function updateARInfo() {
    if (!gpsPos) return;
    const now = new Date();
    const sunPos = SunCalc.calcSunAzAlt(gpsPos.lat, gpsPos.lon, now);
    $('ar-sun-info').textContent = `☀️ ${Math.round(sunPos.altitude)}° ${Compass.compassPoint(sunPos.azimuth)}`;
    const obs = CameraAR.getObstacles();
    $('ar-horizon-info').textContent = `🏔️ ${obs.length} ostacol${obs.length === 1 ? 'o' : 'i'}`;
  }

  function handleARTap(e) {
    if (!gpsPos) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const w = rect.width;
    const h = rect.height;

    // Convert screen position to azimuth/altitude
    const fov = 60;
    const relAz = ((x - w/2) / (w/2)) * (fov / 2);
    const azimuth = (heading + relAz + 360) % 360;
    const altitude = ((h - y) / h) * 70 - 10;

    const obs = CameraAR.addObstacle(azimuth, altitude);
    updateARInfo();

    // Show confirmation
    const marker = document.createElement('div');
    marker.className = 'ar-obstacle fade-in';
    marker.style.left = x + 'px';
    marker.style.top = y + 'px';
    marker.onclick = () => { marker.remove(); CameraAR.removeObstacle(obs.id); updateARInfo(); };
    e.currentTarget.parentElement.appendChild(marker);
    setTimeout(() => marker.style.opacity = '0.5', 2000);
  }

  // === TRACKER ===
  function updateTracker() {
    if (!gpsPos) return;
    const data = Tracker.generateTimeline(gpsPos.lat, gpsPos.lon, new Date());
    Tracker.renderTimeline($('trail-scroll'), data);
  }

  // === MODAL ===
  function showModal(icon, title, txt, buttons) {
    $('modal-icon').textContent = icon;
    $('modal-title').textContent = title;
    $('modal-txt').textContent = txt;
    $('modal-acts').innerHTML = buttons.map((b, i) => `<button class="btn ${b.cls||''}" data-bi="${i}">${b.label}</button>`).join('');
    $('modal-acts').querySelectorAll('button').forEach(btn => {
      btn.onclick = () => { buttons[+btn.dataset.bi].fn(); $('modal').classList.remove('on'); };
    });
    $('modal').classList.add('on');
  }

  // === MAIN LOOP ===
  function startUpdateLoop() {
    updateClock();
    updateCountdown();
    updateLocation();
    setInterval(() => {
      updateClock();
      updateCountdown();
    }, 1000);
  }

  // === INIT ===
  async function init() {
    createStars();

    $('btn-start').onclick = async () => {
      $('btn-start').textContent = 'Caricamento...';
      $('btn-start').disabled = true;
      await requestPermissions();

      // Start compass
      Compass.startOrientation(onHeading);
      Compass.startGPS((pos) => {
        gpsPos = pos;
        updateLocation();
        updateCountdown();
        if (mode === 'compass') onHeading(heading);
        if (mode === 'tracker') updateTracker();
      });

      CameraAR.loadObstacles();
      showView('compass');
      switchMode('compass');
      startUpdateLoop();
    };

    // Nav
    $('nav-compass').onclick = () => switchMode('compass');
    $('nav-camera').onclick = () => switchMode('camera');
    $('nav-tracker').onclick = () => switchMode('tracker');

    // AR tap
    $('ar-tap').onclick = handleARTap;

    // Service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    }
  }

  init();
})();
