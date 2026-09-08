document.addEventListener('DOMContentLoaded', () => {
  const welcome = document.getElementById('welcome');
  const studio = document.getElementById('studio');
  const stats = document.getElementById('stats');
  const allowMic = document.getElementById('allow-mic');
  const demoMode = document.getElementById('demo-mode');
  const canvas = document.getElementById('canvas');
  const noiseFill = document.getElementById('noise-fill');
  const ctx = canvas.getContext('2d');
  let streak = parseInt(localStorage.getItem('silentMinutes') || '0');
  let noiseThreshold = 30; // dB threshold, user-configurable in future
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let silenceCount = 0; // consecutive seconds below threshold

  // Resize canvas
  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Set up toolbar color selection
  const toolbar = document.getElementById('toolbar');
  toolbar.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      document.querySelectorAll('#toolbar button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    }
  });

  // Clear canvas
  document.getElementById('clear').addEventListener('click', () => {
    const c = ctx;
    c.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Export to PNG
  document.getElementById('export').addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'silent-canvas.png';
    link.click();
  });

  // Stats navigation
  document.getElementById('back').addEventListener('click', () => {
    studio.hidden = false;
    stats.hidden = true;
  });

  // Demo mode: simulated noise that unlocks after 3 seconds
  if (demoMode) {
    demoMode.addEventListener('click', () => {
      welcome.hidden = true;
      studio.hidden = true;
      stats.hidden = false;
      document.getElementById('streak').textContent = streak;
    });
  }

  // Allow microphone (mock for now — real implementation would use getUserMedia)
  if (allowMic) {
    allowMic.addEventListener('click', () => {
      welcome.hidden = true;
      studio.hidden = false;
      // Simulate noise below threshold for demo
      silenceCount = 30; // 30 seconds of "silence"
      unlockCanvas();
    });
  }

  // Core: simulate noise reading + canvas unlock
  function simulateNoiseLevel(isSilent) {
    const noiseBar = document.getElementById('noise-bar');
    const fill = document.getElementById('noise-fill');
    if (isSilent) {
      silenceCount++;
      noiseFill.style.width = '100%';
      noiseBar.style.background = '#2a3f6a';
      if (silenceCount >= 30) {
        unlockCanvas();
      }
    } else {
      silenceCount = 0;
      noiseFill.style.width = '0%';
      noiseBar.style.background = '#e07070';
    }
  }

  function unlockCanvas() {
    welcome.hidden = true;
    studio.hidden = false;
    silenceCount = 0;
    // Add streak minutes
    const minutes = Math.floor(streak / 60);
    streak += 60; // increment by 60 seconds of silence
    localStorage.setItem('silentMinutes', streak);
    document.getElementById('streak').textContent = streak;
    // Simple drawing enable
    isDrawing = true;
    // Start a simple draw loop just for demo
    let tick = 0;
    const drawLoop = setInterval(() => {
      tick++;
      if (tick > 300) { clearInterval(drawLoop); return; }
      // Draw a simple oscillating line
      const x = (tick * 2) % canvas.width;
      const y = 150 + Math.sin(tick * 0.1) * 50;
      ctx.beginPath();
      ctx.moveTo(lastX || x, lastY || y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = document.querySelector('#toolbar button.active') ? 
        getComputedStyle(document.querySelector('#toolbar button.active')).backgroundColor : '#d4a843';
      ctx.lineWidth = document.getElementById('brush-size').value;
      ctx.stroke();
      lastX = x;
      lastY = y;
    }, 20);
  }

  // In a real implementation, this would use the Web Audio API to read mic input
  // and compare RMS against threshold. For now, we use the demo flow.
  // The flow: user clicks "Allow Microphone", we simulate silence for 30 seconds,
  // then unlock the canvas.

  // Mouse drawing
  canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  });
  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = getComputedStyle(document.querySelector('#toolbar button.active')).backgroundColor;
    ctx.lineWidth = document.getElementById('brush-size').value;
    ctx.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
  });
  canvas.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('mouseleave', () => isDrawing = false);
});