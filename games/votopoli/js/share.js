// share.js — Canvas share cards for VOTOPOLI
window.Share = (() => {
  const W = 1080, H = 1080;

  function createCanvas() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    return c;
  }

  function drawBase(ctx) {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#FF9500');
    grad.addColorStop(0.5, '#E67E00');
    grad.addColorStop(1, '#CC6600');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(200, 200, 300, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(900, 800, 250, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawText(ctx, text, y, size, alpha, align) {
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.fillStyle = `rgba(255,255,255,${alpha || 1})`;
    ctx.textAlign = align || 'center';
    ctx.fillText(text, W / 2, y);
  }

  function generateProgress(state) {
    const c = createCanvas();
    const ctx = c.getContext('2d');
    drawBase(ctx);

    const city = World.getCity(state.city);
    const country = World.getCountry(state.country);
    const home = World.getHome(state.home);

    drawText(ctx, '🗳️', 280, 140);
    drawText(ctx, 'VOTOPOLI', 420, 64);
    drawText(ctx, 'La Democrazia è un Gioco', 480, 30, 0.7);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 540); ctx.lineTo(780, 540); ctx.stroke();

    drawText(ctx, `${country.flag} ${city.name}`, 620, 44);
    drawText(ctx, `${home.emoji} ${home.name} · ${Save.formatMoney(state.money)}`, 680, 32, 0.85);
    drawText(ctx, `🗳️ ${state.votesCast} voti · 📰 ${state.scandals} scandali`, 730, 28, 0.7);
    drawText(ctx, 'Scarica ora gratis!', 850, 36, 0.7);

    return c.toDataURL('image/png');
  }

  function generateAchievement(ach) {
    const c = createCanvas();
    const ctx = c.getContext('2d');
    drawBase(ctx);

    drawText(ctx, ach.icon, 300, 140);
    drawText(ctx, ach.title, 440, 52);
    drawText(ctx, ach.desc, 500, 32, 0.8);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 560); ctx.lineTo(780, 560); ctx.stroke();

    drawText(ctx, '🗳️ VOTOPOLI', 640, 48);
    drawText(ctx, 'La Democrazia è un Gioco', 700, 30, 0.7);
    drawText(ctx, 'Scarica ora gratis!', 820, 36, 0.7);

    return c.toDataURL('image/png');
  }

  function generateElection(result, cityName) {
    const c = createCanvas();
    const ctx = c.getContext('2d');
    drawBase(ctx);

    drawText(ctx, result.winner.partyEmoji, 280, 140);
    drawText(ctx, `${result.winner.name}`, 420, 48);
    drawText(ctx, `${result.winner.party}`, 470, 32, 0.8);
    drawText(ctx, `vince le elezioni di ${cityName}!`, 530, 28, 0.7);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 580); ctx.lineTo(780, 580); ctx.stroke();

    drawText(ctx, '🗳️ VOTOPOLI', 660, 48);
    drawText(ctx, 'La Democrazia è un Gioco', 720, 30, 0.7);
    drawText(ctx, 'Scarica ora gratis!', 840, 36, 0.7);

    return c.toDataURL('image/png');
  }

  function downloadCard(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function nativeShare(title, text, dataUrl) {
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'votopoli.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title, text, files: [file] });
          return true;
        }
      } catch(e) {}
    }
    return false;
  }

  async function shareProgress(state) {
    const card = generateProgress(state);
    const shared = await nativeShare(
      'Votopoli — La Democrazia è un Gioco',
      `Sono a ${World.getCity(state.city).name} con ${Save.formatMoney(state.money)}!`,
      card
    );
    if (!shared) downloadCard(card, 'votopoli-progress.png');
    return shared;
  }

  async function shareAchievement(ach) {
    const card = generateAchievement(ach);
    const shared = await nativeShare(
      `${ach.title} — Votopoli`,
      `${ach.desc}! Scarica il gioco:`,
      card
    );
    if (!shared) downloadCard(card, `votopoli-${ach.id}.png`);
    return shared;
  }

  async function shareElection(result, cityName) {
    const card = generateElection(result, cityName);
    const shared = await nativeShare(
      `${result.winner.name} vince! — Votopoli`,
      `${result.winner.name} del ${result.winner.party} è il nuovo sindaco di ${cityName}!`,
      card
    );
    if (!shared) downloadCard(card, `votopoli-election-${cityName}.png`);
    return shared;
  }

  return { shareProgress, shareAchievement, shareElection };
})();
