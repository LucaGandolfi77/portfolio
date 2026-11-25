/* I DUE LUMI — Livello di testo ad alta risoluzione
   Il canvas di gioco e' 240x160 e viene ingrandito con pixel-art: scrivere
   testo li' dentro rende le lettere (soprattutto la "e") illeggibili.
   Questo secondo canvas ha la risoluzione dello schermo, quindi il testo
   resta nitido a qualsiasi scala. */
const TXC = document.getElementById('tx');
let TXCTX = null;

function resizeText(scale){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = scale || 1;
  TXC.width = Math.max(1, Math.round(W * s * dpr));
  TXC.height = Math.max(1, Math.round(H * s * dpr));
  TXC.style.width = (W * s) + 'px';
  TXC.style.height = (H * s) + 'px';
  TXCTX = TXC.getContext('2d');
  TXCTX.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
  TXCTX.textBaseline = 'alphabetic';
}
function clearText(){ if(TXCTX) TXCTX.clearRect(0, 0, W, H); }
function text(str, x, y, size, color, align){
  if(!TXCTX || !str) return;
  const g = TXCTX;
  g.save();
  g.font = 'bold ' + size + 'px "Courier New", monospace';
  g.textAlign = align || 'left';
  const w = g.measureText(str).width;
  const bx = align === 'center' ? x - w/2 : (align === 'right' ? x - w : x);
  g.fillStyle = 'rgba(9,7,6,.82)';
  g.fillRect(bx - 4, y - size + 2, w + 8, size + 6);
  g.fillStyle = color || '#f7e8c9';
  g.shadowColor = 'rgba(0,0,0,.95)';
  g.shadowBlur = 3;
  g.fillText(str, x, y);
  g.restore();
}
resizeText(CANVAS._scale || 1);
window.addEventListener('resize', () => resizeText(CANVAS._scale || 1));
