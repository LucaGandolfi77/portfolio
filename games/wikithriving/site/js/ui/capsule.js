/* Capsule UI — Time Capsule letters */
(function(){
  var STAGES=['sprout','explorer','teen','young_adult','adult','sage','elder'];
  var STAGE_NAMES={sprout:'Sprout 🌱',explorer:'Explorer 🔭',teen:'Teen 🦋',young_adult:'Young Adult 🚀',adult:'Adult 🧭',sage:'Sage 🌲',elder:'Elder 🕊️'};
  function getNextStage(current){
    var idx=STAGES.indexOf(current);
    return idx<STAGES.length-1?STAGES[idx+1]:null;
  }
  function render(){
    var state=window.App.getState();
    var p=state.profile;
    if(!state.capsule) state.capsule=[];
    var sealed=state.capsule.filter(function(c){return c.unlockStage!==p.stageId;});
    var openable=state.capsule.filter(function(c){return c.unlockStage===p.stageId&&!c.opened;});
    var opened=state.capsule.filter(function(c){return c.opened;});
    document.getElementById('capsule-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">📮</div>
        <h3>Time Capsule</h3>
        <p style="font-size:.85rem;color:var(--ink3)">Letters to your future self</p>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✏️ Write a New Letter</div>
        <p style="font-size:.8rem;color:var(--ink3);margin-bottom:10px">This letter will be sealed and unlocked when you reach the next life stage.</p>
        <textarea id="capsule-input" rows="4" style="width:100%;padding:12px;border:2px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:.9rem;resize:none;margin-bottom:10px" placeholder="Dear future me..."></textarea>
        <button class="btn btn-primary" style="width:100%" onclick="CapsuleUI.write()">📮 Seal Letter</button>
      </div>
      ${openable.length?`
        <h4 style="margin-bottom:10px;color:var(--gold2)">📬 Ready to Open (${openable.length})</h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
          ${openable.map(function(c){
            return '<div class="card" style="border-color:var(--gold);background:var(--gold-light)">'+
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
                '<span style="font-size:.8rem;color:var(--gold2)">From: '+STAGE_NAMES[c.fromStage]+'</span>'+
                '<span style="font-size:1.2rem">📬</span>'+
              '</div>'+
              '<p style="font-size:.9rem;color:var(--ink2);line-height:1.5">'+c.text+'</p>'+
              '<button class="btn btn-primary btn-sm" style="width:100%;margin-top:8px" onclick="CapsuleUI.open(\''+c.id+'\')">Open (+10 XP)</button>'+
            '</div>';
          }).join('')}
        </div>
      `:''}
      ${sealed.length?`
        <h4 style="margin-bottom:10px;color:var(--ink3)">🔒 Sealed (${sealed.length})</h4>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          ${sealed.map(function(c){
            return '<div class="card" style="opacity:.6;text-align:center;padding:14px">'+
              '<div style="font-size:1.2rem;margin-bottom:4px">🔒</div>'+
              '<div style="font-size:.8rem;color:var(--ink3)">Opens at: '+STAGE_NAMES[c.unlockStage]+'</div>'+
            '</div>';
          }).join('')}
        </div>
      `:''}
      ${opened.length?`
        <h4 style="margin-bottom:10px">📬 Opened (${opened.length})</h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${opened.map(function(c){
            return '<div class="card" style="padding:14px;border-left:4px solid var(--gold)">'+
              '<div style="font-size:.7rem;color:var(--ink3);margin-bottom:6px">From '+STAGE_NAMES[c.fromStage]+' · Opened '+c.openedDate+'</div>'+
              '<p style="font-size:.9rem;color:var(--ink2);line-height:1.5">'+c.text+'</p>'+
            '</div>';
          }).join('')}
        </div>
      `:''}
    `;
  }
  function write(){
    var input=document.getElementById('capsule-input');
    if(!input||!input.value.trim()) return;
    var state=window.App.getState();
    if(!state.capsule) state.capsule=[];
    var p=state.profile;
    var next=getNextStage(p.stageId);
    if(!next){alert('You\'ve reached the final stage! No more future selves to write to.');return;}
    state.capsule.push({
      id:'cap-'+Date.now(),
      text:input.value.trim(),
      fromStage:p.stageId,
      unlockStage:next,
      created:new Date().toISOString().slice(0,10),
      opened:false
    });
    window.App.setState(state);
    alert('📮 Letter sealed! It will unlock when you reach '+STAGE_NAMES[next]+'.');
    render();
  }
  function open(capsuleId){
    var state=window.App.getState();
    var cap=state.capsule.find(function(c){return c.id===capsuleId;});
    if(!cap||cap.opened) return;
    cap.opened=true;
    cap.openedDate=new Date().toISOString().slice(0,10);
    window.Progress.addXP(state,10);
    window.App.setState(state);
    render();
  }
  window.CapsuleUI={render:render,write:write,open:open};
})();
