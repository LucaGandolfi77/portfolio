/* Miraggio Pass — motore di progressione cross-game.
   Legge i salvataggi reali dei giochi, assegna XP, gestisce sfide giornaliere,
   streak, badge e profilo. Tutto in localStorage, nessun server. */
(function(){
  'use strict';

  var STORE = 'miraggio_pass_v1';
  var EVENTS = 'miraggio_events';
  var CATALOG = window.MIRAGGIO_CATALOG || [];
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var LEVELS = [
    { min:0,    name:'Tirocinante' },
    { min:120,  name:'Specializzando' },
    { min:300,  name:'Residente' },
    { min:600,  name:'Medico di Guardia' },
    { min:1000, name:'Primario' },
    { min:1600, name:'Direttore' },
    { min:2500, name:'Professore' },
    { min:3800, name:'Leggenda del Miraggio' },
    { min:6000, name:'Immortale' }
  ];

  var BADGES = [
    { id:'first',    icon:'🌱', name:'Primo Passo',      desc:'Il primo gioco sincronizzato',        test:function(s){ return Object.keys(s.seen).length >= 1; } },
    { id:'arcade5',  icon:'🕹️', name:'Arcade Rookie',    desc:'5 giochi arcade scoperti',            test:function(s){ return countCat(s,'arcade') >= 5; } },
    { id:'arcade10', icon:'🏆', name:'Arcade Legend',    desc:'10 giochi arcade scoperti',           test:function(s){ return countCat(s,'arcade') >= 10; } },
    { id:'strat5',   icon:'♟️', name:'Mentecritto',      desc:'5 giochi di strategia',               test:function(s){ return countCat(s,'strategia') >= 5; } },
    { id:'creative', icon:'🎨', name:'Manto d’Artista',  desc:'5 giochi creativi',                   test:function(s){ return countCat(s,'creativita') >= 5; } },
    { id:'xp1000',   icon:'⭐', name:'Mille Punti',      desc:'Raggiungi 1000 XP',                   test:function(s){ return s.xp >= 1000; } },
    { id:'xp5000',   icon:'💫', name:'Cinque Mila',      desc:'Raggiungi 5000 XP',                   test:function(s){ return s.xp >= 5000; } },
    { id:'streak3',  icon:'🔥', name:'Costanza',         desc:'3 giorni di fila',                    test:function(s){ return s.streak >= 3; } },
    { id:'streak7',  icon:'🌞', name:'Settimana Perfetta',desc:'7 giorni di fila',                   test:function(s){ return s.streak >= 7; } },
    { id:'poly10',   icon:'🎯', name:'Poliglotta',       desc:'10 giochi diversi in un giorno',      test:function(s,d){ return (d && d.games ? d.games.length : 0) >= 10; } },
    { id:'collector',icon:'🧭', name:'Collezionista',    desc:'20 giochi scoperti',                  test:function(s){ return Object.keys(s.seen).length >= 20; } },
    { id:'daily10',  icon:'📅', name:'Puntuale',         desc:'10 sfide giornaliere completate',     test:function(s){ return s.dailyDoneCount >= 10; } }
  ];

  var CHALLENGES = [
    { id:'play3',    icon:'🎮', text:'Gioca 3 giochi diversi',        target:3, get:function(d){ return d.games.length; } },
    { id:'xp400',    icon:'⚡', text:'Guadagna 400 XP oggi',          target:400, get:function(d){ return d.xp; } },
    { id:'arcade2',  icon:'🕹️', text:'Gioca 2 giochi arcade',         target:2, get:function(d){ return d.games.filter(inCat('arcade')).length; } },
    { id:'record',   icon:'📈', text:'Batti un record personale',     target:1, get:function(d){ return d.records || 0; } },
    { id:'checkin2', icon:'✅', text:'Fai 2 check-in manuali',        target:2, get:function(d){ return d.checkins.length; } },
    { id:'strategy', icon:'♟️', text:'Gioca un gioco di strategia',   target:1, get:function(d){ return d.games.filter(inCat('strategia')).length; } },
    { id:'creative', icon:'🎨', text:'Gioca un gioco creativo',       target:1, get:function(d){ return d.games.filter(inCat('creativita')).length; } },
    { id:'poly5',    icon:'🌈', text:'5 giochi diversi in un giorno', target:5, get:function(d){ return d.games.length; } },
    { id:'streak3',  icon:'🔥', text:'3 giorni di fila',              target:3, get:function(d,s){ return s.streak; } },
    { id:'badge',    icon:'🏅', text:'Sblocca un nuovo badge',        target:1, get:function(d,s){ return Object.keys(s.badges).length > 0 ? 1 : 0; } }
  ];

  var KEY_GAME = {
    snake_highScore:'snake', si_high:'invaders', pb_high:'pinball', pixelRunnerHighScore:'pixelrunner',
    geom_dash_bestScore:'geomdash', 'sinibbio.best':'sinibbio', scalpel_save:'scalpel',
    'flappy-neon-v1':'flappy', 'memory-garden-v1':'memory', 'royale-lab-v1':'clashroyale',
    'city-sim-v3':'citysim', 'tetris_apocalypse_best_':'tetris', forza4_scores:'forza4',
    'animal_crossing_save_v1':'animalcrossing', 'yatzee.save.v1':'yatzee', 'yatzee.solo.save.v1':'yatzeesolo',
    pk_chips:'poker', bj_chips:'blackjack', slot_wins:'slot', av_balance:'aviator'
  };

  var S, dailyCache, toastTimer;

  /* ── utility ── */
  function today(){ var d = new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function dayOffset(n){ var d = new Date(); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function hash(str){ var h = 2166136261; for(var i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function game(id){ for(var i=0;i<CATALOG.length;i++) if(CATALOG[i].id === id) return CATALOG[i]; return null; }
  function inCat(cat){ return function(id){ var g = game(id); return g && g.cat === cat; }; }
  function countCat(s, cat){ var n = 0; for(var id in s.seen){ var g = game(id); if(g && g.cat === cat) n++; } return n; }
  function levelInfo(xp){
    var idx = 0;
    for(var i=0;i<LEVELS.length;i++) if(xp >= LEVELS[i].min) idx = i;
    var cur = LEVELS[idx], next = LEVELS[idx+1] || null;
    var pct = next ? Math.min(100, Math.round((xp-cur.min)/(next.min-cur.min)*100)) : 100;
    return { num:idx+1, name:cur.name, next:next, pct:pct, cur:cur };
  }
  function defaultState(){
    return { v:1, xp:0, level:1, best:{}, seen:{}, badges:{}, days:{}, streak:0,
             lastDay:'', title:'', accent:'cyan', dailyDoneCount:0, createdAt:Date.now() };
  }
  function load(){
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || 'null');
      if(!s || s.v !== 1) return defaultState();
      var d = defaultState();
      for(var k in d) if(s[k] === undefined) s[k] = d[k];
      return s;
    } catch(e){ return defaultState(); }
  }
  function save(){ try { localStorage.setItem(STORE, JSON.stringify(S)); } catch(e){} }
  function day(){
    var k = today();
    if(!S.days[k]) S.days[k] = { games:[], xp:0, records:0, checkins:[] };
    var d = S.days[k];
    if(!d.games) d.games = [];
    if(!d.checkins) d.checkins = [];
    return d;
  }

  /* ── progressione ── */
  function grant(gameId, amount, reason){
    if(gameId && !game(gameId)) return;
    var before = levelInfo(S.xp).num;
    S.xp += amount;
    S.level = levelInfo(S.xp).num;
    var d = day();
    d.xp += amount;
    if(gameId){
      if(d.games.indexOf(gameId) === -1) d.games.push(gameId);
      S.seen[gameId] = true;
    }
    if(reason === 'record') d.records = (d.records || 0) + 1;
    if(levelInfo(S.xp).num > before){
      toast('⬆️ Livello ' + levelInfo(S.xp).num + ' — ' + levelInfo(S.xp).name, 'levelup');
      confetti();
    }
  }

  function scan(){
    var gained = 0, newly = 0;
    for(var i=0;i<CATALOG.length;i++){
      var g = CATALOG[i];
      var val = 0;
      try { val = g.metric(localStorage); } catch(e){ val = 0; }
      if(!val) continue;
      var prev = Number(S.best[g.id]) || 0;
      if(!S.seen[g.id]) newly++;
      if(val > prev){
        var delta = prev ? val-prev : val;
        var xp = Math.max(5, Math.round(Math.sqrt(Math.max(1, delta)) * g.xp));
        if(xp > 400) xp = 400;
        S.best[g.id] = val;
        S.seen[g.id] = true;
        grant(g.id, xp, 'record');
        gained += xp;
      } else {
        S.seen[g.id] = true;
      }
    }
    if(newly) toast('🔎 ' + newly + (newly === 1 ? ' nuovo gioco scoperto!' : ' nuovi giochi scoperti!'));
    return gained;
  }

  function mapPathToGame(path){
    if(!path) return null;
    path = String(path).replace(/\\/g,'/');
    var i, p;
    /* prima: corrispondenza sul percorso completo (evita scontro tra index.html) */
    for(i=0;i<CATALOG.length;i++){
      p = CATALOG[i].path.replace(/^\.\.\/projects\//,'');
      if(path.indexOf('/'+p) !== -1) return CATALOG[i].id;
    }
    /* poi: fallback sull'ultimo segmento */
    var seg = path.split('/').pop();
    for(i=0;i<CATALOG.length;i++){
      p = CATALOG[i].path.split('/').pop();
      if(p === seg) return CATALOG[i].id;
    }
    return null;
  }

  function processEvents(){
    var raw;
    try { raw = JSON.parse(localStorage.getItem(EVENTS) || '[]'); } catch(e){ raw = []; }
    if(!Array.isArray(raw) || !raw.length) return;
    var d = day();
    for(var i=0;i<raw.length;i++){
      var ev = raw[i];
      if(!ev) continue;
      var id = mapPathToGame(ev.page);
      if(!id && ev.key){
        for(var k in KEY_GAME){
          if(ev.key === k || ev.key.indexOf(k) === 0){ id = KEY_GAME[k]; break; }
        }
      }
      if(id){
        if(d.games.indexOf(id) === -1) d.games.push(id);
        if(!S.seen[id]) S.seen[id] = true;
        if(ev.type === 'pageview' && (d.checkins.indexOf('v:'+id) === -1)){
          d.checkins.push('v:'+id);
          grant(id, 8, 'visit');
        }
      }
    }
    try { localStorage.removeItem(EVENTS); } catch(e){}
  }

  function dailyChallenges(){
    if(dailyCache && dailyCache.day === today()) return dailyCache.list;
    var seed = hash(today());
    var r = rng(seed);
    var pool = CHALLENGES.slice();
    for(var i=pool.length-1;i>0;i--){ var j = Math.floor(r()*(i+1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    dailyCache = { day:today(), list:pool.slice(0,3) };
    return dailyCache.list;
  }

  function updateStreak(){
    var t = today();
    if(S.lastDay === t) return;
    if(S.lastDay === dayOffset(-1)) S.streak = (S.streak || 0) + 1;
    else if(S.lastDay !== t) S.streak = 1;
    S.lastDay = t;
  }

  function checkBadges(){
    var d = day();
    var newly = [];
    for(var i=0;i<BADGES.length;i++){
      var b = BADGES[i];
      if(!S.badges[b.id] && b.test(S, d)){
        S.badges[b.id] = Date.now();
        newly.push(b);
      }
    }
    if(newly.length){
      toast('🏅 Badge: ' + newly[0].name, 'badge');
      confetti();
    }
  }

  function sync(){
    updateStreak();
    processEvents();
    var gained = scan();
    checkBadges();
    var done = 0, list = dailyChallenges();
    for(var i=0;i<list.length;i++){
      var c = list[i], v = Math.min(c.target, Number(c.get(day(), S)) || 0);
      if(v >= c.target) done++;
    }
    if(done === 3 && !S['daily_'+today()]){
      S['daily_'+today()] = true;
      S.dailyDoneCount = (S.dailyDoneCount || 0) + 1;
      grant(null, 100, 'daily');
      toast('🎯 Giornata perfetta! +100 XP', 'badge');
    }
    save();
    render();
    return gained;
  }

  /* ── UI ── */
  function toast(msg, cls){
    var box = $('#toasts'); if(!box) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (cls || '');
    el.innerHTML = msg;
    box.appendChild(el);
    setTimeout(function(){ el.classList.add('out'); setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 400); }, 3200);
  }
  function confetti(){
    var box = $('#confetti'); if(!box) return;
    var colors = ['#5fd0ff','#2ecc71','#f39c12','#e74c3c','#9b59b6','#f1c40f'];
    for(var i=0;i<42;i++){
      var p = document.createElement('i');
      p.style.left = Math.random()*100+'%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random()*0.35)+'s';
      p.style.transform = 'rotate('+(Math.random()*360)+'deg)';
      box.appendChild(p);
      (function(el){ setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 1900); })(p);
    }
  }

  function render(){
    var li = levelInfo(S.xp);
    $('#rankName').textContent = li.name;
    $('#levelNum').textContent = 'Lv. ' + li.num;
    $('#xpText').textContent = S.xp.toLocaleString() + ' XP' + (li.next ? ' / ' + li.next.min.toLocaleString() : ' · MAX');
    $('#xpFill').style.width = li.pct + '%';
    $('#streakVal').textContent = (S.streak || 0) + ' 🔥';
    $('#todayXp').textContent = (day().xp || 0) + ' XP oggi';
    $('#statGames').textContent = Object.keys(S.seen).length;
    $('#statBadges').textContent = Object.keys(S.badges).length + '/' + BADGES.length;
    $('#statDays').textContent = Object.keys(S.days).length;
    $('#statXp').textContent = S.xp.toLocaleString();
    renderChallenges();
    renderRecent();
    renderGames();
    renderBadges();
    renderProfile();
    renderHistory();
  }

  function renderChallenges(){
    var list = dailyChallenges(), d = day(), html = '';
    for(var i=0;i<list.length;i++){
      var c = list[i], v = Math.min(c.target, Number(c.get(d, S)) || 0);
      var pct = Math.round(v/c.target*100);
      html += '<div class="challenge' + (v>=c.target?' done':'') + '">' +
        '<div class="ch-ico">' + c.icon + '</div>' +
        '<div class="ch-body"><div class="ch-title">' + esc(c.text) + '</div>' +
        '<div class="ch-bar"><i style="width:' + pct + '%"></i></div></div>' +
        '<div class="ch-count">' + v + '/' + c.target + '</div></div>';
    }
    var a = $('#challengeList'), b = $('#challengeList2');
    if(a) a.innerHTML = html;
    if(b) b.innerHTML = html;
  }

  function renderRecent(){
    var arr = Object.keys(S.best).map(function(id){ return { id:id, v:Number(S.best[id])||0 }; })
      .sort(function(a,b){ return b.v-a.v; }).slice(0,4);
    if(!arr.length){ $('#recentList').innerHTML = '<p class="empty">Nessun record yet — apri un gioco e il pass lo rileverà da solo.</p>'; return; }
    var html = '';
    for(var i=0;i<arr.length;i++){
      var g = game(arr[i].id); if(!g) continue;
      html += '<a class="mini-card" href="' + href(g) + '">' +
        '<span class="mini-ico">' + g.icon + '</span>' +
        '<span class="mini-info"><b>' + esc(g.name) + '</b><small>' + g.label + ': ' + arr[i].v + '</small></span>' +
        '<span class="mini-arrow">→</span></a>';
    }
    $('#recentList').innerHTML = html;
  }

  function href(g){
    if(g.root === 'projects') return '../../projects/' + g.path.replace(/^\.\.\/projects\//,'');
    if(g.path.indexOf('/') !== -1) return '../' + g.path;
    return '../' + g.path;
  }

  var activeCat = 'all', searchTerm = '';
  function renderGames(){
    var wrap = $('#gamesGrid'); if(!wrap) return;
    var filter = CATALOG.filter(function(g){
      if(activeCat !== 'all' && g.cat !== activeCat) return false;
      if(searchTerm && g.name.toLowerCase().indexOf(searchTerm) === -1) return false;
      return true;
    });
    var html = '';
    for(var i=0;i<filter.length;i++){
      var g = filter[i], seen = !!S.seen[g.id], checked = day().checkins.indexOf(g.id) !== -1;
      html += '<div class="game-card' + (seen?' seen':'') + '">' +
        '<div class="gc-top"><span class="gc-ico">' + g.icon + '</span>' +
        '<span class="gc-cat cat-' + g.cat + '">' + g.cat + '</span></div>' +
        '<div class="gc-name">' + esc(g.name) + '</div>' +
        '<div class="gc-best">' + (S.best[g.id] ? g.label + ': <b>' + S.best[g.id] + '</b>' : (seen ? 'Giocato · nessun record' : 'Non ancora giocato')) + '</div>' +
        '<div class="gc-actions"><a class="btn-open" href="' + href(g) + '">Apri →</a>' +
        '<button class="btn-check' + (checked?' on':'') + '" data-check="' + g.id + '">' + (checked?'✓ Oggi':'Check-in') + '</button></div></div>';
    }
    wrap.innerHTML = html || '<p class="empty">Nessun gioco trovato.</p>';
    $$('[data-check]', wrap).forEach(function(b){
      b.addEventListener('click', function(){ checkin(b.getAttribute('data-check')); });
    });
  }

  function checkin(id){
    var d = day();
    if(d.checkins.indexOf(id) !== -1){ toast('Già registrato oggi ✓'); return; }
    d.checkins.push(id);
    if(d.games.indexOf(id) === -1) d.games.push(id);
    S.seen[id] = true;
    grant(id, 12, 'checkin');
    checkBadges(); save(); render();
    toast('✅ Check-in registrato: +12 XP');
  }

  function renderBadges(){
    var html = '';
    for(var i=0;i<BADGES.length;i++){
      var b = BADGES[i], got = S.badges[b.id];
      html += '<div class="badge' + (got?' got':'') + '">' +
        '<div class="bd-ico">' + (got ? b.icon : '🔒') + '</div>' +
        '<div class="bd-name">' + esc(b.name) + '</div>' +
        '<div class="bd-desc">' + esc(b.desc) + '</div>' +
        (got ? '<div class="bd-date">' + new Date(got).toLocaleDateString('it-IT') + '</div>' : '') +
        '</div>';
    }
    $('#badgesGrid').innerHTML = html;
  }

  function renderHistory(){
    var html = '';
    for(var i=6;i>=0;i--){
      var key = dayOffset(-i), d = S.days[key];
      if(!d) continue;
      var done = 0, list = dailyChallenges();
      for(var j=0;j<list.length;j++){
        var c = list[j];
        if(Math.min(c.target, Number(c.get(d, S)) || 0) >= c.target) done++;
      }
      html += '<div class="hist-row"><span>' + key + '</span><span>' + d.games.length + ' giochi</span><span>' + d.xp + ' XP</span><span>' + done + '/3 sfide</span></div>';
    }
    $('#historyList').innerHTML = html || '<p class="empty">Ancora nessuna attività registrata.</p>';
  }

  function renderProfile(){
    var titles = ['Tirocinante','Specializzando','Residente','Primario','Direttore','Leggenda'];
    var sel = $('#titleSelect');
    if(sel && !sel.options.length){
      for(var i=0;i<titles.length;i++){
        var o = document.createElement('option'); o.value = titles[i]; o.textContent = titles[i]; sel.appendChild(o);
      }
    }
    if(sel) sel.value = S.title || titles[0];
    $$('[data-accent]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-accent') === (S.accent||'cyan')); });
    document.body.setAttribute('data-accent', S.accent || 'cyan');
    var snip = $('#snippet');
    if(snip) snip.textContent = '<script src="../miraggio-pass/js/bridge.js"></script>';
  }

  /* ── init ── */
  function bind(){
    $$('[data-tab]').forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-tab');
        $$('[data-tab]').forEach(function(x){ x.classList.toggle('on', x === b); });
        $$('.panel').forEach(function(x){ x.classList.toggle('on', x.id === 'tab-'+t); });
        window.scrollTo(0,0);
      });
    });
    $$('[data-cat]').forEach(function(b){
      b.addEventListener('click', function(){
        activeCat = b.getAttribute('data-cat');
        $$('[data-cat]').forEach(function(x){ x.classList.toggle('on', x === b); });
        renderGames();
      });
    });
    var s = $('#searchGames');
    if(s) s.addEventListener('input', function(){ searchTerm = s.value.trim().toLowerCase(); renderGames(); });
    var ts = $('#titleSelect');
    if(ts) ts.addEventListener('change', function(){ S.title = ts.value; save(); toast('Titolo aggiornato'); });
    $$('[data-accent]').forEach(function(b){
      b.addEventListener('click', function(){ S.accent = b.getAttribute('data-accent'); save(); renderProfile(); });
    });
    var reset = $('#btnReset');
    if(reset) reset.addEventListener('click', function(){
      if(confirm('Cancellare TUTTI i progressi del Miraggio Pass?')){
        try { localStorage.removeItem(STORE); localStorage.removeItem(EVENTS); } catch(e){}
        location.reload();
      }
    });
    var exp = '#btnExport';
    $(exp).addEventListener('click', function(){
      var blob = new Blob([JSON.stringify(S, null, 2)], { type:'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'miraggio-pass-' + today() + '.json'; a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
    });
    var imp = $('#btnImport'), file = $('#importFile');
    if(imp && file){
      imp.addEventListener('click', function(){ file.click(); });
      file.addEventListener('change', function(){
        var f = file.files && file.files[0]; if(!f) return;
        var r = new FileReader();
        r.onload = function(){
          try {
            var o = JSON.parse(r.result);
            if(o && o.v === 1){ localStorage.setItem(STORE, JSON.stringify(o)); location.reload(); }
            else toast('File non valido');
          } catch(e){ toast('File non valido'); }
        };
        r.readAsText(f);
      });
    }
    var copy = $('#btnCopy');
    if(copy) copy.addEventListener('click', function(){
      var txt = $('#snippet').textContent;
      if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ toast('Snippet copiato!'); });
      else toast('Seleziona e copia il testo');
    });
    var inst = $('#btnInstall'), deferred = null;
    window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; inst.style.display = 'inline-flex'; });
    if(inst) inst.addEventListener('click', function(){ if(deferred){ deferred.prompt(); deferred = null; } });
    function conn(){ var el = $('#online'); if(el) el.textContent = navigator.onLine ? '● Online' : '○ Offline'; }
    window.addEventListener('online', conn); window.addEventListener('offline', conn); conn();
    window.addEventListener('miraggio:event', function(){
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ sync(); }, 600);
    });
  }

  function init(){
    S = load();
    bind();
    sync();
    /* ricontrolla quando torni alla tab (es. dopo aver giocato) */
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) sync(); });
    setInterval(function(){ sync(); }, 30000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
