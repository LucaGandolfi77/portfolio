/* I DUE LUMI — Sistema dialoghi */
const DLG = {
  nonna: [
    { lines:['Hai trovato l\'altro luce?','Ovunque ci sia luce, c\'è speranza.'], item:'miele' },
    { lines:['Ah, Milo! Sei tornato!','Il miele è per te, cresci forte.'] },
  ],
  bambina: [
    { lines:['Io sono Tito! Sei Milo?','Perché brilli così?','Mi piace la tua luce!'] },
    { lines:['Torna a trovarmi, Milo!'], item:'miele' },
  ],
  custode: [
    { lines:['...'], battle:true },
    { lines:['Hai vinto. Prendi questa runa.','Forse un giorno capirai...'], item:'runa' },
  ],
  custodeeco: [
    { lines:['Il bosco ha bisogno di te.','Il custode protegge ciò che resta.','Non puoi combattere l\'eco...'] },
  ],
  signora: [
    { lines:['Milo, nonna ti aspetta.','Non perderti tra le ombre, viaggiero.'], item:'oscurum' },
  ],
  focascena: [
    { lines:['La foce osserva.','Il mare ricorda ciò che hai dimenticato.'], item:'miele' },
  ],
  contadina: [
    { lines:['Il grano cresce dove c\'è speranza.','Prendi questo, viaggiero della luce.'], item:'miele' },
  ],
  falco: [
    { lines:['Il vento porta le storie di chi è caduto.','Non dimenticare chi sei, Milo.'], item:'runa' },
  ],
};

function interactNPC(npc){
  const d = DLG[npc.id];
  if(!d) return;
  const idx = STATE.flags['dlg_'+npc.id] || 0;
  const dlg = d[Math.min(idx, d.length-1)];
  showText(npc.id, dlg.lines, () => {
    if(dlg.item && !STATE.flags['item_'+npc.id]){
      STATE.inventory.push(dlg.item);
      STATE.flags['item_'+npc.id] = true;
      STATE.flags.justPicked = true;
      setTimeout(()=>{ STATE.flags.justPicked = false; }, 2000);
    }
    if(dlg.battle && !STATE.flags['boss_'+npc.id]){
      startBattle(npc.id === 'custode' ? 'custode' : 'ombra', ()=>{
        STATE.flags['boss_'+npc.id] = true;
        const nd = d[Math.min(idx+1, d.length-1)];
        showText(npc.id, nd.lines, ()=>{ STATE.flags['dlg_'+npc.id] = idx+1; });
      });
      return;
    }
    STATE.flags['dlg_'+npc.id] = idx+1;
  });
}
