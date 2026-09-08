/** Canvas visual — onde sonore animate (zero server) */
function drawVisual() {
  const c = document.getElementById('visual'); if (!c) return;
  const ctx = c.getContext('2d'); const w = c.width = c.clientWidth * 2; const h = c.height = c.clientHeight * 2; ctx.scale(2,2);
  ctx.fillStyle = '#0f1b14'; ctx.fillRect(0,0,w/2,h/2);
  const t = Date.now() / 800;
  for (let i = 0; i < 4; i++) {
    const y = h/4 + Math.sin(t + i)*30 + i*40;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x < w/2; x += 10) ctx.lineTo(x, y + Math.sin(x/50 + t + i)*15);
    ctx.strokeStyle = `rgba(46,204,113,${0.2 + i*0.15})`; ctx.lineWidth = 2; ctx.stroke();
  }
  requestAnimationFrame(drawVisual);
}
drawVisual();
