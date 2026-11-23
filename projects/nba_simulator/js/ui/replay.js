/* Replay playback and WebM export */

import { frameAt } from '../sim/replay.js';
import { createCourt2D } from '../render/court-2d.js';

export function createReplayPlayer(canvas, replay, onFrame = () => {}) {
  const court = createCourt2D(canvas);
  if (!court) return null;
  let raf = 0;
  let playing = false;
  let start = 0;
  let offset = 0;
  let progress = 0;
  const duration = Math.max(2500, Math.min(22000, (replay.events || []).length * 260));

  function resize(w, h, dpr) { court.resize(w, h, dpr || 1); }

  function draw(p) {
    const frame = frameAt(replay, p);
    if (!frame) return;
    const state = {
      players: [],
      homeColor: replay.homeColor,
      awayColor: replay.awayColor,
      ball: frame.shot ? { x: frame.shot.x / 500, y: frame.shot.y / 500 } : { x: 0.5, y: 0.5 }
    };
    court.draw(state, performance.now());
    const ctx = canvas.getContext('2d');
    const dpr = canvas.width / Math.max(1, canvas.clientWidth || 1);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(8, 8, 190, 44);
    ctx.fillStyle = '#fff';
    ctx.font = '900 20px Inter, sans-serif';
    ctx.fillText(`${replay.home} ${frame.score.home}–${frame.score.away} ${replay.away}`, 18, 37);
    ctx.restore();
    onFrame(frame, p);
  }

  function loop(now) {
    if (!playing) return;
    progress = Math.min(1, (now - start + offset) / duration);
    draw(progress);
    if (progress >= 1) { playing = false; return; }
    raf = requestAnimationFrame(loop);
  }

  function play() {
    if (playing) return;
    playing = true;
    start = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(raf);
    offset = progress * duration;
  }

  function seek(p) {
    progress = Math.max(0, Math.min(1, p));
    offset = progress * duration;
    start = performance.now();
    draw(progress);
  }

  function stop() { pause(); progress = 0; offset = 0; draw(0); }

  function exportWebM(seconds = 6) {
    if (!canvas.captureStream || typeof MediaRecorder === 'undefined') return Promise.resolve(null);
    const stream = canvas.captureStream(30);
    const chunks = [];
    const mime = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm';
    let recorder;
    try { recorder = new MediaRecorder(stream, { mimeType: mime }); }
    catch (e) { return Promise.resolve(null); }
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    return new Promise(resolve => {
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); resolve(new Blob(chunks, { type: 'video/webm' })); };
      recorder.start();
      seek(0);
      play();
      setTimeout(() => { recorder.stop(); pause(); }, Math.min(seconds * 1000, duration));
    });
  }

  return { play, pause, seek, stop, resize, exportWebM, draw, duration, get playing() { return playing; } };
}
