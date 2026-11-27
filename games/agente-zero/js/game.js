/* ============================================================
   Agente Zero — one match on the court
   ------------------------------------------------------------
   Owns the canvas: camera, player, ball, net and effects. Rules
   stay in modes.js; this file plays them out in real time.
   Phases: demo → aim → gather → flight → … → over
   (cpu: the rival's turn in Z-E-R-O; drink: the bomb mode).
   ============================================================ */
import * as M from './modes.js';
import { releasePoint, idealShot, makeShot, simulate, sampleAt, hoopX, handAt, BALL_R, RIM, BOARD_Y, FRAME } from './physics.js';
import { wobbleAt, applyWobble, swerve, effects, strength } from './drunk.js';
import { newBomb, stepBomb, dropShot } from './bomb.js';
import { drawBombScene } from './render/bomb.js';
import { aiError, judgeError } from './shot.js';
import { makeCamera, project, toView } from './render/camera.js';
import { drawScene } from './render/court.js';
import { makeNet, stepNet, drawNet, drawRim, drawBoard, drawBallAt, drawBallShadow, drawDefender, BALLS } from './render/hoop.js';
import { drawPlayer, poseAt, blend, POSE_TIME } from './render/player.js';
import { distanceOf, angleOf, spotAt, PRACTICE_SPOTS } from './court-data.js';

const RIVAL_LOOK = { skin: 's3', hair: 'buzz', hairColor: 'black', jersey: 'rival', shoes: 'black', band: 'none', ball: 'classic' };

export function createGame(canvas, { audio, settings, look, emit, tilt = () => 0, words = () => ({}) }) {
  const ctx = canvas.getContext('2d');
  const still = document.createElement('canvas');
  const stillCtx = still.getContext('2d');
  let w = 0, h = 0, dpr = 1, stillKey = '';
  let match = null, phase = 'demo', paused = false;
  let clock = 0, anim = 0, phaseT = 0;
  let cam = null, view = { ...spotAt(0, 4.2) }, from = null, moveT = 1;
  let pose = null, poseName = 'idle', poseStart = 0;
  let flight = null, gather = 0, preview = null, decidedAt = 0;
  let particles = [], shake = 0, lastBeep = 0;
  let bomb = null, holding = false, wasHic = false, idealCache = null;
  const net = makeNet();

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    for (const c of [canvas, still]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    stillKey = '';
  }

  function setPose(name) {
    if (poseName !== name) { poseName = name; poseStart = anim; }
  }

  function moveTo(spot, instant = false) {
    if (instant || settings().motion) { view = { ...spot }; from = null; moveT = 1; return; }
    if (Math.hypot(spot.x - view.x, spot.y - view.y) < 0.01) return;
    from = { ...view };
    moveT = 0;
    view = { ...spot };
  }

  /** The spot the camera is looking from right now (it glides between spots). */
  function camSpot() {
    if (!from || moveT >= 1) return view;
    const k = moveT * moveT * (3 - 2 * moveT);
    const d = distanceOf(from) + (distanceOf(view) - distanceOf(from)) * k;
    const a = angleOf(from) + (angleOf(view) - angleOf(from)) * k;
    return spotAt(a, d);
  }

  const isBomb = () => match?.id === 'bomb';
  /** What the drink is doing to his hands right now. */
  const wobble = () => (isBomb() ? wobbleAt(clock, match.level) : null);

  /** The court with nobody playing: behind the menus. */
  function demo(place = 'bunker') {
    match = null; flight = null; bomb = null; holding = false; phase = 'demo'; paused = false; particles = [];
    audio.setDrunk(0);
    demo.place = place;
    moveTo(spotAt(0, 4.2), true);
    setPose('idle');
    audio.crowd(0);
  }
  demo.place = 'bunker';

  function start(next) {
    match = next;
    clock = 0; flight = null; particles = []; paused = false; lastBeep = 0;
    bomb = null; holding = false; wasHic = false;
    audio.setDrunk(0);
    moveTo(match.spot, true);
    audio.crowd(['hall', 'arena'].includes(match.place) ? 0.5 : 0);
    nextShot();
  }

  function nextShot() {
    flight = null; preview = null; gather = 0;
    if (match.over) return finish();
    if (match.pendingDrink) {
      bomb = newBomb(match.level);
      holding = false;
      phase = 'drink';
      setPose('idle');
      emit('drink', { match, bomb });
      return;
    }
    moveTo(match.spot);
    phaseT = 0;
    if (M.turnOf(match) === 'cpu') { phase = 'cpu'; setPose('ready'); }
    else { phase = 'aim'; setPose('idle'); }
    emit('turn', { match, who: M.turnOf(match) });
  }

  function finish() {
    if (phase === 'over') return;
    phase = 'over';
    audio.crowd(0);
    const s = M.summaryOf(match);
    bomb = null;
    setPose(s.won ? look().celebration : 'sad');
    emit('over', { match, summary: s });
  }

  const shooterSpot = () => view;
  const distance = () => Math.hypot(view.x, view.y);

  /** Release state for a player error, from the current spot. */
  function stateFor(err) {
    const s = shooterSpot();
    const p = releasePoint(s.x, s.y);
    return makeShot(p, idealShot(p), err, clock);
  }

  function launch(input, who) {
    const s = shooterSpot();
    const spot = { x: s.x, y: s.y };
    const env = match.env;
    const w = who === 'you' ? wobble() : null;
    const err = w ? applyWobble(input, w) : input;
    const state = stateFor(err);
    let sim = simulate(state, env);
    if (w) sim = swerve(sim, state, match.level, FRAME, match.attempts % 2 ? -1 : 1);
    if (!M.release(match)) return false;
    flight = {
      sim, t: 0, who, err, spot, env, event: 0, decided: false, trail: [],
      beater: match.timeLeft !== null && match.timeLeft < 0.8,
      fire: M.onFire(match) && who === 'you', money: M.isMoneyBall(match),
    };
    phase = 'flight';
    moveT = 1; from = null;
    setPose('shoot');
    pose = blend(pose, poseAt('shoot', 0), 0.85);
    audio.sfx.shoot();
    if (who === 'you') buzz(12);
    emit('launch', { match, who });
    return true;
  }

  /** A short vibration, where the phone allows it. */
  function buzz(ms) {
    if (settings().vibrate && navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(ms);
  }

  const canShoot = () => !!match && !paused && (phase === 'aim' || phase === 'gather') && !match.inFlight && !match.over;

  function shoot(err) {
    if (!canShoot()) return false;
    return launch(err, 'you');
  }

  function onGather(k) {
    if (!canShoot()) return;
    phase = 'gather';
    gather = k;
    setPose(k > 0.55 ? 'gather' : 'ready');
  }

  function onPreview(err) {
    preview = null;
    if (!err || !canShoot() || match.id !== 'training' || !settings().guide) return;
    const sim = simulate(stateFor(err), match.env, { maxT: 0.75 });
    preview = sim.path.filter((_, i) => i % 3 === 2);
  }

  function cancel() {
    if (phase === 'gather') { phase = 'aim'; setPose('idle'); }
    preview = null;
  }

  /** One step of the drink scene. */
  function stepDrink(dt) {
    const before = bomb.step;
    const entered = stepBomb(bomb, dt, { tilt: tilt(), hold: holding });
    if (bomb.step === 'fall' && before === 'fall' && bomb.t >= 0.35 && bomb.t - dt < 0.35) {
      if (bomb.clean) { audio.sfx.plop(); buzz(25); } else audio.sfx.spill();
    }
    if (bomb.step === 'drink' && bomb.rate && Math.floor(bomb.t * 4) !== Math.floor((bomb.t - dt) * 4)) audio.sfx.gulp();
    if (!entered) return;
    if (entered === 'burp') { audio.sfx.burp(); buzz(60); }
    if (entered === 'done') {
      const res = M.applyBomb(match, bomb.clean);
      bomb = null; holding = false;
      audio.setDrunk(strength(match.level));
      emit('drunk', { match, res });
      nextShot();
    } else emit('bombstep', { match, bomb });
  }

  function burst(x, y, n, colors, speed = 220, life = 0.9) {
    if (settings().motion) n = Math.ceil(n / 4);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = Math.random() * speed;
      particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.5, life, max: life, c: colors[i % colors.length], r: 2 + Math.random() * 3 });
    }
  }

  function decide() {
    const f = flight;
    if (f.decided) return;
    f.decided = true;
    decidedAt = f.t;
    const out = M.applyShot(match, f.sim);
    const err = judgeError(f.err);
    if (out.made) {
      audio.sfx.score(out.points || 2);
      if (f.who === 'you') buzz([20, 40, 30]);
      if (['hall', 'arena'].includes(match.place) || out.fire) audio.sfx.cheer(out.fire ? 1 : 0.6);
      const p = project(cam, [hoopX(f.env, clock), 0, RIM.z]);
      if (p) burst(p.x, p.y, out.result === 'swish' ? 40 : 18, ['#fff', '#ff3b4e', '#ffd24a']);
      if (out.ignited && f.who === 'you') audio.sfx.fire();
    } else if (out.result === 'airball' && f.who === 'you') audio.sfx.lose();
    if (['hall', 'arena'].includes(match.place)) audio.crowd(0.5 + Math.min(0.5, match.streak * 0.12));
    else audio.crowd(match.streak >= M.FIRE_AT ? 0.4 : 0);
    emit('shot', { match, out, err, spot: f.spot, env: f.env, beater: f.beater && out.made });
  }

  function stepFlight(dt) {
    const f = flight;
    f.t += dt;
    const ev = f.sim.events;
    while (f.event < ev.length && ev[f.event].t <= f.t) {
      const e = ev[f.event++];
      if (e.kind === 'rim') { audio.sfx.rim(e.speed); if (!settings().motion) shake = Math.min(5, e.speed); }
      else if (e.kind === 'board') audio.sfx.board(e.speed);
      else if (e.kind === 'floor') { audio.sfx.bounce(e.speed); if (!f.decided) decide(); }
      else if (e.kind === 'hand') audio.sfx.block();
      else if (e.kind === 'score') { if (f.sim.result === 'swish') audio.sfx.swish(); else audio.sfx.net(); decide(); }
    }
    if (!f.decided && f.t >= f.sim.duration) decide();
    if (poseName === 'shoot' && f.t > 0.16) setPose('follow');
    if (poseName === 'follow' && f.t > 0.55) setPose('land');
    if (f.decided) {
      const made = f.sim.scored;
      if (made && f.who === 'you' && poseName !== look().celebration && f.t - decidedAt > 0.1 && (f.sim.result === 'swish' || f.fire)) setPose(look().celebration);
      else if (!made && poseName === 'land' && f.sim.result === 'airball') setPose('sad');
      const quick = match.timeLeft !== null;
      let wait = quick ? 0.4 : made ? 1.15 : 0.7;
      if (isBomb() && made) wait = 0.9;
      if (match.id === 'zero') wait = 1.5;
      if (f.t - decidedAt > wait) nextShot();
    }
  }

  /** Slow motion around a clean basket. */
  function timeScale() {
    const f = flight;
    if (!f || settings().motion || f.sim.result !== 'swish' || match.timeLeft !== null) return 1;
    return f.t > f.sim.scoreAt - 0.16 && f.t < f.sim.scoreAt + 0.2 ? 0.42 : 1;
  }

  function update(dt) {
    anim += dt;
    if (paused) return;
    phaseT += dt;
    if (phase === 'drink') { stepDrink(dt); return; }
    const ts = phase === 'flight' ? timeScale() : 1;
    clock += dt * ts;
    if (moveT < 1) moveT = Math.min(1, moveT + dt / 0.5);
    if (match && phase !== 'over' && !(phase === 'cpu')) {
      const e = M.tick(match, dt);
      if (e === 'buzzer') audio.sfx.buzzer();
      const left = match.timeLeft ?? match.shotClock;
      if (left !== undefined && left !== null && left > 0 && left < (match.timeLeft !== null ? 5 : 3) && Math.ceil(left) !== lastBeep) {
        lastBeep = Math.ceil(left);
        audio.sfx.tick();
      }
      if (e === 'late') {
        emit('shot', { match, out: { made: false, result: 'late', who: 'you', points: 0 }, err: { len: '', side: '' }, spot: { ...view }, env: match.env });
        emit('cancel');
        nextShot();
      } else if (match.over && phase !== 'flight') {
        emit('cancel');
        finish();
      }
    }
    if (phase === 'cpu') {
      if (phaseT > 0.7) setPose('gather');
      if (phaseT > 1.5) {
        const d = distance();
        launch(aiError(match.rng, match.skill, d), 'cpu');
      }
    } else if (phase === 'flight') stepFlight(dt * ts);
    if (isBomb() && (phase === 'aim' || phase === 'gather')) {
      const hic = wobble().hiccup;
      if (hic && !wasHic) { audio.sfx.hiccup(); emit('hiccup', { match }); }
      wasHic = hic;
    }

    // pose blending
    const t = anim - poseStart;
    if (POSE_TIME[poseName] && t > POSE_TIME[poseName] && phase !== 'over') setPose('idle');
    const target = poseAt(poseName, t);
    pose = blend(pose, target, Math.min(1, dt * (poseName === 'idle' ? 12 : 18)));
    if (poseName === 'idle') {
      // the dribble follows its own rhythm exactly
      const b = Math.abs(Math.sin(t * 5.2));
      if (pose.ball) pose.ball = target.ball;
      if (phase !== 'over' && t > 0.3 && b < 0.12 && !update.touch && phase === 'aim') { update.touch = true; audio.sfx.bounce(1.6); }
      if (b > 0.4) update.touch = false;
    }

    const ball = flight ? sampleAt(flight.sim.path, flight.t).p : null;
    const hx = flight ? sampleAt(flight.sim.path, flight.t).hx : hoopX(match?.env, clock);
    stepNet(net, dt * ts, hx, ball);
    for (const p of particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 480 * dt; }
    particles = particles.filter((p) => p.life > 0);
    shake = Math.max(0, shake - dt * 22);
  }

  function drawStill(place) {
    const s = camSpot();
    cam = makeCamera(s, w, h);
    const key = `${place}|${s.x.toFixed(3)}|${s.y.toFixed(3)}|${w}x${h}`;
    if (key !== stillKey) {
      stillKey = key;
      stillCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(stillCtx, cam, place);
    }
  }

  /** The aim trail that circles while he is drunk: green when it is true. */
  function drawSway() {
    const w = wobble();
    if (!w || match.level < 20 || !canShoot()) return;
    const key = `${view.x}|${view.y}`;
    if (idealCache?.key !== key) {
      const p = releasePoint(view.x, view.y);
      const ideal = idealShot(p);
      idealCache = { key, p, ideal, true: simulate(makeShot(p, ideal, {}), {}, { maxT: 0.45 }).path };
    }
    const { p, ideal } = idealCache;
    const live = simulate(makeShot(p, ideal, { power: 1 + w.power, aim: w.aim }), {}, { maxT: 0.45 }).path;
    const good = Math.abs(w.aim) < 0.012 && Math.abs(w.power) < 0.009;
    const dots = (path, r, color) => path.forEach((f, i) => {
      if (i % 3 !== 2) return;
      const s = project(cam, f.p);
      if (!s) return;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 7); ctx.fill();
    });
    dots(idealCache.true, 2.4, 'rgba(255,255,255,.4)');
    // the swing is drawn three times larger than it is, to be readable
    const shown = live.map((f, i) => {
      const t = idealCache.true[i] || f;
      return { p: f.p.map((v, k) => t.p[k] + (v - t.p[k]) * 3) };
    });
    dots(shown, 4.6, good ? '#4ade80' : '#ffd24a');
  }

  /** Zero asleep under the hoop, the ball for a pillow. */
  function drawAsleep() {
    const at = project(cam, [0.95, -0.7, 0.1]);
    if (!at) return;
    ctx.save();
    ctx.translate(at.x, at.y);
    ctx.rotate(-Math.PI / 2);
    drawPlayer(ctx, 0, 0, at.s, poseAt('idle', 0), look(), { ball: false, shadow: false });
    ctx.restore();
    drawBallAt(ctx, at.x - 1.92 * at.s, at.y + 0.08 * at.s, BALL_R * 1.5 * at.s, 0, look().ball);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#14101c'; ctx.lineWidth = 4; ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const k = (anim * 0.45 + i / 3) % 1;
      ctx.font = `900 ${14 + k * 22}px system-ui, sans-serif`;
      ctx.globalAlpha = 1 - k;
      const x = at.x - 1.7 * at.s + k * 40, y = at.y - 0.4 * at.s - k * 90;
      ctx.strokeText('Z', x, y); ctx.fillText('Z', x, y);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!w) return;
    const place = match?.place || demo.place;
    drawStill(place);
    const fx = isBomb() ? effects(anim, match.level, settings().motion) : null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0c0814';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    if (fx) {
      // the whole court sways; a little zoom hides most of the corners
      const zoom = 1 + Math.abs(fx.rot) * 1.1 + strength(match.level) * 0.05;
      ctx.translate(w / 2 + fx.dx, h / 2 + fx.dy);
      ctx.rotate(fx.rot);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);
    }
    if (shake > 0.2) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    ctx.drawImage(still, 0, 0, w, h);
    const env = match?.env || {};
    const sample = flight ? sampleAt(flight.sim.path, flight.t) : null;
    const hx = sample ? sample.hx : hoopX(env, clock);
    const ball = sample?.p;
    const style = flight?.who === 'cpu' ? 'classic' : look().ball;
    const spot = camSpot();
    const feet = project(cam, [spot.x, spot.y, 0]);
    const hand = handAt(env, clock);
    const contrast = settings().contrast;
    const playerDepth = feet ? feet.d : 4;

    let layer = null;
    if (ball) {
      const d = toView(cam, ball).d;
      const rimD = toView(cam, [hx, 0, RIM.z]).d;
      if (ball[1] > BOARD_Y + 0.05) layer = 'back';
      else if (d < playerDepth - 0.1) layer = 'near';
      else if (d < rimD - RIM.r * 0.8 || ball[2] > RIM.z + BALL_R * 0.7) layer = 'front';
      else layer = 'mid';
      if (hand && layer === 'front' && d <= toView(cam, hand).d) layer = 'over';
    }
    const drawFlying = () => {
      const s = project(cam, ball);
      if (!s) return;
      const r = BALL_R * s.s;
      const fire = flight.fire;
      for (const [i, p] of flight.trail.entries()) {
        const q = project(cam, p);
        if (!q) continue;
        const k = i / flight.trail.length;
        ctx.globalAlpha = k * (fire ? 0.55 : 0.2);
        ctx.fillStyle = fire ? (i % 2 ? '#ffb01f' : '#ff4a12') : flight.money ? '#5ad1ff' : '#fff';
        ctx.beginPath(); ctx.arc(q.x, q.y, BALL_R * q.s * (0.35 + k * 0.55), 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawBallAt(ctx, s.x, s.y, r, -sample.a, flight.money ? 'street' : style, fire);
      if (contrast) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, r + 1.5, 0, 7); ctx.stroke(); }
    };
    if (ball && !paused) { flight.trail.push([...ball]); if (flight.trail.length > 12) flight.trail.shift(); }

    if (ball) drawBallShadow(ctx, cam, ball);
    if (layer === 'back') drawFlying();
    drawBoard(ctx, cam, hx, place);
    drawRim(ctx, cam, hx, false, contrast);
    drawNet(ctx, cam, net, false);
    if (layer === 'mid') drawFlying();
    drawNet(ctx, cam, net, true);
    drawRim(ctx, cam, hx, true, contrast);
    if (layer === 'front') drawFlying();
    if (hand) drawDefender(ctx, cam, hand);
    if (layer === 'over') drawFlying();

    if (preview) {
      preview.forEach((f, i) => {
        const s = project(cam, f.p);
        if (!s) return;
        ctx.globalAlpha = 0.85 * (1 - i / preview.length) + 0.1;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x, s.y, 3.2, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    drawSway();
    const asleep = isBomb() && match.crashed && phase === 'over';
    if (asleep) drawAsleep();
    else if (feet && pose) {
      const cpu = match && (flight ? flight.who : M.turnOf(match)) === 'cpu' && phase !== 'over';
      const mine = look();
      ctx.save();
      if (isBomb()) {
        ctx.translate(feet.x, feet.y);
        ctx.rotate(Math.sin(anim * 1.9) * 0.13 * strength(match.level));
        ctx.translate(-feet.x, -feet.y);
      }
      drawPlayer(ctx, feet.x, feet.y, feet.s, pose, cpu ? RIVAL_LOOK : mine, {
        ball: phase !== 'flight' && phase !== 'over',
        spin: anim * 3, fire: !cpu && !!match && M.onFire(match),
      });
      ctx.restore();
    }
    if (layer === 'near') drawFlying();

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r * 1.6);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (fx?.double && phase !== 'drink') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = fx.double;
      ctx.drawImage(canvas, fx.offset * dpr, Math.abs(fx.offset) * 0.2 * dpr);
      ctx.globalAlpha = 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (fx?.vignette > 0.05 && phase !== 'drink') {
      const v = ctx.createRadialGradient(w / 2, h * 0.45, h * (0.42 - 0.2 * fx.vignette), w / 2, h * 0.45, h * 0.75);
      v.addColorStop(0, 'rgba(30,0,40,0)');
      v.addColorStop(1, `rgba(30,0,40,${(0.7 * fx.vignette).toFixed(3)})`);
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    }
    if (phase === 'drink' && bomb) drawBombScene(ctx, w, h, bomb, look(), words(), anim);
  }

  resize();

  return {
    resize, update, draw, demo, start, shoot, onGather, onPreview, cancel, canShoot, distance,
    nextShot, wobble,
    drop() {
      if (paused || phase !== 'drink' || !bomb || !dropShot(bomb)) return false;
      emit('bombstep', { match, bomb });
      return true;
    },
    hold(v) { holding = !!v && phase === 'drink' && !paused; },
    get bomb() { return bomb; },
    setSpot(spot) {
      if (!match || !M.setSpot(match, spot)) return false;
      moveTo(match.spot);
      return true;
    },
    pose: (name) => setPose(name),
    pause(v) { paused = v; },
    get paused() { return paused; },
    get match() { return match; },
    get phase() { return phase; },
    get clock() { return clock; },
    get flight() { return flight; },
    spots: PRACTICE_SPOTS,
    balls: BALLS,
  };
}
