/* ================= SOUND (WebAudio) ================= */
const SFX={
  ctx:null,enabled:false,ambientTimer:0,
  ensure(){
    if(this.ctx)return true;
    try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return false;}
    if(this.ctx.state==='suspended')this.ctx.resume();
    return true;
  },
  tone(f,dur,type,vol,delay,slide){
    if(SILENT||!this.ensure()||!this.enabled)return;
    const t=this.ctx.currentTime+(delay||0);
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type||'sine';o.frequency.value=f;
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.07,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(this.ctx.destination);
    o.start(t);o.stop(t+dur+0.05);
  },
  catch(){[523,659,784].forEach((f,i)=>this.tone(f,.16,'triangle',.09,i*.1));},
  fail(){this.tone(240,.2,'sawtooth',.06);this.tone(180,.3,'sawtooth',.05,.18);},
  level(){this.tone(392,.12,'triangle',.08);this.tone(523,.16,'triangle',.08,.12);},
  evolve(){[523,659,784,1047].forEach((f,i)=>this.tone(f,.22,'triangle',.09,i*.1));},
  quest(){this.tone(880,.18,'sine',.07);this.tone(1108,.3,'sine',.07,.16);},
  throw(){this.tone(500,.1,'sine',.05,0,900);},
  ride(){this.tone(330,.2,'triangle',.07);this.tone(440,.25,'triangle',.07,.15);},
  chirp(seed){
    if(!this.ensure()||!this.enabled)return;
    const f=280+(seed%30)*16;
    this.tone(f,.1,'sine',.028);
  },
  ambientTick(dt){
    if(!this.enabled)return;
    this.ambientTimer-=dt;
    if(this.ambientTimer>0)return;
    this.ambientTimer=1.1;
    if(G.weather==='rain')this.tone(90,0.9,'sine',0.02,0,70);
    else if(G.weather==='sandstorm')this.tone(55,1.1,'sawtooth',0.016,0,45);
    else if(G.weather==='aurora')this.tone(1200,1.2,'sine',0.012,0,1400);
  }
};
function toggleSound(){
  G.muted=!G.muted;
  SFX.enabled=!G.muted;
  if(!G.muted){SFX.ensure();if(SFX.ctx&&SFX.ctx.state==='suspended')SFX.ctx.resume();}
  $('btnSound').textContent=G.muted?'🔇':'🔊';
  $('btnSound').classList.toggle('on',!G.muted);
}

