/**
 * audio.js — decode/resample, VAD a energia, visualizzazioni e registrazione.
 */

export async function decodeAudio(blob, targetRate = 16000) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('AudioContext non disponibile');
  const context = new AudioContextClass();
  let buffer;
  try { buffer = await context.decodeAudioData(await blob.arrayBuffer()); }
  finally { try { await context.close(); } catch (e) {} }
  let channel = buffer.getChannelData(0);
  if (buffer.numberOfChannels > 1) {
    const mixed = new Float32Array(buffer.length);
    for (let c = 0; c < buffer.numberOfChannels; c += 1) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i += 1) mixed[i] += data[i] / buffer.numberOfChannels;
    }
    channel = mixed;
  }
  if (buffer.sampleRate !== targetRate) channel = resample(channel, buffer.sampleRate, targetRate);
  return { samples: channel, rate: targetRate, duration: channel.length / targetRate };
}

export function resample(input, fromRate, toRate) {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const output = new Float32Array(length);
  let position = 0;
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(position);
    const fraction = position - index;
    output[i] = input[index] * (1 - fraction) + (input[Math.min(index + 1, input.length - 1)] || 0) * fraction;
    position += ratio;
  }
  return output;
}

/** VAD semplice a energia: rimuove il silenzio ai margini. */
export function trimSilence(samples, rate = 16000, frameMs = 20, padMs = 120) {
  if (!samples || samples.length < rate / 10) return { samples, trimmedMs: 0, frames: 0 };
  const frameSize = Math.max(1, Math.floor(rate * frameMs / 1000));
  const frames = Math.floor(samples.length / frameSize);
  const energies = [];
  for (let f = 0; f < frames; f += 1) {
    let sum = 0;
    for (let i = 0; i < frameSize; i += 1) {
      const value = samples[f * frameSize + i];
      sum += value * value;
    }
    energies.push(Math.sqrt(sum / frameSize));
  }
  const sorted = energies.slice().sort((a, b) => a - b);
  const noise = sorted[Math.floor(sorted.length * 0.2)] || 0;
  const threshold = Math.max(0.008, noise * 2.2);
  let first = energies.findIndex((value) => value > threshold);
  let last = -1;
  for (let i = energies.length - 1; i >= 0; i -= 1) { if (energies[i] > threshold) { last = i; break; } }
  if (first < 0 || last <= first) return { samples, trimmedMs: 0, frames };
  const padding = Math.floor(padMs / frameMs);
  const start = Math.max(0, (first - padding) * frameSize);
  const end = Math.min(samples.length, (last + padding + 1) * frameSize);
  return { samples: samples.slice(start, end), trimmedMs: Math.round(((start + (samples.length - end)) / rate) * 1000), frames };
}

function prepareCanvas(canvas) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const width = canvas.clientWidth || 400, height = canvas.clientHeight || 76;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

export function drawWave(canvas, samples, colors = ['#4de8ff', '#a98bff']) {
  if (!canvas || !samples) return;
  const { ctx, width, height } = prepareCanvas(canvas);
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  const step = Math.max(1, Math.floor(samples.length / width));
  for (let px = 0; px < width; px += 1) {
    let min = 0, max = 0;
    for (let k = 0; k < step; k += 1) {
      const value = samples[px * step + k] || 0;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    ctx.moveTo(px, height / 2 - max * height * 0.45);
    ctx.lineTo(px, height / 2 - min * height * 0.45);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(140,190,255,.18)';
  ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
}

/** Spettro a bande con DFT naive su una finestra campionata. */
export function drawSpectrum(canvas, samples, bands = 28) {
  if (!canvas || !samples) return;
  const { ctx, width, height } = prepareCanvas(canvas);
  const windowSize = Math.min(1024, Math.max(128, samples.length));
  const offset = Math.max(0, Math.floor((samples.length - windowSize) / 2));
  const values = [];
  for (let band = 0; band < bands; band += 1) {
    const frequency = 2 + band * 14;
    let real = 0, imaginary = 0;
    for (let i = 0; i < windowSize; i += 1) {
      const angle = (2 * Math.PI * frequency * i) / windowSize;
      const value = samples[offset + i] || 0;
      real += value * Math.cos(angle);
      imaginary += value * Math.sin(angle);
    }
    values.push(Math.sqrt(real * real + imaginary * imaginary) / windowSize);
  }
  const peak = Math.max(0.001, ...values);
  const barWidth = width / bands;
  for (let band = 0; band < bands; band += 1) {
    const ratio = values[band] / peak;
    const barHeight = Math.max(2, ratio * height * 0.9);
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
    gradient.addColorStop(0, '#4de8ff');
    gradient.addColorStop(1, '#a98bff');
    ctx.fillStyle = gradient;
    ctx.fillRect(band * barWidth + 1, height - barHeight, Math.max(1, barWidth - 2), barHeight);
  }
}

export function pickMime() {
  if (!window.MediaRecorder) return '';
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return options.find((type) => { try { return MediaRecorder.isTypeSupported(type); } catch (e) { return false; } }) || '';
}

export function createRecorder() {
  let stream = null, recorder = null, chunks = [];
  return {
    get active() { return !!recorder && recorder.state === 'recording'; },
    async start() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      const mime = pickMime();
      try { recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
      catch (e) { recorder = new MediaRecorder(stream); }
      recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
      recorder.start(250);
    },
    stop() {
      return new Promise((resolve) => {
        if (!recorder) { resolve(null); return; }
        recorder.onstop = () => {
          stream && stream.getTracks().forEach((track) => track.stop());
          stream = null; recorder = null;
          resolve(chunks.length ? new Blob(chunks, { type: chunks[0].type || 'audio/webm' }) : null);
        };
        recorder.stop();
      });
    },
    cancel() {
      try { recorder && recorder.stop(); } catch (e) {}
      stream && stream.getTracks().forEach((track) => track.stop());
      stream = null; recorder = null; chunks = [];
    }
  };
}
