/* DITTOPIA — weather, ambient particles and photo mode */

const MAX = 180;

export function createEffects() {
  return {
    particles: Array.from({ length: MAX }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '#fff', size: 2 })),
    weather: 'clear',
    season: 'spring',
    flash: 0
  };
}

function spawn(effects, x, y, vx, vy, color, life, size) {
  for (const p of effects.particles) {
    if (p.active) continue;
    Object.assign(p, { active: true, x, y, vx, vy, life, color, size });
    return;
  }
}

export function burst(effects, x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 80;
    spawn(effects, x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, 0.5 + Math.random() * 0.5, 2 + Math.random() * 2);
  }
}

export function seasonOf(day) {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  return seasons[Math.floor(day / 7) % 4];
}

export function weatherOf(zone, season, isNight) {
  if (zone.id === 'cave') return 'cave';
  if (zone.id === 'frost' || season === 'winter') return 'snow';
  if (season === 'autumn') return 'dust';
  if (isNight && Math.random() < 0.02) return 'rain';
  return zone.weather || 'clear';
}

export function updateEffects(effects, dt, width, height, weather) {
  effects.weather = weather;
  const rate = weather === 'rain' ? 0.5 : weather === 'snow' ? 0.18 : weather === 'dust' ? 0.12 : 0.05;
  if (Math.random() < rate) {
    const color = weather === 'rain' ? '#9fd8ff' : weather === 'snow' ? '#ffffff' : weather === 'dust' ? '#e0b878' : '#b6ff9a';
    const x = Math.random() * width;
    const y = -10;
    const vx = weather === 'rain' ? -40 : (Math.random() - 0.5) * 20;
    const vy = weather === 'rain' ? 420 : weather === 'snow' ? 45 : 25;
    spawn(effects, x, y, vx, vy, color, weather === 'rain' ? 1.8 : 5, weather === 'snow' ? 2 : 1.5);
  }
  for (const p of effects.particles) {
    if (!p.active) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.y > height + 10 || p.life <= 0) p.active = false;
  }
  effects.flash = Math.max(0, effects.flash - dt * 2);
}

export function drawEffects(ctx, effects) {
  for (const p of effects.particles) {
    if (!p.active) continue;
    ctx.globalAlpha = Math.min(0.85, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

export function photo(canvas) {
  try { return canvas.toDataURL('image/png'); }
  catch (e) { return null; }
}

export function downloadPhoto(dataUrl, name = 'dittopia.png') {
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  a.click();
}
