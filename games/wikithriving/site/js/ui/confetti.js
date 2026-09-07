/* Confetti celebration — canvas overlay */
(function(){
  var canvas=null;
  var ctx2d=null;
  var particles=[];
  var running=false;
  function ensureCanvas(){
    if(canvas) return;
    canvas=document.createElement('canvas');
    canvas.id='confetti-canvas';
    canvas.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    ctx2d=canvas.getContext('2d');
    resize();
    window.addEventListener('resize',resize);
  }
  function resize(){
    if(!canvas)return;
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
  }
  var colors=['#d4a54a','#4caf50','#2196f3','#ff9800','#e91e63','#9c27b0','#00bcd4','#ff5722'];
  function createParticle(){
    return {
      x:Math.random()*canvas.width,
      y:canvas.height+10,
      vx:(Math.random()-0.5)*6,
      vy:-(Math.random()*12+6),
      size:Math.random()*6+3,
      color:colors[Math.floor(Math.random()*colors.length)],
      rotation:Math.random()*360,
      rotSpeed:(Math.random()-0.5)*10,
      gravity:0.15+Math.random()*0.1,
      opacity:1,
      shape:Math.random()>0.5?'rect':'circle'
    };
  }
  function animate(){
    if(!running||particles.length===0){
      running=false;
      if(ctx2d)ctx2d.clearRect(0,0,canvas.width,canvas.height);
      return;
    }
    ctx2d.clearRect(0,0,canvas.width,canvas.height);
    for(var i=particles.length-1;i>=0;i--){
      var p=particles[i];
      p.x+=p.vx;
      p.vy+=p.gravity;
      p.y+=p.vy;
      p.rotation+=p.rotSpeed;
      p.opacity-=0.005;
      if(p.opacity<=0||p.y>canvas.height+20){particles.splice(i,1);continue;}
      ctx2d.save();
      ctx2d.globalAlpha=p.opacity;
      ctx2d.translate(p.x,p.y);
      ctx2d.rotate(p.rotation*Math.PI/180);
      ctx2d.fillStyle=p.color;
      if(p.shape==='rect'){ctx2d.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);}
      else{ctx2d.beginPath();ctx2d.arc(0,0,p.size/2,0,Math.PI*2);ctx2d.fill();}
      ctx2d.restore();
    }
    requestAnimationFrame(animate);
  }
  function fire(count){
    ensureCanvas();
    count=count||60;
    for(var i=0;i<count;i++) particles.push(createParticle());
    if(!running){running=true;animate();}
    setTimeout(function(){running=false;},3000);
  }
  function celebrate(){
    fire(80);
    if(window.SFX) window.SFX.achievement();
  }
  window.Confetti={fire:fire,celebrate:celebrate};
})();
