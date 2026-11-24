/* Morse Studio — pure WAV generator (no DOM) */
import { durationSeconds, normalizeSymbols } from './codec.js';

export function buildSegments(morse, wpm = 14) {
  const unit = 1.2 / Math.max(1, wpm);
  const tokens = normalizeSymbols(morse).split(/\s+/).filter(Boolean);
  const segs = [];
  tokens.forEach(tok => {
    if (tok === '/') { segs.push({ type: 'silence', dur: unit * 7 }); return; }
    for (let i = 0; i < tok.length; i++) {
      if (tok[i] === '.') segs.push({ type: 'tone', dur: unit });
      else if (tok[i] === '-') segs.push({ type: 'tone', dur: unit * 3 });
      if (i < tok.length - 1) segs.push({ type: 'silence', dur: unit });
    }
    segs.push({ type: 'silence', dur: unit * 3 });
  });
  while (segs.length && segs[segs.length - 1].type === 'silence') segs.pop();
  return segs;
}

export function buildWav(morse, opts = {}) {
  const sampleRate = opts.sampleRate || 44100;
  const freq = opts.freq || 700;
  const amp = Math.max(0, Math.min(1, opts.volume == null ? 0.25 : opts.volume * 0.4));
  const wpm = opts.wpm || 14;
  const fade = opts.fade === false ? 0 : Math.min(0.02, 0.006);
  const segs = buildSegments(morse, wpm);
  const totalSamples = Math.max(1, Math.ceil(durationSeconds(morse, wpm) * sampleRate));
  const buffer = new Float32Array(totalSamples);
  let offset = 0;
  segs.forEach(seg => {
    const n = Math.floor(seg.dur * sampleRate);
    if (seg.type === 'silence') { offset += n; return; }
    for (let i = 0; i < n && offset < totalSamples; i++, offset++) {
      let env = 1;
      if (fade) {
        const t = i / sampleRate;
        if (t < fade) env = t / fade;
        const left = (n / sampleRate) - t;
        if (left < fade) env = Math.min(env, left / fade);
      }
      buffer[offset] = amp * env * Math.sin(2 * Math.PI * freq * (i / sampleRate));
    }
  });

  const bytes = new Uint8Array(44 + buffer.length * 2);
  const view = new DataView(bytes.buffer);
  let p = 0;
  const write = s => { for (let i = 0; i < s.length; i++) bytes[p++] = s.charCodeAt(i); };
  write('RIFF'); view.setUint32(p, 36 + buffer.length * 2, true); p += 4; write('WAVE');
  write('fmt '); view.setUint32(p, 16, true); p += 4;
  view.setUint16(p, 1, true); p += 2;
  view.setUint16(p, 1, true); p += 2;
  view.setUint32(p, sampleRate, true); p += 4;
  view.setUint32(p, sampleRate * 2, true); p += 4;
  view.setUint16(p, 2, true); p += 2;
  view.setUint16(p, 16, true); p += 2;
  write('data'); view.setUint32(p, buffer.length * 2, true); p += 4;
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(p + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return bytes;
}

export function wavBlob(morse, opts) {
  return new Blob([buildWav(morse, opts)], { type: 'audio/wav' });
}
