// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — UI (DOM overlay)
// Login, HUD, negozi, mappa, minimappa. Fix: ESC chiude le modali,
// grammatica corretta, contatori munizioni visibili.
// ═══════════════════════════════════════════════════════════════

var UI = {};

// helper globale di scorciatoia (usato anche da game.js)
function $(id) { return document.getElementById(id); }

UI.$ = $;

// --- Toast / messaggio -------------------------------------------------------
UI.toast = function (msg, ms) {
  var t = UI.$('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(UI._toastT);
  UI._toastT = setTimeout(function () { t.classList.remove('on'); }, ms || 2000);
};

UI.message = function (msg, ms) {
  var m = UI.$('message');
  m.textContent = msg;
  m.classList.add('on');
  clearTimeout(UI._msgT);
  UI._msgT = setTimeout(function () { m.classList.remove('on'); }, ms || 1600);
};

// --- Login ---------------------------------------------------------------------
UI.showLogin = function () {
  UI.$('login').classList.remove('hidden');
  UI.renderAccountList();
};
UI.hideLogin = function () { UI.$('login').classList.add('hidden'); };

UI.renderAccountList = function () {
  var list = UI.$('accountList'), names = SAVE.listAccounts(), i, b;
  list.innerHTML = '';
  if (!names.length) return;
  for (i = 0; i < names.length; i++) {
    b = document.createElement('button');
    b.className = 'acc';
    b.textContent = names[i];
    b.onclick = function () {
      AUDIO.resume();
      GAME.enter(names[this._i]);
    };
    b._i = i;
    list.appendChild(b);
  }
};

// --- HUD --------------------------------------------------------------------------
UI.updateHud = function (p) {
  var ship = DATA.SHIPS[p.ship];
  var st = GAME.stats(p);

  $('hudName').textContent = p.name;
  $('hudShip').textContent = ship.name + ' (' + ship.slots + ' slot) · CONFIG ' + DATA.CONFIGS[p.config].name;

  $('hudCredits').innerHTML = 'CREDITI <b>' + (p.admin ? '∞' : GAME.fmt(p.credits)) + '</b>';
  $('hudVoidium').innerHTML = 'VOIDIUM <b>' + (p.admin ? '∞' : GAME.fmt(p.voidium)) + '</b>';
  $('hudHull').innerHTML = 'SCOFO <b>' + ship.name + '</b>';

  var epNext = GAME.epForNextLevel(p.level);
  $('hudStats').innerHTML =
    'LIVELLO <b>' + p.level + '</b> · EP <b>' + GAME.fmt(p.ep) + '</b>/' + GAME.fmt(epNext) +
    ' · RANK <b>' + GAME.rankTitle(p) + '</b> · ONORE <b>' + GAME.fmt(p.honor) + '</b>';

  $('hudDrone').innerHTML = 'DRONE <b>' + (p.drone ? DATA.DRONES[p.drone].name : 'NESSUNO') + '</b>';

  var actBoost = [], bk;
  for (bk in DATA.BOOSTERS) if (DATA.BOOSTERS.hasOwnProperty(bk) && GAME.boosterActive(p, bk)) {
    actBoost.push('<span style="color:' + DATA.BOOSTERS[bk].color + '">' + bk.toUpperCase() + ' ' + GAME.boosterTimeLeft(p, bk) + '</span>');
  }
  var elB = $('hudBoost');
  if (actBoost.length) { elB.classList.remove('hidden'); elB.innerHTML = 'BOOSTER ' + actBoost.join(' · '); }
  else elB.classList.add('hidden');

  var mm = p.mission;
  var el = $('hudMission');
  if (mm) {
    var prog = mm.type === 'survive'
      ? Math.max(0, mm.need - Math.ceil(mm.secs)) + '/' + mm.need + 's'
      : mm.have + '/' + mm.need;
    el.classList.remove('hidden');
    el.innerHTML = (mm.claimable ? '<b style="color:var(--good)">COMPLETATA!</b> ' : '') + mm.label + ' · ' + prog + (mm.claimable ? ' · premi B' : '');
  } else {
    el.classList.add('hidden');
  }

  document.querySelector('#barHp .fill').style.width = Math.max(0, Math.min(100, (p.hp / st.maxHp) * 100)) + '%';
  document.querySelector('#barShield .fill').style.width = Math.max(0, Math.min(100, (p.shieldHp / st.maxShield) * 100)) + '%';
  document.querySelector('#barEnergy .fill').style.width = Math.max(0, Math.min(100, (p.energy / st.maxEnergy) * 100)) + '%';
};

UI.setSector = function (name) { $('sector').textContent = name; };
UI.showHud = function () { $('hud').classList.remove('hidden'); };
UI.hideHud = function () { $('hud').classList.add('hidden'); };

// --- Minimappa -----------------------------------------------------------------------
UI.drawMinimap = function () {
  var cv = $('minimap'), ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var sx = W / DATA.WORLD_W, sy = H / DATA.WORLD_H;
  var i, p = GAME.player;
  ctx.clearRect(0, 0, W, H);

  // buco nero al centro
  var bhx = DATA.BLACKHOLE.x * sx, bhy = DATA.BLACKHOLE.y * sy;
  var grd = ctx.createRadialGradient(bhx, bhy, 1, bhx, bhy, BH_MM_R());
  grd.addColorStop(0, '#000');
  grd.addColorStop(0.55, 'rgba(124,92,255,.55)');
  grd.addColorStop(1, 'rgba(124,92,255,0)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(bhx, bhy, BH_MM_R(), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(bhx, bhy, 4, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#2fd3ff';
  ctx.fillRect(DATA.BASE.x * sx - 2, DATA.BASE.y * sy - 2, 4, 4);
  ctx.fillStyle = '#9f6bff';
  ctx.fillRect(DATA.GATE.portal.x * sx - 3, DATA.GATE.portal.y * sy - 3, 6, 6);

  ctx.fillStyle = '#6b5b4e';
  for (i = 0; i < WORLD.asteroids.length; i++) {
    if (!WORLD.asteroids[i].alive) continue;
    ctx.fillRect(WORLD.asteroids[i].x * sx - 1, WORLD.asteroids[i].y * sy - 1, 2, 2);
  }
  ctx.fillStyle = '#e8546a';
  for (i = 0; i < WORLD.npcs.length; i++) {
    if (!WORLD.npcs[i].alive) continue;
    ctx.fillRect(WORLD.npcs[i].x * sx - 1, WORLD.npcs[i].y * sy - 1, 2, 2);
  }
  // mini-boss evento
  ctx.fillStyle = '#b388ff';
  for (i = 0; i < WORLD.bosses.length; i++) {
    if (!WORLD.bosses[i].alive) continue;
    ctx.fillRect(WORLD.bosses[i].x * sx - 2, WORLD.bosses[i].y * sy - 2, 5, 5);
  }
  ctx.fillStyle = '#ffe97a';
  for (i = 0; i < WORLD.drops.length; i++) {
    ctx.fillRect(WORLD.drops[i].x * sx - 1, WORLD.drops[i].y * sy - 1, 2, 2);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(p.x * sx - 3, p.y * sy - 3, 6, 6);

  if (GAME.moveTarget) {
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(GAME.moveTarget.x * sx, GAME.moveTarget.y * sy, 3, 0, Math.PI * 2);
    ctx.stroke();
  }
};
function BH_MM_R() { return 26; }

// Tap/click sulla minimappa → vola verso quel punto del mondo
UI.minimapMove = function (clientX, clientY) {
  var cv = $('minimap');
  var r = cv.getBoundingClientRect();
  var sx = clientX - r.left, sy = clientY - r.top;
  if (sx < 0 || sy < 0 || sx > r.width || sy > r.height) return;
  var wx = (sx / r.width) * DATA.WORLD_W;
  var wy = (sy / r.height) * DATA.WORLD_H;
  GAME.moveTarget = { x: wx, y: wy };
  AUDIO.select();
};

// --- Munizioni ---------------------------------------------------------------------------
UI.updateAmmo = function () {
  var p = GAME.player;
  var btns = document.querySelectorAll('#ammoBar .ammo');
  for (var i = 0; i < btns.length; i++) {
    var t = btns[i].getAttribute('data-a');
    btns[i].classList.toggle('on', t === p.ammo);
    var cnt = p.ammoCounts[t] || 0;
    btns[i].innerHTML = (i + 1) + '<small>' + cnt + '</small>';
    btns[i].style.opacity = cnt > 0 ? '' : '0.35';
  }
  var def = DATA.AMMO[p.ammo] || DATA.AMMO.red;
  $('ammoNow').innerHTML = 'MUN <b style="color:' + def.color + '">' + def.name + '</b> x' + def.mult +
    ' · <b>' + (p.ammoCounts[p.ammo] || 0) + '</b>';
};

// --- Bersaglio ------------------------------------------------------------------------------
UI.updateTarget = function () {
  var box = $('targetInfo');
  var n = GAME.selectedNpc && GAME.selectedNpc.alive ? GAME.selectedNpc : null;
  if (!n) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  $('tName').textContent = n.name + (GAME.attacking ? ' · ATTACCO' : ' · selezionato');
  $('tFill').style.width = Math.max(0, Math.min(100, (n.hp / n.maxHp) * 100)) + '%';
  $('tFill').style.background = n.isBoss ? '#ff2d4d' : '#ff5b6a';
};

// --- Mappa galattica ----------------------------------------------------------------------------
UI.openMap = function () { $('map').classList.remove('hidden'); GAME.paused = true; UI.drawGalaxyMap(); };
UI.closeMap = function () { $('map').classList.add('hidden'); GAME.paused = false; };

UI.drawGalaxyMap = function () {
  var cv = $('mapCanvas'), ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var sx = W / DATA.WORLD_W, sy = H / DATA.WORLD_H;
  var i, p = GAME.player;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, W, H);

  // disegno il buco nero al centro
  var bhx = DATA.BLACKHOLE.x * sx, bhy = DATA.BLACKHOLE.y * sy;
  var g = ctx.createRadialGradient(bhx, bhy, 2, bhx, bhy, 90);
  g.addColorStop(0, '#000');
  g.addColorStop(0.35, '#2a1f4d');
  g.addColorStop(0.7, 'rgba(124,92,255,.28)');
  g.addColorStop(1, 'rgba(124,92,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(bhx, bhy, 90, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#2a3a5c'; ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeRect(W / 2, 0, W / 2, H / 2);
  ctx.strokeRect(0, H / 2, W / 2, H / 2);
  ctx.strokeRect(W / 2, H / 2, W / 2, H / 2);

  ctx.fillStyle = '#8fa3c7';
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('PERIFERIA', 10, 20);
  ctx.fillText('DISCO D\'ACCRESCIMENTO', W / 2 + 10, 20);
  ctx.fillText('SFERA DEI FOTON', 10, H / 2 + 20);
  ctx.fillText('ORIZZONTE DEGLI EVENTI', W / 2 + 10, H / 2 + 20);

  var sec;
  ctx.font = '10px sans-serif';
  for (i = 0; i < DATA.SECTORS.length; i++) {
    sec = DATA.SECTORS[i];
    ctx.fillStyle = (p.level >= sec.reqLevel) ? '#46e0a0' : '#ff5b6a';
    ctx.fillText('LIV. ' + sec.reqLevel, (sec.x0 / DATA.WORLD_W) * W + 10, (sec.y0 / DATA.WORLD_H) * H + 34);
  }

  ctx.fillStyle = '#6b5b4e';
  for (i = 0; i < WORLD.asteroids.length; i++) {
    if (!WORLD.asteroids[i].alive) continue;
    ctx.fillRect(WORLD.asteroids[i].x * sx - 1, WORLD.asteroids[i].y * sy - 1, 2, 2);
  }
  for (i = 0; i < WORLD.npcs.length; i++) {
    if (!WORLD.npcs[i].alive) continue;
    ctx.fillStyle = WORLD.npcs[i].color;
    ctx.fillRect(WORLD.npcs[i].x * sx - 2, WORLD.npcs[i].y * sy - 2, 4, 4);
  }
  ctx.fillStyle = '#2fd3ff';
  ctx.fillRect(DATA.BASE.x * sx - 3, DATA.BASE.y * sy - 3, 6, 6);
  ctx.fillStyle = '#9f6bff';
  ctx.fillRect(DATA.GATE.portal.x * sx - 4, DATA.GATE.portal.y * sy - 4, 8, 8);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(p.x * sx, p.y * sy, 5, 0, Math.PI * 2); ctx.fill();
};

// --- Negozi -----------------------------------------------------------------------------------------
UI.openShop = function () { $('shop').classList.remove('hidden'); GAME.paused = true; UI.shopTab = 'nave'; UI.renderShop(); };
UI.closeShop = function () { $('shop').classList.add('hidden'); GAME.paused = false; };
UI.closeMissions = function () { $('missions').classList.add('hidden'); GAME.paused = false; };

// Chiude qualsiasi modale aperta (usato da ESC e dai pulsanti touch)
UI.closeAllPanels = function () {
  ['shop', 'map', 'missions'].forEach(function (id) { $(id).classList.add('hidden'); });
  GAME.paused = false;
};
UI.anyPanelOpen = function () {
  return !$('shop').classList.contains('hidden') ||
         !$('map').classList.contains('hidden') ||
         !$('missions').classList.contains('hidden');
};

UI.shopTabs = [
  { tab: 'nave',     label: 'NAVE',       data: null },
  { tab: 'navi',     label: 'NAVI',       data: DATA.SHIPS,      type: 'ship' },
  { tab: 'laser',    label: 'LASER',      data: DATA.LASERS,     type: 'laser' },
  { tab: 'scudo',    label: 'SCUDO',      data: DATA.SHIELDS,    type: 'shield' },
  { tab: 'gen',      label: 'GENERATORE', data: DATA.GENERATORS, type: 'gen' },
  { tab: 'batt',     label: 'BATTERIE',   data: DATA.BATTERIES,  type: 'batt' },
  { tab: 'prop',     label: 'PROPULSORE', data: DATA.ENGINES,    type: 'eng' },
  { tab: 'drone',    label: 'DRONI',      data: DATA.DRONES,     type: 'drone' },
  { tab: 'munizioni',label: 'MUNIZIONI',  data: null, type: null },
  { tab: 'minerali', label: 'MINERALI',   data: null, type: null },
  { tab: 'skylab',   label: 'FABBRICA',   data: null, type: null },
  { tab: 'portale',  label: 'FRATTURA',   data: null, type: null },
  { tab: 'booster',  label: 'BOOSTER',    data: null, type: null }
];

UI.renderShop = function () {
  var p = GAME.player;
  var admin = p.admin;
  var items = $('shopItems');
  var tabsEl = $('shop');
  var active = UI.shopTab || 'nave';

  $('shopCredits').innerHTML = 'CREDITI <b>' + (admin ? '∞' : GAME.fmt(p.credits)) + '</b>';
  $('shopVoidium').innerHTML = 'VOIDIUM <b>' + (admin ? '∞' : GAME.fmt(p.voidium)) + '</b>';
  $('shopAdmin').classList.toggle('hidden', !admin);

  var tabBtns = tabsEl.querySelectorAll('.tab');
  for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].classList.toggle('on', tabBtns[i].getAttribute('data-tab') === active);
  }

  items.innerHTML = '';
  if (active === 'nave') { UI.renderShipTab(p, items); return; }
  if (active === 'munizioni') { UI.renderAmmoTab(p, items, admin); return; }
  if (active === 'minerali') { UI.renderMinerals(p, items, admin); return; }
  if (active === 'skylab') { UI.renderSkylab(p, items, admin); return; }
  if (active === 'portale') { UI.renderPortal(p, items, admin); return; }
  if (active === 'booster') { UI.renderBooster(p, items, admin); return; }

  for (i = 0; i < UI.shopTabs.length; i++) {
    var t = UI.shopTabs[i];
    if (t.tab !== active || !t.data) continue;
    for (var k in t.data) {
      if (!t.data.hasOwnProperty(k)) continue;
      var def = t.data[k];
      var row = document.createElement('div');
      row.className = 'shopRow';

      var info = document.createElement('div');
      info.className = 'info';
      var nm = document.createElement('div');
      nm.className = 'nm';
      nm.textContent = def.name;
      var st = document.createElement('div');
      st.className = 'st';
      st.textContent = UI.describeItem(t.type, def);
      info.appendChild(nm); info.appendChild(st);

      var costBox = document.createElement('div');
      costBox.className = 'cost' + (def.voidium > 0 ? ' u' : '');
      costBox.textContent = GAME.fmt(def.cost) + ' CS' + (def.voidium > 0 ? ' · ' + GAME.fmt(def.voidium) + ' VD' : '');

      var buy = document.createElement('button');
      buy.className = 'buy';
      buy._key = k; buy._type = t.type;
      buy.onclick = function () { GAME.buy(this._type, this._key); };

      var ownedList = (p.owned && p.owned[t.type]) || [];
      var inUse = (t.type === 'ship' && p.ship === k) || (t.type === 'drone' && p.drone === k);
      if (inUse) { buy.textContent = 'IN USO'; buy.disabled = true; }
      else if (ownedList.indexOf(k) >= 0) { buy.textContent = 'POSSIEDI'; buy.disabled = true; }
      else {
        buy.textContent = 'COMPRA';
        buy.disabled = !(admin || (p.credits >= def.cost && p.voidium >= def.voidium));
      }
      row.appendChild(info); row.appendChild(costBox); row.appendChild(buy);
      items.appendChild(row);
    }
  }
};

// Tab MUNIZIONI: pacchetti acquistabili (le munizioni ora sono consumabili)
UI.renderAmmoTab = function (p, items, admin) {
  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'MUNIZIONI · ogni colpo ne consuma 1 (moltiplicatore danno)';
  items.appendChild(title);

  Object.keys(DATA.AMMO).forEach(function (key) {
    var def = DATA.AMMO[key];
    var have = p.ammoCounts[key] || 0;
    var row = document.createElement('div');
    row.className = 'shopRow';

    var info = document.createElement('div');
    info.className = 'info';
    var nm = document.createElement('div');
    nm.className = 'nm';
    nm.innerHTML = '<span class="chip" style="background:' + def.color + '"></span> Munizioni ' + def.name;
    var st = document.createElement('div');
    st.className = 'st';
    st.textContent = 'Danno x' + def.mult + ' · ne hai ' + have;
    info.appendChild(nm); info.appendChild(st);

    var costBox = document.createElement('div');
    costBox.className = 'cost';
    costBox.textContent = GAME.fmt(def.cost) + ' CS / ' + def.pack;

    var buy = document.createElement('button');
    buy.className = 'buy';
    buy._key = key;
    buy.onclick = function () { GAME.buyAmmo(this._key); };
    buy.textContent = '+' + def.pack;
    buy.disabled = !(admin || p.credits >= def.cost);

    row.appendChild(info); row.appendChild(costBox); row.appendChild(buy);
    items.appendChild(row);
  });
};

// Tab NAVE
UI.renderShipTab = function (p, items) {
  var ship = DATA.SHIPS[p.ship];
  var st = GAME.stats(p);

  var card = document.createElement('div');
  card.className = 'skylab';
  card.innerHTML =
    '<div class="skyRow"><b style="color:' + ship.color + '">' + ship.name + '</b> · Scafo ' + ship.maxHp +
    ' HP · Velocità base ' + ship.speed + ' · <b>' + ship.slots + ' slot</b></div>' +
    '<div class="skyRow">Danno <b>' + st.dmg + '</b> (' + st.rate + '/s, portata ' + st.range + ') · Scudo <b>' +
    st.maxShield + '</b> · Energia <b>' + st.maxEnergy + '</b> · Velocità <b>' + Math.round(st.speed) + '</b></div>';
  items.appendChild(card);

  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'SLOT DI BORDO (installa i moduli che possiedi)';
  items.appendChild(title);

  var all = [], i, j, cat;
  for (i = 0; i < SAVE.SLOT_ORDER.length; i++) {
    cat = SAVE.SLOT_ORDER[i];
    var owned = (p.owned && p.owned[cat]) || [];
    for (j = 0; j < owned.length; j++) {
      var def = null;
      if (cat === 'laser') def = DATA.LASERS[owned[j]];
      else if (cat === 'shield') def = DATA.SHIELDS[owned[j]];
      else if (cat === 'gen') def = DATA.GENERATORS[owned[j]];
      else if (cat === 'batt') def = DATA.BATTERIES[owned[j]];
      else if (cat === 'eng') def = DATA.ENGINES[owned[j]];
      if (def) all.push({ key: owned[j], label: def.name + ' (' + cat.toUpperCase() + ')' });
    }
  }

  for (i = 0; i < ship.slots; i++) {
    var row = document.createElement('div');
    row.className = 'shopRow';
    var lab = document.createElement('div');
    lab.className = 'nm';
    lab.textContent = 'SLOT ' + (i + 1);
    var sel = document.createElement('select');
    sel.className = 'slotSel';
    var opt = document.createElement('option');
    opt.value = ''; opt.textContent = '— VUOTO —';
    sel.appendChild(opt);
    for (j = 0; j < all.length; j++) {
      var o = document.createElement('option');
      o.value = all[j].key; o.textContent = all[j].label;
      sel.appendChild(o);
    }
    sel.value = p.slots[i] || '';
    (function (idx, s) {
      s.onchange = function () { GAME.installModule(idx, s.value); };
    })(i, sel);
    row.appendChild(lab); row.appendChild(sel);
    items.appendChild(row);
  }

  var hint = document.createElement('div');
  hint.className = 'skyRow';
  hint.textContent = 'Compra i moduli nelle altre schede e installali qui negli slot.';
  items.appendChild(hint);
};

// Tab MINERALI
UI.renderMinerals = function (p, items, admin) {
  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'STIVA MINERALI · vendi per crediti (l\'Onore aumenta il prezzo)';
  items.appendChild(title);

  Object.keys(DATA.ORES).forEach(function (key) {
    var def = DATA.ORES[key];
    var qty = (p.ores && p.ores[key]) ? p.ores[key] : 0;
    var row = document.createElement('div');
    row.className = 'shopRow';

    var info = document.createElement('div');
    info.className = 'info';
    var nm = document.createElement('div');
    nm.className = 'nm';
    nm.innerHTML = '<span class="chip" style="background:' + def.color + '"></span> ' + def.name +
      ' <span class="qty">×' + qty + '</span>';
    var st = document.createElement('div');
    st.className = 'st';
    st.textContent = (def.tier !== 'raw' ? 'Raffinato · ' : 'Grezzo · ') + GAME.fmt(def.value) + ' CS base';
    info.appendChild(nm); info.appendChild(st);

    var costBox = document.createElement('div');
    costBox.className = 'cost';
    costBox.textContent = GAME.fmt(GAME.orePrice(key)) + ' CS/l\'una';

    var sellOne = document.createElement('button');
    sellOne.className = 'buy';
    sellOne._key = key;
    sellOne.onclick = function () { GAME.sellOre(this._key, 1); };
    sellOne.textContent = 'VENDI 1';
    sellOne.disabled = qty < 1;

    var sellAll = document.createElement('button');
    sellAll.className = 'buy alt';
    sellAll._key = key; sellAll._qty = qty;
    sellAll.onclick = function () { GAME.sellOre(this._key, this._qty); };
    sellAll.textContent = 'TUTTE';
    sellAll.disabled = qty < 1;

    row.appendChild(info); row.appendChild(costBox);
    var wrap = document.createElement('div');
    wrap.style.display = 'flex'; wrap.style.gap = '6px';
    wrap.appendChild(sellOne); wrap.appendChild(sellAll);
    row.appendChild(wrap);
    items.appendChild(row);
  });

  var title2 = document.createElement('div');
  title2.className = 'secTitle';
  title2.textContent = 'RAFFINERIA · combina minerali per crearne di pregiati';
  items.appendChild(title2);

  Object.keys(DATA.RECIPES).forEach(function (rk) {
    var rec = DATA.RECIPES[rk];
    var outDef = DATA.ORES[rec.out];
    var rowR = document.createElement('div');
    rowR.className = 'shopRow';

    var infoR = document.createElement('div');
    infoR.className = 'info';
    var nmR = document.createElement('div');
    nmR.className = 'nm';
    nmR.innerHTML = '<span class="chip" style="background:' + outDef.color + '"></span> ' + outDef.name;
    var ingText = [];
    for (var ing in rec.cost) if (rec.cost.hasOwnProperty(ing)) ingText.push(rec.cost[ing] + ' ' + DATA.ORES[ing].name);
    var stR = document.createElement('div');
    stR.className = 'st';
    stR.textContent = 'Da: ' + ingText.join(' + ');
    infoR.appendChild(nmR); infoR.appendChild(stR);

    var costBoxR = document.createElement('div');
    costBoxR.className = 'cost';
    costBoxR.textContent = 'Valore ' + GAME.fmt(outDef.value) + ' CS';

    var ref = document.createElement('button');
    ref.className = 'buy';
    ref._key = rk;
    ref.onclick = function () { GAME.refine(this._key); };
    ref.textContent = 'RAFFINA';
    ref.disabled = !GAME.canAffordRecipe(rk);

    rowR.appendChild(infoR); rowR.appendChild(costBoxR); rowR.appendChild(ref);
    items.appendChild(rowR);
  });
};

// Tab FABBICA ORBITALE (ex Skylab)
UI.renderSkylab = function (p, items, admin) {
  var lvl = DATA.SKYLAB[p.skylab.level];
  var next = DATA.SKYLAB[p.skylab.level + 1];

  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'FABBRICA ORBITALE · produzione passiva (anche offline)';
  items.appendChild(title);

  var box = document.createElement('div');
  box.className = 'skylab';
  var outOre = DATA.ORES[DATA.RECIPES[p.skylab.recipe].out];
  box.innerHTML = '<div class="skyRow"><b>' + lvl.name + '</b> · ' + lvl.rate +
    ' unità/ora di <b style="color:' + outOre.color + '">' + outOre.name + '</b></div>';
  items.appendChild(box);

  if (next) {
    var req = document.createElement('div');
    req.className = 'skyRow';
    req.textContent = 'Prossimo: ' + next.name + ' · ' + next.rate + ' u/h · costo ' + GAME.fmt(next.cost) + ' CS · livello ' + next.reqLevel;
    box.appendChild(req);
    var up = document.createElement('button');
    up.className = 'buy';
    up.onclick = function () { GAME.skylabUpgrade(); };
    up.textContent = 'POTENZIA';
    up.disabled = !(admin || (p.credits >= next.cost && p.level >= next.reqLevel));
    box.appendChild(up);
  } else {
    box.insertAdjacentHTML('beforeend', '<div class="skyRow">Livello massimo raggiunto</div>');
  }

  var title2 = document.createElement('div');
  title2.className = 'secTitle';
  title2.textContent = 'MINERALE DA PRODURRE';
  items.appendChild(title2);

  Object.keys(DATA.RECIPES).forEach(function (rk) {
    var rec = DATA.RECIPES[rk];
    var outDef = DATA.ORES[rec.out];
    var row = document.createElement('div');
    row.className = 'shopRow';
    var ingText = [];
    for (var ing in rec.cost) if (rec.cost.hasOwnProperty(ing)) ingText.push(rec.cost[ing] + ' ' + DATA.ORES[ing].name);

    var info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = '<div class="nm"><span class="chip" style="background:' + outDef.color + '"></span> ' + outDef.name + '</div>' +
      '<div class="st">Consuma: ' + ingText.join(' + ') + '</div>';

    var set = document.createElement('button');
    set.className = 'buy';
    set._key = rk;
    set.onclick = function () { GAME.skylabSetRecipe(this._key); };
    set.textContent = (p.skylab.recipe === rk) ? 'ATTIVA' : 'SELEZIONA';
    if (p.skylab.recipe === rk) { set.disabled = true; set.style.background = 'var(--good)'; }

    row.appendChild(info); row.appendChild(set);
    items.appendChild(row);
  });
};

UI.describeItem = function (type, def) {
  switch (type) {
    case 'ship': return 'Scafo ' + def.maxHp + ' HP · Velocità ' + def.speed + ' · ' + def.slots + ' slot';
    case 'laser': return 'Danno ' + def.dmg + ' · ' + def.rate + ' colpi/s · Portata ' + def.range;
    case 'shield': return 'Scudo ' + def.max + ' · Rigenera ' + def.regen + '/s';
    case 'gen': return 'Energia +' + def.regen + '/s';
    case 'batt': return 'Energia max +' + def.max;
    case 'eng': return 'Velocità +' + def.boost;
    case 'drone': return 'Danno ' + def.dmg + ' · ' + def.rate + '/s · Portata ' + def.range + ' · Raccoglie i drop';
  }
  return '';
};

// --- Missioni ----------------------------------------------------------------------------------------
UI.openMissions = function () {
  var p = GAME.player;
  if (!p.missionBoard && !p.mission) GAME.refreshMissionBoard();
  $('missions').classList.remove('hidden');
  GAME.paused = true;
  UI.renderMissions();
};

UI.renderMissions = function () {
  var p = GAME.player;
  var box = $('missionsItems');
  box.innerHTML = '';
  var m = p.mission;

  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'MISSIONE ATTIVA';
  box.appendChild(title);

  if (m) {
    var row = document.createElement('div');
    row.className = 'shopRow';
    var info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = '<div class="nm">' + esc(m.label) + '</div><div class="st">' +
      (m.type === 'survive'
        ? 'Sopravvissuti: ' + Math.max(0, m.need - Math.ceil(m.secs)) + ' / ' + m.need + ' s'
        : 'Progresso: ' + m.have + ' / ' + m.need) + '</div>';
    var rew = document.createElement('div');
    rew.className = 'cost';
    rew.innerHTML = '+' + GAME.fmt(m.reward.credits) + ' CS<br>+' + m.reward.voidium + ' VD · +' + GAME.fmt(m.reward.ep) + ' EP';
    var claim = document.createElement('button');
    claim.className = 'buy';
    claim.textContent = m.claimable ? 'RISCUOTI' : 'IN CORSO';
    claim.disabled = !m.claimable;
    claim.onclick = function () { GAME.claimMission(); };
    row.appendChild(info); row.appendChild(rew); row.appendChild(claim);
    box.appendChild(row);
  } else {
    box.insertAdjacentHTML('beforeend', '<div class="skyRow">Nessuna missione attiva.</div>');
  }

  var title2 = document.createElement('div');
  title2.className = 'secTitle';
  title2.textContent = 'BACHECA (3 missioni per il tuo livello)';
  box.appendChild(title2);

  if (!p.mission && p.missionBoard) {
    p.missionBoard.forEach(function (bm, mi) {
      var brow = document.createElement('div');
      brow.className = 'shopRow';
      var binfo = document.createElement('div');
      binfo.className = 'info';
      binfo.innerHTML = '<div class="nm">' + esc(bm.label) + '</div>';
      var brew = document.createElement('div');
      brew.className = 'cost';
      brew.innerHTML = '+' + GAME.fmt(bm.reward.credits) + ' CS<br>+' + bm.reward.voidium + ' VD · +' + GAME.fmt(bm.reward.ep) + ' EP';
      var acc = document.createElement('button');
      acc.className = 'buy';
      acc.textContent = 'ACCETTA';
      acc.onclick = function () { GAME.acceptMission(mi); };
      brow.appendChild(binfo); brow.appendChild(brew); brow.appendChild(acc);
      box.appendChild(brow);
    });
  } else if (!p.mission) {
    var refresh = document.createElement('button');
    refresh.className = 'buy';
    refresh.textContent = 'GENERA MISSIONI';
    refresh.onclick = function () { GAME.refreshMissionBoard(); UI.renderMissions(); };
    box.appendChild(refresh);
  }

  if (p.mission) {
    box.insertAdjacentHTML('beforeend', '<div class="skyRow">Una missione alla volta: completa e riscuoti.</div>');
  }
};

function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// Tab FRATTURA (ex Galaxy Gate)
UI.renderPortal = function (p, items, admin) {
  var G = DATA.GATE;
  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'LA FRATTURA · Orizzonte degli Eventi';
  items.appendChild(title);

  var box = document.createElement('div');
  box.className = 'skylab';
  box.innerHTML =
    '<div class="skyRow">Requisito: <b>livello ' + G.reqLevel + '</b> · 5 ondate + boss <b>SINGULARITAS</b> · tasto <b>G</b> o pulsante FRATTURA</div>' +
    '<div class="skyRow">Ricompensa: crediti, voidium, EP, onore e PARTI DI FRATTURA.</div>';
  items.appendChild(box);

  var title2 = document.createElement('div');
  title2.className = 'secTitle';
  title2.textContent = 'PARTI DI FRATTURA: ' + (p.gateParts || 0);
  items.appendChild(title2);

  var rowS = document.createElement('div');
  rowS.className = 'shopRow';
  rowS.innerHTML =
    '<div class="info"><div class="nm">Scambio 5 parti</div><div class="st">Ottieni 2.000 VOIDIUM</div></div>' +
    '<div class="cost">5 → 2000 VD</div>';
  var bS = document.createElement('button');
  bS.className = 'buy';
  bS.textContent = 'SCAMBIA';
  bS.disabled = (p.gateParts || 0) < 5;
  bS.onclick = function () {
    p.gateParts -= 5;
    if (!p.admin) p.voidium += 2000;
    UI.renderPortal(p, items, admin);
    UI.updateHud(p);
    SAVE.saveAccount(p);
  };
  rowS.appendChild(bS);
  items.appendChild(rowS);

  var rowV = document.createElement('div');
  rowV.className = 'shopRow';
  rowV.innerHTML =
    '<div class="info"><div class="nm">Vendi 1 parte</div><div class="st">Ottieni 1.500 CREDITI</div></div>' +
    '<div class="cost">1 → 1500 CS</div>';
  var bV = document.createElement('button');
  bV.className = 'buy';
  bV.textContent = 'VENDI';
  bV.disabled = (p.gateParts || 0) < 1;
  bV.onclick = function () {
    p.gateParts -= 1;
    p.credits += 1500;
    UI.renderPortal(p, items, admin);
    UI.updateHud(p);
    SAVE.saveAccount(p);
  };
  rowV.appendChild(bV);
  items.appendChild(rowV);
};

// Tab BOOSTER + kit
UI.renderBooster = function (p, items, admin) {
  var title = document.createElement('div');
  title.className = 'secTitle';
  title.textContent = 'BOOSTER (10 ORE REALI) · il voidium compra tempo';
  items.appendChild(title);

  Object.keys(DATA.BOOSTERS).forEach(function (key) {
    var def = DATA.BOOSTERS[key];
    var active = GAME.boosterActive(p, key);
    var row = document.createElement('div');
    row.className = 'shopRow';
    var info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = '<div class="nm"><span class="chip" style="background:' + def.color + '"></span> ' + def.name + '</div>' +
      '<div class="st">' + def.desc + (active ? ' · ATTIVO (' + GAME.boosterTimeLeft(p, key) + ')' : '') + '</div>';
    var costBox = document.createElement('div');
    costBox.className = 'cost u';
    costBox.textContent = GAME.fmt(def.voidium) + ' VD';
    var buy = document.createElement('button');
    buy.className = 'buy';
    buy._key = key;
    buy.onclick = function () { GAME.buyBooster(this._key); };
    buy.textContent = active ? 'RINNOVA' : 'ATTIVA';
    buy.disabled = !(admin || p.voidium >= def.voidium);
    row.appendChild(info); row.appendChild(costBox); row.appendChild(buy);
    items.appendChild(row);
  });

  var title2 = document.createElement('div');
  title2.className = 'secTitle';
  title2.textContent = 'KIT CONSUMABILI (crediti)';
  items.appendChild(title2);

  Object.keys(DATA.KITS).forEach(function (kk) {
    var kde = DATA.KITS[kk];
    var krow = document.createElement('div');
    krow.className = 'shopRow';
    krow.innerHTML = '<div class="info"><div class="nm">' + kde.name + '</div><div class="st">' + kde.desc + '</div></div>' +
      '<div class="cost">' + GAME.fmt(kde.cost) + ' CS</div>';
    var kuse = document.createElement('button');
    kuse.className = 'buy';
    kuse._key = kk;
    kuse.onclick = function () { GAME.useKit(this._key); };
    kuse.textContent = 'USA';
    kuse.disabled = !(admin || p.credits >= kde.cost);
    krow.appendChild(kuse);
    items.appendChild(krow);
  });
};

// --- Init UI ------------------------------------------------------------------------------------------
UI.init = function () {
  $('loginBtn').onclick = function () {
    var name = $('loginName').value.trim();
    if (!name) { UI.toast('Inserisci un nome pilota'); return; }
    AUDIO.resume();
    GAME.enter(name);
  };
  $('loginName').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') $('loginBtn').click();
  });
  $('shopClose').onclick = UI.closeShop;
  $('mapClose').onclick = UI.closeMap;
  $('missionsClose').onclick = UI.closeMissions;

  // mute audio
  var muteBtn = $('btnMute');
  var setIcon = function () {
    muteBtn.textContent = AUDIO.muted ? '🔇' : '🔊';
    muteBtn.classList.toggle('off', AUDIO.muted);
  };
  AUDIO.init(); setIcon();
  muteBtn.onclick = function () { AUDIO.setMuted(!AUDIO.muted); setIcon(); };

  // munizioni 1-4
  var ammoBtns = document.querySelectorAll('#ammoBar .ammo');
  for (var a = 0; a < ammoBtns.length; a++) {
    ammoBtns[a].onclick = function () { GAME.setAmmo(this.getAttribute('data-a')); };
  }

  // minimappa: click/tap = vola lì; drag = sposta la finestra (desktop)
  var mm = $('minimap');
  mm.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') { UI.minimapMove(e.clientX, e.clientY); return; }
    mm._drag = true; mm._moved = false;
    mm._sx = e.clientX; mm._sy = e.clientY;
    e.preventDefault();
  });
  window.addEventListener('pointermove', function (e) {
    if (!mm._drag) return;
    var dx = e.clientX - mm._sx, dy = e.clientY - mm._sy;
    if (!mm._moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) mm._moved = true;
    if (mm._moved) {
      var r = mm.getBoundingClientRect();
      var nx = Math.max(0, Math.min(window.innerWidth - mm.offsetWidth, r.left + dx));
      var ny = Math.max(0, Math.min(window.innerHeight - mm.offsetHeight, r.top + dy));
      mm.style.left = nx + 'px'; mm.style.top = ny + 'px';
      mm.style.right = 'auto'; mm.style.bottom = 'auto';
      mm._sx = e.clientX; mm._sy = e.clientY;
    }
  });
  window.addEventListener('pointerup', function (e) {
    if (!mm._drag) return;
    mm._drag = false;
    if (!mm._moved) UI.minimapMove(e.clientX, e.clientY);
  });

  var tabBtns = document.querySelectorAll('.tabs .tab');
  for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].onclick = function () {
      UI.shopTab = this.getAttribute('data-tab');
      UI.renderShop();
    };
  }
};
