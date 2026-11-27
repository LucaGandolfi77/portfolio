/* ============================================================
   Bar Blu — the journal: memories, Anna's postcards, endings
   ------------------------------------------------------------
   Postcards are drawn on the fly from the scene where they were
   made: the Blender render turned to charcoal on warm paper, the
   silhouettes that were on stage, and Anna's caption.
   ============================================================ */
import { CAST, silhouette } from '../cast.js';

const ENDINGS = {
  luce: { title: 'La luce', text: 'Le tre sorelle spente. La saletta piena di stelle.' },
  tramonto: { title: 'Il tramonto', text: 'Quattro mesi senza musichetta, poi la serranda abbassata, puliti.' },
  ronzio: { title: 'Il ronzio', text: 'Il bar sopravvive. La musichetta, anche.' },
  buio: { title: 'Il buio', text: 'Lucky Star. Quattordici macchine e nessun caffè.' },
};
export { ENDINGS };

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Draws one postcard to a canvas and returns it. */
export async function drawPostcard(card) {
  const W = 960, H = 640;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  // paper
  ctx.fillStyle = '#efe6d4';
  ctx.fillRect(0, 0, W, H);
  const img = await loadImage(`art/${card.bg}.webp`);
  const pad = 34, iw = W - pad * 2, ih = H - pad * 2 - 70;
  if (img) {
    const scale = Math.max(iw / img.width, ih / img.height);
    const sw = iw / scale, sh = ih / scale;
    const sx = (img.width - sw) / 2, sy = Math.max(0, (img.height - sh) * 0.42);
    ctx.save();
    ctx.filter = 'grayscale(1) contrast(1.7) brightness(1.45)';
    ctx.globalAlpha = 0.92;
    ctx.drawImage(img, sx, sy, sw, sh, pad, pad, iw, ih);
    ctx.restore();
  }
  // silhouettes, as charcoal shapes
  const ids = (card.actors || []).filter((id) => CAST[id]?.look).slice(0, 3);
  for (let i = 0; i < ids.length; i++) {
    const c = CAST[ids[i]];
    const svg = silhouette(c.look, '#2a2622', 'pc' + i).replace('#0c0f1a', '#1e1b18');
    const sil = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    if (!sil) continue;
    const h = ih * 0.62;
    const w = h * 200 / 240;
    const x = pad + iw * ((i + 1) / (ids.length + 1)) - w / 2;
    ctx.globalAlpha = 0.88;
    ctx.drawImage(sil, x, pad + ih - h, w, h);
    ctx.globalAlpha = 1;
  }
  // grain and hatching
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = `rgba(90,70,50,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  ctx.strokeStyle = 'rgba(40,30,20,0.08)';
  for (let i = 0; i < 90; i++) {
    const x = pad + Math.random() * iw, y = pad + Math.random() * ih, l = 20 + Math.random() * 60;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * 0.7, y - l * 0.7); ctx.stroke();
  }
  ctx.restore();
  // warm wash and vignette
  ctx.fillStyle = 'rgba(214,170,110,0.16)';
  ctx.fillRect(pad, pad, iw, ih);
  const vg = ctx.createRadialGradient(W / 2, H / 2 - 30, ih * 0.3, W / 2, H / 2 - 30, ih * 0.9);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(60,40,20,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(pad, pad, iw, ih);
  // caption
  ctx.fillStyle = '#2b2118';
  ctx.font = 'italic 34px "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
  ctx.textAlign = 'left';
  ctx.fillText(card.caption, pad + 6, H - 34);
  ctx.font = '22px "Bradley Hand", "Segoe Print", cursive';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b5440';
  ctx.fillText(`${card.night || ''} — A.`, W - pad - 6, H - 36);
  return cv;
}

export function renderJournal(root, save, tab = 'persone') {
  const body = root.querySelector('.jr-body');
  root.querySelectorAll('.jr-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  body.innerHTML = '';
  if (tab === 'persone') {
    const ids = Object.keys(CAST).filter((id) => CAST[id].look && id !== 'cliente');
    let any = false;
    for (const id of ids) {
      const mem = save.memories[id] || [];
      const met = save.met.includes(id);
      if (!met && !mem.length) continue;
      any = true;
      const c = CAST[id];
      const card = document.createElement('article');
      card.className = 'jr-person';
      card.style.setProperty('--rim', c.color);
      card.innerHTML = `<div class="jr-sil">${silhouette(c.look, c.color, 'j' + id)}</div><div class="jr-text"><h3></h3><ul></ul></div>`;
      card.querySelector('h3').textContent = c.name;
      const ul = card.querySelector('ul');
      if (!mem.length) { const li = document.createElement('li'); li.className = 'locked'; li.textContent = 'Non ti ha ancora raccontato niente.'; ul.appendChild(li); }
      for (const m of mem) { const li = document.createElement('li'); li.textContent = m; ul.appendChild(li); }
      body.appendChild(card);
    }
    if (!any) body.innerHTML = '<p class="jr-empty">Il diario è vuoto. Le persone si ricordano solo dopo che le hai ascoltate.</p>';
  } else if (tab === 'cartoline') {
    if (!save.postcards.length) { body.innerHTML = '<p class="jr-empty">Anna non ha ancora disegnato niente per te.</p>'; return; }
    const grid = document.createElement('div');
    grid.className = 'jr-cards';
    body.appendChild(grid);
    for (const card of save.postcards) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'jr-card';
      b.innerHTML = '<span class="jr-cap"></span>';
      b.querySelector('.jr-cap').textContent = card.caption;
      grid.appendChild(b);
      drawPostcard(card).then((cv) => { cv.className = 'jr-thumb'; b.prepend(cv); });
      b.addEventListener('click', () => openPostcard(root, card));
    }
  } else {
    const list = document.createElement('div');
    list.className = 'jr-endings';
    for (const [k, e] of Object.entries(ENDINGS)) {
      const found = save.endings.includes(k);
      const d = document.createElement('div');
      d.className = 'jr-ending' + (found ? '' : ' locked');
      d.innerHTML = '<b></b><span></span>';
      d.querySelector('b').textContent = found ? e.title : '???';
      d.querySelector('span').textContent = found ? e.text : 'Un altro modo in cui poteva andare.';
      list.appendChild(d);
    }
    body.appendChild(list);
  }
}

async function openPostcard(root, card) {
  const view = root.querySelector('.jr-view');
  const holder = view.querySelector('.jr-view-img');
  holder.innerHTML = '';
  const cv = await drawPostcard(card);
  holder.appendChild(cv);
  view.classList.remove('hidden');
  const share = view.querySelector('.jr-share');
  share.onclick = () => {
    cv.toBlob(async (blob) => {
      const file = new File([blob], `bar-blu-${card.id}.png`, { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Bar Blu', text: card.caption });
          return;
        }
      } catch (e) { /* fall back to download */ }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  };
  view.querySelector('.jr-close').onclick = () => view.classList.add('hidden');
}
