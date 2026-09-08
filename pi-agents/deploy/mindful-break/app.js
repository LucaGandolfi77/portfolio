const START_TIME = 60000;
let startTime, timer;
document.getElementById('welcome')?.addEventListener('click', startBreak);
function startBreak() {
  const welcome = document.getElementById('welcome'), breakScreen = document.getElementById('break'), stats = document.getElementById('stats');
  if (welcome) welcome.hidden = true;
  if (breakScreen) breakScreen.hidden = false;
  startTime = Date.now();
  const circle = document.querySelector('.circle'), timerEl = document.querySelector('.timer'), hint = document.querySelector('.hint');
  let remaining = 60;
  timerEl.textContent = '60s';
  function tick() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remainingSec = 60 - elapsed;
    if (remainingSec <= 0) {
      timerEl.textContent = 'Done';
      const streakEl = document.getElementById('streak'), streak = parseInt(localStorage.getItem('breaks') || '0') + 1;
      localStorage.setItem('breaks', streak);
      timerEl.textContent = 'Completed!';
      if (hint) hint.textContent = 'Well done! Your streak: ' + streak;
      setTimeout(() => { if (breakScreen) breakScreen.hidden = true; if (stats) { stats.hidden = false; document.getElementById('streak').textContent = streak; } }, 2000);
      clearInterval(timer);
      return;
    }
    timerEl.textContent = remainingSec + 's';
    if (circle) {
      const progress = (60 - remainingSec) / 60;
      circle.style.transform = 'scale(' + (0.8 + progress * 0.4) + ')';
    }
  }
  timer = setInterval(tick, 500);
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}