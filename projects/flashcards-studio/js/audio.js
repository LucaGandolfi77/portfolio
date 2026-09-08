/** Audio locale — pronuncia via speechSynthesis (zero server) */
const Audio = { speak(text) { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(text); u.lang = 'it-IT'; u.rate = 0.9; window.speechSynthesis.speak(u); } } };
