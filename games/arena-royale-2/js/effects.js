/* Arena Royale 2 — visual effects, confetti, toasts and combat feedback */

import * as THREE from 'three';
import { G } from './state.js';
import { rand } from './config.js';

let els = {};
let toastTimer = 0;
let confettiRaf = 0;
let confettiParts = [];
const CONFETTI_COLORS = ['#ffd166', '#ff6b5e', '#5ac8e0', '#58d66b', '#ff5ec4', '#b06ad0', '#ffffff'];

export function initEffects(elements) { els = elements; }

export function addShake(amount) { G.shake = Math.min(G.shake + amount, 1.3); }

/* ---------- 3D particles ---------- */
export function spawnParticle(x, y, z, vx, vy, vz, color, life, size, gravity = true) {
  if (!G.scene) return;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 6, 5),
    new THREE.MeshBasicMaterial({ color, transparent: true })
  );
  mesh.position.set(x, y, z);
  G.scene.add(mesh);
  G.particles.push({ mesh, vel: new THREE.Vector3(vx, vy, vz), life, t: 0, gravity });
}

export function poof(x, y, z, color, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(2, 7);
    spawnParticle(x + rand(-0.2, 0.2), y + rand(0, 1.4), z + rand(-0.2, 0.2),
      Math.cos(a) * sp, rand(2, 6), Math.sin(a) * sp, color, rand(0.4, 0.8), rand(0.16, 0.3));
  }
}

export function updateParticles(dt) {
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const p = G.particles[i];
    p.t += dt;
    if (p.t >= p.life) {
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      G.scene.remove(p.mesh);
      G.particles.splice(i, 1);
      continue;
    }
    if (p.gravity) p.vel.y -= 12 * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    const k = 1 - p.t / p.life;
    p.mesh.material.opacity = Math.min(1, k * 1.6);
    p.mesh.scale.setScalar(0.6 + k * 0.8);
  }
}

export function explosionRing(x, z) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffa050, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.25, z);
  G.scene.add(ring);
  G.explosions.push({ mesh: ring, t: 0 });
}

export function updateExplosions(dt) {
  for (let i = G.explosions.length - 1; i >= 0; i--) {
    const ex = G.explosions[i];
    ex.t += dt / 0.35;
    const s = 0.8 + ex.t * 12;
    ex.mesh.scale.set(s, s, s);
    ex.mesh.material.opacity = Math.max(0, 1 - ex.t);
    if (ex.t >= 1) {
      ex.mesh.geometry.dispose();
      ex.mesh.material.dispose();
      G.scene.remove(ex.mesh);
      G.explosions.splice(i, 1);
    }
  }
}

/* ---------- DOM feedback ---------- */
export function spawnDamageNumber(entity, amount, onPlayer, crit) {
  if (!G.camera || !entity) return;
  const v = entity.pos.clone().add(new THREE.Vector3(rand(-0.3, 0.3), 1.7, rand(-0.3, 0.3))).project(G.camera);
  if (v.z > 1) return;
  const x = ((v.x + 1) / 2) * window.innerWidth;
  const y = ((-v.y + 1) / 2) * window.innerHeight;
  if (x < -30 || x > window.innerWidth + 30 || y < -30 || y > window.innerHeight + 30) return;
  const el = document.createElement('div');
  el.className = 'dmg-num' + (crit ? ' crit' : '') + (onPlayer ? ' enemy' : '');
  el.textContent = '-' + amount;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  els.damageNumbers.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

export function flashHit() {
  if (!els.flashOverlay) return;
  els.flashOverlay.classList.remove('hit');
  void els.flashOverlay.offsetWidth;
  els.flashOverlay.classList.add('hit');
}

export function toast(message, ms = 1800) {
  if (!els.toast) return;
  els.toastText.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), ms);
}

export function killFeed(text, tone = '') {
  const feed = els.killFeed;
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'kill-item ' + tone;
  item.textContent = text;
  feed.prepend(item);
  while (feed.children.length > 5) feed.lastChild.remove();
  setTimeout(() => item.remove(), 3200);
}

export function damageDirection(source, target) {
  const el = els.damageDir;
  if (!el) return;
  const dx = source.x - target.x;
  const dz = source.z - target.z;
  const ang = Math.atan2(dx, -dz) * 180 / Math.PI;
  el.style.setProperty('--r', ang + 'deg');
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 900);
}

/* ---------- Confetti (dt-based, DPR-aware) ---------- */
export function startConfetti() {
  const cv = els.confettiCanvas;
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(window.innerWidth * dpr);
  cv.height = Math.round(window.innerHeight * dpr);
  cv.style.width = window.innerWidth + 'px';
  cv.style.height = window.innerHeight + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv.classList.add('show');
  confettiParts = [];
  for (let i = 0; i < 150; i++) {
    confettiParts.push({
      x: rand(0, window.innerWidth),
      y: rand(-window.innerHeight * 0.6, -20),
      w: rand(5, 10), h: rand(8, 14),
      vx: rand(-30, 30), vy: rand(120, 320),
      rot: Math.random() * Math.PI, vr: rand(-5, 5),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      sway: rand(0, Math.PI * 2)
    });
  }
  let last = performance.now();
  const step = now => {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of confettiParts) {
      p.sway += dt * 3;
      p.x += (p.vx + Math.sin(p.sway) * 26) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y < window.innerHeight + 30) alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive > 0) confettiRaf = requestAnimationFrame(step);
    else { cv.classList.remove('show'); ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); confettiRaf = 0; }
  };
  cancelAnimationFrame(confettiRaf);
  confettiRaf = requestAnimationFrame(step);
}

export function stopConfetti() {
  cancelAnimationFrame(confettiRaf);
  confettiRaf = 0;
  confettiParts = [];
  if (els.confettiCanvas) els.confettiCanvas.classList.remove('show');
}
