/**
 * Sunset Compass — Camera AR Mode
 * Tap to mark obstacles on the horizon
 */
window.CameraAR = (function() {
  let stream = null;
  let obstacles = [];
  let onObstacleAdd = null;
  let onObstacleRemove = null;

  async function start(videoEl, callback) {
    onObstacleAdd = callback;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      videoEl.srcObject = stream;
      await videoEl.play();
      return true;
    } catch (e) {
      console.warn('Camera access denied:', e);
      return false;
    }
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function isActive() { return stream !== null; }

  function loadObstacles() {
    try {
      const saved = localStorage.getItem('sunset_obstacles');
      if (saved) obstacles = JSON.parse(saved);
    } catch(e) { obstacles = []; }
    return obstacles;
  }

  function saveObstacles() {
    localStorage.setItem('sunset_obstacles', JSON.stringify(obstacles));
  }

  function addObstacle(azimuth, altitude) {
    const obs = { id: Date.now(), azimuth: Math.round(azimuth * 10) / 10, altitude: Math.round(altitude * 10) / 10, time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) };
    obstacles.push(obs);
    saveObstacles();
    if (onObstacleAdd) onObstacleAdd(obs);
    return obs;
  }

  function removeObstacle(id) {
    obstacles = obstacles.filter(o => o.id !== id);
    saveObstacles();
    if (onObstacleRemove) onObstacleRemove(id);
  }

  function getObstacles() { return obstacles; }

  function clearObstacles() {
    obstacles = [];
    saveObstacles();
  }

  // Map sun position to screen coordinates (simplified: azimuth -> x, altitude -> y)
  function sunToScreen(sunAz, sunAlt, heading, screenW, screenH) {
    // Field of view: ~60 degrees horizontal
    const fov = 60;
    const relAz = sunAz - heading;
    // Wrap to -180..180
    let rel = relAz;
    if (rel > 180) rel -= 360;
    if (rel < -180) rel += 360;

    // Only show if within FOV
    if (Math.abs(rel) > fov / 2) return null;

    const x = (rel / (fov / 2)) * (screenW / 2) + screenW / 2;
    // Map altitude: -10 (below) to +60 (high) -> screen Y
    const y = screenH - ((sunAlt + 10) / 70) * screenH;

    return { x, y };
  }

  // Draw sun path arc on SVG overlay
  function drawSunPath(svgEl, sunPositions, heading, screenW, screenH) {
    let svg = '';
    const points = [];

    sunPositions.forEach(sp => {
      const pos = sunToScreen(sp.azimuth, sp.altitude, heading, screenW, screenH);
      if (pos) {
        points.push({ ...pos, alt: sp.altitude, time: sp.time, isNow: sp.isNow || false });
      }
    });

    if (points.length < 2) {
      svgEl.innerHTML = svg;
      return;
    }

    // Draw path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    svg += `<path d="${pathD}" fill="none" stroke="#f0a030" stroke-width="2" opacity="0.5" stroke-dasharray="6,4"/>`;

    // Draw points
    points.forEach(p => {
      const r = p.isNow ? 5 : 2;
      const color = p.isNow ? '#f0a030' : '#c08020';
      svg += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color}" opacity="${p.isNow ? 1 : 0.5}"/>`;
      if (p.isNow) {
        svg += `<circle cx="${p.x}" cy="${p.y}" r="10" fill="none" stroke="#f0a030" stroke-width="1" opacity="0.3"/>`;
      }
    });

    svgEl.innerHTML = svg;
  }

  return {
    start, stop, isActive,
    loadObstacles, saveObstacles,
    addObstacle, removeObstacle, getObstacles, clearObstacles,
    sunToScreen, drawSunPath
  };
})();
