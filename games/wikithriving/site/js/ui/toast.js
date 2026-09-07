/* Toast system — replaces all alert() calls */
(function(){
  var container=null;
  function ensureContainer(){
    if(container) return;
    container=document.createElement('div');
    container.id='toast-container';
    container.style.cssText='position:fixed;top:0;left:0;right:0;z-index:10000;display:flex;flex-direction:column;align-items:center;padding:12px;pointer-events:none';
    document.body.appendChild(container);
  }
  function show(msg,type,duration){
    ensureContainer();
    type=type||'info';
    duration=duration||2500;
    var toast=document.createElement('div');
    var bg,border,text;
    if(type==='success'){bg='#e8f5e9';border='#4caf50';text='#2e7d32';}
    else if(type==='error'){bg='#ffebee';border='#ef5350';text='#c62828';}
    else if(type==='warning'){bg='#fff3e0';border='#ff9800';text='#e65100';}
    else{bg='var(--paper)';border='var(--border)';text='var(--ink)';}
    toast.style.cssText='pointer-events:auto;max-width:90%;padding:12px 20px;border-radius:var(--radius-sm);background:'+bg+';border:1px solid '+border+';color:'+text+';font-weight:600;font-size:.9rem;box-shadow:var(--shadow-lg);transform:translateY(-20px);opacity:0;transition:all .3s ease;margin-bottom:8px;font-family:var(--font-sans)';
    toast.textContent=msg;
    container.appendChild(toast);
    requestAnimationFrame(function(){
      toast.style.transform='translateY(0)';
      toast.style.opacity='1';
    });
    setTimeout(function(){
      toast.style.transform='translateY(-20px)';
      toast.style.opacity='0';
      setTimeout(function(){if(toast.parentNode)toast.parentNode.removeChild(toast);},300);
    },duration);
  }
  function success(msg,dur){show(msg,'success',dur);}
  function error(msg,dur){show(msg,'error',dur);}
  function warning(msg,dur){show(msg,'warning',dur);}
  function info(msg,dur){show(msg,'info',dur);}
  window.Toast={show:show,success:success,error:error,warning:warning,info:info};
})();
