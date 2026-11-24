/* Streaming — media player with Media Session, PiP and queue orchestration */
import { isYoutube, ytIdOf } from './api.js';

export class Player {
  constructor(els, hooks = {}) {
    this.els = els; this.hooks = hooks;
    this.video = null; this.current = null; this.queue = [];
    this.mode = 'video';
  }
  open(item) {
    this.current = item;
    this.els.player.classList.remove('hidden');
    this.els.title.textContent = item.title || '';
    this.hooks.onOpen?.(item);
    if (item.source === 'youtube' || isYoutube(item.url)) return this.youtube(item);
    return this.videoPlayer(item);
  }
  videoPlayer(item) {
    this.mode = 'video';
    this.els.area.innerHTML = `<div class="player-box"><video id="streamVideo" controls playsinline preload="metadata" crossorigin="anonymous"></video></div>`;
    const v = document.getElementById('streamVideo');
    this.video = v;
    v.src = item.url;
    if (item.thumb) v.poster = item.thumb;
    v.volume = this.hooks.volume?.() ?? 0.8;
    v.playbackRate = this.hooks.speed?.() ?? 1;
    v.addEventListener('loadedmetadata', () => {
      const resume = this.hooks.position?.(item.id) || 0;
      if (resume > 5 && resume < v.duration - 10) v.currentTime = resume;
      v.play().catch(() => {});
    });
    v.addEventListener('timeupdate', () => {
      this.hooks.onTime?.(item.id, v.currentTime);
    });
    v.addEventListener('ended', () => this.hooks.onEnded?.());
    this.mediaSession(item);
    return v;
  }
  youtube(item) {
    this.mode = 'youtube';
    const id = ytIdOf(item.url) || item.id;
    this.els.area.innerHTML = `<div class="player-box"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&playsinline=1&autoplay=1"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    this.video = null;
    this.mediaSession(item);
  }
  mediaSession(item) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title || '', artist: item.creator || 'Internet Archive',
        artwork: item.thumb ? [{ src: item.thumb, sizes: '512x512', type: 'image/jpeg' }] : []
      });
      navigator.mediaSession.setActionHandler('play', () => this.video?.play());
      navigator.mediaSession.setActionHandler('pause', () => this.video?.pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.hooks.onNext?.());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.hooks.onPrev?.());
    } catch (e) {}
  }
  setSpeed(speed) { if (this.video) this.video.playbackRate = speed; }
  setVolume(v) { if (this.video) this.video.volume = v; }
  async pip() {
    if (!this.video || !document.pictureInPictureEnabled) return false;
    try { await this.video.requestPictureInPicture(); return true; } catch (e) { return false; }
  }
  fullscreen() {
    const box = this.els.area.querySelector('.player-box');
    if (!box) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else box.requestFullscreen?.();
  }
  close() {
    try { this.video?.pause(); } catch (e) {}
    if (this.video) this.hooks.onTime?.(this.current?.id, this.video.currentTime);
    this.els.area.innerHTML = '';
    this.els.player.classList.add('hidden');
    this.video = null; this.current = null;
    try { navigator.mediaSession.metadata = null; } catch (e) {}
  }
}
