// i18n.js — Internationalization support
window.I18n = (() => {
  let currentLang = 'it';
  let translations = {};

  const LANGUAGES = {
    it: { name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
    en: { name: 'English', flag: '🇬🇧', nativeName: 'English' },
    es: { name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
    fr: { name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    de: { name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    pt: { name: 'Português', flag: '🇧🇷', nativeName: 'Português' }
  };

  const TRANSLATIONS = {
    it: {
      // Menu
      'menu.title': 'Il Regno di Moneta',
      'menu.subtitle': 'Educazione Finanziaria Gamificata',
      'menu.newGame': 'Nuova Partita',
      'menu.continue': 'Continua',
      'menu.empire': 'Impero di Soldania',
      'menu.achievements': 'Achievements',
      'menu.leagues': 'Leagues',
      'menu.store': 'Negozio',
      'menu.progress': 'Progresso',
      // Game
      'game.next': 'Prossimo',
      'game.skip': 'Salta storia',
      'game.play': 'Gioca!',
      'game.retry': 'Riprova',
      'game.lessonNext': 'Prossimo capitolo',
      // Empire
      'empire.buildings': 'Edifici',
      'empire.upgrades': 'Miglioramenti',
      'empire.prestige': 'Prestige',
      'empire.stats': 'Statistiche',
      'empire.money': 'Soldi',
      'empire.rate': 'Guadagno',
      'empire.offline': 'Guadagni Offline!',
      'empire.offlineMsg': 'Hai guagnato {amount} mentre eri assente',
      'empire.prestigeTitle': 'Rifonda il Regno',
      'empire.prestigeConfirm': 'Vuoi davvero rifondare?',
      // Leagues
      'leagues.title': 'Leagues',
      'leagues.rank': 'Posizione',
      'leagues.leaderboard': 'Classifica settimanale',
      'leagues.promotion': 'Promozione!',
      'leagues.demotion': 'Retrocessione',
      // Store
      'store.title': 'Negozio',
      'store.removeAds': 'Rimuovi pubblicità',
      'store.premium': 'Premium',
      'store.coins': 'Monete',
      'store.restore': 'Ripristina acquisti',
      // Achievements
      'achievements.title': 'Achievements',
      'achievements.progress': '{pct}% completato ({done}/{total})',
      // Common
      'common.close': 'Chiudi',
      'common.share': 'Condividi',
      'common.loading': 'Caricamento...',
      'common.error': 'Errore',
      'common.success': 'Successo'
    },
    en: {
      'menu.title': 'The Kingdom of Money',
      'menu.subtitle': 'Gamified Financial Literacy',
      'menu.newGame': 'New Game',
      'menu.continue': 'Continue',
      'menu.empire': 'Empire of Soldania',
      'menu.achievements': 'Achievements',
      'menu.leagues': 'Leagues',
      'menu.store': 'Store',
      'menu.progress': 'Progress',
      'game.next': 'Next',
      'game.skip': 'Skip story',
      'game.play': 'Play!',
      'game.retry': 'Retry',
      'game.lessonNext': 'Next chapter',
      'empire.buildings': 'Buildings',
      'empire.upgrades': 'Upgrades',
      'empire.prestige': 'Prestige',
      'empire.stats': 'Statistics',
      'empire.money': 'Money',
      'empire.rate': 'Income',
      'empire.offline': 'Offline Earnings!',
      'empire.offlineMsg': 'You earned {amount} while away',
      'empire.prestigeTitle': 'Refound the Kingdom',
      'empire.prestigeConfirm': 'Are you sure you want to refound?',
      'leagues.title': 'Leagues',
      'leagues.rank': 'Rank',
      'leagues.leaderboard': 'Weekly leaderboard',
      'leagues.promotion': 'Promotion!',
      'leagues.demotion': 'Demotion',
      'store.title': 'Store',
      'store.removeAds': 'Remove ads',
      'store.premium': 'Premium',
      'store.coins': 'Coins',
      'store.restore': 'Restore purchases',
      'achievements.title': 'Achievements',
      'achievements.progress': '{pct}% completed ({done}/{total})',
      'common.close': 'Close',
      'common.share': 'Share',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success'
    },
    es: {
      'menu.title': 'El Reino del Dinero',
      'menu.subtitle': 'Educación Financiera Gamificada',
      'menu.newGame': 'Nueva Partida',
      'menu.continue': 'Continuar',
      'menu.empire': 'Imperio de Soldania',
      'menu.achievements': 'Logros',
      'menu.leagues': 'Ligas',
      'menu.store': 'Tienda',
      'menu.progress': 'Progreso',
      'game.next': 'Siguiente',
      'game.skip': 'Saltar historia',
      'game.play': '¡Jugar!',
      'game.retry': 'Reintentar',
      'game.lessonNext': 'Siguiente capítulo',
      'empire.buildings': 'Edificios',
      'empire.upgrades': 'Mejoras',
      'empire.prestige': 'Prestigio',
      'empire.stats': 'Estadísticas',
      'empire.money': 'Dinero',
      'empire.rate': 'Ingresos',
      'common.close': 'Cerrar',
      'common.share': 'Compartir',
      'achievements.title': 'Logros',
      'achievements.progress': '{pct}% completado ({done}/{total})'
    },
    fr: {
      'menu.title': 'Le Royaume de l\'Argent',
      'menu.subtitle': 'Éducation Financière Ludique',
      'menu.newGame': 'Nouvelle Partie',
      'menu.continue': 'Continuer',
      'menu.empire': 'Empire de Soldania',
      'menu.achievements': 'Succès',
      'menu.leagues': 'Ligues',
      'menu.store': 'Boutique',
      'menu.progress': 'Progrès',
      'game.next': 'Suivant',
      'game.skip': 'Passer l\'histoire',
      'game.play': 'Jouer!',
      'game.retry': 'Réessayer',
      'game.lessonNext': 'Chapitre suivant',
      'empire.buildings': 'Bâtiments',
      'empire.upgrades': 'Améliorations',
      'empire.prestige': 'Prestige',
      'empire.stats': 'Statistiques',
      'common.close': 'Fermer',
      'common.share': 'Partager',
      'achievements.title': 'Succès',
      'achievements.progress': '{pct}% terminé ({done}/{total})'
    },
    de: {
      'menu.title': 'Das Königreich des Geldes',
      'menu.subtitle': 'Gamifizierte Finanzbildung',
      'menu.newGame': 'Neues Spiel',
      'menu.continue': 'Weiter',
      'menu.empire': 'Imperium von Soldania',
      'menu.achievements': 'Erfolge',
      'menu.leagues': 'Ligen',
      'menu.store': 'Shop',
      'menu.progress': 'Fortschritt',
      'game.next': 'Weiter',
      'game.skip': 'Geschichte überspringen',
      'game.play': 'Spielen!',
      'game.retry': 'Erneut versuchen',
      'game.lessonNext': 'Nächstes Kapitel',
      'common.close': 'Schließen',
      'common.share': 'Teilen',
      'achievements.title': 'Erfolge',
      'achievements.progress': '{pct}% abgeschlossen ({done}/{total})'
    },
    pt: {
      'menu.title': 'O Reino do Dinheiro',
      'menu.subtitle': 'Educação Financeira Gamificada',
      'menu.newGame': 'Novo Jogo',
      'menu.continue': 'Continuar',
      'menu.empire': 'Império de Soldania',
      'menu.achievements': 'Conquistas',
      'menu.leagues': 'Ligas',
      'menu.store': 'Loja',
      'menu.progress': 'Progresso',
      'game.next': 'Próximo',
      'game.skip': 'Pular história',
      'game.play': 'Jogar!',
      'game.retry': 'Tentar novamente',
      'game.lessonNext': 'Próximo capítulo',
      'common.close': 'Fechar',
      'common.share': 'Compartilhar',
      'achievements.title': 'Conquistas',
      'achievements.progress': '{pct}% concluído ({done}/{total})'
    }
  };

  function t(key, params = {}) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['it'];
    let text = dict[key] || TRANSLATIONS['it'][key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    currentLang = lang;
    try {
      localStorage.setItem('rdm_lang', lang);
    } catch(e) {}
  }

  function getLanguage() {
    return currentLang;
  }

  function detectLanguage() {
    try {
      const saved = localStorage.getItem('rdm_lang');
      if (saved && LANGUAGES[saved]) return saved;
    } catch(e) {}
    const browserLang = navigator.language || navigator.userLanguage || 'it';
    const short = browserLang.substring(0, 2).toLowerCase();
    return LANGUAGES[short] ? short : 'it';
  }

  function getAvailableLanguages() {
    return Object.entries(LANGUAGES).map(([code, info]) => ({
      code,
      ...info
    }));
  }

  function renderLanguageSelector() {
    const langs = getAvailableLanguages();
    return langs.map(lang => `
      <button class="lang-btn ${lang.code === currentLang ? 'active' : ''}"
              onclick="I18n.setLanguage('${lang.code}'); location.reload();"
              style="display:flex;align-items:center;gap:8px;padding:8px 12px;margin:4px 0;
                     border:1px solid ${lang.code === currentLang ? 'var(--gold)' : 'var(--line)'};
                     border-radius:8px;background:${lang.code === currentLang ? 'var(--gold-light)' : 'var(--card)'};
                     width:100%;text-align:left;cursor:pointer">
        <span style="font-size:20px">${lang.flag}</span>
        <div>
          <div style="font-size:13px;font-weight:700">${lang.nativeName}</div>
          <div style="font-size:10px;color:var(--dim)">${lang.name}</div>
        </div>
      </button>
    `).join('');
  }

  currentLang = detectLanguage();

  return {
    t, setLanguage, getLanguage,
    getAvailableLanguages, renderLanguageSelector,
    LANGUAGES
  };
})();
