window.Agency = {
  _state: null,
  _t(k) { return window.I18n.t(k); },

  _clients: [
    { name:'Ristorante Da Nonna', emoji:'🍝', type:'ristorante', budget:2000, needs:['Social Media','Menu design','Foto piatti'], tone:'caldo, tradizionale, familiare', typeKey:'client_ristorante', toneKey:'tone_ristorante', needKeys:['need_social_media','need_menu_design','need_foto_piatti'] },
    { name:'Studio Legale Rossi', emoji:'⚖️', type:'legale', budget:3500, needs:['Sito web','Branding','LinkedIn'], tone:'autorevole, professionale, fiducia', typeKey:'client_legale', toneKey:'tone_legale', needKeys:['need_sito_web','need_branding','need_linkedin'] },
    { name:'Boutique Fior di Luna', emoji:'👗', type:'fashion', budget:4000, needs:['Instagram','Collaborazioni','E-commerce'], tone:'elegante, femminile, aspirazionale', typeKey:'client_fashion', toneKey:'tone_fashion', needKeys:['need_instagram','need_collaborazioni','need_e_commerce'] },
    { name:'Palestra Iron Gym', emoji:'💪', type:'fitness', budget:2500, needs:['TikTok','Reels','Community'], tone:'energico, motivante, diretto', typeKey:'client_fitness', toneKey:'tone_fitness', needKeys:['need_tiktok','need_reels','need_community'] },
    { name:'Fotografo Luca B.', emoji:'📷', type:'fotografo', budget:1500, needs:['Portfolio','Instagram','SEO'], tone:'artistico, minimal, emozionale', typeKey:'client_fotografo', toneKey:'tone_fotografo', needKeys:['need_portfolio','need_instagram','need_seo'] },
    { name:'B&B Vista Mare', emoji:'🏖️', type:'turismo', budget:3000, needs:['Booking','TripAdvisor','Instagram'], tone:'sognante, rilassante, autentico', typeKey:'client_turismo', toneKey:'tone_turismo', needKeys:['need_booking','need_tripadvisor','need_instagram'] },
    { name:'Farmacia Al Ponte', emoji:'💊', type:'salute', budget:2000, needs:['Google My Business','Facebook','Consulenze'], tone:'fiducioso, competente, vicino', typeKey:'client_salute', toneKey:'tone_salute', needKeys:['need_google_my_business','need_facebook','need_consulenze'] },
    { name:'Artigiano del legno', emoji:'🪵', type:'artigiano', budget:1800, needs:['Instagram','Marketplace','Storia del brand'], tone:'autentico, artigianale, unico', typeKey:'client_artigiano', toneKey:'tone_artigiano', needKeys:['need_instagram','need_marketplace','need_storia_del_brand'] },
    { name:'Scuola di cucina', emoji:'👨‍🍳', type:'educazione', budget:2800, needs:['YouTube','Workshop','Newsletter'], tone:'educativo, appassionato, accessibile', typeKey:'client_educazione', toneKey:'tone_educazione', needKeys:['need_youtube','need_workshop','need_newsletter'] },
    { name:'Negozio di piante', emoji:'🌿', type:'botanica', budget:2200, needs:['Instagram','TikTok','Eventi'], tone:'naturale, verde, cura', typeKey:'client_botanica', toneKey:'tone_botanica', needKeys:['need_instagram','need_tiktok','need_eventi'] },
    { name:'Studio di architettura', emoji:'🏛️', type:'architettura', budget:5000, needs:['Portfolio','LinkedIn','PR'], tone:'minimal, sofisticato, visionario', typeKey:'client_architettura', toneKey:'tone_architettura', needKeys:['need_portfolio','need_linkedin','need_pr'] },
    { name:'Brand di cosmetici bio', emoji:'🧴', type:'beauty', budget:4500, needs:['Influencer','TikTok','E-commerce'], tone:'pulito, etico, consapevole', typeKey:'client_beauty', toneKey:'tone_beauty', needKeys:['need_influencer','need_tiktok','need_e_commerce'] },
    { name:'Muoviti ONG', emoji:'🌍', type:'no-profit', budget:800, needs:['Social','Donazioni','Campagne'], tone:'ispirante, urgente, comunitario', typeKey:'client_no_profit', toneKey:'tone_no_profit', needKeys:['need_social','need_donazioni','need_campagne'] },
    { name:'Gelateria Artigiano', emoji:'🍦', type:'food', budget:1500, needs:['Instagram','Google','Loyalty'], tone:'gustoso, colorato, divertente', typeKey:'client_food', toneKey:'tone_food', needKeys:['need_instagram','need_google','need_loyalty'] },
    { name:'Startup tech CodeLab', emoji:'💻', type:'tech', budget:6000, needs:['LinkedIn','Content','Ads'], tone:'innovativo, diretto, datato', typeKey:'client_tech', toneKey:'tone_tech', needKeys:['need_linkedin','need_content','need_ads'] },
    { name:'Centro veterinario', emoji:'🐕', type:'veterinario', budget:2000, needs:['Google','Facebook','Community'], tone:'affettuoso, competente, rassicurante', typeKey:'client_veterinario', toneKey:'tone_veterinario', needKeys:['need_google','need_facebook','need_community'] },
    { name:'Parrucchiere Style', emoji:'✂️', type:'beauty2', budget:1800, needs:['Instagram','TikTok','Recensioni'], tone:'trendy, creativo, sociale', typeKey:'client_beauty2', toneKey:'tone_beauty2', needKeys:['need_instagram','need_tiktok','need_recensioni'] },
    { name:'Libreria Le Pagine', emoji:'📚', type:'cultura', budget:1200, needs:['Instagram','Eventi','Newsletter'], tone:'culturale, caldo, curioso', typeKey:'client_cultura', toneKey:'tone_cultura', needKeys:['need_instagram','need_eventi','need_newsletter'] },
    { name:'Autoscuola ViaLibera', emoji:'🚗', type:'servizi', budget:2200, needs:['Google','Facebook','Video'], tone:'rassicurante, pratico, accessibile', typeKey:'client_servizi', toneKey:'tone_servizi', needKeys:['need_google','need_facebook','need_video'] },
    { name:'Falegname Mestiere', emoji:'🪚', type:'mestiere', budget:1000, needs:['Passaparola','Google','Portfolio'], tone:'onesto, preciso, tradizionale', typeKey:'client_mestiere', toneKey:'tone_mestiere', needKeys:['need_passaparola','need_google','need_portfolio'] }
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
    { name:'Facile', budget_mult:1.2, quality_req:0.5, color:'var(--green)', nameKey:'agency_diff_easy' },
    { name:'Medio', budget_mult:1.0, quality_req:0.7, color:'var(--gold)', nameKey:'agency_diff_medium' },
    { name:'Difficile', budget_mult:0.8, quality_req:0.9, color:'var(--red)', nameKey:'agency_diff_hard' }
  ],

  init() {
    const gameSave = Save.load();
    const agencyData = gameSave.agencyState || {};
    const saved = localStorage.getItem('esposta_agency');
    let parsed = null;
    try { parsed = saved ? JSON.parse(saved) : null; } catch(e) {}

    if (parsed) {
      this._state = parsed;
    } else {
      this._state = {
        money: agencyData.money || 500,
        reputation: agencyData.reputation || 3,
        clients_served: agencyData.clientsServed || 0,
        total_earned: agencyData.totalEarned || 0,
        current_client: null,
        current_services: [],
        campaign_count: 0
      };
    }
    window.Analytics && window.Analytics.trackEvent('agency_started', {});
    return this._state;
  },

  save() {
    localStorage.setItem('esposta_agency', JSON.stringify(this._state));
    const gameSave = Save.load();
    gameSave.agencyState = {
      money: this._state.money,
      reputation: this._state.reputation,
      clientsServed: this._state.clients_served,
      totalEarned: this._state.total_earned,
      campaignHistory: gameSave.agencyState.campaignHistory || []
    };
    Save.save(gameSave);
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

    const gameSave = Save.load();
    gameSave.agencyState.campaignHistory.push({
      client: client.name,
      score: totalScore,
      reward: reward,
      date: new Date().toISOString()
    });

    s.current_client = null;
    s.current_services = [];
    s.current_spent = 0;
    s.current_budget = 0;
    s.current_diff = null;
    this.save();
    window.Analytics && window.Analytics.trackEvent('agency_campaign_completed', { clientType: client.type, earnings: reward, reputation: s.reputation });

    return { totalScore, reward, repChange, budgetScore, qualityScore };
  },

  renderMenu(area) {
    const s = this._state;
    const client = s.current_client;
    const brief = client ? { client, diff: this._difficulties.find(d=>d.name===s.current_diff), services: this._services.filter(sv => s.current_services.includes(sv.name)), budget: s.current_budget, spent: s.current_spent } : null;

    area.innerHTML = `
      <div class="mg-title">${this._t('agency_title')}</div>
      <div class="ag-header">
        <div class="ag-money">€${s.money.toLocaleString()}</div>
        <div class="ag-rate">⭐ ${this._t('agency_reputation')} ${s.reputation}/10 · ${this._t('agency_clients_served')} ${s.clients_served} · ${this._t('agency_total_earned')} €${s.total_earned.toLocaleString()}</div>
      </div>
      ${brief ? this._renderBrief(brief) : `
        <div class="mg-card" style="text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🏢</div>
          <div style="font-size:13px;color:var(--dim);margin-bottom:12px">${this._t('agency_no_client')}</div>
          <button class="btn primary" id="agency-new">${this._t('agency_new_client')}</button>
        </div>
      `}
      <div class="mg-card">
        <div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:6px">${this._t('agency_stats')}</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6">
          ${this._t('agency_clients_served')} ${s.clients_served} · ${this._lang()==='en'?'Campaigns':'Campagne'}: ${s.campaign_count}<br>
          ${this._t('agency_reputation')} ${'⭐'.repeat(s.reputation)}${'☆'.repeat(10-s.reputation)}
        </div>
      </div>
      ${s.clients_served >= 3 ? `
        <div class="mg-card" style="text-align:center">
          <button class="btn green" id="agency-retire">${this._t('agency_close')}</button>
        </div>
      ` : ''}`;
  },

  _lang() { return window.I18n.getLang(); },

  _renderBrief(brief) {
    const remaining = brief.budget - brief.spent;
    const l = this._lang();
    const diffName = l === 'en' ? this._t(brief.diff.nameKey) : brief.diff.name;
    const clientType = l === 'en' ? this._t(brief.client.typeKey) : brief.client.type;
    const clientTone = l === 'en' ? this._t(brief.client.toneKey) : brief.client.tone;
    const clientNeeds = l === 'en' ? brief.client.needKeys.map(k => this._t(k)) : brief.client.needs;
    return `
      <div class="mg-card">
        <div class="ag-brief">
          <div class="ab-title">${brief.client.emoji} ${brief.client.name}</div>
          <div class="ab-client">${this._t('agency_sector')} ${clientType} · ${this._t('agency_budget')} €${brief.budget} · ${this._t('agency_difficulty')} <span style="color:${brief.diff.color}">${diffName}</span></div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:4px">${this._t('agency_tone')} <i>${clientTone}</i></div>
          <div style="font-size:11px;color:var(--dim)">${this._t('agency_needs')} ${clientNeeds.join(', ')}</div>
        </div>
        <div class="mg-score">${this._t('agency_budget_left')} €${remaining.toLocaleString()} / €${brief.budget.toLocaleString()}</div>
        <div class="mg-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">
          ${brief.services.map(s => `
            <button class="mg-btn ag-svc" data-svc="${s.name}" data-cost="${s.cost}" ${brief.spent + s.cost > brief.budget ? 'disabled' : ''}>
              ${s.name} — €${s.cost}<br><span style="font-size:9px;color:var(--dim)">${s.effort}</span>
            </button>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn primary" id="agency-execute" ${brief.spent === 0 ? 'disabled' : ''}>${this._t('agency_execute')}</button>
          <button class="btn red" id="agency-reject">${this._t('agency_reject')}</button>
        </div>
      </div>`;
  },

  _renderResult(result) {
    const grade = result.totalScore >= 0.9 ? 'S' : result.totalScore >= 0.75 ? 'A' : result.totalScore >= 0.6 ? 'B' : result.totalScore >= 0.4 ? 'C' : 'D';
    const gradeColor = { S:'var(--gold)', A:'var(--green)', B:'var(--blue)', C:'var(--sepia)', D:'var(--red)' }[grade];
    const messages = {
      S: ' ' + this._t('agency_grade_S'),
      A: ' ' + this._t('agency_grade_A'),
      B: ' ' + this._t('agency_grade_B'),
      C: ' ' + this._t('agency_grade_C'),
      D: ' ' + this._t('agency_grade_D')
    };
    return `
      <div class="mg-card fade-in" style="text-align:center">
        <div style="font-size:48px;margin-bottom:4px">${result.totalScore >= 0.7 ? '🎉' : result.totalScore >= 0.5 ? '😐' : '😟'}</div>
        <div class="mg-title">${this._t('agency_campaign_done')}</div>
        <div style="font-size:28px;font-weight:800;color:${gradeColor};margin:4px 0">${this._t('agency_grade')} ${grade}</div>
        <div style="font-size:12px;color:var(--cream);line-height:1.5;margin:8px 0">${messages[grade]}</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.6">
          Budget: ${result.budgetScore >= 0.8 ? '✅' : '❌'} · ${this._lang()==='en'?'Quality':'Qualità'}: ${result.qualityScore >= 0.6 ? '✅' : '❌'} · ${this._t('agency_reputation')} ${result.repChange > 0 ? '+1 ⬆️' : result.repChange < 0 ? '-1 ⬇️' : '→'}
        </div>
        <div class="mg-score">+€${result.reward} · ${this._t('agency_reputation')} ${this._state.reputation}/10</div>
        <button class="btn primary" id="agency-continue">${this._t('agency_continue')}</button>
      </div>`;
  }
};
