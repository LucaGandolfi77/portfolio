/* I DUE LUMI — Oggetti / inventario */
const ITEMS = {
  luminoso: { name:'Germoglio Luminoso', desc:'Una piccola luce che non si spegne mai.', effect:'heal', power:30 },
  miele: { name:'Miele di Luna', desc:'Dolce come una carezza.', effect:'heal', power:20 },
  runa: { name:'Runa Antica', desc:'Emette un debole bagliore dorato.', effect:'noxia', power:20 },
  oscurum: { name:'Oscurum', desc:'Condensa l\'oscurità in un oggetto solido.', effect:'heal', power:15 },
};

function useItem(id){
  const item = ITEMS[id];
  if(!item) return;
  if(item.effect==='heal'){
    PLAYER.life = Math.min(PLAYER.maxLife, PLAYER.life + item.power);
  } else if(item.effect==='noxia'){
    PLAYER.noxia = Math.min(PLAYER.maxNoxia, PLAYER.noxia + item.power);
  }
  STATE.inventory = STATE.inventory.filter(i => i !== id);
  sfx('pick');
  updateMenu();
}
