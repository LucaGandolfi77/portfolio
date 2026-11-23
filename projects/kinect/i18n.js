/* Kinetic — i18n using the site-wide JSON namespace `kinect` */

const FALLBACK = {
  title: 'Kinetic', subtitle: 'Catch the light with your hands',
  start: 'Start', camera: 'Camera', touch: 'Touch mode',
  classic: 'Classic', time: 'Time Attack', gesture: 'Gesture Combo',
  relaxed: 'Relaxed', normal: 'Normal', chaotic: 'Chaotic',
  play: 'PLAY', loading: 'Loading', model: 'Hand model', cameraStep: 'Camera',
  error: 'Something went wrong', retry: 'Retry', pause: 'Paused', resume: 'Resume',
  restart: 'Restart', over: 'Game over', score: 'Score', timeLeft: 'Time',
  combo: 'Combo', accuracy: 'Accuracy', best: 'Best', hits: 'Hits', misses: 'Misses',
  maxCombo: 'Max combo', settings: 'Settings', sound: 'Sound', mirror: 'Mirror',
  sensitivity: 'Sensitivity', quality: 'Quality', high: 'High', low: 'Low',
  close: 'Close', hintNoHands: 'Show your hand to the camera',
  hintGesture: 'Match the gesture to collect the orb',
  touchHint: 'Drag to move the reticle', orientation: 'Rotate your device for a wider view',
  offlineTitle: 'You are offline', offlineText: 'Reconnect to load the hand model, or play in Touch mode.',
  permission: 'Camera permission denied. Allow it in your browser settings.',
  notfound: 'No camera found on this device.', busy: 'Camera is busy. Close other apps and retry.',
  modelError: 'The hand model could not be loaded. Check your connection.',
  insecure: 'A secure connection (HTTPS) is required for the camera.',
  unsupported: 'This browser does not support camera tracking.', generic: 'Unexpected error. Try again.'
};

export class I18n {
  constructor() {
    this.lang = (localStorage.getItem('site_lang') || localStorage.getItem('lang') || 'en').slice(0, 2);
    if (!['en', 'it'].includes(this.lang)) this.lang = 'en';
    this.dict = { ...FALLBACK };
  }

  async init() {
    try {
      const res = await fetch(`../../i18n/${this.lang}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.kinect) this.dict = { ...FALLBACK, ...data.kinect };
      }
    } catch (e) { /* offline: built-in fallback */ }
    document.documentElement.lang = this.lang;
    return this;
  }

  t(key, vars = {}) {
    let text = this.dict[key] || FALLBACK[key] || key;
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  }

  setLang(lang) {
    this.lang = lang.slice(0, 2) === 'it' ? 'it' : 'en';
    return this.init();
  }
}
