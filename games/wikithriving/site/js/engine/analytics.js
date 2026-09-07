/* Analytics — privacy-first, local events + optional Firebase */
(function(){
  var events=[];
  var userId=null;
  function genId(){return 'u_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
  function init(){
    userId=localStorage.getItem('wt_uid');
    if(!userId){userId=genId();localStorage.setItem('wt_uid',userId);}
    try{
      var saved=JSON.parse(localStorage.getItem('wt_events')||'[]');
      events=saved.slice(-500);
    }catch(e){events=[];}
  }
  function track(event,params){
    params=params||{};
    var entry={e:event,t:Date.now(),p:params};
    events.push(entry);
    if(events.length>500) events=events.slice(-500);
    try{localStorage.setItem('wt_events',JSON.stringify(events));}catch(e){}
    if(window.DEBUG_ANALYTICS) console.log('[Analytics]',event,params);
  }
  function getEvents(){return events.slice();}
  function getRecentEvents(n){return events.slice(-n);}
  function clearEvents(){events=[];localStorage.removeItem('wt_events');}
  function getInstallDate(){
    var first=localStorage.getItem('wt_install');
    if(!first){first=Date.now();localStorage.setItem('wt_install',first);}
    return parseInt(first);
  }
  function getDaysSinceInstall(){return Math.floor((Date.now()-getInstallDate())/86400000);}
  init();
  window.Analytics={track:track,getEvents:getEvents,getRecentEvents:getRecentEvents,clearEvents:clearEvents,getDaysSinceInstall:getDaysSinceInstall,userId:function(){return userId;}};
})();
