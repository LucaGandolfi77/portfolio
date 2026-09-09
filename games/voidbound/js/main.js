const Main = (() => {
  'use strict';
  const D = VOIDBOUND;
  let canvas, player, bots, game_state, running, last_time, accumulator;
  let touch = { joystick: false, jx: 0, jy: 0, jx2: 0, jy2: 0 };
  let keys = {};
  let touch_ids = { move: null, atk: null, ab1: null, ab2: null, ult: null, chan: null };
  let menu_state = 'menu';
  let selected_roster = 0;
  let events_log = [];

  function init() {
    canvas = document.getElementById('game');
    Render.init(canvas);
    window.addEventListener('resize', () => Render.resize());
    setup_input();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
    show_menu();
  }

  function show_menu() {
    menu_state = 'menu';
    const menu = document.getElementById('menu');
    const picker = document.getElementById('roster-picker');
    picker.innerHTML = '';
    for (let i = 0; i < D.ROSTER.length; i++) {
      const r = D.ROSTER[i];
      const card = document.createElement('div');
      card.className = 'roster-card';
      card.dataset.idx = i;
      card.innerHTML = `<div class="roster-icon" style="color:${r.color}">${r.icon}</div><div class="roster-name">${r.name}</div><div class="roster-sub">${r.subtitle}</div><div class="roster-role">${r.role}</div>`;
      card.addEventListener('click', () => {
        selected_roster = i;
        document.querySelectorAll('.roster-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      if (i === 0) card.classList.add('selected');
      picker.appendChild(card);
    }
    menu.classList.remove('hidden');
    document.getElementById('controls-overlay').classList.add('hidden');
  }

  function start_game() {
    menu_state = 'playing';
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('controls-overlay').classList.remove('hidden');
    events_log = [];
    game_state = Game.init();
    Game.on_event = (evt, data) => { events_log.push({ evt, data, time: game_state.time }); };

    player = Game.spawn_champion(selected_roster, 0, true, 'top');
    const available = [0,1,2,3,4,5,6,7].filter(i => i !== selected_roster);
    bots = [];
    const blue_bots = available.splice(0, 4);
    const red_bots = available.slice(0, 5);
    for (const idx of blue_bots) bots.push(Game.spawn_champion(idx, 0, false, null));
    for (const idx of red_bots) bots.push(Game.spawn_champion(idx, 1, false, null));
    AI.assign_lanes(bots);
    for (let i = 0; i < 18; i++) Game.spawn_creep(i);

    running = true;
    last_time = performance.now();
    accumulator = 0;
    requestAnimationFrame(loop);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min((now - last_time) / 1000, 0.05);
    last_time = now;
    accumulator += dt;

    while (accumulator >= 1/30) {
      handle_input();
      for (const b of bots) AI.update_bot(b, 1/30);
      Game.update(1/30);
      accumulator -= 1/30;
    }

    Render.update_camera(player);
    Render.render_frame(Game.state, Game.entities, Game.particles, Game.projectiles, Game.shards_dropped, player);

    if (Game.state.phase === 'finished') {
      running = false;
      Render.render_end_screen(Game.state);
      canvas.addEventListener('click', restart_handler, { once: true });
      canvas.addEventListener('touchstart', restart_handler, { once: true });
    } else {
      requestAnimationFrame(loop);
    }
  }

  function restart_handler() {
    canvas.removeEventListener('click', restart_handler);
    canvas.removeEventListener('touchstart', restart_handler);
    show_menu();
  }

  function handle_input() {
    if (!player || player.dead || player.stun_timer > 0) { player.vx = 0; player.vy = 0; return; }

    let mx = 0, my = 0;
    if (touch.joystick) {
      mx = touch.jx;
      my = touch.jy;
    }
    if (keys['w'] || keys['arrowup']) my -= 1;
    if (keys['s'] || keys['arrowdown']) my += 1;
    if (keys['a'] || keys['arrowleft']) mx -= 1;
    if (keys['d'] || keys['arrowright']) mx += 1;

    const len = Math.hypot(mx, my);
    if (len > 0.1) {
      player.vx = mx / Math.max(len, 1);
      player.vy = my / Math.max(len, 1);
    } else {
      player.vx = 0;
      player.vy = 0;
    }

    if (keys['j'] || keys[' ']) Game.basic_attack(player);
    if (keys['k']) Game.use_ability(player, 0);
    if (keys['l']) Game.use_ability(player, 1);
    if (keys['u']) Game.use_ability(player, 2);
    if (keys['e']) Game.try_channel(player);
  }

  function setup_input() {
    window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; e.preventDefault(); });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    canvas.addEventListener('touchstart', handle_touch_start, { passive: false });
    canvas.addEventListener('touchmove', handle_touch_move, { passive: false });
    canvas.addEventListener('touchend', handle_touch_end, { passive: false });
    canvas.addEventListener('touchcancel', handle_touch_end, { passive: false });

    document.getElementById('btn-atk').addEventListener('touchstart', e => { e.preventDefault(); Game.basic_attack(player); }, { passive: false });
    document.getElementById('btn-ab1').addEventListener('touchstart', e => { e.preventDefault(); Game.use_ability(player, 0); }, { passive: false });
    document.getElementById('btn-ab2').addEventListener('touchstart', e => { e.preventDefault(); Game.use_ability(player, 1); }, { passive: false });
    document.getElementById('btn-ult').addEventListener('touchstart', e => { e.preventDefault(); Game.use_ability(player, 2); }, { passive: false });
    document.getElementById('btn-chan').addEventListener('touchstart', e => { e.preventDefault(); Game.try_channel(player); }, { passive: false });
  }

  function handle_touch_start(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const x = t.clientX;
      const vw = window.innerWidth;
      if (x < vw * 0.4 && touch_ids.move === null) {
        touch_ids.move = t.identifier;
        touch.joystick = true;
        touch.jx2 = x;
        touch.jy2 = t.clientY;
        touch.jx = 0;
        touch.jy = 0;
        document.getElementById('joystick-base').classList.remove('hidden');
        document.getElementById('joystick-knob').classList.remove('hidden');
        document.getElementById('joystick-base').style.left = x + 'px';
        document.getElementById('joystick-base').style.top = t.clientY + 'px';
        document.getElementById('joystick-knob').style.left = x + 'px';
        document.getElementById('joystick-knob').style.top = t.clientY + 'px';
      }
    }
  }

  function handle_touch_move(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === touch_ids.move) {
        const dx = t.clientX - touch.jx2;
        const dy = t.clientY - touch.jy2;
        const d = Math.hypot(dx, dy);
        const max_r = 60;
        if (d > max_r) {
          touch.jx = dx / d;
          touch.jy = dy / d;
          document.getElementById('joystick-knob').style.left = (touch.jx2 + touch.jx * max_r) + 'px';
          document.getElementById('joystick-knob').style.top = (touch.jy2 + touch.jy * max_r) + 'px';
        } else {
          touch.jx = dx / max_r;
          touch.jy = dy / max_r;
          document.getElementById('joystick-knob').style.left = t.clientX + 'px';
          document.getElementById('joystick-knob').style.top = t.clientY + 'px';
        }
      }
    }
  }

  function handle_touch_end(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === touch_ids.move) {
        touch_ids.move = null;
        touch.joystick = false;
        touch.jx = 0;
        touch.jy = 0;
        document.getElementById('joystick-base').classList.add('hidden');
        document.getElementById('joystick-knob').classList.add('hidden');
      }
    }
  }

  window.start_game = start_game;
  return { init };
})();

window.addEventListener('DOMContentLoaded', () => Main.init());
