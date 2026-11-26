/*
 * Minimal PNG decoder (no dependencies): non-interlaced, colour types
 * 0 (grey), 2 (RGB), 3 (palette, 1-8 bit), 4 (grey+alpha), 6 (RGBA), 8 bit
 * per channel. Returns { width, height, data } with RGBA bytes.
 */
import { inflateSync } from 'node:zlib';

export function decodePng(buffer) {
  const sig = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== sig) throw new Error('not a PNG');
  let pos = 8;
  let width = 0, height = 0, depth = 0, type = 0, interlace = 0;
  let palette = null;
  let trns = null;
  const idat = [];
  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const name = buffer.toString('latin1', pos + 4, pos + 8);
    const chunk = buffer.subarray(pos + 8, pos + 8 + len);
    if (name === 'IHDR') {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      depth = chunk[8];
      type = chunk[9];
      interlace = chunk[12];
    } else if (name === 'PLTE') palette = chunk;
    else if (name === 'tRNS') trns = chunk;
    else if (name === 'IDAT') idat.push(chunk);
    else if (name === 'IEND') break;
    pos += 12 + len;
  }
  if (interlace) throw new Error('interlaced PNG not supported');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  if (!channels) throw new Error(`PNG colour type ${type} not supported`);
  if (type !== 3 && depth !== 8) throw new Error(`PNG bit depth ${depth} not supported`);
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = Math.max(1, (channels * depth) >> 3);
  const stride = Math.ceil((width * channels * depth) / 8);
  const lines = Buffer.alloc(stride * height);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = lines.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v = src[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[i] = v & 255;
    }
    prev = out;
  }
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const row = lines.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (type === 3) {
        const perByte = 8 / depth;
        const byte = row[Math.floor(x / perByte)];
        const shift = 8 - depth * ((x % perByte) + 1);
        const idx = (byte >> shift) & ((1 << depth) - 1);
        data[o] = palette[idx * 3];
        data[o + 1] = palette[idx * 3 + 1];
        data[o + 2] = palette[idx * 3 + 2];
        data[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
      } else if (type === 0 || type === 4) {
        const g = row[x * channels];
        data[o] = data[o + 1] = data[o + 2] = g;
        data[o + 3] = type === 4 ? row[x * channels + 1] : 255;
      } else {
        data[o] = row[x * channels];
        data[o + 1] = row[x * channels + 1];
        data[o + 2] = row[x * channels + 2];
        data[o + 3] = type === 6 ? row[x * channels + 3] : 255;
      }
    }
  }
  return { width, height, data };
}
