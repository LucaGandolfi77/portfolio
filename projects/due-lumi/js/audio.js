/* I DUE LUMI — Audio procedurali Web Audio API */
let actx = null;
function ensureAudio(){ if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume(); return actx; }
function playTone(freq, dur, type, vol){
  try{
    const a = ensureAudio();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'triangle';
    o.frequency.setValueAtTime(freq, a.currentTime);
    g.gain.setValueAtTime(vol||0.05, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  } catch(e){}
}
function playNote(freq, dur, vol){ playTone(freq, dur, 'triangle', vol||0.03); }
function sfx(name){
  if(name==='step'){ playNote(200+Math.random()*60, 0.04, 0.02); }
  else if(name==='pick'){ playNote(523,0.08,0.04); setTimeout(()=>playNote(659,0.08,0.04),60); }
  else if(name==='hit'){ playNote(180,0.1,'sawtooth',0.06); }
  else if(name==='open'){ playNote(330,0.1,0.03); setTimeout(()=>playNote(440,0.1,0.03),80); }
  else if(name==='switch'){ playNote(440,0.08,0.03); setTimeout(()=>playNote(660,0.1,0.03),60); }
  else if(name==='boss'){ playNote(110,0.3,'sawtooth',0.05); playNote(138,0.3,'sawtooth',0.04); }
  else if(name==='win'){ playNote(523,0.15,0.04); setTimeout(()=>playNote(659,0.15,0.04),120); setTimeout(()=>playNote(784,0.25,0.04),240); }
}

/* ambient loop */
let ambTimer = null;
const SONGS = {
  hub: { notes:[262,330,392,330], bpm:3 },
  meadow: { notes:[262,349,523,392,349,330], bpm:3.5 },
  forest: { notes:[196,233,262,196,174], bpm:4 },
  coast: { notes:[220,277,330,277,220], bpm:4.5 },
  wind: { notes:[196,262,220,196], bpm:5 },
  finale: { notes:[262,330,392,523,392,330], bpm:3 },
  crisis: { notes:[164,196,174,164,146], bpm:3 },
};
let songNote = 0;
function startAmb(song){
  stopAmb();
  const s = SONGS[song]; if(!s) return;
  songNote = 0;
  ambTimer = setInterval(()=>{
    playNote(s.notes[songNote % s.notes.length], 0.3, 0.015);
    songNote++;
  }, s.bpm * 1000);
}
function stopAmb(){ if(ambTimer){ clearInterval(ambTimer); ambTimer=null; } }
