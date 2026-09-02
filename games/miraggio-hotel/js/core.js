/* ============================================================
   MIRAGGIO HOTEL — motore (canvas, avatar, chat, stanze, monete)
   ============================================================ */
(function () {
  'use strict';
  const D = window.MIRAGGIO;
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'miraggio_save_v1';
  const TAU = Math.PI * 2;

  /* ---------- stato ---------- */
  function freshState() {
    return {
      nick: '',
      coins: D.startCoins,
      earned: 0,
      room: 'atrio',
      outfit: {
        skin: D.skins[1], hairColor: D.hairColors[0], hairStyle: 'short',
        top: D.tops[0], pants: D.pants[0], acc: 'none'
      },
      ownedStyles: ['short', 'bald'],
      ownedAcc: ['none', 'glasses'],
      ownedColors: [D.skins[0], D.skins[1], D.hairColors[0], D.tops[0], D.pants[0]],
      styleIdx: { hairStyle: 0, acc: 0 },
      px: 350, py: 360,
      eqStyle: { hairStyle: 'short', acc: 'none' }
    };
  }
  let st = freshState();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) {} }
  function load() { try { const r = localStorage.getItem(SAVE_KEY); if (r) { st = Object.assign(freshState(), JSON.parse(r)); return true; } } catch (e) {} return false; }
  function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  /* ---------- runtime ---------- */
  const canvas = $('view');
  const ctx = canvas.getContext('2d');
  let CW = 0, CH = 0, DPR = 1;
  const cam = { s: 1, ox: 0, oy: 0 };
  const TOP_RES = 84, DOCK_RES = 92;

  const player = { x: 350, y: 360, tx: null, ty: null, moving: false, face: 1, ph: 0, anim: null, animT: 0, talked: false };
  let bubbles = [];      // {x,y,lines,t,dur,color,bg,align}
  let fx = [];           // {x,y,e,life,t,size}
  let botPos = {};       // id -> {x,y,ph,tx,ty,wander,moving,dir}
  let roomBots = [];
  let lastBotTalk = {};  // id -> ts
  let lastFurnTalk = {}; // key -> ts
  let lastChatCoin = 0;
  let lastAmbient = 0;
  let lastEvent = 0;

  function room() { return D.rooms[st.room]; }

  /* ---------- audio minuscolo ---------- */
  let AC = null;
  function blip(freq, dur, type) {
    if (st && st.sound === false) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = freq || 660;
      g.gain.value = 0.06;
      o.connect(g); g.connect(AC.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.12));
      o.stop(AC.currentTime + (dur || 0.12) + 0.02);
    } catch (e) {}
  }
  function coinSound() { blip(880, .09, 'triangle'); setTimeout(() => blip(1320, .12, 'triangle'), 70); }

  /* ---------- toast ---------- */
  let toastT = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2800);
  }

  /* ---------- monete & badge ---------- */
  function addCoins(n, silent) {
    const ev = activeEvent();
    if (n > 0 && ev && ev.mult > 1) n = Math.round(n * ev.mult);
    st.coins += n; st.earned += n;
    if (!silent) coinSound();
    try { if (st.sound !== false && navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    updateHUD();
    save();
  }
  function badgeFor() {
    let b = D.badges[0];
    D.badges.forEach(x => { if (st.earned >= x.min) b = x; });
    return b;
  }
  function updateHUD() {
    $('nameChip').textContent = '👤 ' + (st.nick || 'Ospite') + (st.lvl ? ' · Lv ' + st.lvl : '');
    $('coins').textContent = st.coins;
    $('roomChip').textContent = room().emoji + ' ' + room().name;
    const b = badgeFor();
    $('badgeChip').textContent = b.icon + ' ' + b.title;
    try {
      const snd = $('soundBtn');
      if (snd) snd.textContent = st.sound === false ? '🔇' : '🔊';
      const inCam = st.room === 'camera';
      $('shopChip').style.display = inCam ? '' : 'none';
      $('stashChip').style.display = inCam ? '' : 'none';
      const ev = activeEvent();
      const evEl = $('evChip');
      if (ev.active) {
        evEl.style.display = '';
        evEl.textContent = ev.emoji + ' LIVE ×' + ev.mult + ' ' + ev.name;
        evEl.style.background = 'linear-gradient(135deg,#ffd166,#ff9f43)';
        evEl.style.color = '#4a2c00';
      } else if (ev.next) {
        evEl.style.display = '';
        evEl.textContent = '⏰ prossimo evento in ' + ev.next;
        evEl.style.background = 'rgba(255,255,255,.13)';
        evEl.style.color = '#fff';
      } else evEl.style.display = 'none';
    } catch (e) {}
  }

  /* ---------- dimensioni / camera ---------- */
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = window.innerWidth; CH = window.innerHeight;
    canvas.width = Math.round(CW * DPR);
    canvas.height = Math.round(CH * DPR);
    canvas.style.width = CW + 'px';
    canvas.style.height = CH + 'px';
    computeCam();
  }
  function computeCam() {
    const r = room();
    const availH = Math.max(160, CH - TOP_RES - DOCK_RES);
    cam.s = Math.min((CW - 14) / r.w, availH / r.h);
    cam.s = Math.min(cam.s, 1.15);
    cam.ox = (CW - r.w * cam.s) / 2;
    cam.oy = TOP_RES + (availH - r.h * cam.s) / 2;
  }
  const toW = (cx, cy) => ({ x: (cx - cam.ox) / cam.s, y: (cy - cam.oy) / cam.s });
  const toS = (x, y) => ({ x: cam.ox + x * cam.s, y: cam.oy + y * cam.s });

  /* ---------- ingressi ---------- */
  function enterRoom(id) {
    st.room = id;
    st.px = st.py = -1; // respawn
    setupRoom();
    computeCam();
    $('roomChip').textContent = room().emoji + ' ' + room().name;
    // aggiorna selezione nella lista
    document.querySelectorAll('.room').forEach(el => el.classList.toggle('here', el.dataset.room === id));
    missionHit('room', null);
    toast(room().emoji + ' Benvenuto in: ' + room().name);
    updateHUD(); save();
  }
  function setupRoom() {
    const r = room();
    player.x = r.w / 2;
    player.y = r.h - 60;
    player.tx = null; player.moving = false; player.anim = null;
    botPos = {};
    roomBots = (r.bots || []).map((id, i) => {
      const col = Math.floor(i / 2);
      const x = 130 + ((i % 2) * (r.w - 260)) + (i % 2 ? 0 : 0);
      const pos = { id, homeX: 150 + i * 110, homeY: 250 + (i % 2) * 60, x: 150 + i * 110, y: 250 + (i % 2) * 60, ph: 0, wander: 0, moving: false, dir: 1 };
      botPos[id] = pos;
      return pos;
    });
    // valigie sparse
    bubbles = []; fx = [];
    lastAmbient = performance.now() + 2500;
  }

  /* ---------- collisioni ---------- */
  function solidList() { return (room().furniture || []).filter(f => !f.xl); }
  function clampPt(x, y) {
    const r = room();
    const minY = r.walkTop || 40;
    x = Math.max(24, Math.min(r.w - 24, x));
    y = Math.max(minY, Math.min(r.h - 26, y));
    // push fuori dai mobili
    for (let k = 0; k < 3; k++) {
      let pushed = false;
      solidList().forEach(f => {
        const rad = (f.s || 34) * 0.42;
        const dx = x - f.x, dy = y - f.y;
        const d = Math.hypot(dx, dy);
        if (d < rad + 10 && d > 0.001) {
          const p = rad + 10 - d;
          x += (dx / d) * p; y += (dy / d) * p;
          pushed = true;
        }
      });
      if (!pushed) break;
    }
    return { x: Math.max(24, Math.min(room().w - 24, x)), y: Math.max(room().walkTop || 40, Math.min(room().h - 26, y)) };
  }

  /* ---------- loop ---------- */
  let lastT = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    step(dt);
    draw();
  }
  function step(dt) {
    everyTick(dt);
    // player movimento
    if (player.tx !== null) {
      const dx = player.tx - player.x, dy = player.ty - player.y;
      const d = Math.hypot(dx, dy);
      const sp = 210 * cam.s * dt;
      if (d < 4 || sp <= 0) {
        const act = player._act; player._act = null;
        player.tx = null; player.moving = false;
        if (act) act();
      } else {
        player.face = dx >= 0 ? 1 : -1;
        player.moving = true;
        player.ph += dt * 11;
        const np = clampPt(player.x + (dx / d) * sp, player.y + (dy / d) * sp);
        player.x = np.x; player.y = np.y;
      }
    } else player.moving = false;

    // bot vagabondano piano
    const r = room();
    roomBots.forEach(bp => {
      const b = D.bots[bp.id];
      if (!b) return;
      if (!bp.tx) {
        if (Math.random() < 0.004) {
          bp.tx = Math.max(120, Math.min(r.w - 120, bp.homeX + (Math.random() - 0.5) * 200));
          bp.ty = Math.max(r.walkTop + 60, Math.min(r.h - 90, bp.homeY + (Math.random() - 0.5) * 130));
        }
      } else {
        const dx = bp.tx - bp.x, dy = bp.ty - bp.y;
        const d = Math.hypot(dx, dy);
        if (d < 6) { bp.tx = null; bp.moving = false; }
        else {
          const sp = 36 * dt;
          const np = clampPt(bp.x + (dx / d) * sp, bp.y + (dy / d) * sp);
          bp.x = np.x; bp.y = np.y;
          bp.dir = dx >= 0 ? 1 : -1;
          bp.moving = true; bp.ph += dt * 8;
        }
      }
    });

    // animazioni giocatore
    if (player.anim && performance.now() > player.animT) player.anim = null;

    // aggiorna bolle
    const now = performance.now();
    bubbles = bubbles.filter(b => now < b.t + b.dur);
    fx = fx.filter(f => now < f.t + f.life);

    // ambient
    if (now - lastAmbient > D.ambientInterval) {
      lastAmbient = now;
      const candidates = roomBots.filter(bp => D.bots[bp.id] && !bubbles.some(b => b.owner === bp.id));
      if (candidates.length && Math.random() < 0.75) {
        const bp = candidates[Math.floor(Math.random() * candidates.length)];
        const lines = D.bots[bp.id].ambient || D.bots[bp.id].greet;
        say(bp, lines[Math.floor(Math.random() * lines.length)], 3600);
      }
    }
    // evento casuale divertente
    if (now - lastEvent > 26000 && Math.random() < 0.5) {
      lastEvent = now;
      const events = [
        '🎊 Consegna confetti a sorpresa in tutta la stanza!',
        '🦜 Un pappagallo ha imparato a dire “Bravo!” e ora applaude tutti.',
        '🧦 Qualcuno ha lasciato dei calzini arcobaleno appesi… chi sarà?',
        '☁️ Sta piovendo zucchero filato davanti alla finestra!',
        '📣 L’altoparlante: “Ricordate: qui il dress code è il sorriso”.'
      ];
      toast(events[Math.floor(Math.random() * events.length)]);
      if (Math.random() < 0.5) addCoins(2, true);
    }
  }

  /* ---------- bolle ---------- */
  function wrapLines(txt) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = '600 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    const max = 210;
    const words = String(txt).split(' ');
    const lines = []; let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > max && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    ctx.restore();
    return lines.length ? lines : [''];
  }
  function say(who, txt, dur, opts) {
    const isBot = !!(who.id !== undefined && who.id !== 'player');
    const x = isBot ? who.x : player.x;
    const y = isBot ? who.y - 8 : player.y;
    const o = opts || {};
    bubbles.push({
      x, y, owner: who.id || 'player',
      lines: wrapLines(txt), t: performance.now(),
      dur: dur || 3000,
      color: o.color || (isBot ? '#fff' : '#fffbe6'),
      ink: o.ink || (isBot ? '#3a2a8f' : '#5a3a00'),
      border: o.border || (isBot ? D.bots[who.id].top : '#ffd166'),
      align: isBot ? -1 : 1
    });
  }

  /* ---------- interazioni ---------- */
  function walkTo(x, y, act) {
    const p = clampPt(x, y);
    player.tx = p.x; player.ty = p.y;
    player._act = act;
  }

  function talkBot(bp) {
    const b = D.bots[bp.id];
    bp.dir = (player.x <= bp.x) ? 1 : -1;
    player.face = bp.x >= player.x ? 1 : -1;
    const now = performance.now();
    const line = b.greet[Math.floor(Math.random() * b.greet.length)];
    say(bp, line, 3800);
    const prevTalk = lastBotTalk[bp.id];
    const canCoin = prevTalk === undefined || now - prevTalk > 5000;
    lastBotTalk[bp.id] = now;
    if (canCoin) { addCoins(2); spawnFx(bp.x, bp.y - 46, '🪙'); }
    if (canCoin && bp.id === guestId()) { addCoins(2); spawnFx(bp.x, bp.y - 60, '⭐'); }
    if (Math.random() < 0.25) playerWave(bp);
    affTalk(bp.id);
  }
  function playerWave(who) {
    setAnim('wave', 1400);
  }
  function setAnim(anim, dur) {
    player.anim = anim; player.animT = performance.now() + (dur || 1400);
  }
  function spawnFx(x, y, e, size) {
    fx.push({ x, y, e, life: 1300, t: performance.now(), size: size || 18 });
  }

  function interactFurniture(f) {
    const key = st.room + ':' + f.e;
    const now = performance.now();
    const reply = D.furnitureReplies[f.e];
    if (!reply) return;
    const prevFurn = lastFurnTalk[key];
    if (f.xl && prevFurn !== undefined && now - prevFurn < 9000) return;
    lastFurnTalk[key] = now;
    bubbles.push({ x: f.x, y: f.y - 20, owner: 'f' + key, lines: wrapLines(reply), t: now, dur: 3600, color: '#e9f7ff', ink: '#1b5e79', border: '#40c4ff' });
    if (f.xl) { addCoins(1 + Math.floor(Math.random() * 2)); spawnFx(f.x, f.y - 44, '🪙'); missionHit('furn', null); }
    blip(520, .08, 'sine');
  }

  /* ---------- emotes ---------- */
  function doEmote(e) {
    setAnim(e.anim, e.dur);
    say({ id: 'player', x: player.x, y: player.y }, e.txt, e.dur);
    const nearBot = roomBots.find(bp => Math.hypot(bp.x - player.x, bp.y - player.y) < 230) || null;
    if (nearBot) affEmote(nearBot.id, e.id); else missionHit('emote', null);
    const ejs = { wave: '👋', dance: '🎵', jump: '⭐', clap: '👏', heart: '💖', angry: '💢', laugh: '😂', dive: '💦' };
    for (let i = 0; i < 5; i++) setTimeout(() => spawnFx(player.x + (Math.random() - 0.5) * 40, player.y - 40, ejs[e.anim] || '✨', 15 + Math.random() * 9), i * 120);
    if (e.anim === 'dance') blip(660, .15, 'square');
    // reazione simpatica di un ospite vicino
    const near = roomBots.find(bp => Math.hypot(bp.x - player.x, bp.y - player.y) < 240);
    if (near && Math.random() < 0.5) {
      setTimeout(() => {
        const lines = D.bots[near.id].ambient || D.bots[near.id].greet;
        say(near, lines[Math.floor(Math.random() * lines.length)], 3200);
      }, 800);
    }
  }

  /* ---------- chat ---------- */
  function sendChat(txt) {
    txt = String(txt || '').trim();
    if (!txt) return;
    say({ id: 'player' }, txt, 3600, { color: '#fffbe6', ink: '#5a3a00', border: '#ffd166' });
    const now = performance.now();
    const prevChat = lastChatCoin;
    if (prevChat === 0 || now - prevChat > 9000) { addCoins(1); spawnFx(player.x, player.y - 46, '🪙'); lastChatCoin = now; }
    const low = txt.toLowerCase();
    const hit = D.chatTriggers.find(tr => tr.words.some(w => low.includes(w)));
    missionHit('chat', null);
    if (hit && hit.words.some(w => w === 'ciao')) missionHit('chatWord', null);
    if (hit) {
      const responder = roomBots.filter(bp => D.bots[bp.id]).sort((a, b) =>
        Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
      if (responder) setTimeout(() => say(responder, hit.reply, 4000), 900);
      else setTimeout(() => {
        const rp = { id: 'player', x: player.x, y: player.y };
        say(rp, '📣 L’eco del Miraggio risponde: “' + hit.reply + '”', 4200, { color: '#efe6ff', ink: '#5b3bd6', border: '#8b6cff' });
      }, 700);
    }
    blip(700, .07, 'sine');
    closeComposer();
  }

  /* ============================ DISEGNO ============================ */
  function drawFloor() {
    const r = room();
    const ts = 46;
    for (let gy = 0; gy < Math.ceil(r.h / ts); gy++) {
      for (let gx = 0; gx < Math.ceil(r.w / ts); gx++) {
        ctx.fillStyle = (gx + gy) % 2 ? r.floor2 : r.floor1;
        ctx.fillRect(gx * ts, gy * ts, ts, ts);
      }
    }
    // muro: strisce allegre
    ctx.fillStyle = r.wall;
    ctx.fillRect(0, 0, r.w, 18);
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    for (let x = 0; x < r.w; x += 40) ctx.fillRect(x, 4, 18, 10);
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.fillRect(0, 18, r.w, 7);
    // battiscopa
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(0, r.h - 8, r.w, 8);
  }

  function EMOJI(size) { return size + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; }

  function drawWorld() {
    ctx.save();
    ctx.translate(cam.ox, cam.oy);
    ctx.scale(cam.s, cam.s);
    drawFloor();
    const r = room();

    // mobili
    (r.furniture || []).forEach(f => {
      ctx.fillStyle = 'rgba(60,20,100,.12)';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + (f.s || 34) * 0.36, (f.s || 34) * 0.4, (f.s || 34) * 0.13, 0, 0, TAU);
      ctx.fill();
      ctx.font = EMOJI(f.s || 34);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.e, f.x, f.y);
      if (f.xl) { // oggetto interattivo: piccolo luccichio
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300 + f.x);
        ctx.strokeStyle = 'rgba(255,209,102,' + (0.25 + pulse * 0.4) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y - 4, (f.s || 34) * 0.42 + pulse * 2, 0, TAU);
        ctx.stroke();
      }
    });
    if (r.id === 'camera') drawCameraExtras();

    // bot
    roomBots.forEach(bp => {
      const b = D.bots[bp.id];
      if (!b) return;
      drawAv(bp.x, bp.y, bp.moving ? Math.floor(bp.ph) % 2 : 0, bp.dir, b, 1, false);
    });
    // giocatore
    const pwalk = player.moving ? Math.floor(player.ph) % 2 : 0;
    drawAv(player.x, player.y, pwalk, player.face, st.outfit, 1, true);

    ctx.restore();
  }

  function drawAv(x, y, walk, face, o, scale, isPlayer) {
    // o: {skin, hairColor, hairStyle, top, pants, acc}
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * face, scale);
    const now = performance.now();
    let bobY = 0, tilt = 0;
    const anim = isPlayer ? player.anim : null;
    if (anim === 'dance') { bobY = Math.sin(now / 90) * 5; tilt = Math.sin(now / 140) * 0.08; }
    else if (anim === 'jump') { const p = Math.max(0, 1 - (now % 700) / 700); bobY = -Math.sin(p * Math.PI) * 16; }
    else if (anim === 'wave') tilt = -0.06;
    else if (anim === 'heart') bobY = Math.sin(now / 150) * 2;
    else if (isPlayer && player.moving) bobY = Math.sin(player.ph * 0.6) * 1.2;
    ctx.translate(0, bobY);
    if (tilt) ctx.rotate(tilt * face);

    // ombra
    ctx.fillStyle = 'rgba(60,20,100,.16)';
    ctx.beginPath(); ctx.ellipse(0, 13, 14, 4.6, 0, 0, TAU); ctx.fill();

    // gambe + scarpe
    const legSwing = walk ? Math.sin(walk * Math.PI) * 3.4 : 0;
    ctx.fillStyle = o.pants;
    ctx.fillRect(-5.5, 1, 4.6, 8 + legSwing * 0.15);
    ctx.fillRect(0.9, 1, 4.6, 8 - legSwing * 0.15);
    ctx.fillStyle = '#2a2140';
    ctx.fillRect(-6.4, 9.4, 6.2, 3);
    ctx.fillRect(0.2, 9.4, 6.2, 3);

    // busto (tuta)
    ctx.fillStyle = o.top;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-10, -12, 20, 18, 5) : ctx.rect(-10, -12, 20, 18);
    ctx.fill();
    // zip
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillRect(-1.2, -12, 2.4, 18);

    // braccia (quella che saluta si alza)
    const waving = anim === 'wave' || (isPlayer && player.anim === 'wave');
    const armL = waving ? -Math.sin(now / 160) * 3 : 0;
    ctx.fillStyle = o.top;
    ctx.fillRect(-13.4, -8 - armL, 3.8, 13 + armL);
    ctx.fillRect(9.6, -8, 3.8, 13);
    ctx.fillStyle = o.skin;
    ctx.fillRect(-14.2, 4.5 - armL * 0.5, 5, 4);
    ctx.fillRect(9, 4.5, 5, 4);

    // testa grande (stile chibi)
    ctx.fillStyle = o.skin;
    ctx.beginPath(); ctx.arc(0, -21, 12, 0, TAU); ctx.fill();
    // orecchie
    ctx.fillRect(-12.5, -23, 2.6, 4);
    ctx.fillRect(9.9, -23, 2.6, 4);

    // occhi + bocca
    const blink = (now % 3200) < 120;
    ctx.fillStyle = '#261a3d';
    if (!blink) {
      ctx.fillRect(-6, -22.5, 2.4, 3.4);
      ctx.fillRect(3.6, -22.5, 2.4, 3.4);
    } else {
      ctx.fillRect(-6, -21, 2.6, 1.1);
      ctx.fillRect(3.6, -21, 2.6, 1.1);
    }
    ctx.strokeStyle = '#261a3d'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    if (anim === 'angry') {
      ctx.beginPath(); ctx.moveTo(-1.6, -12.4); ctx.quadraticCurveTo(0, -10.8, 1.6, -12.4); ctx.stroke();
      ctx.strokeStyle = '#e33'; ctx.beginPath(); ctx.moveTo(-7, -24); ctx.lineTo(-3, -21); ctx.stroke(); ctx.beginPath(); ctx.moveTo(7, -24); ctx.lineTo(3, -21); ctx.stroke();
    } else if (anim === 'laugh') {
      ctx.fillStyle = '#8a3a50'; ctx.beginPath(); ctx.arc(0, -11.6, 3, 0, TAU); ctx.fill();
    } else if (anim === 'heart') {
      ctx.fillStyle = '#ff5d9e'; ctx.font = '10px sans-serif'; ctx.fillText('♥', -4.6, -10.6);
    } else if (anim === 'dance') {
      ctx.beginPath(); ctx.arc(0, -12.4, 2.2, 0, TAU); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, -12.6, 2.4, 0.1, Math.PI - 0.1); ctx.stroke();
      // guance
      ctx.fillStyle = 'rgba(255,120,140,.5)';
      ctx.beginPath(); ctx.arc(-7.4, -17.5, 2.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(7.4, -17.5, 2.3, 0, TAU); ctx.fill();
    }

    // capelli
    ctx.fillStyle = o.hairColor;
    const hs = o.hairStyle;
    if (hs === 'bald') {
      ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, -21, 11, 0, TAU); ctx.stroke();
    } else if (hs === 'long') {
      ctx.beginPath(); ctx.arc(0, -22.5, 12.2, Math.PI * 0.9, Math.PI * 0.1); ctx.fill();
      ctx.fillRect(-10.5, -24, 4.5, 16);
      ctx.fillRect(6, -24, 4.5, 16);
    } else if (hs === 'curly') {
      ctx.beginPath(); ctx.arc(0, -23.5, 12, Math.PI, 0); ctx.fill();
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 10.4, -23.8 + Math.sin(a) * 3.4, 2.6, 0, TAU); ctx.fill();
      }
    } else if (hs === 'puff') {
      ctx.beginPath(); ctx.arc(0, -24.5, 9.4, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(-7.6, -23.5, 5.4, Math.PI * 0.6, Math.PI * 1.6); ctx.fill();
      ctx.beginPath(); ctx.arc(7.6, -23.5, 5.4, Math.PI * 0.4, -Math.PI * 0.6); ctx.fill();
      ctx.fillStyle = '#ff8f8f';
      ctx.beginPath(); ctx.arc(0, -33.5, 3.2, 0, TAU); ctx.fill();
    } else { // short
      ctx.beginPath(); ctx.arc(0, -22.5, 12.2, Math.PI, 0); ctx.fill();
    }
    // accessori
    if (o.acc === 'glasses') {
      ctx.strokeStyle = '#3a2a8f'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(-4.8, -21, 3.4, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(4.8, -21, 3.4, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1.4, -21); ctx.lineTo(1.4, -21); ctx.stroke();
    } else if (o.acc === 'cap') {
      ctx.fillStyle = o.top;
      ctx.beginPath(); ctx.arc(0, -23.4, 12.4, Math.PI * 0.94, Math.PI * 0.06); ctx.fill();
      ctx.fillRect(-13, -23.6, 26, 3.2);
      ctx.beginPath(); ctx.arc(-11, -21, 2.6, 0, TAU); ctx.fill();
    } else if (o.acc === 'headphones') {
      ctx.strokeStyle = '#3a2a8f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -22, 12.6, Math.PI * 0.82, Math.PI * 1.18); ctx.stroke();
      ctx.fillStyle = '#ff5d9e';
      ctx.fillRect(-14.6, -27.4, 5.6, 8);
      ctx.fillRect(9, -27.4, 5.6, 8);
    } else if (o.acc === 'crown') {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(-9.5, -33.6); ctx.lineTo(-9.5, -26.4);
      ctx.lineTo(-4.6, -30.2); ctx.lineTo(0, -26.4); ctx.lineTo(4.6, -30.2); ctx.lineTo(9.5, -26.4); ctx.lineTo(9.5, -33.6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff5d9e';
      [[-6.6, -27], [0, -27], [6.6, -27]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 1.2, 0, TAU); ctx.fill(); });
    }
    ctx.restore();
  }

  function drawScreen() {
    // etichette bot
    roomBots.forEach(bp => {
      const s = toS(bp.x, bp.y - 46);
      const nm = D.bots[bp.id] && D.bots[bp.id].name || bp.id;
      ctx.font = '900 12px system-ui,sans-serif';
      const w = ctx.measureText(nm).width + 14;
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); rr(s.x - w / 2, s.y - 9, w, 17, 9); ctx.fill();
      ctx.fillStyle = '#4a2a8f';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(nm, s.x, s.y + 0.5);
    });
    // bolle
    const now = performance.now();
    bubbles.forEach(b => {
      const sp = toS(b.x, b.y - (b.owner === 'player' ? 62 : 50));
      const fade = Math.min(1, (b.t + b.dur - now) / 260, (now - b.t) / 180 + 0.6);
      let w = 0;
      ctx.font = '600 13.5px system-ui,sans-serif';
      b.lines.forEach(l => { w = Math.max(w, ctx.measureText(l).width); });
      const bw = w + 18, bh = b.lines.length * 17 + 10;
      let bx = Math.min(Math.max(sp.x - bw / 2, 4), CW - bw - 4);
      let by = Math.max(sp.y - bh - 4, 8);
      if (by < 40 && b.owner === 'player') by = 46;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, fade));
      ctx.fillStyle = b.color || '#fff';
      ctx.strokeStyle = b.border || '#c9b6ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); rr(bx, by, bw, bh, 11); ctx.fill(); ctx.stroke();
      // coda
      ctx.fillStyle = b.color || '#fff';
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2 - 5, by + bh - 1);
      ctx.lineTo(bx + bw / 2, by + bh + 8);
      ctx.lineTo(bx + bw / 2 + 5, by + bh - 1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = b.ink || '#3a2a8f';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      b.lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 8 + i * 17 + 4));
      ctx.globalAlpha = 1;
    });
    // effetti
    fx.forEach(f => {
      const p = (now - f.t) / f.life;
      const sp = toS(f.x, f.y - p * 70);
      ctx.globalAlpha = 1 - p;
      ctx.font = (f.size || 18) + 'px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.e, sp.x, sp.y);
      ctx.globalAlpha = 1;
    });
  }

  function rr(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    if (!room()) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    drawWorld();
    drawScreen();
  }

  /* ============================ INPUT ============================ */
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const w = toW(e.clientX, e.clientY);
    const r = room();
    if (w.x < 20 || w.y < 20 || w.x > r.w - 20 || w.y > r.h - 20) return;
    // la tua camera: posiziona/rimuovi mobili
    if (st.room === 'camera') {
      const slots = room().slots || [];
      let done = false;
      slots.forEach((sp, si) => {
        if (done) return;
        const placed = st.placed.find(p => p.slot === si);
        if (Math.hypot(sp.x - w.x, sp.y - w.y) < 52) {
          done = true;
          if (placed) {
            walkTo(sp.x, sp.y + 10, () => removePlaced(si));
          } else if (st.shopItems.length) {
            walkTo(sp.x, sp.y + 10, () => placeFirst(si));
          } else {
            walkTo(sp.x, sp.y + 10, () => toast('Magazzino vuoto: compra un mobile al 🛒 Negozio'));
          }
        }
      });
      if (done) return;
    }
    // bot?
    let target = null, best = 60;
    roomBots.forEach(bp => {
      const d = Math.hypot(bp.x - w.x, bp.y - w.y);
      if (d < best) { best = d; target = { kind: 'bot', bp }; }
    });
    if (target) {
      walkTo(target.bp.x - 12, target.bp.y + 16, () => talkBot(target.bp));
      return;
    }
    // mobili interattivi
    let fur = null, fbest = 60;
    (r.furniture || []).forEach(f => {
      const d = Math.hypot(f.x - w.x, f.y - w.y);
      if (d < fbest) { fbest = d; fur = f; }
    });
    if (fur && D.furnitureReplies[fur.e]) {
      walkTo(fur.x + (fur.x < w.x ? -14 : 14), fur.y + 16, () => interactFurniture(fur));
      return;
    }
    walkTo(w.x, w.y);
  });

  /* ============================ UI: stanze ============================ */
  function renderRooms() {
    const list = $('roomList');
    list.innerHTML = '';
    Object.keys(D.rooms).forEach(id => {
      const r = D.rooms[id];
      const b = document.createElement('button');
      b.className = 'room' + (st.room === id ? ' here' : '');
      b.dataset.room = id;
      b.innerHTML = '<span class="re">' + r.emoji + '</span><span style="flex:1"><b>' + r.name + '</b><small>' + r.hint + '</small></span>' +
        (st.room === id ? '<span class="online">● qui</span>' : '<span class="online">' + (2 + Math.floor(Math.random() * 5)) + ' in stanza</span>');
      b.onclick = () => { $('sRooms').classList.remove('on'); enterRoom(id); };
      list.appendChild(b);
    });
  }

  /* ============================ UI: guardaroba ============================ */
  function ownedColor(hex) { return st.ownedColors.includes(hex); }
  function buyEquipColor(hex) {
    const isSkin = D.skins.includes(hex), isHair = D.hairColors.includes(hex),
      isTop = D.tops.includes(hex), isPants = D.pants.includes(hex);
    const idx = isSkin ? D.skins.indexOf(hex) : isHair ? D.hairColors.indexOf(hex) : isTop ? D.tops.indexOf(hex) : D.pants.indexOf(hex);
    let cost = idx <= 1 ? 0 : 12;
    cost = effCost(cost);
    const slot = isSkin ? 'skin' : isHair ? 'hairColor' : isTop ? 'top' : 'pants';
    if (!ownedColor(hex)) {
      if (st.coins < cost) { toast('🪙 Ti servono ' + cost + ' monete per questo colore'); return; }
      st.coins -= cost; st.ownedColors.push(hex);
      coinSound();
    }
    st.outfit[slot] = hex;
    equipDone();
  }
  function equipStyle(slot, id, cost, type) {
    const owned = type === 'style' ? st.ownedStyles.includes(id) : st.ownedAcc.includes(id);
    cost = effCost(cost);
    if (!owned) {
      if (st.coins < cost) { toast('🪙 Ti servono ' + cost + ' monete'); return; }
      st.coins -= cost;
      (type === 'style' ? st.ownedStyles : st.ownedAcc).push(id);
      coinSound();
    }
    st.eqStyle[slot] = id;
    st.outfit[slot] = id;
    equipDone();
  }
  function equipDone() { updateHUD(); save(); renderWardrobe(); draw(); }
  function colorBtn(hex, on) {
    return '<button class="opt ' + (on ? 'on' : '') + '" data-hex="' + hex + '"><span class="sw" style="background:' + hex + '"></span>' +
      (ownedColor(hex) ? '' : '<small class="coin-tag">🪙12</small>') + '</button>';
  }
  function renderWardrobe() {
    $('coinLbl').textContent = '🪙 ' + st.coins;
    const body = $('wardBody');
    let h = '';
    // capelli
    h += '<div class="gtitle">Taglio di capelli</div><div class="rowopt">';
    D.wardrobe.hairStyle.forEach(opt => {
      const owned = st.ownedStyles.includes(opt.id);
      h += '<button class="opt ' + (st.eqStyle.hairStyle === opt.id ? 'on' : '') + (owned ? '' : ' lock') + '" data-style="' + opt.id + '" data-slot="hairStyle" data-cost="' + opt.cost + '">' + opt.label +
        (owned ? '' : ' <small class="coin-tag">🪙' + effCost(opt.cost) + '</small>') + '</button>';
    });
    h += '</div>';
    h += '<div class="gtitle">Accessorio</div><div class="rowopt">';
    D.wardrobe.acc.forEach(opt => {
      const owned = st.ownedAcc.includes(opt.id);
      h += '<button class="opt ' + (st.eqStyle.acc === opt.id ? 'on' : '') + (owned ? '' : ' lock') + '" data-acc="' + opt.id + '" data-cost="' + opt.cost + '">' + opt.label +
        (owned ? '' : ' <small class="coin-tag">🪙' + effCost(opt.cost) + '</small>') + '</button>';
    });
    h += '</div>';
    h += '<div class="gtitle">Pelle</div><div class="rowopt">' + D.wardrobe.skin.map(x => colorBtn(x, st.outfit.skin === x)).join('') + '</div>';
    h += '<div class="gtitle">Colore capelli</div><div class="rowopt">' + D.wardrobe.hairColor.map(x => colorBtn(x, st.outfit.hairColor === x)).join('') + '</div>';
    h += '<div class="gtitle">Tuta</div><div class="rowopt">' + D.wardrobe.top.map(x => colorBtn(x, st.outfit.top === x)).join('') + '</div>';
    h += '<div class="gtitle">Pantaloni</div><div class="rowopt">' + D.wardrobe.pants.map(x => colorBtn(x, st.outfit.pants === x)).join('') + '</div>';
    h += '<div class="hint" style="font-size:.75rem;color:#8a7fb8;margin-top:10px">I primi 2 colori di ogni palette sono gratis. Gli altri costano 🪙12. Le monete si guadagnano parlando con gli ospiti e toccando gli oggetti luccicanti ✨</div>';
    body.innerHTML = h;

    body.querySelectorAll('[data-style]').forEach(b => b.onclick = () => equipStyle('hairStyle', b.dataset.style, parseInt(b.dataset.cost, 10), 'style'));
    body.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => equipStyle('acc', b.dataset.acc, parseInt(b.dataset.cost, 10), 'acc'));
    body.querySelectorAll('[data-hex]').forEach(b => b.onclick = () => buyEquipColor(b.dataset.hex));
  }

  /* ============================ UI: emotes ============================ */
  function renderEmotes() {
    const list = $('emoList');
    list.innerHTML = '';
    D.emotes.forEach(em => {
      const b = document.createElement('button');
      b.className = 'emo';
      b.innerHTML = '<span class="e">' + em.e + '</span>' + em.label;
      b.onclick = () => { $('sEmotes').classList.remove('on'); doEmote(em); };
      list.appendChild(b);
    });
  }

  /* ============================ UI: chat ============================ */
  const composer = $('composer');
  function openComposer() {
    composer.classList.add('on');
    const inp = $('chatInput');
    inp.value = '';
    setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
  }
  function closeComposer() { composer.classList.remove('on'); try { $('chatInput').blur(); } catch (e) {} }

  /* ============================ start screen ============================ */
  const avprev = $('avprev');
  function paintPreview() {
    const c = avprev.getContext('2d');
    const W = avprev.width, H = avprev.height;
    c.clearRect(0, 0, W, H);
    const o = st.outfit;
    const cx = W / 2, cy = H / 2 + 18, sc = 1.5;
    c.save();
    c.translate(cx, cy);
    c.scale(sc, sc);
    // corpo
    c.fillStyle = o.top;
    rr2(c, -10, -4, 20, 22, 6); c.fill();
    // testa
    c.fillStyle = o.skin;
    c.beginPath(); c.arc(0, -20, 12, 0, TAU); c.fill();
    // occhi + bocca
    c.fillStyle = '#261a3d';
    c.fillRect(-6, -21.5, 2.2, 3);
    c.fillRect(3.8, -21.5, 2.2, 3);
    c.beginPath(); c.arc(0, -12.4, 2, 0.15, Math.PI - 0.15); c.stroke();
    // guance
    c.fillStyle = 'rgba(255,120,140,.5)';
    c.beginPath(); c.arc(-7.2, -17, 2, 0, TAU); c.fill();
    c.beginPath(); c.arc(7.2, -17, 2, 0, TAU); c.fill();
    // capelli
    c.fillStyle = o.hairColor;
    const hs = o.hairStyle;
    if (hs === 'long') {
      c.beginPath(); c.arc(0, -21.5, 12.2, Math.PI * 0.92, Math.PI * 0.08); c.fill();
      c.fillRect(-10.2, -22, 4, 15);
      c.fillRect(6.2, -22, 4, 15);
    } else if (hs === 'curly') {
      c.beginPath(); c.arc(0, -22.5, 11.6, Math.PI, 0); c.fill();
    } else if (hs === 'puff') {
      c.beginPath(); c.arc(0, -23.5, 8.6, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(-6.8, -22.5, 5, Math.PI * .6, Math.PI * 1.6); c.fill();
      c.beginPath(); c.arc(6.8, -22.5, 5, Math.PI * .4, -Math.PI * .6); c.fill();
    } else if (hs !== 'bald') {
      c.beginPath(); c.arc(0, -21.8, 12, Math.PI, 0); c.fill();
    }
    // accessori
    if (o.acc === 'glasses') {
      c.strokeStyle = '#3a2a8f'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(-4.6, -20.6, 3.2, 0, TAU); c.stroke();
      c.beginPath(); c.arc(4.6, -20.6, 3.2, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-1.4, -20.6); c.lineTo(1.4, -20.6); c.stroke();
    } else if (o.acc === 'cap') {
      c.fillStyle = o.top;
      c.beginPath(); c.arc(0, -22.6, 12.2, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(-11, -20.6, 2.4, 0, TAU); c.fill();
    } else if (o.acc === 'headphones') {
      c.strokeStyle = '#3a2a8f'; c.lineWidth = 2.6;
      c.beginPath(); c.arc(0, -21, 11.8, Math.PI * .82, Math.PI * 1.18); c.stroke();
      c.fillStyle = '#ff5d9e';
      c.fillRect(-14, -26, 5.2, 7);
      c.fillRect(8.8, -26, 5.2, 7);
    } else if (o.acc === 'crown') {
      c.fillStyle = '#ffd166';
      c.beginPath();
      c.moveTo(-9, -31.6); c.lineTo(-9, -24.6); c.lineTo(-4.4, -28.2); c.lineTo(0, -24.6); c.lineTo(4.4, -28.2); c.lineTo(9, -24.6); c.lineTo(9, -31.6);
      c.closePath(); c.fill();
    }
    c.restore();
  }
  function rr2(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function makeSwatches(colors, sel) {
    return colors.map((col, i) => '<button class="swatch ' + (sel === col ? 'on' : '') + '" data-c="' + i + '" style="background:' + col + '"></button>').join('');
  }
  function bindStart() {
    const skinEl = $('skinSw'), hairEl = $('hairSw'), topEl = $('topSw');
    function refreshSwatches() {
      skinEl.innerHTML = makeSwatches(D.skins, st.outfit.skin);
      hairEl.innerHTML = makeSwatches(D.hairColors, st.outfit.hairColor);
      topEl.innerHTML = makeSwatches(D.tops, st.outfit.top);
    }
    function bindCols() {
      [skinEl, hairEl, topEl].forEach((el, gi) => {
        el.querySelectorAll('.swatch').forEach(sw => {
          sw.onclick = () => {
            const i = parseInt(sw.dataset.c, 10);
            if (gi === 0) st.outfit.skin = D.skins[i];
            else if (gi === 1) st.outfit.hairColor = D.hairColors[i];
            else st.outfit.top = D.tops[i];
            refreshSwatches(); bindCols(); paintPreview();
          };
        });
      });
    }
    refreshSwatches(); bindCols(); paintPreview();
    $('enterBtn').onclick = () => {
      const nick = $('nick').value.trim();
      st.nick = (nick || 'Ospite').slice(0, 14);
      normalize();
      $('cover').style.display = 'none';
      setupRoom();
      updateHUD();
      resize();
      renderRooms(); renderEmotes(); renderWardrobe();
      $('dbRooms').classList.add('on');
      startLoop();
      save();
      blip(523, .15, 'triangle'); setTimeout(() => blip(784, .2, 'triangle'), 90);
      toast('🎉 Benvenuto al Miraggio, ' + st.nick + '! Tocca gli ospiti per chiacchierare e guadagna monete.');
    };
    $('nick').addEventListener('keydown', e => { if (e.key === 'Enter') $('enterBtn').click(); });
  }

  /* ============================ loop start ============================ */
  let running = false;
  function startLoop() {
    if (running) return;
    running = true;
    lastT = performance.now();
    requestAnimationFrame(loop);
  }

  /* ============================ UI wiring ============================ */
  function bindUI() {
    function closeAllSheets() {
      document.querySelectorAll('.sheetwrap').forEach(x => x.classList.remove('on'));
      closeComposer();
      document.querySelectorAll('.db').forEach(b => b.classList.remove('on'));
    }
    $('dbRooms').onclick = () => { const el = $('sRooms'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderRooms(); $('dbRooms').classList.add('on'); } };
    $('dbChat').onclick = () => { const was = composer.classList.contains('on'); closeAllSheets(); if (!was) { openComposer(); $('dbChat').classList.add('on'); } };
    $('dbEmotes').onclick = () => { const el = $('sEmotes'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderEmotes(); $('dbEmotes').classList.add('on'); } };
    $('dbWardrobe').onclick = () => { const el = $('sWardrobe'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderWardrobe(); $('dbWardrobe').classList.add('on'); } };
    document.querySelectorAll('.sheetwrap').forEach(sw => sw.addEventListener('click', e => { if (e.target === sw) { sw.classList.remove('on'); closeAllSheets(); } }));
    document.querySelectorAll('[data-close]').forEach(x => x.onclick = () => { $(x.dataset.close).classList.remove('on'); document.querySelectorAll('.db').forEach(b => b.classList.remove('on')); });
    // chat
    $('chatSend').onclick = () => sendChat($('chatInput').value);
    $('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat($('chatInput').value); });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resize(); });
    // reset
    const resetLink = document.createElement('button');
    resetLink.className = 'x';
    resetLink.textContent = '↺';
    resetLink.style.cssText = 'background:rgba(255,255,255,.2);color:#fff;margin-top:14px';
    resetLink.title = 'Ricomincia da capo';
    resetLink.onclick = () => { if (confirm('Ripartire da zero? Perdi monete e look.')) { wipe(); location.reload(); } };
    document.querySelector('.cover .panel').appendChild(resetLink);
  }
  /* ============================ boot ============================ */
  function boot() {
    normalize();
    const hasSave = load();
    normalize();
    wireExtras();
    wireExtra2();
    // PWA: manifest + service worker (solo su https/localhost)
    try {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = 'manifest.webmanifest';
      document.head.appendChild(link);
      if ('serviceWorker' in navigator && /^https:|^http:/.test(location.protocol)) {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      }
    } catch (e) {}
    bindUI();
    // prepara outfit di default se salvataggio parziale
    if (hasSave) {
      $('nick').value = st.nick;
      $('cover').style.display = 'none';
      $('cover').classList.remove('on');
      setupRoom(); updateHUD(); renderRooms(); renderEmotes(); renderWardrobe(); resize(); startLoop();
      toast('👋 Bentornato, ' + (st.nick || 'Ospite') + '!');
    } else {
      st = freshState();
      bindStart();
    }
    window.addEventListener('error', (e) => { try { toast('Ops: ' + (e.message || 'errore')); } catch (x) {} });
  }

  function closeAllSheets() {
    document.querySelectorAll('.sheetwrap').forEach(x => x.classList.remove('on'));
    closeComposer();
    document.querySelectorAll('.db').forEach(b => b.classList.remove('on'));
  }

  /* ============ AFFINITÀ, LIVELLI E STORIE ============ */
  const LVL_T = [1, 4, 8, 13, 20];
  function lvlOf(botId) {
    const x = (st.friends && st.friends[botId] && st.friends[botId].x) || 0;
    let l = 0; LVL_T.forEach(t => { if (x >= t) l++; });
    return Math.min(5, l);
  }
  function affTalk(botId) {
    st.friends = st.friends || {}; st.friends[botId] = st.friends[botId] || { x: 0 };
    const old = lvlOf(botId);
    st.friends[botId].x++;
    const lv = lvlOf(botId);
    st.stats.talks = (st.stats.talks || 0) + 1;
    xpAdd(2);
    if (lv > old) onLevelUp(botId, lv);
    else missionHit('talk', botId);
    save();
  }
  function onLevelUp(botId, lv) {
    const ci = D.charInfo[botId];
    const bname = D.bots[botId] ? D.bots[botId].name : botId;
    missionHit('talk', botId);
    if (!ci) return;
    const f = st.friends[botId];
    if (lv === 2 && !f.s1) { f.s1 = true; storySay(botId, ci.s1, '📖'); addSticker(botId); xpAdd(10); logDiary('📖 ' + bname + ' ti ha confidato il primo segreto.'); }
    if (lv === 3 && !f.s3) { f.s3 = true; const l3 = D.story3[botId]; if (l3) storySay(botId, l3, '🤩'); xpAdd(12); logDiary('🤩 ' + bname + ' ha un altro capitolo di storia.'); }
    if (lv === 4 && !f.s2) { f.s2 = true; storySay(botId, ci.s2, '🤫'); xpAdd(15); logDiary('🤫 Il grande segreto di ' + bname + ': lo sai anche tu, ora.'); }
    if (lv === 5 && !f.trophy) {
      f.trophy = true;
      st.items.push({ e: ci.trophy, name: 'Trofeo di ' + bname });
      addCoins(8);
      xpAdd(25);
      toast('🏆 Trofeo sbloccato: ' + ci.trophy + ' (+8 🪙)');
      spawnFx(player.x, player.y - 50, '🏆', 22);
      logDiary('🏆 Trofeo conquistato: ' + ci.trophy + ' (' + bname + ')');
      blip(660, .1, 'triangle'); setTimeout(() => blip(880, .14, 'triangle'), 90);
    }
    save();
  }
  function storySay(botId, txt, tag) {
    const bp = roomBots.find(b => b.id === botId);
    const who = bp || { id: botId, x: player.x, y: player.y - 60 };
    setTimeout(() => {
      const cur = roomBots.find(b => b.id === botId);
      const w = cur || who;
      bubbles.push({ x: w.x, y: w.y - 10, owner: 'story' + botId, lines: wrapLines(tag + ' ' + txt), t: performance.now(), dur: 6000, color: '#fff3d6', ink: '#6b4a00', border: '#ffd166' });
      if (cur && Math.random() < 0.4) spawnFx(cur.x, cur.y - 50, '💛');
    }, 1500);
  }
  function affEmote(botId, emoteId) {
    missionHit('emote', botId);
    const ci = D.charInfo[botId];
    if (!ci) return;
    if (ci.likes.indexOf(emoteId) >= 0) {
      st.friends[botId] = st.friends[botId] || { x: 0 };
      const old = lvlOf(botId);
      st.friends[botId].x += 2;
      const lv = lvlOf(botId);
      if (lv > old) onLevelUp(botId, lv);
      else if (Math.random() < 0.7) { addCoins(1); spawnFx(player.x, player.y - 46, '💛'); }
      xpAdd(2);
      const bp = roomBots.find(b => b.id === botId);
      if (bp && Math.random() < 0.55) {
        const lines = ['Adoro quando fai così! 💖', 'Ecco, questa emote vale più di mille parole!', 'Ti copio!'];
        setTimeout(() => say(bp, lines[Math.floor(Math.random() * lines.length)], 3200), 600);
      }
    } else {
      const bp = roomBots.find(b => b.id === botId);
      if (bp && Math.random() < 0.5) {
        const lines = ['Ahi, questa emote mi ha colpito in pieno…', 'Ok, ok… questa la incasso con sportività 😅', 'Il mio cuoricino digitale ha fatto "glitch".'];
        setTimeout(() => say(bp, lines[Math.floor(Math.random() * lines.length)], 3000), 500);
      }
    }
    save();
  }

  /* ============ MISSIONI GIORNALIERE ============ */
  function dayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function ensureMissions() {
    st.missions = st.missions || { date: '', list: [] };
    if (st.missions.date === dayKey() && st.missions.list.length) return;
    const pool = D.missionPool;
    const seed = dayKey().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pick = [];
    const add = (v) => { const i = ((v % pool.length) + pool.length) % pool.length; if (pick.indexOf(i) < 0) pick.push(i); };
    add(seed); add(seed * 7 + 3); add(seed * 13 + 11);
    st.missions = { date: dayKey(), list: pick.map(i => ({ i, p: 0, done: false })) };
    save();
  }
  function missionHit(type, botId) {
    ensureMissions();
    let changed = false;
    st.missions.list.forEach(m => {
      if (m.done) return;
      const tpl = D.missionPool[m.i];
      if (!tpl) return;
      if (tpl.t !== type) return;
      if (tpl.bot && tpl.bot !== botId) return;
      m.p = Math.min(tpl.n, m.p + 1);
      if (m.p >= tpl.n) { m.done = true; changed = true; }
    });
    if (changed) {
      const doneCount = st.missions.list.filter(x => x.done).length;
      addCoins(5);
      xpAdd(12);
      const doneM = st.missions.list.filter(x => x.done);
      const lastM = doneM[doneM.length - 1];
      if (lastM && D.missionPool[lastM.i]) logDiary('📋 Missione: ' + D.missionPool[lastM.i].title);
      toast('📋 Missione completata! +5 🪙 (' + doneCount + '/' + st.missions.list.length + ')');
      spawnFx(player.x, player.y - 50, '✅');
      blip(700, .1, 'triangle'); setTimeout(() => blip(1050, .12, 'triangle'), 80);
      save();
    }
  }
  function missionsLeftToday() { ensureMissions(); return st.missions.list.filter(m => !m.done).length; }

  /* ============ UI missioni / amici / trofei ============ */
  function heartsHtml(lv) {
    let h = '';
    for (let i = 0; i < 5; i++) h += i < lv ? '❤️' : '🤍';
    return h;
  }
  function renderMissionsUI() {
    normalize(); ensureMissions();
    const b = $('missionsBody');
    const gb = D.bots[guestId()];
    const guestBanner = '<div style="background:#fff6df;border:1.5px solid #ffd166;border-radius:13px;padding:8px 12px;margin-bottom:9px;font-size:.8rem;color:#6b4a00">⭐ <b>Ospite del giorno: ' + (gb ? gb.name : '?') + '</b> — oggi parlargli vale il doppio!</div>';
    let html = '';
    const done = st.missions.list.filter(m => m.done).length;
    st.missions.list.forEach(m => {
      const tpl = D.missionPool[m.i];
      if (!tpl) return;
      const pct = Math.min(100, Math.round((m.p / tpl.n) * 100));
      html += '<div style="background:#faf8ff;border:1.5px solid ' + (m.done ? '#3ddc97' : '#e7e0ff') + ';border-radius:14px;padding:10px 12px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:.9rem;color:#3a2a8f">' + tpl.title + '</b>' +
        (m.done ? '<span style="color:#0a8f52;font-weight:900">✓ fatto!</span>' : '<span style="color:#8a7fb8;font-size:.75rem">' + m.p + '/' + tpl.n + '</span>') + '</div>' +
        '<div style="font-size:.72rem;color:#8a7fb8">' + tpl.desc + '</div>' +
        '<div style="height:6px;background:#efe9ff;border-radius:99px;margin-top:7px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + (m.done ? '#3ddc97' : 'linear-gradient(90deg,#5b3bd6,#ff5d9e)') + ';border-radius:99px"></div></div></div>';
    });
    b.innerHTML = guestBanner + (html || '<div style="color:#8a7fb8">Nessuna missione.</div>');
    $('missionsDone').textContent = done + '/' + st.missions.list.length + ' completate';
    // amici
    const fb = $('friendsBody');
    let fh = '';
    Object.keys(D.bots).forEach(id => {
      const bot = D.bots[id];
      const lv = lvlOf(id);
      const ci = D.charInfo[id];
      const f = st.friends[id] || {};
      const locked2 = lv < 2 ? ' 🔒' : '';
      const locked4 = lv < 4 ? ' 🔒' : '';
      fh += '<div style="display:flex;align-items:center;gap:9px;background:#faf8ff;border:1px solid #e7e0ff;border-radius:13px;padding:8px 10px;margin-bottom:6px">' +
        '<span style="font-size:20px">' + bot.emoji + '</span>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:.86rem;color:#3a2a8f">' + bot.name + ' <span style="color:#8a7fb8;font-weight:500;font-size:.7rem">· ' + bot.role + '</span></div>' +
        '<div style="font-size:.72rem">' + heartsHtml(lv) + ' <span style="color:#8a7fb8">' + (ci ? ('storia ' + lv + '/5') : '') + '</span></div>' +
        (ci ? '<div style="font-size:.68rem;color:#a06f9f">💡 liv2:' + (f.s1 ? 'vista' : locked2) + ' · liv4:' + (f.s2 ? 'vista' : locked4) + '</div>' : '') +
        '</div></div>';
    });
    fb.innerHTML = fh;
    // trofei
    const tb = $('trophyBody');
    tb.innerHTML = st.items.length
      ? st.items.map(it => '<span style="display:inline-flex;align-items:center;gap:6px;background:#fff6df;border:1px solid #ffd166;border-radius:99px;padding:5px 11px;font-size:.78rem;font-weight:800;color:#6b4a00;margin:0 5px 6px 0">' + it.e + ' ' + it.name + '</span>').join('')
      : '<div style="color:#8a7fb8;font-size:.8rem">Nessun trofeo ancora: porta un ospite a livello 5 parlandogli e con le emote che ama!</div>';
    // album degli amici (figurine)
    const ab = $('albumBody');
    if (ab) {
      let ah = '';
      Object.keys(D.bots).forEach(id => {
        const got = st.stickers && st.stickers[id];
        const nm = D.bots[id] ? D.bots[id].name : id;
        const em = D.bots[id] ? D.bots[id].emoji : '❓';
        ah += '<span title="' + nm + '" style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;margin:0 4px 6px 0;background:' + (got ? 'linear-gradient(135deg,#ffe08a,#ff9f43)' : '#efe9ff') + ';border:1.5px solid ' + (got ? '#e09b00' : '#e7e0ff') + ';font-size:22px;filter:' + (got ? 'none' : 'grayscale(1)') + ';opacity:' + (got ? 1 : .55) + '">' + em + '</span>';
      });
      const gotN = Object.keys(st.stickers || {}).length;
      ab.innerHTML = ah + '<div style="font-size:.72rem;color:#8a7fb8;margin-top:2px">' + gotN + '/' + Object.keys(D.bots).length + ' raccolte — si sbloccano al segreto del livello 2. Album completo: +50 🪙.</div>';
    }
    // diario del Miraggio
    const db = $('diaryBody');
    if (db) {
      db.innerHTML = st.log && st.log.length
        ? '<div style="font-family:ui-monospace,monospace;font-size:.74rem;line-height:1.8;color:#5a4a9f;max-height:200px;overflow-y:auto">' + st.log.map(l => '<div>' + l + '</div>').join('') + '</div>'
        : '<div style="color:#8a7fb8;font-size:.8rem">Nessuna voce… il Miraggio aspetta la tua storia!</div>';
    }
  }

  /* ============ MINIGIOCHI ============ */
  function openGame(id) {
    if (id === 'memory') startMemory();
    else if (id === 'gabbiano') startGabbiano();
    else if (id === 'slot') startSlot();
    else if (id === 'treasure') startTreasure();
  }
  function showGame(title) {
    closeAllSheets();
    $('gameTitle').textContent = title;
    $('gameWrap').classList.add('on');
  }
  function closeGame() {
    $('gameWrap').classList.remove('on');
    if (memTimer) clearInterval(memTimer);
    if (gabbTimer) clearInterval(gabbTimer);
  }
  function doneGame(id, earned, msg) {
    st.stats = st.stats || {};
    st.stats.best = st.stats.best || {};
    st.stats.best[id] = Math.max(st.stats.best[id] || 0, earned);
    st.stats.games = (st.stats.games || 0) + 1;
    missionHit('minigame', null);
    if (earned > 0) { addCoins(earned); }
    xpAdd(8);
    const gname = D.minigames[id] ? D.minigames[id].name : id;
    logDiary('🎮 ' + gname + (earned > 0 ? ' → +' + earned + ' 🪙' : ' → riprovaci!'));
    toast(msg || (earned > 0 ? ('🎉 +' + earned + ' 🪙') : 'Riprova: la fortuna gira!'));
    renderGamesUI();
    save();
  }
  const EMO_POOL = ['🍒', '🍋', '⭐', '🔔', '💎', '🍩', '🍉', '🐸'];
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* --- Memoria di coppie --- */
  let memTimer = null;
  function startMemory() {
    closeGame(); showGame('🧠 Memoria di coppie');
    const body = $('gameBody');
    const pairs = shuffle(EMO_POOL).slice(0, 6);
    const cards = shuffle(pairs.concat(pairs));
    let open = [], locked = false, found = 0, timeLeft = 45;
    body.innerHTML = '<div style="text-align:center;color:#8a7fb8;font-size:.85rem">Trova le 6 coppie prima che scada il tempo<br><b id="memTime" style="color:#5b3bd6">45s</b></div><div id="memGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px"></div><div id="memEnd"></div>';
    const grid = $('memGrid');
    cards.forEach((e, i) => {
      const b = document.createElement('button');
      b.className = 'memc';
      b.style.cssText = 'aspect-ratio:1;border-radius:14px;border:2px solid #e7e0ff;background:linear-gradient(135deg,#5b3bd6,#8a4bd6);color:#fff;font-size:26px;cursor:pointer';
      b.dataset.i = i; b.dataset.e = e;
      b.addEventListener('click', () => {
        if (locked || open.includes(i) || b.dataset.done) return;
        b.textContent = e;
        b.style.background = '#fff';
        open.push(i);
        if (open.length === 2) {
          locked = true;
          const a = cards[open[0]], c = cards[open[1]];
          if (a === c) {
            found++;
            grid.children[open[0]].dataset.done = '1';
            grid.children[open[1]].dataset.done = '1';
            grid.children[open[0]].style.background = '#3ddc97';
            grid.children[open[1]].style.background = '#3ddc97';
            open = []; locked = false;
            blip(900, .07, 'triangle');
            if (found === 6) { clearInterval(memTimer); doneGame('memory', 6 + Math.max(0, Math.round(timeLeft / 4)), '🧠 Memoria completata!'); }
          } else {
            setTimeout(() => {
              grid.children[open[0]].textContent = ''; grid.children[open[0]].style.background = '';
              grid.children[open[1]].textContent = ''; grid.children[open[1]].style.background = '';
              open = []; locked = false;
            }, 620);
          }
        }
      });
      grid.appendChild(b);
    });
    clearInterval(memTimer);
    memTimer = setInterval(() => {
      timeLeft--;
      const el = $('memTime');
      if (el) el.textContent = timeLeft + 's';
      if (timeLeft <= 0) { clearInterval(memTimer); doneGame('memory', 0, '⏰ Tempo scaduto! Ma Leo ha applaudito comunque.'); }
    }, 1000);
  }

  /* --- Whack-a-Tino --- */
  let gabbTimer = null;
  function startGabbiano() {
    closeGame(); showGame('🕊️ Whack-a-Tino!');
    const body = $('gameBody');
    const W = 330, H = 320;
    body.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:900;color:#3a2a8f"><span>🪙 ' + D.minigames.gabbiano.rewardBase + ' per punto</span><span id="gbTime">20s</span></div><canvas id="gbCv" width="' + W + '" height="' + H + '" style="width:100%;height:auto;background:radial-gradient(circle at 50% 20%,#bfeaff,#7fd8ff);border-radius:16px;margin-top:8px;touch-action:none"></canvas><div style="text-align:center;font-weight:900;color:#5b3bd6;margin-top:6px">Punti: <span id="gbScore">0</span></div>';
    const cv = $('gbCv'), g = cv.getContext('2d');
    const birds = [];
    let score = 0, timeLeft = 20;
    function spawn() {
      if (birds.length >= 3) return;
      const gold = Math.random() < 0.18;
      birds.push({ x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 70), gold, t: performance.now() });
    }
    function drawBirds() {
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.5)';
      for (let r = 0; r < 4; r++) { g.beginPath(); g.arc(40 + r * 84, 55 + (r % 2) * 70, 30, 0, 7); g.fill(); }
      birds.forEach(b => {
        const bob = Math.sin((performance.now() - b.t) / 130) * 4;
        g.font = '34px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(b.gold ? '🐤' : '🕊️', b.x, b.y + bob);
      });
    }
    function hitTest(x, y) {
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        if (Math.abs(x - b.x) < 26 && Math.abs(y - b.y) < 26) {
          birds.splice(i, 1);
          score += b.gold ? 3 : 1;
          $('gbScore').textContent = score;
          blip(500 + score * 60, .07, 'square');
          return;
        }
      }
    }
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) * (W / r.width);
      const y = (e.clientY - r.top) * (H / r.height);
      hitTest(x, y);
    });
    clearInterval(gabbTimer);
    spawn(); spawn();
    gabbTimer = setInterval(() => {
      if (Math.random() < 0.8) spawn();
      timeLeft -= 0.2;
      const el = $('gbTime');
      if (el) el.textContent = Math.max(0, Math.round(timeLeft)) + 's';
      drawBirds();
      if (timeLeft <= 0) {
        clearInterval(gabbTimer);
        const earned = score;
        doneGame('gabbiano', earned, earned > 0 ? ('🕊️ ' + earned + ' gabbiani colpiti! (+' + earned + ' 🪙)') : '🕊️ Tino è sfuggito a tutti… stavolta.');
      }
    }, 200);
  }

  /* --- Slot --- */
  function startSlot() {
    if (st.coins < 5) { toast('Ti servono 5 🪙 per giocare'); renderGamesUI(); return; }
    closeGame(); showGame('🎰 Jackpot delle risate');
    const body = $('gameBody');
    const sym = ['🍒', '🍋', '⭐', '🔔', '7️⃣', '🍩', '💎'];
    let reels = [0, 0, 0];
    body.innerHTML = '<div style="text-align:center;color:#8a7fb8;font-size:.85rem">Punta 5 🪙 e allinea le emoji</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;margin:16px 0"><div id="sl" style="display:flex;gap:10px"></div></div>' +
      '<div style="display:flex;gap:8px;justify-content:center"><button class="bigbtn" id="slSpin" style="max-width:240px">🔄 Gira (5 🪙)</button></div>' +
      '<div id="slRes" style="text-align:center;min-height:40px;font-weight:900;color:#3a2a8f;margin-top:12px;font-size:1.05rem"></div>';
    const wrap = $('sl');
    for (let i = 0; i < 3; i++) {
      const r = document.createElement('div');
      r.id = 'sl' + i;
      r.style.cssText = 'width:78px;height:96px;display:grid;place-items:center;font-size:52px;background:linear-gradient(180deg,#fff,#f4ecff);border:3px solid #d9c9ff;border-radius:16px';
      r.textContent = sym[0];
      wrap.appendChild(r);
    }
    $('slSpin').addEventListener('click', () => {
      if (st.coins < 5) { toast('Monete insufficienti'); return; }
      st.coins -= 5; updateHUD(); save();
      $('slRes').textContent = '';
      $('slSpin').disabled = true;
      // esito predefinito
      const roll = Math.random();
      let res;
      if (roll < 0.08) res = [7, 7, 7];
      else if (roll < 0.3) { const k = 1 + Math.floor(Math.random() * 6); res = [k, k, 2]; }
      else { res = [Math.floor(Math.random() * 7), Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)]; }
      let frames = 0;
      const iv = setInterval(() => {
        frames++;
        for (let i = 0; i < 3; i++) {
          $('sl' + i).textContent = sym[Math.floor(Math.random() * 7)];
          if (frames > 9 - i * 3) $('sl' + i).textContent = sym[res[i]];
        }
        blip(300 + frames * 40, .04, 'sine');
        if (frames > 12) {
          clearInterval(iv);
          const a = res[0], b = res[1], c = res[2];
          let pay = 0, txt = 'Niente stavolta… la ruota si sta riposando.';
          if (a === b && b === c) { pay = (a === 7 ? 50 : 30); txt = '🎉 TRIS! +' + pay + ' 🪙'; }
          else if (a === b || b === c || a === c) { pay = 12; txt = '✨ Coppia! +' + pay + ' 🪙'; }
          $('slRes').textContent = txt;
          doneGame('slot', pay, pay > 0 ? txt : '🎰 La slot ti guarda. Sorride. Riprova!');
          $('slSpin').disabled = false;
        }
      }, 90);
    });
  }

  function renderGamesUI() {
    normalize();
    const b = $('gamesBody');
    st.stats = st.stats || {}; st.stats.best = st.stats.best || {};
    b.innerHTML = '';
    Object.keys(D.minigames).forEach(id => {
      const mg = D.minigames[id];
      const who = D.bots[mg.who];
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;gap:12px;align-items:center;background:#faf8ff;border:1.5px solid #e7e0ff;border-radius:16px;padding:12px;margin-bottom:10px';
      card.innerHTML = '<span style="font-size:30px">' + mg.emoji + '</span>' +
        '<div style="flex:1;min-width:0"><b style="color:#3a2a8f">' + mg.name + '</b>' +
        '<div style="font-size:.75rem;color:#8a7fb8">' + mg.how + '</div>' +
        '<div style="font-size:.7rem;color:#a06f9f">con ' + (who ? who.name : '?') + ' · record: ' + (st.stats.best[id] || 0) + '</div></div>' +
        '<button class="mini" data-game="' + id + '">Gioca ▶</button>';
      card.querySelector('[data-game]').addEventListener('click', () => openGame(id));
      b.appendChild(card);
    });
  }

  /* ============ WIRING EXTRA ============ */
  function wireExtras() {
    $('dbMissions').onclick = () => { const el = $('sMissions'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderMissionsUI(); $('dbMissions').classList.add('on'); } };
    $('dbGames').onclick = () => { const el = $('sGames'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderGamesUI(); $('dbGames').classList.add('on'); } };
    $('gameClose').onclick = () => closeGame();
    $('gameWrap').addEventListener('click', e => { if (e.target === $('gameWrap')) closeGame(); });
  }
  function normalize() {
    st.friends = st.friends || {};
    st.items = st.items || [];
    st.missions = st.missions || { date: '', list: [] };
    st.stats = st.stats || {};
    st.stats.best = st.stats.best || {};
    st.stats.talks = st.stats.talks || 0;
    st.stats.games = st.stats.games || 0;
    if (st.xp === undefined) st.xp = 0;
    if (st.lvl === undefined) st.lvl = 0;
    if (st.log === undefined) st.log = [];
    if (st.sound === undefined) st.sound = true;
    if (st.stickers === undefined) st.stickers = {};
    if (st.shopItems === undefined) st.shopItems = [];
    if (st.placed === undefined) st.placed = [];
    if (st.albumBonus === undefined) st.albumBonus = false;
    if (st._tick === undefined) st._tick = 0;
  }


  /* ============ EVENTI A ORARI ============ */
  function activeEvent() {
    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();
    for (const ev of D.events) {
      const start = ev.h * 60 + (ev.m || 0);
      const end = start + (ev.dur || 30);
      if (nowMin >= start && nowMin < end) {
        return { active: true, ...ev, end };
      }
    }
    return { active: false, next: null, mult: 1 };
  }
  function nextEventText() {
    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();
    let best = null;
    D.events.forEach(ev => {
      let start = ev.h * 60 + (ev.m || 0);
      if (start <= nowMin) start += 24 * 60;
      if (!best || start < best.start) best = { ...ev, start };
    });
    if (!best) return null;
    const diff = best.start - nowMin;
    const h = Math.floor(diff / 60), m = diff % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm';
  }
  let lastEvCheck = 0;
  let evActiveNow = false;
  function everyTick(dt) {
    if (!st) return;
    st._tick = (st._tick || 0) + dt;
    if (st._tick < 1) return;
    st._tick = 0;
    const now = performance.now();
    const ev = activeEvent();
    if (ev.active && !evActiveNow) {
      evActiveNow = true;
      toast(ev.msg);
      logDiary(ev.msg);
      if (st.room === 'discoteca' || st.room === 'bar') {
        for (let i = 0; i < 6; i++) setTimeout(() => spawnFx(150 + Math.random() * 380, 130 + Math.random() * 200, ev.emoji === '🪩' ? '🪩' : '🍹', 20), i * 200);
      }
    } else if (!ev.active) evActiveNow = false;
    // produzione mobili della camera
    productionTick();
  }
  function productionTick() {
    const now = Date.now();
    let gained = 0;
    (st.placed || []).forEach(p => {
      const item = D.furnitureShop.find(f => f.e === p.e);
      if (!item || !item.prod) return;
      if (!p.last) p.last = now;
      if (now - p.last >= 30000) { p.last = now; gained += item.prod; }
    });
    if (gained > 0) {
      addCoins(gained, true);
      if (st.room === 'camera') spawnFx(player.x, player.y - 46, '🪙');
    }
  }

  /* ============ OSPITE DEL GIORNO ============ */
  function guestId() {
    const keys = Object.keys(D.bots).sort();
    const seed = dayKey().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return keys[seed % keys.length];
  }

  /* ============ XP / LIVELLO GIOCATORE ============ */
  const XP_T = [20, 60, 120, 220, 340];
  function lvlOfPlayer() { let l = 0; XP_T.forEach(t => { if (st.xp >= t) l++; }); return l; }
  function xpAdd(n) {
    normalize();
    st.xp = (st.xp || 0) + n;
    const lv = lvlOfPlayer();
    if (lv > (st.lvl || 0)) {
      st.lvl = lv;
      addCoins(10 + lv * 5, true);
      toast('⬆️ Livello ' + lv + '! +' + (10 + lv * 5) + ' 🪙' + (lv >= 3 ? ' (sconto guardaroba 20% attivo)' : ''));
      logDiary('⬆️ Sei salito al livello ' + lv + '!');
      blip(523, .1, 'triangle'); setTimeout(() => blip(784, .16, 'triangle'), 100);
    }
    save();
  }
  function effCost(c) { return st.lvl >= 3 ? Math.ceil(c * 0.8) : c; }

  /* ============ DIARIO ============ */
  function logDiary(txt) {
    normalize();
    const d = new Date();
    const stamp = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    st.log = st.log || [];
    st.log.unshift(stamp + '  ' + txt);
    if (st.log.length > 50) st.log.length = 50;
    save();
  }

  /* ============ ALBUM / FIGURINE ============ */
  function addSticker(botId) {
    normalize();
    st.stickers = st.stickers || {};
    if (!st.stickers[botId]) {
      st.stickers[botId] = 1;
      const all = Object.keys(D.bots).length;
      const got = Object.keys(st.stickers).length;
      toast('📔 Figurina di ' + D.bots[botId].name + ' aggiunta all\'album (' + got + '/' + all + ')');
      if (got >= all && !st.albumBonus) { st.albumBonus = true; addCoins(50); toast('🏆 Album completo! +50 🪙'); }
      save();
    }
  }

  /* ============ NEGOZIO & CAMERA ============ */
  function renderShop() {
    normalize();
    $('shopCoins').textContent = '🪙 ' + st.coins;
    const b = $('shopBody');
    b.innerHTML = '';
    D.furnitureShop.forEach((f, i) => {
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;gap:10px;align-items:center;background:#faf8ff;border:1.5px solid #e7e0ff;border-radius:14px;padding:9px 11px;margin-bottom:8px';
      card.innerHTML = '<span style="font-size:24px">' + f.e + '</span><div style="flex:1;min-width:0"><b style="color:#3a2a8f;font-size:.9rem">' + f.name + '</b><div style="font-size:.72rem;color:#8a7fb8">' + f.desc + '</div></div>' +
        '<button class="mini" data-buy="' + i + '">🛒 ' + effCost(f.cost) + '🪙</button>';
      card.querySelector('[data-buy]').addEventListener('click', () => buyFurn(i));
      b.appendChild(card);
    });
  }
  function buyFurn(i) {
    const f = D.furnitureShop[i];
    const cost = effCost(f.cost);
    if (st.coins < cost) { toast('Ti servono ' + cost + ' 🪙'); return; }
    st.coins -= cost;
    st.shopItems = st.shopItems || [];
    st.shopItems.push(f.e);
    toast('🛒 Comprato: ' + f.name);
    logDiary('🛒 Comprato: ' + f.name + ' (' + cost + ' 🪙)');
    coinSound();
    updateHUD(); save(); renderShop();
  }
  function firstFreeSlot() {
    const slots = room().slots || [];
    st.placed = st.placed || [];
    for (let i = 0; i < slots.length; i++) if (!st.placed.find(p => p.slot === i)) return i;
    return -1;
  }
  function placeFirst(slotIdx) {
    st.shopItems = st.shopItems || [];
    st.placed = st.placed || [];
    if (!st.shopItems.length) { toast('Magazzino vuoto: compra al negozio'); return; }
    const idx = slotIdx >= 0 ? slotIdx : firstFreeSlot();
    if (idx < 0) { toast('Camera piena: tocca un mobile per riporlo'); return; }
    if (st.placed.find(p => p.slot === idx)) return;
    const e = st.shopItems.shift();
    st.placed.push({ e, slot: idx, last: Date.now() });
    toast('📦 Posizionato: ' + e + ' (produce monete ogni 30s)');
    save(); renderStash();
  }
  function removePlaced(slotIdx) {
    st.placed = st.placed || [];
    const p = st.placed.find(x => x.slot === slotIdx);
    if (!p) return;
    st.placed = st.placed.filter(x => x.slot !== slotIdx);
    st.shopItems.push(p.e);
    toast('📦 ' + p.e + ' riposto nel magazzino');
    save(); renderStash();
  }
  function renderStash() {
    normalize();
    const b = $('stashBody');
    st.shopItems = st.shopItems || [];
    st.placed = st.placed || [];
    let h = '';
    if (st.shopItems.length) {
      const uniq = [...new Set(st.shopItems)];
      h += '<div class="gtitle">Da posizionare</div>';
      uniq.forEach(e => {
        const cnt = st.shopItems.filter(x => x === e).length;
        const meta = D.furnitureShop.find(f => f.e === e);
        h += '<div style="display:flex;align-items:center;gap:9px;background:#faf8ff;border:1px solid #e7e0ff;border-radius:12px;padding:7px 10px;margin-bottom:6px"><span style="font-size:20px">' + e + '</span><div style="flex:1;font-size:.8rem;color:#3a2a8f"><b>' + (meta ? meta.name : e) + '</b> ×' + cnt + '</div><button class="mini" data-put="' + e + '">▶ posiziona</button></div>';
      });
    } else h += '<div style="color:#8a7fb8;font-size:.82rem;margin-bottom:8px">Magazzino vuoto. Compra al 🛒 Negozio mobili.</div>';
    h += '<div class="gtitle">Nella tua camera</div>';
    if (st.placed.length) {
      st.placed.forEach(p => {
        const meta = D.furnitureShop.find(f => f.e === p.e);
        h += '<div style="display:flex;align-items:center;gap:9px;background:#f4fff6;border:1px solid #bdecc8;border-radius:12px;padding:7px 10px;margin-bottom:6px"><span style="font-size:20px">' + p.e + '</span><div style="flex:1;font-size:.78rem;color:#0a6b3a">' + (meta ? meta.name : p.e) + ' · slot ' + (p.slot + 1) + ' · produce 🪙</div><button class="mini" data-rm="' + p.slot + '">riponi</button></div>';
      });
    } else h += '<div style="color:#8a7fb8;font-size:.82rem">Camera vuota: tocca uno slot tratteggiato per posizionare.</div>';
    b.innerHTML = h;
    b.querySelectorAll('[data-put]').forEach(btn => btn.onclick = () => { const e = btn.dataset.put; const i = st.shopItems.indexOf(e); if (i >= 0) { st.shopItems.splice(i, 1); const slot = firstFreeSlot(); if (slot < 0) { st.shopItems.push(e); toast('Camera piena'); return; } st.placed.push({ e, slot, last: Date.now() }); toast('Posizionato ' + e); save(); renderStash(); } });
    b.querySelectorAll('[data-rm]').forEach(btn => btn.onclick = () => removePlaced(parseInt(btn.dataset.rm, 10)));
  }
  function drawCameraExtras() {
    const r = room();
    if (r.id !== 'camera') return;
    const now = performance.now();
    st.placed = st.placed || [];
    (r.slots || []).forEach((sp, si) => {
      const placed = st.placed.find(p => p.slot === si);
      if (!placed) {
        ctx.strokeStyle = 'rgba(122,90,255,.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y - 6, 26, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '16px system-ui,sans-serif';
        ctx.fillStyle = 'rgba(122,90,255,.6)';
        ctx.textAlign = 'center';
        ctx.fillText('+', sp.x, sp.y + 2);
      } else {
        const bob = Math.sin(now / 600 + si) * 2;
        ctx.fillStyle = 'rgba(60,20,100,.12)';
        ctx.beginPath(); ctx.ellipse(sp.x, sp.y + 8, 14, 4.5, 0, 0, TAU); ctx.fill();
        ctx.font = '34px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(placed.e, sp.x, sp.y - 10 + bob);
        const pulse = 0.5 + 0.5 * Math.sin(now / 400 + si * 1.2);
        ctx.strokeStyle = 'rgba(61,220,151,' + (0.3 + pulse * 0.5) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sp.x, sp.y - 8, 30 + pulse * 2, 0, TAU); ctx.stroke();
      }
    });
  }

  /* ============ CACCIA AL TESORO ============ */
  function startTreasure() {
    closeGame(); showGame('🧭 Caccia al tesoro');
    const body = $('gameBody');
    const N = 12, chest = Math.floor(Math.random() * N);
    let left = 4;
    body.innerHTML = '<div style="text-align:center;color:#8a7fb8;font-size:.85rem">Tino ha nascosto il forziere tra 12 casse.<br>Hai <b id="trLeft" style="color:#5b3bd6">4</b> tentativi. Ogni errore dimezza… il premio non si sa mai.</div>' +
      '<div id="trGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px"></div><div id="trRes" style="text-align:center;min-height:34px;font-weight:900;color:#3a2a8f;margin-top:10px"></div>';
    const grid = $('trGrid');
    let done = false;
    for (let i = 0; i < N; i++) {
      const b = document.createElement('button');
      b.className = 'trc';
      b.style.cssText = 'aspect-ratio:1;font-size:30px;border-radius:14px;border:2px solid #e7e0ff;background:linear-gradient(135deg,#c9a15f,#8a5a2b);cursor:pointer;color:rgba(255,255,255,.2)';
      b.addEventListener('click', () => {
        if (done || b.dataset.open) return;
        b.dataset.open = '1';
        left--;
        if (i === chest) {
          done = true;
          b.textContent = '🎁';
          b.style.background = '#3ddc97';
          const earned = 6 + left * 2;
          $('trRes').textContent = '🎉 Trovato! Premi residui: ' + left;
          doneGame('treasure', earned, '🧭 Forziere trovato! +' + earned + ' 🪙');
        } else {
          b.textContent = '❌';
          b.style.background = '#e8e0ff';
          $('trLeft').textContent = left;
          if (left <= 0) {
            done = true;
            grid.children[chest].textContent = '🎁';
            grid.children[chest].style.background = '#3ddc97';
            $('trRes').textContent = 'Tino ha vinto… stavolta.';
            doneGame('treasure', 0, '🧭 Il forziere era sotto la cassa ' + (chest + 1) + '. Riprova!');
          }
        }
      });
      grid.appendChild(b);
    }
  }

  /* ============ FOTO DEL LOOK ============ */
  function lookShot() {
    const c = document.createElement('canvas');
    c.width = 420; c.height = 560;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 420, 560);
    grad.addColorStop(0, '#5b3bd6'); grad.addColorStop(.55, '#ff5d9e'); grad.addColorStop(1, '#ffd166');
    g.fillStyle = grad; g.fillRect(0, 0, 420, 560);
    // cerchi decorativi
    g.globalAlpha = .25;
    g.fillStyle = '#fff';
    [[350, 80, 60], [60, 480, 90], [370, 430, 40]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    g.globalAlpha = 1;
    g.textAlign = 'center';
    g.font = '900 30px system-ui,sans-serif';
    g.fillStyle = '#fff';
    g.fillText('MIRAGGIO HOTEL', 210, 76);
    g.font = '600 22px system-ui,sans-serif';
    g.fillText((st.nick || 'Ospite') + ' · ' + badgeFor().title, 210, 112);
    const saved = ctx;
    ctx = g;
    g.translate(210, 330); g.scale(3.1, 3.1);
    drawAv(0, 0, 0, 1, st.outfit, 1, false);
    ctx = saved;
    g.font = '16px system-ui,sans-serif';
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText('La tua scheda al Miraggio 🏨', 210, 532);
    try {
      const url = c.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = 'miraggio-look.png';
      document.body.appendChild(a); a.click(); a.remove();
      toast('📸 Look salvato come immagine');
    } catch (e) { toast('Export non supportato'); }
  }

  /* ============ CHAT GLOBALE (BroadcastChannel tra schede) ============ */
  let bc = null;
  function initBroadcast() {
    try {
      if (typeof BroadcastChannel === 'undefined') return;
      bc = new BroadcastChannel('miraggio-hotel');
      bc.onmessage = (ev) => {
        const d = ev.data;
        if (!d || !d.txt || d.nick === st.nick) return;
        toast('📡 ' + d.nick + ' ha scritto: ' + d.txt);
        spawnFx(player.x, player.y - 60, '📡');
      };
    } catch (e) {}
  }
  function broadcast(txt) {
    try { if (bc) bc.postMessage({ nick: st.nick || 'Ospite', txt }); } catch (e) {}
  }

  /* ============ WIRING EXTRA 2 ============ */
  function wireExtra2() {
    $('soundBtn').onclick = () => { st.sound = st.sound === false ? true : false; save(); updateHUD(); toast(st.sound === false ? '🔇 Suoni disattivati' : '🔊 Suoni attivi'); };
    $('shopChip').onclick = () => { const el = $('sShop'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderShop(); } };
    $('stashChip').onclick = () => { const el = $('sStash'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderStash(); } };
    $('diaryCopy').onclick = () => { const t = (st.log || []).join('\n'); if (!t) return toast('Diario ancora vuoto'); copyText(t); };
    $('diaryClear').onclick = () => { st.log = []; save(); renderMissionsUI(); toast('🗑️ Diario svuotato'); };
    $('lookShot').onclick = lookShot;
    initBroadcast();
  }
  function copyText(txt) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(() => toast('📋 Copiato')).catch(() => {}); return; }
    } catch (e) {}
    const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('📋 Copiato'); } catch (e) {}
    ta.remove();
  }

  /* API di debug/test (nessun effetto sul gameplay) */
  window.__MH = {
    get: () => st,
    room: () => st.room,
    bots: () => roomBots.length,
    roomFurn: () => room().furniture.map(f => f.e),
    enter: (id) => enterRoom(id),
    talk: (i) => { const bp = roomBots[i]; if (bp) talkBot(bp); return !!bp; },
    furn: (i) => { const f = room().furniture[i]; if (f && D.furnitureReplies[f.e]) interactFurniture(f); },
    emote: (id) => { const e = D.emotes.find(x => x.id === id); if (e) doEmote(e); },
    chat: (t) => sendChat(t),
    equipStyle: (slot, id, cost, type) => equipStyle(slot, id, cost, type),
    equipColor: (hex) => buyEquipColor(hex),
    coins: () => st.coins,
    bubbleCount: () => bubbles.length,
    anim: () => player.anim,
    nick: (n) => { if (n) st.nick = n; return st.nick; },
    save: () => save(),
    paint: () => draw(),
    tryOutfit: (h, a) => { st.outfit.hairStyle = h; st.outfit.acc = a; },
    openGame: (id) => openGame(id),
    lvlOf: (id) => lvlOf(id),
    missionCount: () => { ensureMissions(); return st.missions.list.filter(m => !m.done).length; },
    xp: () => st.xp || 0,
    lvlP: () => st.lvl || 0,
    eventInfo: () => activeEvent(),
    guest: () => guestId(),
    buyFurn: (i) => buyFurn(i),
    placeFirst: (s) => placeFirst(s),
    placedCount: () => (st.placed || []).length,
    shopItemsCount: () => (st.shopItems || []).length,
    stickers: () => Object.keys(st.stickers || {}).length,
    diaryLen: () => (st.log || []).length,
    outfit: () => JSON.parse(JSON.stringify(st.outfit))
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
