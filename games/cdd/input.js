/* CDD RUN — keyboard, touch and on-screen controls */

export function initInput(actions) {
  const KEYS_LEFT = ['ArrowLeft', 'a', 'A'];
  const KEYS_RIGHT = ['ArrowRight', 'd', 'D'];
  const KEYS_JUMP = ['ArrowUp', 'w', 'W', ' '];

  window.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/i.test(e.target.tagName)) return;
    if (KEYS_LEFT.includes(e.key)) { e.preventDefault(); actions.lane(-1); }
    else if (KEYS_RIGHT.includes(e.key)) { e.preventDefault(); actions.lane(1); }
    else if (KEYS_JUMP.includes(e.key)) {
      e.preventDefault();
      if (actions.isRunning()) actions.jump(); else actions.primary();
    } else if (e.key === 'Enter') { e.preventDefault(); actions.primary(); }
    else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { e.preventDefault(); actions.pause(); }
    else if (e.key === 'r' || e.key === 'R') actions.restart();
  });

  let startX = 0, startY = 0;
  window.addEventListener('touchstart', e => {
    if (!e.touches.length) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', e => {
    if (!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 36) actions.lane(dx > 0 ? 1 : -1);
    else if (Math.abs(dy) > Math.abs(dx) && dy < -36) actions.jump();
  }, { passive: true });

  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', e => { e.preventDefault(); actions.audio(); fn(); });
  };
  bind('ctrlLeft', () => actions.lane(-1));
  bind('ctrlRight', () => actions.lane(1));
  bind('ctrlJump', () => actions.jump());
}
