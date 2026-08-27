
'use strict';
/* ================= UTILS ================= */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function toast(msg,color){if(SILENT)return;const d=document.createElement('div');d.className='toast';d.textContent=msg;if(color)d.style.borderLeftColor=color;$('toasts').appendChild(d);setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity .4s';setTimeout(()=>d.remove(),420);},3000);}
let SILENT=false; /* il motore di test mette a tacere toast/audio durante le simulazioni */
function setSilent(v){SILENT=!!v;}

