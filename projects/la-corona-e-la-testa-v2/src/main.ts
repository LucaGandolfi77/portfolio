import './styles.css';

/* The film is drawn with WebGL: without it, say so kindly instead of failing. */
function webgl(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

if (webgl()) {
  void import('./app');
} else {
  const it = (navigator.language || 'it').toLowerCase().startsWith('it') || new URLSearchParams(location.search).get('lang') === 'it';
  document.documentElement.classList.add('no-webgl');
  const note = document.querySelector('.poster-note');
  document.querySelectorAll<HTMLButtonElement>('#poster button').forEach((b) => (b.disabled = true));
  if (note)
    note.textContent = it
      ? 'Questo film è disegnato in 3D con WebGL, che questo browser non mette a disposizione. Prova con un browser aggiornato o attiva l’accelerazione grafica.'
      : 'This film is drawn in 3D with WebGL, which this browser does not provide. Try an up-to-date browser or turn on hardware acceleration.';
}
