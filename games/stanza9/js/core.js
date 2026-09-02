/* ============================================================
   STANZA 9 — motore di gioco
   Habbo-meets-Baldur's-Gate: cammina per la stanza, parla,
   scegli. Ottimizzato per iPhone (tap-to-move, niente hover).
   ============================================================ */
(function () {
  'use strict';
  const D = window.STANZA9;
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = 'stanza9_save_v1';
  const CORE_FRIENDS = ['mattia', 'sofia', 'davide', 'emma', 'gabriele'];

  /* ============================ STATO ============================ */
  function freshState() {
    return {
      chapter: 1,
      flags: {},
      frags: [],
      items: [],
      trust: { mattia: 0, sofia: 0, davide: 0, emma: 0, gabriele: 0, giorgio: 0 },
      chat: [],          // [{from, text}]
      chatSeen: 0,
      loc: 'piazza',
      px: 330, py: 300,
      obj: null,
      dailyTalk: {},     // char -> chapter
      smallCount: {},    // char -> righe usate
      endKey: null
    };
  }
  let st = freshState();
  let loaded = false;

  function saveGame() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) {}
  }
  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const o = JSON.parse(raw);
      st = Object.assign(freshState(), o);
      return true;
    } catch (e) { return false; }
  }
  function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  /* ============================ HELPERS ============================ */
  const hasF = (f) => !!st.flags[f];
  const setF = (f) => { st.flags[f] = 1; };
  const unF = (f) => { delete st.flags[f]; };
  function hasItem(id) { return st.items.indexOf(id) >= 0; }
  function trustSum() { return CORE_FRIENDS.reduce((a, c) => a + (st.trust[c] || 0), 0); }
  const trustLabel = (v) => v >= 90 ? 'Alleato' : v >= 70 ? 'Fiducia' : v >= 45 ? 'Aperto' : v >= 20 ? 'Cauto' : v > 0 ? 'Freddo' : 'Sconosciuto';
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* Toast */
  let toastT = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }
  function hint(msg) {
    const h = $('actHint');
    h.textContent = msg;
    h.classList.add('on');
    clearTimeout(hint._t);
    hint._t = setTimeout(() => h.classList.remove('on'), 2400);
  }

  /* ============================ CHAT ============================ */
  function addChat(list) {
    (list || []).forEach(m => st.chat.push(m));
  }
  function unreadChat() { return st.chat.length - st.chatSeen; }
  function renderChat() {
    const wrap = $('chatWrap');
    wrap.innerHTML = '';
    const names = { sistema: 'Sistema', gruppo: 'La Stanza 9' };
    st.chat.forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'msg ' + (m.from === 'giulia' ? 'giulia' : m.from === 'sistema' ? 'sistema' : '');
      const ava = m.from === 'sistema' ? '' : '<div class="ava">' + (D.chars[m.from] ? D.chars[m.from].emoji : '💬') + '</div>';
      const who = names[m.from] || (D.chars[m.from] ? D.chars[m.from].short : '');
      const bub = '<div class="bub">' + (m.from !== 'sistema' && m.from !== 'gruppo' ? '<b style="display:block;font-size:11px;color:#93a7c9">' + esc(who) + '</b>' : '') + esc(m.text) + '</div>';
      row.innerHTML = ava + bub;
      wrap.appendChild(row);
      if (i === st.chat.length - 1) row.scrollIntoView({ block: 'nearest' });
    });
    st.chatSeen = st.chat.length;
    updateHUD();
    saveGame();
  }

  /* ============================ HUD / DIARIO ============================ */
  function updateHUD() {
    const ch = D.chapters[st.chapter - 1];
    $('hudDay').textContent = ch.day.replace('2025', '').trim();
    $('hudLoc').textContent = D.rooms[st.loc].emoji + ' ' + D.rooms[st.loc].name;
    $('hudFrags').textContent = '💠 ' + st.frags.length + '/' + D.fragments.length;
    const u = unreadChat();
    const badge = $('chatBadge');
    badge.style.display = u > 0 ? 'grid' : 'none';
    badge.textContent = u > 9 ? '9+' : u;
    $('btnStanza9').style.display = (hasF('open_stanza9')) ? 'inline-flex' : 'none';
    const st9 = $('st9Badge');
    st9.style.display = (st.loc !== 'stanza9' && (pendingScene('giulia') && st.chapter >= 2)) ? 'block' : 'none';
    const obj = st.obj || ch.objective;
    $('objective').innerHTML = '🎯 ' + obj;
    $('objFull').innerHTML = obj;
  }
  function renderDiary() {
    // ricordi
    const fw = $('diaryFrags');
    fw.innerHTML = '';
    D.fragments.forEach(f => {
      const got = st.frags.indexOf(f.id) >= 0;
      const row = document.createElement('div');
      row.className = 'frag' + (got ? '' : ' locked');
      row.innerHTML = '<div class="e">' + f.e + '</div><p>' + (got ? f.line : 'Un ricordo in frantumi. Parlate con chi c\'era.') + '</p>';
      fw.appendChild(row);
    });
    // oggetti
    const iw = $('diaryItems');
    iw.innerHTML = '';
    if (!st.items.length) iw.innerHTML = '<div style="color:#93a7c9;font-size:13px">Nessun oggetto. I ricordi, a volte, pesano.</div>';
    st.items.forEach(id => {
      const it = D.items[id];
      if (!it) return;
      const row = document.createElement('div');
      row.className = 'itemrow';
      row.innerHTML = '<span class="e">' + it.emoji + '</span><div><div>' + esc(it.name) + '</div><div class="ds">' + esc(it.desc) + '</div></div>';
      iw.appendChild(row);
    });
    // fiducia
    const tw = $('diaryTrust');
    tw.innerHTML = '';
    CORE_FRIENDS.forEach(id => {
      const c = D.chars[id];
      const v = Math.min(100, st.trust[id] || 0);
      const row = document.createElement('div');
      row.className = 'trustrow';
      row.innerHTML = '<span class="nm">' + c.emoji + ' ' + esc(c.short) + '</span><span class="tk"><i style="width:' + v + '%"></i></span><span class="lv">' + trustLabel(v) + '</span>';
      tw.appendChild(row);
    });
    // giorno
    const can = st.chapter < D.chapters.length;
    const db = $('dayEndBtn');
    db.disabled = !can;
    $('dayEndHint').textContent = can
      ? 'La giornata finisce e il capitolo avanza. Potresti perdere conversazioni non ancora fatte: controlla l\'obiettivo prima di dormire.'
      : 'È l\'ultima notte. La scelta è all\'Hotel Meridia.';
    if (!can) db.style.display = 'none'; else db.style.display = '';
  }

  /* ============================ SCENE (dialoghi) ============================ */
  let dlg = null; // {id, scene, idx, optsShown}

  function needOk(need) {
    need = need || {};
    if (need.frag && st.frags.length < need.frag) return false;
    if (need.item && !hasItem(need.item)) return false;
    if (need.flag && !hasF(need.flag)) return false;
    if (need.not && hasF(need.not)) return false;
    if (need.done && !hasF(need.done + '_done')) return false;
    if (need.trust) {
      for (const k in need.trust) if ((st.trust[k] || 0) < need.trust[k]) return false;
    }
    if (need.trustSum && trustSum() < need.trustSum) return false;
    return true;
  }
  function needLabel(need) {
    const parts = [];
    need = need || {};
    if (need.frag) parts.push('💠 ' + need.frag + ' ricordi');
    if (need.item && D.items[need.item]) parts.push(D.items[need.item].emoji + ' ' + D.items[need.item].name);
    if (need.done) { const s = D.scenes[need.done]; if (s && D.chars[s.ch]) parts.push('prima: parlare con ' + D.chars[s.ch].short); }
    if (need.trust) for (const k in need.trust) if (D.chars[k]) parts.push('❤️ fiducia di ' + D.chars[k].short);
    if (need.trustSum) parts.push('❤️ fiducia complessiva ' + need.trustSum);
    if (need.flag) parts.push('🔓 requisito');
    return parts.length ? parts.join(' · ') : '';
  }

  /* trovi una scena programmata per il personaggio */
  function pendingScene(charId) {
    let best = null, bestId = null, bestDay = 99;
    for (const id in D.scenes) {
      const s = D.scenes[id];
      if (s.ch !== charId) continue;
      if (s.day > st.chapter) continue;
      if (hasF(id + '_done')) continue;
      if (id === 'finale' && st.loc !== 'hotel') continue;
      if (id.indexOf('st9_') === 0 && st.loc !== 'stanza9') continue;
      if (!needOk(s.need)) continue;
      if ((s.day || 99) < bestDay) { best = s; bestId = id; bestDay = s.day || 99; }
    }
    return best ? Object.assign({ id: bestId }, best) : null;
  }

  function charBaseTrust(c) { return c && CORE_FRIENDS.indexOf(c) >= 0 ? 10 : 0; }

  function openScene(sceneId) {
    const s = D.scenes[sceneId];
    if (!s) return;
    if (dlg) return;
    const ch = s.ch ? D.chars[s.ch] : null;
    dlg = { id: sceneId, scene: s, idx: 0, end: false };
    // guadagno base fiducia (scena programmata di un amico)
    if (s.day && s.ch && CORE_FRIENDS.indexOf(s.ch) >= 0 && !hasF(sceneId + '_done')) {
      st.trust[s.ch] = Math.min(100, (st.trust[s.ch] || 0) + charBaseTrust(s.ch));
    }
    st.flags[sceneId + '_done'] = 1;
    renderDlg();
    saveGame();
  }

  function openFlavor(icon, title, lines) {
    if (dlg) return;
    dlg = { id: null, flavor: true, icon: icon || '✨', title: title || '', lines: lines || [], idx: 0 };
    renderDlg();
  }

  function renderDlg() {
    if (!dlg) return;
    const sheet = $('dlgSheet');
    const s = dlg.scene;
    const isFlavor = dlg.flavor;
    const ch = !isFlavor && s.ch ? D.chars[s.ch] : null;
    $('dlgAva').textContent = isFlavor ? dlg.icon : (ch ? ch.emoji : '🛎️');
    $('dlgName').textContent = isFlavor ? (dlg.title || 'Ricordo') : ch.name;
    $('dlgRole').textContent = isFlavor ? 'Meridia, 2025' : ch.role;
    $('dlgHearts').textContent = (!isFlavor && ch && CORE_FRIENDS.indexOf(s.ch) >= 0) ? '❤️'.repeat(1 + Math.floor((st.trust[s.ch] || 0) / 25)) : '';
    const body = $('dlgBody');
    body.innerHTML = '';
    const paragraphs = isFlavor ? dlg.lines : s.text;
    const all = paragraphs.slice(0, dlg.idx + 1);
    all.forEach(p => {
      const el = document.createElement('p');
      el.innerHTML = p;
      if (p.startsWith('<i>')) el.classList.add('thought');
      body.appendChild(el);
    });
    const hasMore = dlg.idx < paragraphs.length - 1;
    const optsWrap = $('dlgOpts');
    optsWrap.innerHTML = '';
    if (hasMore) {
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.textContent = '▼ continua';
      btn.onclick = () => { dlg.idx++; renderDlg(); };
      optsWrap.appendChild(btn);
      body.scrollTop = body.scrollHeight;
    } else if (isFlavor) {
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.textContent = '✕ chiudi';
      btn.onclick = () => closeDlg();
      optsWrap.appendChild(btn);
    } else {
      (s.opts || []).forEach((o, i) => {
        const ok = needOk(o.need);
        const btn = document.createElement('button');
        btn.className = 'opt' + (ok ? '' : ' locked');
        if (i === 0) btn.classList.add('alt');
        btn.innerHTML = esc(o.t) + (ok ? '' : '<span style="display:block;font-size:11px;opacity:.75;font-weight:500">🔒 ' + esc(needLabel(o.need)) + '</span>');
        if (ok) btn.onclick = () => pickOption(o); else btn.onclick = () => hint('Requisito non soddisfatto: ' + needLabel(o.need));
        optsWrap.appendChild(btn);
      });
      if (!s.opts || !s.opts.length) {
        const btn = document.createElement('button');
        btn.className = 'opt';
        btn.textContent = '✕ chiudi';
        btn.onclick = () => closeDlg();
        optsWrap.appendChild(btn);
      }
    }
    sheet.classList.add('on');
  }

  function pickOption(o) {
    applyFx(o.fx);
    if (o.to && o.to.indexOf('__end:') === 0) {
      const key = o.to.slice(6);
      closeDlg(true);
      goEnding(key);
      return;
    }
    if (o.to && D.scenes[o.to]) {
      const id = dlg ? dlg.id : null;
      dlg = null;
      openScene(o.to);
      return;
    }
    closeDlg();
  }

  function applyFx(fx) {
    fx = fx || {};
    let toastMsg = null;
    (fx.flag || []).forEach(f => { if (!hasF(f)) { setF(f); } });
    (fx.unflag || []).forEach(f => unF(f));
    if (fx.trust) for (const k in fx.trust) st.trust[k] = Math.min(100, (st.trust[k] || 0) + fx.trust[k]);
    if (fx.frag) {
      const ids = Array.isArray(fx.frag) ? fx.frag : [fx.frag];
      ids.forEach(id => { if (st.frags.indexOf(id) < 0) { st.frags.push(id); toastMsg = toastMsg || ('💠 Ricordo ritrovato: ' + (D.fragments.find(f => f.id === id) || {}).line || ''); } });
    }
    if (fx.item && st.items.indexOf(fx.item) < 0) {
      st.items.push(fx.item);
      const it = D.items[fx.item];
      if (it) toastMsg = toastMsg || (it.emoji + ' Ottenuto: ' + it.name);
    }
    if (fx.delItem) st.items = st.items.filter(i => i !== fx.delItem);
    if (fx.chat) addChat(fx.chat);
    if (fx.obj) st.obj = fx.obj;
    if (fx.toast) toastMsg = toastMsg || fx.toast;
    if (toastMsg) {
      toastMsg = toastMsg.length > 110 ? toastMsg.slice(0, 110) + '…' : toastMsg;
      toast(toastMsg);
    }
    updateHUD();
    saveGame();
  }

  function closeDlg(noEval) {
    const was = dlg;
    dlg = null;
    $('dlgSheet').classList.remove('on');
    if (!noEval && was && was.scene) {
      const id = was.id;
      evaluateBeats({ sceneDone: id });
      if (id === 'finale') renderEndSummaryCheck();
    } else if (was && was.id) {
      evaluateBeats({ sceneDone: was.id });
    }
  }

  /* ============================ BEAT (orchestrazione) ============================ */
  function beatCondOk(cond) {
    cond = cond || {};
    if (cond.ch && st.chapter < cond.ch) return false;
    if (cond.scene) { for (const s of cond.scene) if (!hasF(s + '_done')) return false; }
    if (cond.anyScene) { let ok = false; for (const s of cond.anyScene) if (hasF(s + '_done')) { ok = true; break; } if (!ok) return false; }
    if (cond.flag && !hasF(cond.flag)) return false;
    if (cond.frag && st.frags.length < cond.frag) return false;
    return true;
  }
  function evaluateBeats(evt) {
    if (!st) return;
    const chIdx = st.chapter - 1;
    const ch = D.chapters[chIdx];
    if (!ch || !ch.beats) return;
    let ran = true;
    let guard = 0;
    while (ran && guard++ < 8) {
      ran = false;
      ch.beats.forEach((b, i) => {
        const mk = 'beat_' + chIdx + '_' + i;
        if (hasF(mk)) return;
        if (!beatCondOk(b.cond)) return;
        const doIt = b.do || {};
        if (doIt.open && hasF(doIt.open + '_done')) return;
        (doIt.flag || []).forEach(f => setF(f));
        if (doIt.obj) st.obj = doIt.obj;
        if (doIt.chat) addChat(doIt.chat);
        if (doIt.toast) toast(doIt.toast);
        setF(mk);
        ran = true;
        if (doIt.open) {
          if (dlg) { dlg._queue = doIt.open; }
          else openScene(doIt.open);
        }
      });
    }
    updateHUD();
    saveGame();
  }

  /* ============================ GIORNI / FINALE ============================ */
  function advanceDay() {
    if (st.chapter >= D.chapters.length) return;
    st.chapter++;
    st.loc = 'piazza';
    player.x = D.rooms.piazza.w / 2;
    player.y = D.rooms.piazza.h - 40;
    st.obj = null;
    $('mDiary').classList.remove('on');
    showChapterCard(st.chapter);
  }
  function showChapterCard(n) {
    const ch = D.chapters[n - 1];
    $('ccDay').textContent = ch.day;
    $('ccTitle').textContent = ch.title;
    const body = $('ccBody');
    body.innerHTML = '';
    ch.intro.forEach(p => {
      const el = document.createElement('p');
      el.innerHTML = p;
      body.appendChild(el);
    });
    const obj = document.createElement('p');
    obj.style.cssText = 'background:rgba(139,233,253,.08);border:1px solid rgba(139,233,253,.25);border-radius:12px;padding:10px 12px;color:#aee9fb';
    obj.innerHTML = '🎯 ' + ch.objective;
    body.appendChild(obj);
    $('chapterCard').classList.add('on');
    $('ccBtn').onclick = () => {
      $('chapterCard').classList.remove('on');
      addChat(ch.chat || []);
      evaluateBeats({ ch: n });
      updateHUD();
      saveGame();
    };
  }

  function goEnding(key) {
    const e = D.endings[key];
    st.endKey = key;
    // l'ultimo ricordo si completa ascoltando/consegnando le lettere
    if (st.frags.indexOf('fr12') < 0) st.frags.push('fr12');
    saveGame();
    const scr = $('scrEnd');
    const badge = $('endBadge');
    badge.textContent = e.badge;
    badge.style.cssText = 'align-self:center;' + (e.badgeStyle || '');
    $('endTitle').textContent = e.title;
    const body = $('endBody');
    body.innerHTML = '';
    e.text.forEach(p => {
      const el = document.createElement('p');
      el.className = 'ep';
      el.innerHTML = p;
      body.appendChild(el);
    });
    // epilogo dinamico con gli alleati
    const ep = document.createElement('div');
    ep.style.cssText = 'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:14px;margin-top:12px;font-size:13.5px;line-height:1.7;color:#c9d6ea';
    const lines = [];
    if (hasF('alleato_mattia')) lines.push('🍺 <b>Mattia</b> non ha riaperto il bar il giorno dopo. Ha aperto prima, e ha servito il caffè gratis a chi entrava a chiedere. «Oggi si paga domani», diceva.');
    if (hasF('alleato_sofia')) lines.push('🩺 <b>Sofia</b> ha chiesto un turno ridotto. La prima domenica libera dal 2016 l’ha passata a cena da sua madre.');
    if (hasF('alleato_davide')) lines.push('📦 <b>Davide</b> ha spedito la felpa a se stesso, indirizzo sbagliato. Quando gli è tornata indietro, l’ha appesa in corridoio. «Così la vedo tutti i giorni», ha detto.');
    if (hasF('emma_archivio')) lines.push('💾 <b>Emma</b> ha chiamato il progetto «Meridia 2.0». Il comune le ha dato una stanza vera. Lei ci ha messo i server e una lampada a forma di luna.');
    if (hasF('emma_ai')) lines.push('💾 <b>Emma</b> ha costruito la sua voce, l’ha ascoltata una volta sola, poi l’ha spenta da sola. «Addio», ha detto. «Addio per davvero.»');
    if (hasF('giorgio_viene')) lines.push('🗝️ <b>Giorgio</b> è rimasto fino all’alba. Prima di andarsene ha lasciato la chiave sul bancone. Sotto, un biglietto: «per la prossima estate».');
    if (lines.length) ep.innerHTML = '— Dopo —<br>' + lines.join('<br>');
    body.appendChild(ep);
    // statistiche
    const stEl = $('endStats');
    stEl.innerHTML = '<span class="chip">💠 ' + st.frags.length + '/12 ricordi</span><span class="chip">❤️ ' + Math.round(trustSum() / 5) + '% fiducia media</span><span class="chip">📅 ' + st.chapter + '/7 giorni</span><span class="chip">💬 ' + st.chat.length + ' messaggi</span>';
    scr.classList.add('on');
    document.querySelectorAll('.screen').forEach(s => { if (s.id !== 'scrEnd') s.classList.remove('on'); });
    $('hud').style.display = 'none';
    $('actHint').style.display = 'none';
  }
  function renderEndSummaryCheck() { /* posto per eventuali extra */ }

  /* ============================ CANVAS / MONDO ============================ */
  const canvas = $('view');
  const ctx = canvas.getContext('2d');
  let CW = 0, CH = 0, DPR = 1;
  let cam = { s: 1, ox: 0, oy: 0 };

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = window.innerWidth; CH = window.innerHeight;
    canvas.width = Math.round(CW * DPR);
    canvas.height = Math.round(CH * DPR);
    canvas.style.width = CW + 'px';
    canvas.style.height = CH + 'px';
    computeCam();
    draw();
  }

  function computeCam() {
    const r = D.rooms[st.loc];
    const topReserve = 116;
    const availH = Math.max(180, CH - topReserve - 56);
    cam.s = Math.min((CW - 16) / r.w, availH / r.h);
    cam.s = Math.min(cam.s, 1.25);
    cam.ox = (CW - r.w * cam.s) / 2;
    cam.oy = topReserve + (availH - r.h * cam.s) / 2;
  }
  const toWorld = (cx, cy) => ({ x: (cx - cam.ox) / cam.s, y: (cy - cam.oy) / cam.s });

  /* player */
  let player = { x: 330, y: 300, target: null, action: null, face: 1, ph: 0, moving: false };
  let npcWander = {}; // charId -> {t, phase}

  function movePlayer(dt) {
    if (!player.target) return;
    const dx = player.target.x - player.x, dy = player.target.y - player.y;
    const d = Math.hypot(dx, dy);
    const spd = 190 * cam.s * dt;
    if (d < 4 || spd <= 0) {
      player.x = player.target.x; player.y = player.target.y;
      player.target = null;
      player.moving = false;
      if (player.action) { const a = player.action; player.action = null; a(); }
      return;
    }
    player.moving = true;
    player.face = dx >= 0 ? 1 : -1;
    player.ph += dt * 10;
    const nx = clampX(player.x + (dx / d) * spd);
    const ny = clampY(player.y + (dy / d) * spd);
    player.x = nx; player.y = ny;
    pushOut();
  }

  function clampX(x) { const r = D.rooms[st.loc]; return Math.max(26, Math.min(r.w - 26, x)); }
  function clampY(y) {
    const r = D.rooms[st.loc];
    const minY = r.walkTop || 30;
    return Math.max(minY, Math.min(r.h - 22, y));
  }
  function pushOut() {
    const rr = D.rooms[st.loc];
    (rr.furniture || []).forEach(f => {
      const r = (f.s || 30) * 0.4;
      const vx = player.x - f.x, vy = player.y - f.y;
      const dist = Math.hypot(vx, vy);
      if (dist < r + 10 && dist > 0.001) {
        const push = (r + 10 - dist);
        player.x += (vx / dist) * push;
        player.y += (vy / dist) * push;
        player.x = clampX(player.x); player.y = clampY(player.y);
      }
    });
  }

  function goTo(x, y, action) {
    player.target = { x: clampX(x), y: clampY(y) };
    player.action = action || null;
  }

  function gotoRoom(roomId) {
    st.loc = roomId;
    const r = D.rooms[roomId];
    player.x = r.w / 2;
    player.y = r.h - 60;
    player.target = null; player.action = null; player.moving = false;
    npcWander = {};
    if (roomId === 'hotel') { setF('in_hotel'); evaluateBeats({ enter: 'hotel' }); }
    updateHUD();
    computeCam();
    draw();
    saveGame();
    // test automatico dello stato del luogo
    if (dlg && dlg._queue) { const q = dlg._queue; dlg._queue = null; closeDlg(true); openScene(q); }
  }

  /* ============================ INPUT (iPhone) ============================ */
  let lastTapT = 0;
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTapT < 320) return; // ignora doppio tocco veloce
    lastTapT = now;
    if (dlg || $('chapterCard').classList.contains('on')) return;
    const w = toWorld(e.clientX, e.clientY);
    const rr = D.rooms[st.loc];
    if (w.x < 10 || w.y < 10 || w.x > rr.w - 10 || w.y > rr.h - 10) return;

    // 1) npc
    const npcs = visibleNpcs(rr);
    let best = null, bestD = 70;
    npcs.forEach(n => {
      const d = Math.hypot(n.x - w.x, n.y - w.y);
      if (d < bestD) { bestD = d; best = n; }
    });
    if (best) {
      goTo(best.x - 14, best.y + 18, () => talkTo(best.id));
      return;
    }
    // 2) porte (incluse speciali)
    const doors = allDoors(rr);
    let dBest = null, dDist = 58;
    doors.forEach(dd => {
      const d = Math.hypot(dd.x - w.x, dd.y - w.y);
      if (d < dDist) { dDist = d; dBest = dd; }
    });
    if (dBest) {
      if (dBest.req && !hasF(dBest.req)) { toast(dBest.locked || 'La porta è chiusa.'); return; }
      goTo(dBest.x, dBest.y + 8, () => enterDoor(dBest));
      return;
    }
    // 3) hotspot
    const hots = hotspotsOf(rr);
    let hBest = null, hDist = 52;
    hots.forEach(h => {
      const d = Math.hypot(h.x - w.x, h.y - w.y);
      if (d < hDist) { hDist = d; hBest = h; }
    });
    if (hBest) {
      goTo(hBest.x, hBest.y + 22, () => openFlavor(hBest.e, hBest.label || 'Ricordo', hBest.text || []));
      return;
    }
    // 4) cammina
    goTo(w.x, w.y);
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  function visibleNpcs(room) {
    return (room.npc || [])
      .filter(n => st.chapter >= (n.from || 1))
      .filter(n => !(n.id === 'giulia' && st.loc === 'hotel' && st.endKey))
      .map(n => ({ id: n.id, x: n.x, y: n.y }));
  }
  function allDoors(room) {
    let list = [];
    if (room.doors) list = list.concat(room.doors.map(d => Object.assign({}, d, { inside: false })));
    if (room.specialDoors) list = list.concat(room.specialDoors.map(d => Object.assign({}, d, { inside: false })));
    if (room.id !== 'piazza' && room.id !== 'stanza9') {
      list.push({ x: room.w / 2, y: room.h - 16, to: 'piazza', emoji: '🚪', label: '→ Piazza', inside: true, w: 90 });
    } else if (room.id === 'piazza') {
      // uscita verso hotel è già in specialDoors
    }
    return list;
  }
  function hotspotsOf(room) {
    const list = (room.hotspots || []).slice();
    if (room.id === 'stanza9') {
      const spots = [
        { x: 90, y: 120 }, { x: 190, y: 90 }, { x: 300, y: 85 }, { x: 410, y: 95 }, { x: 520, y: 130 },
        { x: 555, y: 230 }, { x: 500, y: 320 }, { x: 380, y: 350 }, { x: 260, y: 355 }, { x: 140, y: 340 },
        { x: 70, y: 240 }, { x: 310, y: 200 }
      ];
      st.frags.forEach((fid, i) => {
        const fm = D.fragments.find(f => f.id === fid);
        if (fm && spots[i]) list.push({ x: spots[i].x, y: spots[i].y, e: fm.e, label: 'Ricordo', text: [fm.line] });
      });
    }
    return list;
  }
  function enterDoor(d) {
    if (d.inside) { gotoRoom('piazza'); return; }
    if (d.to) gotoRoom(d.to);
  }

  function talkTo(charId) {
    const c = D.chars[charId];
    if (!c) return;
    const scene = pendingScene(charId);
    if (scene) { openScene(scene.id); return; }
    // smalltalk giornaliero (+1 fiducia) per gli amici
    const canGain = CORE_FRIENDS.indexOf(charId) >= 0 && (st.trust[charId] || 0) < 100 && st.dailyTalk[charId] !== st.chapter;
    const lines = D.smalltalk[charId] || ['«…»'];
    const idx = (st.smallCount[charId] || 0) % lines.length;
    st.smallCount[charId] = idx + 1;
    let line = lines[idx];
    if (canGain) {
      st.dailyTalk[charId] = st.chapter;
      st.trust[charId] = Math.min(100, (st.trust[charId] || 0) + 1);
    } else if (charId === 'giulia' && st.endKey) {
      line = 'La scritta lampeggia: «grazie. adesso andate a vivere.»';
    } else if (!D.smalltalk[charId]) {
      line = '«' + c.short + ' ti sorride. La giornata è calda, la città è silenziosa.»';
    }
    openFlavor(c.emoji, c.name, [line]);
    updateHUD();
    saveGame();
  }

  /* ============================ DISEGNO ============================ */
  const EMOJI_FONT = (s) => s + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const MOODS = {
    day: null, gold: 'rgba(255,180,90,.10)', blue: 'rgba(140,190,255,.09)',
    dusk: 'rgba(255,120,70,.14)', night: 'rgba(10,16,60,.28)', dim: 'rgba(8,12,30,.22)'
  };
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    if (!st || !D.rooms[st.loc]) return;
    const r = D.rooms[st.loc];
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // sfondo pagina
    ctx.fillStyle = '#101527';
    ctx.fillRect(0, 0, CW, CH);
    ctx.save();
    ctx.translate(cam.ox, cam.oy);
    ctx.scale(cam.s, cam.s);

    // pavimento a scacchi
    const ts = 40;
    for (let gy = 0; gy < Math.ceil(r.h / ts); gy++) {
      for (let gx = 0; gx < Math.ceil(r.w / ts); gx++) {
        ctx.fillStyle = (gx + gy) % 2 ? r.tile2 : r.tile1;
        ctx.fillRect(gx * ts, gy * ts, ts, ts);
      }
    }
    // muro/parete superiore
    ctx.fillStyle = r.wall || '#887';
    ctx.fillRect(0, 0, r.w, 18);
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.fillRect(0, 18, r.w, 6);

    // mood
    const moodC = MOODS[r.mood];
    if (moodC) { ctx.fillStyle = moodC; ctx.fillRect(0, 0, r.w, r.h); }

    // porte della piazza (vetrine)
    if (r.id === 'piazza') {
      allDoors(r).forEach(dd => {
        if (dd.req) { drawSpecialDoor(dd); return; }
        const dw = 92, dh = 64;
        ctx.fillStyle = 'rgba(30,34,52,.92)';
        rrect(dd.x - dw / 2, dd.y - 8, dw, dh, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.16)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = EMOJI_FONT(30);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dd.emoji, dd.x, dd.y + 18);
        ctx.fillStyle = '#dfe7f5';
        ctx.font = '600 11px system-ui,sans-serif';
        ctx.fillText(dd.label, dd.x, dd.y + dh + 4);
      });
    }
    // uscita verso la piazza negli interni
    if (r.id !== 'piazza') {
      const y = r.h - 14;
      ctx.strokeStyle = 'rgba(255,255,255,.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(r.w / 2 - 40, y); ctx.lineTo(r.w / 2 + 40, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#dfe7f5';
      ctx.font = '700 13px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚪 verso la piazza', r.w / 2, y - 10);
    }

    // mobili
    const furn = (r.furniture || []).concat(dynFurniture(r));
    furn.forEach(f => {
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + (f.s || 30) * 0.32, (f.s || 30) * 0.38, (f.s || 30) * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = EMOJI_FONT(f.s || 32);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.e, f.x, f.y);
    });

    // hotspot con anello pulsante
    const tNow = performance.now() / 600;
    hotspotsOf(r).forEach(h => {
      const pulse = 0.5 + 0.5 * Math.sin(tNow + h.x);
      ctx.strokeStyle = 'rgba(139,233,253,' + (0.35 + pulse * 0.4) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(h.x, h.y - 4, 20 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = EMOJI_FONT(24);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(h.e, h.x, h.y - 4);
    });

    // personaggi
    visibleNpcs(r).forEach(n => {
      const pending = pendingScene(n.id);
      const spr = npcSprite(n.id, n.x, n.y);
      drawChar(spr);
      if (pending) {
        ctx.font = EMOJI_FONT(18);
        ctx.fillText('💬', n.x + 24, n.y - 42);
      }
      // etichetta nome
      const c = D.chars[n.id];
      ctx.font = '700 10.5px system-ui,sans-serif';
      const wName = ctx.measureText(c.short || c.name).width + 12;
      ctx.fillStyle = 'rgba(10,14,28,.78)';
      rrect(n.x - wName / 2, n.y - 58, wName, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#e7ecf6';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.short || c.name, n.x, n.y - 50);
    });

    // giocatore
    if (st.loc !== 'stanza9') {
      const px = player.x, py = player.y;
      const walkPhase = player.moving ? Math.floor(player.ph) % 2 : 0;
      drawCharSprite(px, py, walkPhase, player.face, { skin: '#f2c9a0', hair: '#4a3322', hairStyle: 1, top: '#3f7fd6', acc: null, ghost: false });
    }

    ctx.restore();
    // etichetta stanza digitale se dentro stanza9 (il giocatore è un cursore)
    if (st.loc === 'stanza9') {
      ctx.fillStyle = 'rgba(139,233,253,.9)';
      ctx.font = '700 12px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✳️ stai navigando nell’archivio', CW / 2, CH - 24);
    }
  }

  function dynFurniture(r) {
    if (r.id !== 'stanza9') return [];
    const arr = [];
    // ogni ricordo ritrovato arreda di più la stanza
    const spots = [
      { x: 150, y: 200, e: '🪴' }, { x: 190, y: 260, e: '📚' }, { x: 260, y: 290, e: '🖼️' },
      { x: 340, y: 300, e: '🧸' }, { x: 430, y: 280, e: '🎸' }, { x: 500, y: 220, e: '🛋️' },
      { x: 120, y: 250, e: '🕯️' }, { x: 220, y: 150, e: '☕' }, { x: 480, y: 150, e: '🌙' },
      { x: 60, y: 170, e: '📻' }, { x: 560, y: 180, e: '🌻' }, { x: 310, y: 120, e: '💌' }
    ];
    st.frags.forEach((fid, i) => {
      const fm = D.fragments.find(f => f.id === fid);
      if (fm && spots[i]) arr.push({ x: spots[i].x, y: spots[i].y, e: fm.e, s: 30 });
    });
    return arr;
  }

  function drawSpecialDoor(dd) {
    if (!dd) return;
    const open = hasF(dd.req);
    ctx.fillStyle = open ? 'rgba(40,70,110,.92)' : 'rgba(20,16,24,.94)';
    rrect(dd.x - 80, dd.y - 12, 160, 88, 10);
    ctx.fill();
    ctx.strokeStyle = open ? 'rgba(139,233,253,.5)' : 'rgba(255,120,120,.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = EMOJI_FONT(open ? 34 : 30);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(open ? '🏨' : '🔒', dd.x, dd.y + 20);
    ctx.fillStyle = open ? '#c9f2ff' : '#b7a7a7';
    ctx.font = '700 12px system-ui,sans-serif';
    ctx.fillText(dd.label, dd.x, dd.y + 56);
    if (!open) {
      ctx.font = '600 10px system-ui,sans-serif';
      ctx.fillText('chiuso a chiave — trova la chiave', dd.x, dd.y + 72);
    }
  }

  /* sprite personaggi */
  function npcSprite(id, x, y) {
    const c = D.chars[id];
    const w = npcWander[id] || { phase: 0 };
    if (c.ghost) w.phase += 0.02;
    else if (Math.random() < 0.0015 && !dlg) w.moving = !w.moving;
    if (w.moving && !c.ghost && !dlg && !pendingScene(id)) {
      // piccolo vagabondaggio attorno alla postazione
      if (!w.tx) {
        w.tx = x + (Math.random() - 0.5) * 70;
        w.ty = y + (Math.random() - 0.5) * 40;
      }
      const dx = w.tx - x, dy = w.ty - y;
      const d = Math.hypot(dx, dy);
      if (d < 4) { w.tx = null; w.ty = null; }
      else { x += (dx / d) * 0.5; y += (dy / d) * 0.5; w.phase += 0.1; }
    } else if (!c.ghost) {
      w.phase = 0;
    }
    return { id, x, y, c, ghost: !!c.ghost, walk: c.ghost ? 0 : (w.moving ? Math.floor(w.phase * 2) % 2 : 0), face: c.ghost ? 1 : 1 };
  }

  function drawChar(spr) {
    const bob = spr.ghost ? Math.sin(performance.now() / 500 + spr.x) * 2 : 0;
    drawCharSprite(spr.x, spr.y + bob, spr.walk, spr.face, {
      skin: spr.c.skin, hair: spr.c.hair, hairStyle: spr.c.hairStyle, top: spr.c.top, acc: spr.c.acc, ghost: spr.ghost
    });
  }

  function drawCharSprite(x, y, walk, face, o) {
    const s = 1;
    // ombra
    ctx.fillStyle = o.ghost ? 'rgba(139,233,253,.12)' : 'rgba(0,0,0,.20)';
    ctx.beginPath();
    ctx.ellipse(x, y + 12 * s, 13 * s, 4.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * face, s); // specchia per facing
    ctx.globalAlpha = o.ghost ? 0.65 : 1;
    // gambe
    const legY = 6, legH = 10;
    const swing = walk ? Math.sin(walk * Math.PI) * 3 : 0;
    ctx.fillStyle = o.top || '#333';
    ctx.fillRect(-5, legY - legH + 4, 4, legH - 4 + swing * 0.2);
    ctx.fillRect(1, legY - legH + 4, 4, legH - 4 - swing * 0.2);
    // scarpe
    ctx.fillStyle = '#232830';
    ctx.fillRect(-6, 8, 6, 3.4);
    ctx.fillRect(0, 8, 6, 3.4);
    // busto
    ctx.fillStyle = o.top || '#333';
    ctx.beginPath();
    ctx.roundRect(-9, -9, 18, 17, 5);
    ctx.fill();
    // braccia
    ctx.fillStyle = o.top || '#333';
    ctx.fillRect(-12, -6, 3.4, 10);
    ctx.fillRect(8.6, -6, 3.4, 10);
    // mani
    ctx.fillStyle = o.skin || '#e8c49a';
    ctx.fillRect(-13, 2.5, 4.6, 3.6);
    ctx.fillRect(8.4, 2.5, 4.6, 3.6);
    // collo + testa
    ctx.fillStyle = o.skin || '#e8c49a';
    ctx.fillRect(-2.4, -13, 4.8, 5);
    ctx.beginPath();
    ctx.arc(0, -18, 8.2, 0, Math.PI * 2);
    ctx.fill();
    // occhi
    ctx.fillStyle = '#1c2430';
    if (o.acc === 'glasses') {
      ctx.strokeStyle = '#2c3648';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(-3.4, -18, 3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(3.4, -18, 3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-0.4, -18); ctx.lineTo(0.4, -18); ctx.stroke();
    } else {
      ctx.fillRect(-5, -19, 1.8, 2.4);
      ctx.fillRect(3.2, -19, 1.8, 2.4);
    }
    // capelli
    ctx.fillStyle = o.hair || '#3a2a20';
    const hs = o.hairStyle || 0;
    if (hs === 0) {
      ctx.beginPath(); ctx.arc(0, -19.5, 8.4, Math.PI, 0); ctx.fill();
    } else if (hs === 1) {
      ctx.beginPath(); ctx.arc(0, -19.8, 8.5, Math.PI * 0.92, Math.PI * 0.08); ctx.fill();
      ctx.fillRect(-8, -22, 16, 4);
    } else {
      ctx.beginPath(); ctx.arc(0, -20, 8.4, Math.PI, 0); ctx.fill();
      ctx.fillRect(-8, -24, 3.5, 7);
      ctx.fillRect(4.5, -24, 3.5, 7);
    }
    if (o.acc === 'hat') {
      ctx.fillStyle = '#20263a';
      ctx.beginPath(); ctx.arc(0, -23, 9, Math.PI, 0); ctx.fill();
      ctx.fillRect(-10, -24, 20, 3.4);
    }
    ctx.restore();
  }

  /* ============================ LOOP ============================ */
  let lastT = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    if (!loaded) return;
    if ($('dlgSheet').classList.contains('on') || $('chapterCard').classList.contains('on')) {
      // in dialogo: solo piccoli aggiornamenti ambientali
      if (st.loc) draw();
      return;
    }
    movePlayer(dt);
    if (st.loc) draw();
  }

  /* ============================ UI EVENTI ============================ */
  function bindUI() {
    $('btnChat').addEventListener('click', () => { $('mChat').classList.add('on'); renderChat(); });
    $('btnDiary').addEventListener('click', () => { $('mDiary').classList.add('on'); renderDiary(); });
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => $(b.dataset.close).classList.remove('on')));
    $('mChat').addEventListener('click', (e) => { if (e.target === $('mChat')) $('mChat').classList.remove('on'); });
    $('mDiary').addEventListener('click', (e) => { if (e.target === $('mDiary')) $('mDiary').classList.remove('on'); });
    $('dayEndBtn').addEventListener('click', () => { advanceDay(); });
    $('resetBtn').addEventListener('click', () => { wipeSave(); location.reload(); });
    $('dlgClose').addEventListener('click', () => closeDlg());

    $('btnStanza9').addEventListener('click', () => {
      if (st.loc === 'stanza9') { gotoRoom('piazza'); }
      else { gotoRoom('stanza9'); }
      if (st.loc === 'stanza9') evaluateBeats({ enter: 'stanza9' });
    });

    // avvio
    $('introText').innerHTML = D.meta.intro.map(p => '<p style="margin-bottom:10px">' + p + '</p>').join('');
    $('startBtn').addEventListener('click', () => {
      st = freshState();
      st.items.push('biglietto');
      wipeSave();
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
      showChapterCard(1);
      loaded = true;
      lastT = performance.now();
      requestAnimationFrame(loop);
      saveGame();
    });
    $('contBtn').addEventListener('click', () => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
      loaded = true;
      updateHUD();
      lastT = performance.now();
      requestAnimationFrame(loop);
      draw();
    });
    $('againBtn').addEventListener('click', () => { location.reload(); });
    $('endMenuBtn').addEventListener('click', () => { location.reload(); });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) saveGame(); });
  }

  /* ============================ TEST ============================ */
  function selfTest() {
    const out = [];
    const ok = (m) => out.push('✔ ' + m);
    const bad = (m) => out.push('✘ ' + m);
    // integrità dati
    try {
      const allIds = {};
      Object.keys(D.chars).forEach(c => allIds['char:' + c] = 1);
      Object.keys(D.rooms).forEach(r => allIds['room:' + r] = 1);
      Object.keys(D.items).forEach(i => allIds['item:' + i] = 1);
      Object.keys(D.scenes).forEach(s => { allIds['scene:' + s] = 1; allIds['scenedone:' + s] = 1; });
      D.fragments.forEach(f => allIds['frag:' + f.id] = 1);
      let err = 0;
      Object.keys(D.scenes).forEach(id => {
        const s = D.scenes[id];
        if (s.ch && !D.chars[s.ch]) { bad('scene ' + id + ' → char mancante ' + s.ch); err++; }
        if (s.day < 1 || s.day > 7) { bad('scene ' + id + ' → day fuori range'); err++; }
        (s.opts || []).forEach((o, i) => {
          if (o.to && o.to.indexOf('__end:') === 0 && !D.endings[o.to.slice(6)]) { bad('scene ' + id + ' opt' + i + ' → ending mancante'); err++; }
          if (o.to && o.to.indexOf('__end:') !== 0 && o.to && !D.scenes[o.to]) { bad('scene ' + id + ' opt' + i + ' → to mancante ' + o.to); err++; }
          const fx = o.fx || {};
          (fx.flag || []).forEach(f => allIds['flag:' + f] = 1);
          if (fx.frag) (Array.isArray(fx.frag) ? fx.frag : [fx.frag]).forEach(f => { if (!D.fragments.find(x => x.id === f)) { bad('scene ' + id + ' opt' + i + ' → frag inesistente ' + f); err++; } });
          if (fx.item && !D.items[fx.item]) { bad('scene ' + id + ' opt' + i + ' → item inesistente'); err++; }
          if (fx.delItem && !D.items[fx.delItem]) { bad('item del inesistente'); err++; }
          const nd = o.need || {};
          if (nd.item && !D.items[nd.item]) { bad('need item inesistente'); err++; }
          if (nd.done && !D.scenes[nd.done]) { bad('need done inesistente ' + nd.done); err++; }
        });
      });
      D.chapters.forEach((ch, ci) => {
        if (ch.n !== ci + 1) bad('capitolo fuori ordine');
        (ch.beats || []).forEach((b, bi) => {
          const c = b.cond || {};
          (c.scene || []).forEach(s => { if (!D.scenes[s]) { bad('beat ch' + ch.n + ' scene ' + s + ' inesistente'); err++; } });
          (c.anyScene || []).forEach(s => { if (!D.scenes[s]) { bad('beat anyScene inesistente'); err++; } });
          if (b.do && b.do.open && !D.scenes[b.do.open]) { bad('beat open inesistente'); err++; }
        });
      });
      // frammenti unici
      const seen = {};
      D.fragments.forEach(f => { if (seen[f.id]) bad('frag duplicato ' + f.id); seen[f.id] = 1; });
      ok('scenes: ' + Object.keys(D.scenes).length + ' · frags: ' + D.fragments.length + ' · rooms: ' + Object.keys(D.rooms).length + ' · chars: ' + Object.keys(D.chars).length);
      if (err === 0) ok('tutti i riferimenti risolti');
      else bad(err + ' errori di riferimento');
      // simulazione: raggiungibilità dei finali
      const sim = { flags: {}, frags: [], trust: {}, items: [] };
      const needOk2 = (nd) => {
        nd = nd || {};
        if (nd.frag && sim.frags.length < nd.frag) return false;
        if (nd.item && sim.items.indexOf(nd.item) < 0) return false;
        if (nd.flag && !sim.flags[nd.flag]) return false;
        if (nd.not && sim.flags[nd.not]) return false;
        if (nd.done && !sim.flags[nd.done + '_done']) return false;
        if (nd.trust) for (const k in nd.trust) if ((sim.trust[k] || 0) < nd.trust[k]) return false;
        if (nd.trustSum && CORE_FRIENDS.reduce((a, c) => a + (sim.trust[c] || 0), 0) < nd.trustSum) return false;
        return true;
      };
      const applyOpt = (o) => {
        const fx = o.fx || {};
        (fx.flag || []).forEach(f => sim.flags[f] = 1);
        if (fx.frag) (Array.isArray(fx.frag) ? fx.frag : [fx.frag]).forEach(f => { if (sim.frags.indexOf(f) < 0) sim.frags.push(f); });
        if (fx.item && sim.items.indexOf(fx.item) < 0) sim.items.push(fx.item);
        if (fx.trust) for (const k in fx.trust) sim.trust[k] = (sim.trust[k] || 0) + fx.trust[k];
      };
      const complete = (id) => {
        const s = D.scenes[id];
        if (!s) return;
        sim.flags[id + '_done'] = 1;
        if (s.day && s.ch && CORE_FRIENDS.indexOf(s.ch) >= 0) sim.trust[s.ch] = Math.min(100, (sim.trust[s.ch] || 0) + 10);
        (s.opts || []).forEach(o => { if (needOk2(o.need)) applyOpt(o); });
      };
      // completa tutte le scene possibili in ordine (con tutti i bisogni soddisfatti progressivamente)
      for (let day = 1; day <= 7; day++) {
        let changed = true;
        while (changed) {
          changed = false;
          Object.keys(D.scenes).forEach(id => {
            const s = D.scenes[id];
            if (s.day > day) return;
            if (sim.flags[id + '_done']) return;
            if (id === 'finale') return;
            if (needOk2(s.need)) { complete(id); changed = true; }
          });
        }
      }
      const trustTotal = CORE_FRIENDS.reduce((a, c) => a + (sim.trust[c] || 0), 0);
      const finale = D.scenes['finale'];
      let reach = {};
      (finale.opts || []).forEach(o => { reach[o.to.slice(6)] = needOk2(o.need); });
      ok('simulazione: frags=' + sim.frags.length + '/12 · trust=' + Math.round(trustTotal) + ' · finali raggiungibili: ' + Object.keys(reach).filter(k => reach[k]).join(', '));
      const missing = Object.keys(reach).filter(k => !reach[k]);
      if (missing.length) bad('finali NON raggiungibili nella simulazione ottimale: ' + missing.join(', '));
      // verifica raggiungibilità E1
      const frAll = D.fragments.length;
      if (sim.frags.length < frAll - 1) bad('mancano frammenti: ' + (frAll - 1 - sim.frags.length));
    } catch (e) {
      bad('eccezione: ' + e.message);
    }
    return out;
  }

  /* ============================ BOOT ============================ */
  function boot() {
    bindUI();
    resize();
    // test automatici (?test=1)
    if (/\btest=1\b/.test(location.search)) {
      const res = selfTest();
      console.log('%cSTANZA 9 — self test', 'font-weight:bold');
      res.forEach(l => console.log(l));
      const body = $('introText');
      body.innerHTML = '<b>Auto-test</b><br>' + res.map(r => esc(r)).join('<br>');
      $('startBtn').textContent = 'Avvia comunque';
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
      $('scrStart').classList.add('on');
      loaded = true;
      return;
    }
    if (loadGame() && st.endKey) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
      $('contBtn').style.display = 'none';
      goEnding(st.endKey);
      loaded = true;
      return;
    }
    const hasSave = !!localStorage.getItem(SAVE_KEY);
    $('contBtn').style.display = (hasSave && !st.endKey) ? '' : 'none';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
    $('scrStart').classList.add('on');
  }

  /* ============================ API DEBUG/TEST ============================ */
  // Esposta per QA (?test=1 e test headless): nessun effetto sul gameplay
  window.__S9 = {
    get: () => st,
    talk: (id) => talkTo(id),
    open: (id) => openScene(id),
    flavor: (e, t, lines) => openFlavor(e, t, lines),
    pick: (i) => { if (dlg && !dlg.flavor && document.getElementById('dlgOpts').children[i]) document.getElementById('dlgOpts').children[i].click(); },
    next: () => { const nb = [...document.getElementById('dlgOpts').children].find(b => (b.textContent || '').includes('continua')); if (nb) nb.click(); },
    closeDlg: () => closeDlg(),
    advance: () => advanceDay(),
    goto: (r) => gotoRoom(r),
    hasFlag: (f) => hasF(f),
    dlgOpen: () => !!dlg,
    dlgText: () => (dlg ? document.getElementById('dlgBody').textContent : ''),
    beats: () => evaluateBeats({}),
    save: () => saveGame()
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
