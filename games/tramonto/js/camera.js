/* Sunset Compass — camera stream, obstacle storage and AR geometry */

const KEY = 'sunset_obstacles';

export class CameraAR {
  constructor() {
    this.stream = null;
    this.obstacles = [];
    this.onAdd = null;
    this.onRemove = null;
  }

  async start(videoEl) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoEl.srcObject = this.stream;
      await videoEl.play();
      return true;
    } catch (e) {
      this.stream = null;
      return false;
    }
  }

  stop() {
    if (!this.stream) return;
    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
  }

  isActive() { return this.stream !== null; }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      this.obstacles = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(this.obstacles)) this.obstacles = [];
    } catch (e) { this.obstacles = []; }
    return this.obstacles;
  }

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.obstacles)); } catch (e) { /* ignore */ }
  }

  add(azimuth, altitude) {
    const obs = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      azimuth: Math.round(azimuth * 10) / 10,
      altitude: Math.round(altitude * 10) / 10,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.obstacles.push(obs);
    this.save();
    this.onAdd?.(obs);
    return obs;
  }

  remove(id) {
    this.obstacles = this.obstacles.filter(o => o.id !== id);
    this.save();
    this.onRemove?.(id);
  }

  clear() { this.obstacles = []; this.save(); }
  list() { return this.obstacles; }

  /** Nearest stored obstacle to the sun azimuth, within 30°. */
  nearest(sunAz) {
    let best = null, min = Infinity;
    for (const obs of this.obstacles) {
      let diff = Math.abs(sunAz - obs.azimuth);
      if (diff > 180) diff = 360 - diff;
      if (diff < min) { min = diff; best = obs; }
    }
    return min < 30 ? best : null;
  }

  /** Screen position for a sun/obstacle in a ~60° horizontal FOV. */
  sunToScreen(azimuth, altitude, heading, w, h) {
    const fov = 60;
    let rel = azimuth - heading;
    rel = ((rel + 180) % 360 + 360) % 360 - 180;
    if (Math.abs(rel) > fov / 2) return null;
    return {
      x: (rel / (fov / 2)) * (w / 2) + w / 2,
      y: h - ((altitude + 10) / 70) * h
    };
  }

  /** Inverse of sunToScreen, used when tapping the horizon. */
  screenToWorld(x, y, heading, w, h) {
    const relAz = ((x - w / 2) / (w / 2)) * 30;
    return {
      azimuth: ((heading + relAz) % 360 + 360) % 360,
      altitude: ((h - y) / h) * 70 - 10
    };
  }
}
