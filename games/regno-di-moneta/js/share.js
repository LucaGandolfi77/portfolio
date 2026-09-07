// share.js — Generatore di share card condivisibili
window.Share = (() => {
  function generateShareCard(achievement) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#FF9500');
    grad.addColorStop(0.5, '#FF6B00');
    grad.addColorStop(1, '#E65100');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(200, 200, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(900, 800, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Achievement icon
    ctx.font = '140px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(achievement.icon || '🏆', 540, 350);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(achievement.title || 'Achievement!', 540, 500);

    // Description
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(achievement.desc || '', 540, 580);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 650);
    ctx.lineTo(780, 650);
    ctx.stroke();

    // Game title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.fillText('Il Regno di Moneta', 540, 730);

    // CTA
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Scarica ora gratis!', 540, 810);

    // Coin emoji decoration
    ctx.font = '60px serif';
    ctx.fillText('💰', 540, 910);

    return canvas.toDataURL('image/png');
  }

  function shareProgress() {
    const s = window.Save.get();
    const pct = window.Save.progress(18);
    const card = generateShareCard({
      icon: '🐉',
      title: `${pct}% Completato!`,
      desc: `${s.completedChapters.length}/18 capitoli • €${s.money}`
    });
    downloadCard(card, 'regno-di-moneta-progress.png');
  }

  function shareAchievement(ach) {
    const card = generateShareCard(ach);
    downloadCard(card, `regno-di-moneta-${ach.id}.png`);
  }

  function downloadCard(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Share nativo se disponibile
  async function nativeShare(ach) {
    const card = generateShareCard(ach);
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(card)).blob();
        const file = new File([blob], 'regno-di-moneta.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${ach.title} — Regno di Moneta`,
            text: `${ach.desc}! Scarica il gioco:`,
            files: [file]
          });
          return true;
        }
      } catch(e) {}
    }
    // Fallback: download
    downloadCard(card, `regno-di-moneta-${ach.id}.png`);
    return false;
  }

  return { generateShareCard, shareProgress, shareAchievement, nativeShare };
})();
