#!/usr/bin/env node
// Generate PNG icons for SHHH from the SVG concept.
// Uses only Node.js built-ins (zlib, fs). Draws a simple geometric icon.
// Output: icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png, icons/icon-180.png

import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BG = [10, 10, 10]
const RING = [233, 69, 96]
const S_COLOR = [233, 69, 96]

function createPNG(w, h, draw) {
  const channels = 4
  const raw = Buffer.alloc(w * h * channels)
  const stride = w * channels

  // fill background
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * stride + x * channels
      raw[i] = BG[0]; raw[i+1] = BG[1]; raw[i+2] = BG[2]; raw[i+3] = 255
    }
  }

  draw(raw, w, h, stride)

  // PNG chunk helpers
  const crc = (buf) => {
    let c = 0xFFFFFFFF
    for (const b of buf) {
      c ^= b
      for (let k = 0; k < 8; k++)
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    return (c ^ 0xFFFFFFFF) >>> 0
  }

  const chunks = []
  const sig = Buffer.from([137,80,78,71,13,10,26,10])

  const makeChunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc(Buffer.concat([typeBuf, data])), 0)
    chunks.push(len, typeBuf, data, crcBuf)
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGBA
  makeChunk('IHDR', ihdr)

  // IDAT (compressed scanlines with filter byte)
  const compressed = []
  for (let y = 0; y < h; y++) {
    compressed.push(0) // filter byte none
    for (let x = 0; x < w; x++) {
      const src = y * stride + x * channels
      compressed.push(raw[src], raw[src+1], raw[src+2], raw[src+3])
    }
  }
  const idat = Buffer.from(deflateSync(Buffer.from(compressed)))
  makeChunk('IDAT', idat)

  // IEND
  makeChunk('IEND', Buffer.alloc(0))

  const buf = Buffer.concat([sig, ...chunks])
  return buf
}

function drawRing(buf, w, h, stride) {
  const cx = w / 2, cy = h / 2
  const outerR = Math.min(w, h) * 0.42
  const innerR = outerR - Math.min(w, h) * 0.05

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist >= innerR && dist <= outerR) {
        const i = y * stride + x * 4
        buf[i] = RING[0]; buf[i+1] = RING[1]; buf[i+2] = RING[2]; buf[i+3] = 255
      }
    }
  }
}

function drawS(buf, w, h, stride) {
  const cx = w / 2, cy = h / 2
  const s = w * 0.35
  const half = s / 2

  // Simple S-shape using filled rectangles with rounded corners approximated by boxes
  // Top horizontal bar
  const topY = cy - s * 0.6
  const botY = cy + s * 0.6
  const midY = cy
  const barH = s * 0.22

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy
      let inS = false
      // Top bar
      if (dy > -s*0.6 - barH/2 && dy < -s*0.6 + barH/2 && Math.abs(dx) < half) inS = true
      // Bottom bar
      if (dy > s*0.6 - barH/2 && dy < s*0.6 + barH/2 && Math.abs(dx) < half) inS = true
      // Left vertical
      if (dx < -half + barH/2 && dx > -half - barH/2 && dy > -s*0.6 + barH/2 && dy < midY - barH/2) inS = true
      // Right vertical
      if (dx < half - barH/2 && dx > half + barH/2 && dy > midY - barH/2 && dy < s*0.6 + barH/2) inS = true
      // Middle horizontal
      if (dy > midY - barH/2 && dy < midY + barH/2 && Math.abs(dx) < half) inS = true

      if (inS) {
        const i = y * stride + x * 4
        buf[i] = S_COLOR[0]; buf[i+1] = S_COLOR[1]; buf[i+2] = S_COLOR[2]; buf[i+3] = 255
      }
    }
  }
}

function drawSForMask(buf, w, h, stride) {
  // Maskable: draw S centered with safe zone padding
  drawS(buf, w, h, stride)
}

const sizes = [192, 512]
const names = { 192: 'icon-192.png', 512: 'icon-512.png', 180: 'icon-180.png' }

mkdirSync('icons', { recursive: true })

for (const s of [192, 512]) {
  const buf = createPNG(s, s, (raw, w, h, stride) => {
    drawRing(raw, w, h, stride)
    drawS(raw, w, h, stride)
  })
  writeFileSync(`icons/${names[s]}`, buf)
}

// maskable 512 - S centered with 10% padding
{
  const s = 512
  const buf = createPNG(s, s, (raw, w, h, stride) => {
    drawRing(raw, w, h, stride)
    // For maskable, draw S slightly smaller to preserve safe zone
    const cx = w/2, cy = h/2, oldHalf = s * 0.35
    // just reuse, ring already has padding
    drawS(raw, w, h, stride)
  })
  writeFileSync('icons/icon-maskable-512.png', buf)
}

// icon-180 for apple-touch-icon
{
  const buf = createPNG(180, 180, (raw, w, h, stride) => {
    drawRing(raw, w, h, stride)
    drawS(raw, w, h, stride)
  })
  writeFileSync('icons/icon-180.png', buf)
}

console.log('Icons generated:')
for (const [size, name] of Object.entries(names)) console.log(`  ${name} (${size}x${size})`)
console.log('  icon-maskable-512.png')
console.log('  icon-180.png (apple-touch)')
