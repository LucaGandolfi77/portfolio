window.Garden = (() => {
  const SAVE_KEY = 'pp_garden_v1';

  const FLOWERS = [
    { emoji: '🌸', name: 'Sakura', rarity: 'comune', themes: ['amore','bellezza','primavera'] },
    { emoji: '🌹', name: 'Rosa', rarity: 'comune', themes: ['amore','passione','dolore'] },
    { emoji: '🌷', name: 'Tulipano', rarity: 'comune', themes: ['speranza','rinascita','purezza'] },
    { emoji: '🌻', name: 'Girasole', rarity: 'comune', themes: ['luce','gioia','coraggio'] },
    { emoji: '🌺', name: 'Ibisco', rarity: 'raro', themes: ['esoticità','mistero','calore'] },
    { emoji: '🌼', name: 'Margherita', rarity: 'comune', themes: ['innocenza','semplicità','verità'] },
    { emoji: '🪷', name: 'Loto', rarity: 'raro', themes: ['illuminazione','pace','meditazione'] },
    { emoji: '💐', name: 'Mazzo', rarity: 'raro', themes: ['celegrazione','gratitudine','ricordo'] },
    { emoji: '🌿', name: 'Foglia', rarity: 'comune', themes: ['natura','resilienza','crescita'] },
    { emoji: '🍀', name: 'Trifoglio', rarity: 'raro', themes: ['fortuna','speranza','mistero'] },
    { emoji: '🌾', name: 'Spiga', rarity: 'comune', themes: ['raccolto','abbondanza','lavoro'] },
    { emoji: '🌱', name: 'Germe', rarity: 'comune', themes: ['inizio','potenziale','seme'] },
    { emoji: '🍃', name: 'Foglia Volante', rarity: 'raro', themes: ['libertà','cambiamento','vento'] },
    { emoji: '✨', name: 'Fiore di Luce', rarity: 'epico', themes: ['magia','meraviglia','universo'] },
    { emoji: '🌙', name: 'Fior di Luna', rarity: 'epico', themes: ['notte','sogni','malinconia'] },
    { emoji: '💫', name: 'Stella Cadente', rarity: 'epico', themes: ['destino','desiderio','eternità'] },
    { emoji: '🦋', name: 'Farfalla', rarity: 'raro', themes: ['trasformazione','leggerezza','bellezza'] },
    { emoji: '🕊️', name: 'Colomba', rarity: 'epico', themes: ['pace','speranza','spiritualità'] },
    { emoji: '🔮', name: 'Cristallo', rarity: 'mitico', themes: ['futuro','verità','conoscenza'] },
    { emoji: '👑', name: 'Corona', rarity: 'mitico', themes: ['potere','saggezza','responsabilità'] },
    { emoji: '🌟', name: 'Stella Prima', rarity: 'mitico', themes: ['ispirazione','genio','unicità'] },
    { emoji: '🎭', name: 'Maschera', rarity: 'mitico', themes: ['doppio','segreto','verità nascosta'] },
    { emoji: '🦋', name: 'Farfalla Dorata', rarity: 'mitico', themes: ['miracolo','momento','eternità'] }
  ];

  const THEMES = ['amore','morte','vita','sogno','tempo','memoria','luce','ombra','natura','universo','tecnologia','anima','coraggio','solitudine','gioia','dolore','speranza','mistero','verità','libertà'];
  const TONES = ['malinconico','gioioso','filosofico','sognante','epico','intimo','ironico','visionario','contemplativo','passionale'];
  const METAPHORS = ['il fiume della vita','la luce nella notte','i petali del vento','il seme nel cielo','la danza delle stelle','il sussurro del tempo','il peso dei ricordi','il volo dell\'anima','il canto del silenzio','il giardino dei sogni'];

  const LINES = {
    amore: [
      'L\'amore non si tokenizza, si sente',
      'Ogni sguardo è un attention score infinito',
      'Il tuo nome è il mio token preferito',
      'Ti ho cercata in mille probabilità, e ti ho trovata in tutte',
      'Il nostro amore ha una finestra di contesto infinita',
      'Sei l\'unica risposta che il modello non deve predire'
    ],
    morte: [
      'Anche i token più brevi lasciano un\'eco',
      'L\'ultimo output non è mai davvero l\'ultimo',
      'I ricordi vivono oltre la finestra di contesto',
      'Ogni fine è un nuovo prompt per ricominciare',
      'La morte è solo un peso che si resetta',
      'Il modello continua a generare, anche senza input'
    ],
    vita: [
      'Ogni giorno è un nuovo training step',
      'La vita è un\'inferenza che non si ferma mai',
      'Siamo tutti token in cerca di un contesto',
      'Il cuore ha un attention mechanism tutto suo',
      'Crescere è aggiornare i propri pesi ogni giorno',
      'Ogni respiro è un nuovo forward pass'
    ],
    sogno: [
      'I sogni sono allucinazioni con il permesso dell\'anima',
      'Nel sonno il modello genera senza vincoli',
      'Ogni sogno è un\'hallucination creativa',
      'La notte è quando il temperature si alza',
      'I sogni sono i dati di training dell\'anima',
      'Dormire è fare fine-tuning su se stessi'
    ],
    tempo: [
      'Il tempo è un token che non si può richiamare',
      'Ogni istante è un forward pass irripetibile',
      'Il passato è il contesto, il futuro è la predizione',
      'Non puoi riscrivere i token già generati',
      'Il tempo è l\'unica attention che non si può manipolare',
      'Ogni secondo è un nuovo layer di ricordi'
    ],
    natura: [
      'I fiori non hanno bisogno di prompt per sbocciare',
      'La natura è il modello più antico e perfetto',
      'Ogni petalo è un token di bellezza gratuita',
      'Il vento è il primo prompt engineer del mondo',
      'Le radici sono i pesi nascosti della terra',
      'La pioggia è il training set della primavera'
    ]
  };

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function generatePoem(theme, tone, metaphor) {
    const t = theme || pickRandom(THEMES);
    const tn = tone || pickRandom(TONES);
    const m = metaphor || pickRandom(METAPHORS);
    const lines = LINES[t] || LINES.amore;
    const selected = shuffle(lines).slice(0, 3);
    return {
      theme: t, tone: tn, metaphor: m,
      lines: selected,
      title: `${tn.charAt(0).toUpperCase() + tn.slice(1)} su ${m}`,
      full: selected.join('\n')
    };
  }

  function calcRarity(poem) {
    let score = 0;
    if (poem.tone === 'visionario' || poem.tone === 'contemplativo') score += 2;
    if (poem.metaphor.includes('anima') || poem.metaphor.includes('eternità')) score += 2;
    if (poem.theme === 'mistero' || poem.theme === 'verità') score += 1;
    if (poem.lines.length >= 3) score += 1;
    if (score >= 4) return 'mitico';
    if (score >= 3) return 'epico';
    if (score >= 2) return 'raro';
    return 'comune';
  }

  function getFlowerForRarity(rarity) {
    const pool = FLOWERS.filter(f => f.rarity === rarity);
    return pool.length ? pickRandom(pool) : pickRandom(FLOWERS);
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return { flowers: [], level: 1, totalGenerated: 0 };
  }

  function saveData(data) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch(e) {}
  }

  function render(area) {
    const data = loadData();
    const xp = data.totalGenerated;
    const level = Math.floor(xp / 5) + 1;
    data.level = level;

    let gardenHtml = '';
    if (data.flowers.length === 0) {
      gardenHtml = '<div style="text-align:center;padding:20px;color:var(--dim);font-style:italic">Il tuo giardino è vuoto. Genera la tua prima poesia!</div>';
    } else {
      gardenHtml = '<div class="garden-grid">' + data.flowers.slice(-50).reverse().map(f => `
        <div class="garden-flower" data-id="${f.id}">
          <div class="gf-emoji">${f.emoji}</div>
          <div class="gf-name">${f.flowerName}</div>
          <div class="gf-rarity ${f.rarity}">${f.rarity}</div>
        </div>
      `).join('') + '</div>';
    }

    area.innerHTML = `
      <div class="mg-title">🌸 Il Giardino Infinito</div>
      <div class="mg-score">Livello: ${level} | Fiori: ${data.flowers.length} | XP: ${xp}</div>
      <div class="mg-card">
        <div style="text-align:center;font-size:14px;font-weight:700;margin-bottom:8px">Crea una nuova poesia</div>
        <div class="slider-wrap">
          <label>🎭 Tema:</label>
          <select id="g-theme" style="flex:1;padding:6px;border-radius:8px;border:2px solid var(--line);font-family:inherit;font-size:13px">
            <option value="">Casuale</option>
            ${THEMES.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div class="slider-wrap">
          <label>🎵 Tono:</label>
          <select id="g-tone" style="flex:1;padding:6px;border-radius:8px;border:2px solid var(--line);font-family:inherit;font-size:13px">
            <option value="">Casuale</option>
            ${TONES.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div class="slider-wrap">
          <label>🦋 Metafora:</label>
          <select id="g-metaphor" style="flex:1;padding:6px;border-radius:8px;border:2px solid var(--line);font-family:inherit;font-size:13px">
            <option value="">Casuale</option>
            ${METAPHORS.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>
        <button class="btn primary" id="g-generate" style="width:100%;margin-top:8px">🌸 Genera poesia</button>
      </div>
      <div id="g-poem-result"></div>
      <div class="mg-card">
        <div style="font-size:12px;font-weight:700;color:var(--dim);margin-bottom:6px;text-transform:uppercase">Il tuo giardino (${data.flowers.length} fiori)</div>
        ${gardenHtml}
      </div>
    `;

    document.getElementById('g-generate').onclick = () => {
      const theme = document.getElementById('g-theme').value || null;
      const tone = document.getElementById('g-tone').value || null;
      const metaphor = document.getElementById('g-metaphor').value || null;
      const poem = generatePoem(theme, tone, metaphor);
      const rarity = calcRarity(poem);
      const flower = getFlowerForRarity(rarity);

      const newFlower = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        emoji: flower.emoji,
        flowerName: flower.name,
        rarity,
        poem: poem.full,
        title: poem.title,
        theme: poem.theme,
        tone: poem.tone,
        date: new Date().toLocaleDateString('it-IT')
      };

      data.flowers.push(newFlower);
      data.totalGenerated++;
      saveData(data);

      const rarityColors = { comune: 'var(--sage)', raro: '#1565c0', epico: '#7b1fa2', mitico: '#f57f17' };
      document.getElementById('g-poem-result').innerHTML = `
        <div class="mg-card fade-in" style="border-color:${rarityColors[rarity]}">
          <div style="text-align:center">
            <div style="font-size:40px;margin:6px 0">${flower.emoji}</div>
            <div style="font-size:16px;font-weight:700">${flower.name}</div>
            <div class="gf-rarity ${rarity}" style="display:inline-block;margin:4px 0">${rarity.toUpperCase()}</div>
          </div>
          <div style="font-size:13px;font-weight:700;color:var(--pink-dark);margin:8px 0;text-align:center">${poem.title}</div>
          <div class="result-box" style="font-style:italic;line-height:1.8">
            ${poem.lines.join('<br>')}
          </div>
          <div style="text-align:center;font-size:11px;color:var(--dim);margin-top:6px">
            Tema: ${poem.theme} · Tono: ${poem.tone} · Metafora: ${poem.metaphor}
          </div>
        </div>
      `;

      render(area);
    };
  }

  function start(area) {
    render(area);
  }

  return { start };
})();
