/* Sunset Compass — GPS + device orientation (ES module) */

import { CARDINALS } from './config.js';

export function compassPoint(deg) {
  return CARDINALS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

export function formatCoord(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${ns} ${Math.abs(lon).toFixed(4)}°${ew}`;
}

export class Compass {
  constructor() {
    this.heading = 0;
    this.position = null;
    this.watchId = null;
    this.listener = null;
    this.lastEmit = 0;
    this.onHeading = null;
  }

  async startOrientation(callback) {
    this.onHeading = callback;
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === 'granted') this.bind(callback);
      } catch (e) { /* denied */ }
    } else {
      this.bind(callback);
    }
  }

  bind(callback) {
    this.stopOrientation();
    this.listener = e => {
      let h = 0;
      if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
      else if (typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
      const now = Date.now();
      if (now - this.lastEmit < 50) return;
      this.lastEmit = now;
      this.heading = h;
      callback(h);
    };
    window.addEventListener('deviceorientationabsolute', this.listener, true);
    window.addEventListener('deviceorientation', this.listener, true);
  }

  stopOrientation() {
    if (!this.listener) return;
    window.removeEventListener('deviceorientationabsolute', this.listener, true);
    window.removeEventListener('deviceorientation', this.listener, true);
    this.listener = null;
  }

  startGPS(callback) {
    if (!navigator.geolocation) return false;
    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        this.position = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        callback(this.position);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return true;
  }

  stopGPS() {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  stop() { this.stopOrientation(); this.stopGPS(); }

  getPosition() { return this.position; }
  getHeading() { return this.heading; }
}
