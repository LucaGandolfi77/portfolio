/* I DUE LUMI — UI menu / inventario */
let menuOpen = false;

function toggleMenu(){
  menuOpen = !menuOpen;
  document.getElementById('menu').style.display = menuOpen ? 'block' : 'none';
  if(menuOpen) updateMenu();
}

function updateMenu(){
  const el = document.getElementById('menuinner');
  let h = '<h2>ventario</h2>';
  if(STATE.inventory.length === 0){
    h += '<div class="mi" style="color:#483d3b">(vuoto)</div>';
  } else {
    STATE.inventory.forEach((id, i) => {
      const item = ITEMS[id];
      h += `<div class="mi" data-inv="${i}">${item.name}<br><span class="eq">${item.desc}</span></div>`;
    });
  }
  h += '<div style="margin-top:12px;color:#f2c14e;font-size:10px">';
  h += 'HP: '+PLAYER.life+'/'+PLAYER.maxLife+'<br>';
  h += 'Noxia: '+PLAYER.noxia+'/'+PLAYER.maxNoxia+'<br>';
  h += 'Memorie: '+STATE.memories.length+'/12';
  h += '</div>';
  h += '<div style="margin-top:12px;color:#e8a55a;font-size:9px">[X] Chiudi</div>';
  el.innerHTML = h;
  el.querySelectorAll('[data-inv]').forEach(e => {
    e.addEventListener('click', () => useItem(STATE.inventory[parseInt(e.dataset.inv)]));
  });
}

function initUI(){
  document.querySelectorAll('.abtn').forEach(el => {
    const k = el.dataset.key;
    el.addEventListener('touchstart', e => { e.preventDefault(); INPUT[k]=true; });
    el.addEventListener('touchend', e => { e.preventDefault(); INPUT[k]=false; });
  });
  document.querySelectorAll('.dbtn').forEach(el => {
    const d = el.dataset.dir;
    el.addEventListener('touchstart', e => { e.preventDefault(); INPUT[d]=true; });
    el.addEventListener('touchend', e => { e.preventDefault(); INPUT[d]=false; });
  });
}
