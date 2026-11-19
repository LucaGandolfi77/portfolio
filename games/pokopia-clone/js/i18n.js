/* DITTOPIA — bilingual interface */

import { state } from './state.js';

const DICT = {
  it: {
    newGame:'NUOVA PARTITA', continue:'CONTINUA', disclaimer:'Fan game non ufficiale. Non affiliato a Nintendo/Game Freak/The Pokémon Company.',
    create:'Crea il tuo Ditto umano', skin:'Pelle', hair:'Capelli', shirt:'Maglietta', startAdventure:"INIZIA L'AVVENTURA",
    menu:'MENU', pokedex:'Pokédex', saveNow:'Salva ora', exportSave:'Esporta salvataggio', importSave:'Importa salvataggio',
    gbMode:'Modalità GB', audio:'Audio', quality:'Qualità', deleteSave:'Cancella salvataggio', close:'Chiudi',
    craft:'BANCO DA LAVORO', dex:'POKéDEX', seen:'visti', friends:'amici', journal:'DIARIO', map:'MAPPA', photo:'FOTO',
    weather:'Meteo', season:'Stagione', stats:'Statistiche', achievements:'Obiettivi', settings:'Impostazioni',
    controls:'WASD/Frecce muovi · E interagisci · 1-9 mosse · C craft · T Pokédex · J diario · M mappa · P menu',
    saved:'Salvataggio completato.', imported:'Importato! Ricarica...', invalid:'Codice non valido.',
    resetConfirm:'Cancellare il salvataggio?', photoSaved:'Foto salvata!', noSave:'Nessun salvataggio.',
    day:'Giorno', night:'Notte', clear:'Sereno', rain:'Pioggia', snow:'Neve', dust:'Polvere', cave:'Grotta',
    spring:'Primavera', summer:'Estate', autumn:'Autunno', winter:'Inverno'
  },
  en: {
    newGame:'NEW GAME', continue:'CONTINUE', disclaimer:'Unofficial fan game. Not affiliated with Nintendo/Game Freak/The Pokémon Company.',
    create:'Create your human Ditto', skin:'Skin', hair:'Hair', shirt:'Shirt', startAdventure:'START ADVENTURE',
    menu:'MENU', pokedex:'Pokédex', saveNow:'Save now', exportSave:'Export save', importSave:'Import save',
    gbMode:'GB mode', audio:'Audio', quality:'Quality', deleteSave:'Delete save', close:'Close',
    craft:'WORKBENCH', dex:'POKéDEX', seen:'seen', friends:'friends', journal:'JOURNAL', map:'MAP', photo:'PHOTO',
    weather:'Weather', season:'Season', stats:'Statistics', achievements:'Achievements', settings:'Settings',
    controls:'WASD/Arrows move · E interact · 1-9 moves · C craft · T Pokédex · J journal · M map · P menu',
    saved:'Save complete.', imported:'Imported! Reload...', invalid:'Invalid code.',
    resetConfirm:'Delete the save?', photoSaved:'Photo saved!', noSave:'No save found.',
    day:'Day', night:'Night', clear:'Clear', rain:'Rain', snow:'Snow', dust:'Dust', cave:'Cave',
    spring:'Spring', summer:'Summer', autumn:'Autumn', winter:'Winter'
  }
};

export function t(key) {
  const lang = state.settings.lang === 'en' ? 'en' : 'it';
  return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
}

export function applyI18n(root = document) {
  document.documentElement.lang = state.settings.lang;
  root.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
}
