// haptic.js — Consolidated haptic feedback (Vibration API)
window.Haptic = (() => {
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
  }
  return {
    tap:      () => vibrate(10),
    light:    () => vibrate(5),
    select:   () => vibrate([10, 30, 10]),
    success:  () => vibrate([10, 30, 10]),
    heavy:    () => vibrate([10, 30, 10, 30, 10]),
    error:    () => vibrate([20, 40, 20]),
    raw:      vibrate
  };
})();
