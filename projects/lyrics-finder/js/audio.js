/* Reverse Lyrics Finder — 30s preview player with seek and volume */
export function createPlayer(els, hooks = {}) {
  const audio = new Audio();
  audio.preload = 'metadata';
  let current = null;

  function fmt(t) {
    if (!isFinite(t)) return '0:00';
    const s = Math.floor(t);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function update() {
    if (!els.seek) return;
    const d = audio.duration || 30;
    els.seek.value = String(Math.round((audio.currentTime / d) * 100) || 0);
    els.seek.style.setProperty('--p', els.seek.value + '%');
    if (els.time) els.time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration || 30);
  }
  function setPlaying(on) {
    els.play.textContent = on ? '❚❚' : '▶';
    els.player.classList.toggle('on', on);
    if (current) {
      hooks.onState?.(on, current);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: current.trackName || '', artist: current.artistName || '',
          album: current.collectionName || '', artwork: current.artworkUrl100
            ? [{ src: current.artworkUrl100.replace('100x100bb', '300x300bb'), sizes: '300x300', type: 'image/jpeg' }] : []
        });
        navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
      }
    }
  }
  function load(track) {
    if (!track || !track.previewUrl) return false;
    const same = current && current.trackId === track.trackId;
    current = track;
    if (!same) {
      audio.src = track.previewUrl;
      audio.load();
    }
    els.title.textContent = `${track.trackName || ''} — ${track.artistName || ''}`;
    els.player.classList.remove('hidden');
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    return true;
  }
  function toggle() {
    if (!audio.src) return;
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
    else { audio.pause(); setPlaying(false); }
  }
  function stop() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    current = null;
    els.player.classList.add('hidden');
    setPlaying(false);
  }

  els.play.addEventListener('click', toggle);
  els.seek.addEventListener('input', () => {
    const d = audio.duration || 30;
    audio.currentTime = (+els.seek.value / 100) * d;
    update();
  });
  els.volume.addEventListener('input', () => { audio.volume = +els.volume.value / 100; });
  els.close.addEventListener('click', stop);
  audio.addEventListener('timeupdate', update);
  audio.addEventListener('loadedmetadata', update);
  audio.addEventListener('ended', () => { setPlaying(false); update(); });
  if ('mediaSession' in navigator) {
    ['play', 'pause', 'stop'].forEach(action => {
      try { navigator.mediaSession.setActionHandler(action, action === 'play' ? toggle : action === 'pause' ? toggle : stop); } catch (e) {}
    });
  }

  return { load, toggle, stop, audio, get current() { return current; } };
}
