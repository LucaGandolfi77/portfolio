/* ============================================================
   Agente Zero — how far the phone has been tipped
   ============================================================ */

const rad = Math.PI / 180;

/** Direction of "up" in the phone's own axes for a beta/gamma reading. */
function upVector({ beta, gamma }) {
  const b = beta * rad, g = gamma * rad;
  return [-Math.cos(b) * Math.sin(g), Math.sin(b), Math.cos(b) * Math.cos(g)];
}

/** Angle in degrees between two readings; safe across the sensor's wrap-around. */
export function tiltDelta(from, to) {
  const a = upVector(from), b = upVector(to);
  const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return Math.acos(Math.max(-1, Math.min(1, d))) / rad;
}

/**
 * Listens to the orientation sensor. reset() takes the next reading as
 * "upright"; angle() is how far the phone has moved from it.
 */
export function createTilt(target = window) {
  let base = null, last = null, seen = false;
  target.addEventListener('deviceorientation', (e) => {
    if (e.beta === null || e.gamma === null || e.beta === undefined) return;
    last = { beta: e.beta, gamma: e.gamma };
    seen = true;
    if (!base) base = last;
  });
  return {
    /** iOS asks the player first, and only from a tap. */
    async request() {
      const D = target.DeviceOrientationEvent;
      if (typeof D?.requestPermission !== 'function') return true;
      try { return (await D.requestPermission()) === 'granted'; } catch (e) { return false; }
    },
    reset() { base = last; },
    angle() { return base && last ? tiltDelta(base, last) : 0; },
    get seen() { return seen; },
  };
}
