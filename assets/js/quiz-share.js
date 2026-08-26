/* =====================================================================
   QuizShare — card condivisibile per i quiz del portfolio
   Genera una card PNG (1200×630) con risultato, e offre:
   📤 Condividi (Web Share API) · 📋 Copia immagine · 💾 Scarica PNG
   Fallback automatici se un'API non è disponibile.
   Uso:  QuizShare.attach('containerId', { emoji, title, sub, page })
   ===================================================================== */
(function () {
  'use strict';

  var CFG = { emoji: '🎯', title: 'Risultato', sub: '', page: 'Quiz', site: (location && location.hostname) || 'portfolio' };
  var W = 1200, H = 630;
  var qsStyleInjected = false;

  /* ---------- disegno della card ---------- */
  function wrapText(ctx, text, maxW) {
    var words = String(text).split(' ');
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
      if (lines.length >= 4) break;
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function renderCard(cfg) {
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // sfondo con gradiente
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a1628');
    grad.addColorStop(0.65, '#10233f');
    grad.addColorStop(1, '#0d1b30');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // strisce decorative
    ctx.save();
    roundRectPath(ctx, 0, 0, W, H, 0);
    ctx.clip();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 10;
    for (var d = -H; d < W + H; d += 90) {
      ctx.beginPath();
      ctx.moveTo(d, 0); ctx.lineTo(d + H, H);
      ctx.stroke();
    }
    // puntini "confetti"
    var dots = [[140, 90], [1060, 120], [180, 520], [1010, 500], [560, 60], [60, 330], [1140, 330], [760, 580]];
    for (var i = 0; i < dots.length; i++) {
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = i % 2 ? '#00d4ff' : '#ffd54a';
      ctx.beginPath();
      ctx.arc(dots[i][0], dots[i][1], 7 + (i % 3) * 4, 0, 6.29);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // eyebrow
    ctx.fillStyle = '#00d4ff';
    ctx.font = '700 34px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('QUIZ · ' + cfg.page.toUpperCase(), 90, 92);

    // emoji nel cerchio
    ctx.fillStyle = 'rgba(0,212,255,0.12)';
    ctx.beginPath(); ctx.arc(150, 300, 82, 0, 6.29); ctx.fill();
    ctx.strokeStyle = 'rgba(0,212,255,0.6)';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(150, 300, 82, 0, 6.29); ctx.stroke();
    ctx.font = '110px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.emoji || '🎯', 150, 305);
    ctx.textBaseline = 'alphabetic';

    // titolo
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 78px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    var titleLines = wrapText(ctx, cfg.title, 860);
    var ty = 220;
    for (var t = 0; t < titleLines.length; t++) {
      ctx.fillText(titleLines[t], 280, ty);
      ty += 92;
    }

    // sottotitolo / descrizione
    ctx.fillStyle = '#a0c0e0';
    ctx.font = '400 34px Inter, system-ui, sans-serif';
    var subLines = wrapText(ctx, cfg.sub || '', 830);
    var sy = ty + 14;
    for (var s = 0; s < subLines.length; s++) {
      ctx.fillText(subLines[s], 280, sy);
      sy += 48;
    }

    // footer
    ctx.fillStyle = '#5c7890';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('◈ ' + cfg.site + ' · fatto con zero server', 90, 560);

    ctx.restore();
    return canvas;
  }

  function cardBlob(cfg) {
    return new Promise(function (resolve) {
      var canvas = renderCard(cfg);
      if (!canvas) { resolve(null); return; }
      canvas.toBlob(resolve, 'image/png');
    });
  }

  /* ---------- azioni ---------- */
  function downloadPng() {
    cardBlob(CFG).then(function (blob) {
      if (!blob) { toast('Canvas non disponibile'); return; }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'quiz-risultato.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      toast('Card scaricata! 📥');
    });
  }

  function copyPng() {
    cardBlob(CFG).then(function (blob) {
      if (!blob) { toast('Canvas non disponibile'); return; }
      if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function () {
          toast('Immagine copiata! Incollala dove vuoi 🎉');
        }).catch(function () { downloadPng(); });
      } else {
        downloadPng();
      }
    });
  }

  function sharePng() {
    cardBlob(CFG).then(function (blob) {
      if (!blob) { toast('Canvas non disponibile'); return; }
      var file = new File([blob], 'quiz-risultato.png', { type: 'image/png' });
      var payload = {
        files: [file],
        title: 'Quiz: ' + CFG.title,
        text: CFG.title + ' — ' + CFG.sub
      };
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share(payload).catch(function () {});
      } else if (navigator.share) {
        navigator.share({ title: payload.title, text: payload.text }).catch(function () {});
      } else {
        copyPng();
      }
    });
  }

  /* ---------- toast ---------- */
  var toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#0a1628;color:#fff;padding:12px 20px;border-radius:30px;font:600 14px Inter,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4);border:1px solid rgba(0,212,255,.5);z-index:9999;transition:opacity .4s;pointer-events:none;';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.style.opacity = '0'; }, 2200);
  }

  /* ---------- stili della barra (iniettati una volta) ---------- */
  function injectStyle() {
    if (qsStyleInjected) return;
    qsStyleInjected = true;
    var st = document.createElement('style');
    st.id = 'qs-style';
    st.textContent = [
      '#quizShare{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:22px;}',
      '#quizShare .qs-note{font-size:12px;color:#a0c0e0;opacity:.85;}',
      '#quizShare .qs-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}',
      '#quizShare .qs-btn{background:rgba(0,212,255,.12);border:1.5px solid #00d4ff;color:#eafcff;padding:12px 18px;border-radius:30px;font:700 14px Inter,sans-serif;cursor:pointer;transition:transform .15s,background .15s;}',
      '#quizShare .qs-btn:active{transform:scale(.95);background:rgba(0,212,255,.25);}',
      '#quizShare canvas{max-width:100%;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ---------- API pubblica ---------- */
  function attach(containerId, cfg) {
    var host = document.getElementById(containerId);
    if (!host) return;
    injectStyle();
    CFG = cfg || CFG;
    if (host.dataset.qsBuilt) { // UI già creata: aggiorna solo la card
      if (host._qsRefresh) host._qsRefresh();
      return;
    }
    host.dataset.qsBuilt = '1';

    var note = document.createElement('div');
    note.className = 'qs-note';
    note.textContent = 'Condividi il tuo risultato come card:';

    var row = document.createElement('div');
    row.className = 'qs-row';

    var bShare = document.createElement('button');
    bShare.className = 'qs-btn';
    bShare.textContent = '📤 Condividi';
    bShare.onclick = sharePng;

    var bCopy = document.createElement('button');
    bCopy.className = 'qs-btn';
    bCopy.textContent = '📋 Copia immagine';
    bCopy.onclick = copyPng;

    var bDown = document.createElement('button');
    bDown.className = 'qs-btn';
    bDown.textContent = '💾 Scarica PNG';
    bDown.onclick = downloadPng;

    row.appendChild(bShare);
    row.appendChild(bCopy);
    row.appendChild(bDown);

    var preview = document.createElement('canvas');
    preview.style.display = 'none';
    host.appendChild(note);
    host.appendChild(row);
    host.appendChild(preview);

    // anteprima aggiornata quando cambia il risultato
    function refreshPreview() {
      var cv = renderCard(CFG);
      if (!cv || !preview) return;
      preview.width = cv.width; preview.height = cv.height;
      var pctx = preview.getContext('2d');
      pctx.drawImage(cv, 0, 0);
      preview.style.display = 'block';
      preview.style.aspectRatio = String(W) + ' / ' + String(H);
    }
    host._qsRefresh = refreshPreview;
    refreshPreview();
  }

  window.QuizShare = { attach: attach, _render: renderCard };
})();
