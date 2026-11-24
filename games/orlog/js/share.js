/** share.js — result card PNG e testo. */

export function resultText({ mode, boss, rounds, score, combo }) {
  return `⚔️ ORLOG — ${mode}\n${boss} defeated in ${rounds} rounds · ${score} pts · best combo ×${combo}`;
}

export function drawResultCard(canvas, { mode, boss, rounds, score, combo, stars = 0 }) {
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#071426');
  gradient.addColorStop(1, '#241436');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,209,102,.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  ctx.fillStyle = '#ffd166';
  ctx.font = '700 30px Georgia, serif';
  ctx.fillText('⚔️ ORLOG — VIKING DICE DUEL', 46, 76);
  ctx.fillStyle = '#eef3ff';
  ctx.font = '800 72px system-ui';
  ctx.fillText(String(score), 46, 188);
  ctx.font = '22px system-ui';
  ctx.fillStyle = '#9fb6d4';
  ctx.fillText(`${mode} · ${boss} · ${rounds} rounds · combo ×${combo}`, 46, 236);
  ctx.fillStyle = '#ffd166';
  ctx.font = '40px serif';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), 46, 300);
  ctx.fillStyle = '#9fb6d4';
  ctx.font = '18px system-ui';
  ctx.fillText(new Date().toLocaleDateString(), 46, 348);
}

export async function shareResult(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 400;
  drawResultCard(canvas, data);
  const text = resultText(data);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob && navigator.share && navigator.canShare) {
    const file = new File([blob], 'orlog.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Orlog', text }); return 'shared'; }
      catch (e) {}
    }
  }
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'orlog.png';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
  try { if (navigator.clipboard) await navigator.clipboard.writeText(text); } catch (e) {}
  return 'saved';
}
