/** share.js — result card PNG e testo. */

import { shareText } from './progress.js';

export function drawCard(canvas, state) {
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0d2a24');
  gradient.addColorStop(1, '#3d2a1e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,209,102,.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  ctx.fillStyle = '#ffd166';
  ctx.font = '700 30px Georgia, serif';
  ctx.fillText('🌿 ORTO MAGICO', 46, 72);
  ctx.fillStyle = '#eef3ff';
  ctx.font = '800 72px system-ui';
  ctx.fillText(String(state.totalHarvests || 0), 46, 180);
  ctx.font = '22px system-ui';
  ctx.fillStyle = '#9fb6d4';
  ctx.fillText(`raccolti · livello ${state.level || 1} · ${state.coins || 0} monete`, 46, 224);
  ctx.fillStyle = '#7cf5b4';
  ctx.font = '24px system-ui';
  ctx.fillText(`${Object.keys(state.collection || {}).length} varietà scoperte`, 46, 270);
  ctx.fillStyle = '#9fb6d4';
  ctx.font = '18px system-ui';
  ctx.fillText(new Date().toLocaleDateString('it-IT'), 46, 316);
}

export async function share(state) {
  const canvas = document.createElement('canvas');
  canvas.width = 760; canvas.height = 360;
  drawCard(canvas, state);
  const text = shareText(state);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob && navigator.share && navigator.canShare) {
    const file = new File([blob], 'orto-magico.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Orto Magico', text }); return 'shared'; }
      catch (e) {}
    }
  }
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'orto-magico.png';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
  try { if (navigator.clipboard) await navigator.clipboard.writeText(text); } catch (e) {}
  return 'saved';
}
