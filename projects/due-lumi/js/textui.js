/* I DUE LUMI — Text UI */
const TEXTUI = {
  visible: false,
  lines: [],
  charIdx: 0,
  lineIdx: 0,
  callback: null,
  name: '',
  options: null,
  selOpt: 0,
};

function showText(name, lines, cb){
  TEXTUI.name = name || '';
  TEXTUI.lines = lines;
  TEXTUI.charIdx = 0;
  TEXTUI.lineIdx = 0;
  TEXTUI.visible = true;
  TEXTUI.callback = cb || null;
  TEXTUI.options = null;
  TEXTUI.selOpt = 0;
  document.getElementById('dlg').style.display = 'block';
  document.getElementById('dlgname').textContent = TEXTUI.name;
  document.getElementById('dlgtxt').textContent = '';
  document.getElementById('dlgopt').innerHTML = '';
}

function showOptions(opts, cb){
  TEXTUI.options = opts;
  TEXTUI.callback = cb;
  TEXTUI.selOpt = 0;
  TEXTUI.visible = true;
  const el = document.getElementById('dlgopt');
  el.innerHTML = '';
  opts.forEach((o, i) => {
    const d = document.createElement('div');
    d.textContent = o.text;
    d.className = i===0 ? 'sel' : '';
    el.appendChild(d);
  });
}

function hideText(){
  TEXTUI.visible = false;
  document.getElementById('dlg').style.display = 'none';
}

function updateText(){
  if(!TEXTUI.visible) return;
  if(!TEXTUI.options){
    TEXTUI.charIdx++;
    const line = TEXTUI.lines[TEXTUI.lineIdx] || '';
    document.getElementById('dlgtxt').textContent = line.substring(0, TEXTUI.charIdx);
    if(TEXTUI.charIdx >= line.length){
      if(justPressedA()){
        TEXTUI.lineIdx++;
        TEXTUI.charIdx = 0;
        if(TEXTUI.lineIdx >= TEXTUI.lines.length){
          if(TEXTUI.callback) TEXTUI.callback(-1);
          hideText();
        } else {
          document.getElementById('dlgtxt').textContent = '';
        }
      }
    } else if(justPressedA()){
      TEXTUI.charIdx = line.length;
    }
  } else {
    if(INPUT.up && !INPUT._upPrev){ TEXTUI.selOpt = Math.max(0, TEXTUI.selOpt-1); updateOptSel(); }
    if(INPUT.down && !INPUT._downPrev){ TEXTUI.selOpt = Math.min(TEXTUI.options.length-1, TEXTUI.selOpt+1); updateOptSel(); }
    if(justPressedA()){
      const cb = TEXTUI.callback;
      const idx = TEXTUI.selOpt;
      hideText();
      if(cb) cb(idx);
    }
  }
  INPUT._upPrev = INPUT.up;
  INPUT._downPrev = INPUT.down;
}

function updateOptSel(){
  const el = document.getElementById('dlgopt');
  el.querySelectorAll('div').forEach((d, i) => {
    d.className = i === TEXTUI.selOpt ? 'sel' : '';
  });
}
