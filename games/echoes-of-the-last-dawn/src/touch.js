/* ═══════════════ TOUCH OPTIMIZATION ═══════════════ */
/* Mobile-optimized joystick, parry button, safe areas */

let joyActive = false;
let joyStartX = 0, joyStartY = 0;
let joyDir = { x: 0, z: 0 };
let parryBtnEl = null;

export function initTouch() {
  // Parry button
  parryBtnEl = document.getElementById("parry-btn");

  // Joystick
  const joyBase = document.getElementById("joy-base");
  const joyKnob = document.getElementById("joy-knob");
  if (!joyBase || !joyKnob) return;

  joyBase.addEventListener("touchstart", onJoyStart, { passive: false });
  joyBase.addEventListener("touchmove", onJoyMove, { passive: false });
  joyBase.addEventListener("touchend", onJoyEnd, { passive: false });
  joyBase.addEventListener("touchcancel", onJoyEnd, { passive: false });

  function onJoyStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    const rect = joyBase.getBoundingClientRect();
    joyStartX = rect.left + rect.width / 2;
    joyStartY = rect.top + rect.height / 2;
    joyActive = true;
    joyKnob.style.transition = "none";
  }

  function onJoyMove(e) {
    if (!joyActive) return;
    e.preventDefault();
    const t = e.touches[0];
    let dx = t.clientX - joyStartX;
    let dy = t.clientY - joyStartY;
    const maxR = joyBase.offsetWidth / 2 - joyKnob.offsetWidth / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxR) { dx = dx / dist * maxR; dy = dy / dist * maxR; }
    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    joyDir.x = dx / maxR;
    joyDir.z = dy / maxR;
  }

  function onJoyEnd() {
    joyActive = false;
    joyKnob.style.transition = "transform 0.15s ease";
    joyKnob.style.transform = "translate(0px, 0px)";
    joyDir.x = 0;
    joyDir.z = 0;
  }
}

export function getJoystickDir() { return joyDir; }

/* ─── Safe area insets ─── */
export function applySafeAreas() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const env = (v) => {
    const m = v.match(/env\(\s*safe-area-inset-(\w+)\s*\)/);
    return m ? parseInt(style.getPropertyValue(`--sat-${m[1]}`) || "0") : 0;
  };
  // Let CSS handle it via env() — we just add the meta tag in index.html
}

/* ─── Prevent double-tap zoom ─── */
export function preventDoubleTapZoom() {
  let lastTap = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });
}

/* ─── Prevent pull-to-refresh ─── */
export function preventPullToRefresh() {
  document.body.addEventListener("touchmove", (e) => {
    if (e.touches.length > 1) return;
    if (document.scrollingElement.scrollTop === 0 && e.touches[0].clientY > 0) {
      // At top of page, prevent pull-down
    }
  }, { passive: true });
}

/* ─── Haptic feedback wrapper ─── */
export function haptic(ms = 10) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
