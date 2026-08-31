window.Agency = {
  _state: null,

  _clients: [
    { name:'Ristorante Da Nonna', emoji:'🍝', type:'ristorante', budget:2000, needs:['Social Media','Menu design','Foto piatti'], tone:'caldo, tradizionale, familiare' },
    { name:'Studio Legale Rossi', emoji:'⚖️', type:'legale', budget:3500, needs:['Sito web','Branding','LinkedIn'], tone:'autorevole, professionale, fiducia' },
    { name:'Boutique Fior di Luna', emoji:'👗', type:'fashion', budget:4000, needs:['Instagram','Collaborazioni','E-commerce'], tone:'elegante, femminile, aspirazionale' },
    { name:'Palestra Iron Gym', emoji:'💪', type:'fitness', budget:2500, needs:['TikTok','Reels','Community'], tone:'energico, motivante, diretto' },
    { name:'Fotografo Luca B.', emoji:'📷', type:'fotografo', budget:1500, needs:['Portfolio','Instagram','SEO'], tone:'artistico, minimal, emozionale' },
    { name:'B&B Vista Mare', emoji:'🏖️', type:'turismo', budget:3000, needs:['Booking','TripAdvisor','Instagram'], tone:'sognante, rilassante, autentico' },
    { name:'Farmacia Al Ponte', emoji:'💊', type:'salute', budget:2000, needs:['Google My Business','Facebook','Consulenze'], tone:'fiducioso, competente, vicino' },
    { name:'Artigiano del legno', emoji:'🪵', type:'artigiano', budget:1800, needs:['Instagram','Marketplace','Storia del brand'], tone:'autentico, artigianale, unico' },
    { name:'Scuola di cucina', emoji:'👨‍🍳', type:'educazione', budget:2800, needs:['YouTube','Workshop','Newsletter'], tone:'educativo, appassionato, accessibile' },
    { name:'Negozio di piante', emoji:'🌿', type:'botanica', budget:2200, needs:['Instagram','TikTok','Eventi'], tone:'naturale, verde, cura' },
    { name:'Studio di architettura', emoji:'🏛️', type:'architettura', budget:5000, needs:['Portfolio','LinkedIn','PR'], tone:'minimal, sofisticato, visionario' },
    { name:'Brand di cosmetici bio', emoji:'🧴', type:'beauty', budget:4500, needs:['Influencer','TikTok','E-commerce'], tone:'pulito, etico, consapevole' },
    { name:'Muoviti ONG', emoji:'🌍', type:'no-profit', budget:800, needs:['Social','Donazioni','Campagne'], tone:'ispirante, urgente, comunitario' },
    { name:'Gelateria Artigiano', emoji:'🍦', type:'food', budget:1500, needs:['Instagram','Google','Loyalty'], tone:'gustoso, colorato, divertente' },
    { name:'Startup tech CodeLab', emoji:'💻', type:'tech', budget:6000, needs:['LinkedIn','Content','Ads'], tone:'innovativo, diretto, datato' },
    { name:'Centro veterinario', emoji:'🐕', type:'veterinario', budget:2000, needs:['Google','Facebook','Community'], tone:'affettuoso, competente, rassicurante' },
    { name:'Parrucchiere Style', emoji:'✂️', type:'beauty2', budget:1800, needs:['Instagram','TikTok','Recensioni'], tone:'trendy, creativo, sociale' },
    { name:'Libreria Le Pagine', emoji:'📚', type:'cultura', budget:1200, needs:['Instagram','Eventi','Newsletter'], tone:'culturale, caldo, curioso' },
    { name:'Autoscuola ViaLibera', emoji:'🚗', type:'servizi', budget:2200, needs:['Google','Facebook','Video'], tone:'rassicurante, pratico, accessibile' },
    { name:'Falegname Mestiere', emoji:'🪚', type:'mestiere', budget:1000, needs:['Passaparola','Google','Portfolio'], tone:'onesto, preciso, tradizionale' }
  ],

  _services: [
    { name:'Social Media Post', cost:150, effort:'low', platforms:['instagram','facebook'] },
    { name:'Reel / TikTok', cost:300, effort:'medium', platforms:['instagram','tiktok'] },
    { name:'Stories Settimanali', cost:200, effort:'low', platforms:['instagram'] },
    { name:'Foto Professionali', cost:500, effort:'high', platforms:['all'] },
    { name:'Gestione Commenti', cost:100, effort:'low', platforms:['all'] },
    { name:'Copywriting', cost:250, effort:'medium', platforms:['all'] },
    { name:'Ads Campaign', cost:400, effort:'medium', platforms:['all'] },
    { name:'Email Marketing', cost:200, effort:'medium', platforms:['email'] },
    { name:'Branding Package', cost:800, effort:'high', platforms:['all'] },
    { name:'Sito Web', cost:1200, effort:'high', platforms:['web'] },
    { name:'SEO Optimization', cost:350, effort:'medium', platforms:['web'] },
    { name:'Video Corporate', cost:700, effort:'high', platforms:['all'] },
    { name:'Photography Workshop', cost:250, effort:'medium', platforms:['offline'] },
    { name:'Content Strategy', cost:400, effort:'medium', platforms:['all'] },
    { name:'Google My Business', cost:100, effort:'low', platforms:['google'] },
    { name:'Influencer Collab', cost:600, effort:'medium', platforms:['social'] },
    { name:'Newsletter Design', cost:150, effort:'low', platforms:['email'] },
    { name:'Analytics Report', cost:100, effort:'low', platforms:['all'] }
  ],

  _difficulties: [
    { name:'Facile', budget_mult:1.2, quality_req:0.5, color:'var(--green)' },
    { name:'Medio', budget_mult:1.0, quality_req:0.7, color:'var(--gold)' },
    { name:'Difficile', budget_mult:0.8, quality_req:0.9, color:'var(--red)' }
  ],

  init() {
    const saved = localStorage.getItem('esposta_agency');
    if (saved) { this._state = JSON.parse(saved); }
    else {
      this._state = {
        money: 500,
        reputation: 3,
        clients_served: 0,
        total_earned: 0,
        current_client: null,
        current_services: [],
        campaign_count: 0
      };
    }
    return this._state;
  },

  save() {
    localStorage.setItem('esposta_agency', JSON.stringify(this._state));
  },

  reset() {
    this._state = { money:500, reputation:3, clients_served:0, total_earned:0, current_client:null, current_services:[], campaign_count:0 };
    this.save();
  },

  _generateBrief() {
    const available = this._clients.filter(c => c.name !== (this._state.current_client?.name));
    const client = available[Math.floor(Math.random() * available.length)];
    const diff = this._difficulties[Math.floor(Math.random() * this._difficulties.length)];
    const numServices = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...this._services].sort(() => Math.random() - 0.5);
    const services = shuffled.slice(0, numServices);
    return { client, diff, services, deadline: 3 + Math.floor(Math.random() * 4) };
  },

  startCampaign(onResult) {
    const brief = this._generateBrief();
    this._state.current_client = brief.client;
    this._state.current_services = brief.services.map(s => s.name);
    this._state.current_diff = brief.diff.name;
    this._state.current_budget = Math.round(brief.client.budget * brief.diff.budget_mult);
    this._state.current_spent = 0;
    this._state.campaign_count++;
    this.save();
    return brief;
  },

  spendOnService(serviceName, cost) {
    this._state.current_spent += cost;
    this._state.money -= cost;
    this.save();
  },

  completeCampaign() {
    const s = this._state;
    const budget = s.current_budget;
    const spent = s.current_spent;
    const diff = this._difficulties.find(d => d.name === s.current_diff);
    const client = s.current_client;

    const budgetScore = spent <= budget ? 1 : Math.max(0, 1 - (spent - budget) / budget);
    const qualityScore = s.current_services.length >= 2 ? 0.8 : 0.5;
    const repBonus = s.reputation / 10;
    const totalScore = Math.min(1, (budgetScore * 0.4 + qualityScore * 0.4 + repBonus * 0.2) * diff.quality_req);

    let reward = Math.round(budget * totalScore * 1.5);
    let repChange = 0;
    if (totalScore >= 0.8) repChange = 1;
    else if (totalScore >= 0.5) repChange = 0;
    else repChange = -1;

    s.money += reward;
    s.reputation = Math.max(1, Math.min(10, s.reputation + repChange));
    s.clients_served++;
    s.total_earned += reward;
    s.current_client = null;
    s.current_services = [];
    s.current_spent = 0;
    s.current_budget = 0;
    s.current_diff = null;
    this.save();

    return { totalScore, reward, repChange, budgetScore, qualityScore };
  },

  renderMenu(area) {
    const s = this._state;
    const client = s.current_client;
    const brief = client ? { client, diff: this._difficulties.find(d=>d.name===s.current_diff), services: this._services.filter(sv => s.current_services.includes(sv.name)), budget: s.current_budget, spent: s.current_spent } : null;

    area.innerHTML = `
      <div class="mg-title">📸 L'Agenzia Infinita</div>
      <div class="ag-header">
        <div class="ag-money">€${s.money.toLocaleString()}</div>
        <div class="ag-rate">⭐ Reputazione: ${s.reputation}/10 · Clienti serviti: ${s.clients_served} · Guadagni totali: €${s.total_earned.toLocaleString()}</div>
      </div>
      ${brief ? this._renderBrief(brief) : `
        <div class="mg-card" style="text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🏢</div>
          <div style="font-size:13px;color:var(--dim);margin-bottom:12px">Nessun cliente in corso. Accetta un nuovo brief!</div>
          <button class="btn primary" id="agency-new">Nuovo Cliente 📋</button>
        </div>
      `}
      <div class="mg-card">
        <div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:6px">📊 Statistiche Agenzia</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6">
          Clienti: ${s.clients_served} · Campagne: ${s.campaign_count}<br>
          Reputazione: ${'⭐'.repeat(s.reputation)}${'☆'.repeat(10-s.reputation)}
        </div>
      </div>
      ${s.clients_served >= 3 ? `
        <div class="mg-card" style="text-align:center">
          <button class="btn green" id="agency-retire">Chiudi Agenzia (vedi risultato finale)</button>
        </div>
      ` : ''}`;
  },

  _renderBrief(brief) {
    const remaining = brief.budget - brief.spent;
    return `
      <div class="mg-card">
        <div class="ag-brief">
          <div class="ab-title">${brief.client.emoji} ${brief.client.name}</div>
          <div class="ab-client">Settore: ${brief.client.type} · Budget: €${brief.budget} · Difficoltà: <span style="color:${brief.diff.color}">${brief.diff.name}</span></div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:4px">Tono: <i>${brief.client.tone}</i></div>
          <div style="font-size:11px;color:var(--dim)">Servizi richiesti: ${brief.client.needs.join(', ')}</div>
        </div>
        <div class="mg-score">Budget rimasto: €${remaining.toLocaleString()} / €${brief.budget.toLocaleString()}</div>
        <div class="mg-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">
          ${brief.services.map(s => `
            <button class="mg-btn ag-svc" data-svc="${s.name}" data-cost="${s.cost}" ${brief.spent + s.cost > brief.budget ? 'disabled' : ''}>
              ${s.name} — €${s.cost}<br><span style="font-size:9px;color:var(--dim)">${s.effort}</span>
            </button>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn primary" id="agency-execute" ${brief.spent === 0 ? 'disabled' : ''}>Esegui Campagna ✅</button>
          <button class="btn red" id="agency-reject">Rifiuta ❌</button>
        </div>
      </div>`;
  },

  _renderResult(result) {
    const grade = result.totalScore >= 0.9 ? 'S' : result.totalScore >= 0.75 ? 'A' : result.totalScore >= 0.6 ? 'B' : result.totalScore >= 0.4 ? 'C' : 'D';
    const gradeColor = { S:'var(--gold)', A:'var(--green)', B:'var(--blue)', C:'var(--sepia)', D:'var(--red)' }[grade];
    const messages = {
      S: ' Eccellente! Il cliente è estatico.',
      A: ' Ottimo lavoro! Consiglio vivamente lo Studio Olga.',
      B: ' Buon lavoro. Il cliente è soddisfatto.',
      C: ' Discreto. C\'era margine di miglioramento.',
      D: ' Deludente. Il cliente potrebbe non tornare.'
    };
    return `
      <div class="mg-card fade-in" style="text-align:center">
        <div style="font-size:48px;margin-bottom:4px">${result.totalScore >= 0.7 ? '🎉' : result.totalScore >= 0.5 ? '😐' : '😟'}</div>
        <div class="mg-title">Campagna Completata!</div>
        <div style="font-size:28px;font-weight:800;color:${gradeColor};margin:4px 0">GRADO ${grade}</div>
        <div style="font-size:12px;color:var(--cream);line-height:1.5;margin:8px 0">${messages[grade]}</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6">
          Budget: ${result.budgetScore >= 0.8 ? '✅' : '❌'} · Qualità: ${result.qualityScore >= 0.6 ? '✅' : '❌'} · Reputazione: ${result.repChange > 0 ? '+1 ⬆️' : result.repChange < 0 ? '-1 ⬇️' : '→'}
        </div>
        <div class="mg-score">+€${result.reward} · Reputazione: ${this._state.reputation}/10</div>
        <button class="btn primary" id="agency-continue">Continua 🏢</button>
      </div>`;
  }
};
