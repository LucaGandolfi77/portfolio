/** share.js — result card PNG e condivisione testuale. */

export function resultText({ mode, score, moves, combo, theme }) {
  return `🌸 Memory Garden — ${mode}\nScore ${score} · ${moves} moves · best ×${combo}\nTheme: ${theme}`;
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}
  try {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    return true;
  } catch (e) { return false; }
}

export function drawResultCard(canvas, { mode, score, moves, combo, theme, stars = 0 }) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width, height = canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0a0d1e');
  gradient.addColorStop(1, '#1b2a4a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.fillStyle = '#ffd166';
  ctx.font = '700 32px Georgia, serif';
  ctx.fillText('🌸 MEMORY GARDEN', 50, 84);
  ctx.fillStyle = '#eaf2ff';
  ctx.font = '800 76px system-ui';
  ctx.fillText(String(score), 50, 200);
  ctx.font = '24px system-ui';
  ctx.fillStyle = '#9fb6d4';
  ctx.fillText(`${mode} · ${moves} moves · best ×${combo}`, 50, 246);
  ctx.fillStyle = '#ffd166';
  ctx.font = '40px serif';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), 50, 310);
  ctx.fillStyle = '#9fb6d4';
  ctx.font = '20px system-ui';
  ctx.fillText(`Theme: ${theme} · ${new Date().toLocaleDateString()}`, 50, 360);
}

export function downloadCard(canvas, filename = 'memory-garden.png') {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
}

export async function shareResult(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 420;
  drawResultCard(canvas, data);
  const text = resultText(data);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob && navigator.share && navigator.canShare) {
    const file = new File([blob], 'memory-garden.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Memory Garden', text }); return 'shared'; }
      catch (e) { /* l'utente ha annullato */ }
    }
  }
  downloadCard(canvas);
  await copyText(text);
  return 'saved';
}
