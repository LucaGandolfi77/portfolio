/* Math Hub UI */
(function(){
  let currentTool=null;
  function render(){
    const p=window.App.getState().profile;
    const stageTools=getToolsForStage(p.stageId);
    document.getElementById('math-content').innerHTML=`
      ${currentTool?`<button class="btn btn-sm" onclick="MathUI.close()" style="margin-bottom:12px">← Back to Math Hub</button>
      <div id="math-tool-output"></div>`:
      `<div style="display:flex;flex-direction:column;gap:10px">
        ${stageTools.map(t=>`
          <button class="card" style="text-align:left;display:flex;align-items:center;gap:12px;padding:16px" onclick="MathUI.openTool('${t.id}')">
            <span style="font-size:1.6rem">${t.icon}</span>
            <div>
              <div style="font-weight:600">${t.name}</div>
              <div style="font-size:.8rem;color:var(--ink3)">${t.desc}</div>
            </div>
          </button>
        `).join('')}
      </div>`}
    `;
    if(currentTool) renderTool();
  }
  function getToolsForStage(stage){
    const tools=[
      {id:'times',name:'Times Table Trainer',icon:'🔢',desc:'Practice multiplication tables',stages:['sprout','explorer']},
      {id:'fractions',name:'Fraction Quiz',icon:'🍕',desc:'Add and subtract fractions',stages:['explorer','teen']},
      {id:'percent',name:'Percentage Quiz',icon:'💯',desc:'Calculate percentages',stages:['explorer','teen']},
      {id:'tip',name:'Tip Calculator',icon:'🍽️',desc:'Split bills and calculate tips',stages:['teen','young_adult','adult','sage','elder']},
      {id:'compound',name:'Compound Interest',icon:'📈',desc:'See how money grows',stages:['teen','young_adult','adult','sage','elder']},
      {id:'mortgage',name:'Mortgage Calculator',icon:'🏠',desc:'Calculate home loan payments',stages:['young_adult','adult','sage']},
      {id:'units',name:'Unit Converter',icon:'🔄',desc:'Metric ↔ Imperial',stages:['teen','young_adult','adult','sage','elder']}
    ];
    return tools.filter(t=>t.stages.includes(stage));
  }
  function openTool(id){currentTool=id;render();}
  function close(){currentTool=null;render();}
  function renderTool(){
    const el=document.getElementById('math-tool-output');
    if(!el) return;
    const renderers={times:renderTimes,fractions:renderFractions,percent:renderPercent,tip:renderTip,compound:renderCompound,mortgage:renderMortgage,units:renderUnits};
    if(renderers[currentTool]) renderers[currentTool](el);
  }
  function renderTimes(el){
    el.innerHTML=`
      <div class="card card-lg">
        <h3 style="margin-bottom:12px">🔢 Times Table Trainer</h3>
        <p style="color:var(--ink3);font-size:.85rem;margin-bottom:12px">How far? (1-12)</p>
        <select id="tt-max" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:12px;font-size:1rem">
          ${[5,6,7,8,9,10,11,12].map(n=>`<option value="${n}">Up to ${n}×${n}</option>`).join('')}
        </select>
        <button class="btn btn-primary" style="width:100%" onclick="MathUI.startTimes()">Start Quiz (10 questions)</button>
        <div id="tt-quiz"></div>
      </div>`;
  }
  function startTimes(){
    const max=parseInt(document.getElementById('tt-max').value);
    const qs=MathTrainers.timesTableQuiz(max,10);
    let idx=0,score=0;
    function showQ(){
      if(idx>=qs.length){
        document.getElementById('tt-quiz').innerHTML=`<div style="text-align:center;margin-top:16px"><p style="font-size:1.5rem;font-weight:700;color:var(--gold)">${score}/${qs.length}</p><p>Great job!</p></div>`;return;
      }
      const q=qs[idx];
      document.getElementById('tt-quiz').innerHTML=`
        <div style="text-align:center;margin-top:16px">
          <p style="font-size:2rem;font-weight:700">${q.a} × ${q.b} = ?</p>
          <input type="number" id="tt-answer" style="width:120px;padding:12px;text-align:center;font-size:1.2rem;border:2px solid var(--border);border-radius:var(--radius-sm);margin:12px 0" onkeypress="if(event.key==='Enter')MathUI.checkTimes(${q.answer})">
          <button class="btn btn-primary" onclick="MathUI.checkTimes(${q.answer})">Check</button>
          <p style="font-size:.8rem;color:var(--ink3);margin-top:4px">${idx+1}/${qs.length}</p>
        </div>`;
      document.getElementById('tt-answer').focus();
    }
    window.MathUI._ttScore=score;window.MathUI._ttIdx=idx;window.MathUI._ttQs=qs;window.MathUI._showQ=showQ;
    showQ();
  }
  function checkTimes(answer){
    const input=parseInt(document.getElementById('tt-answer').value);
    if(input===answer) window.MathUI._ttScore++;
    window.MathUI._ttIdx++;
    window.MathUI._showQ();
  }
  function renderFractions(el){
    const qs=MathTrainers.fractionQuiz(5);
    let html='<div class="card card-lg"><h3 style="margin-bottom:12px">🍕 Fraction Quiz</h3>';
    qs.forEach((q,i)=>{
      html+=`<div style="margin-bottom:12px"><p style="font-size:1.2rem;font-weight:600">${q.display}</p>
        <input type="number" id="fq-n${i}" style="width:60px;padding:8px;text-align:center;border:2px solid var(--border);border-radius:var(--radius-sm)" placeholder="n"> / 
        <input type="number" id="fq-d${i}" style="width:60px;padding:8px;text-align:center;border:2px solid var(--border);border-radius:var(--radius-sm)" placeholder="d">
      </div>`;
    });
    html+=`<button class="btn btn-primary" style="width:100%" onclick="MathUI.checkFractions()">Check</button><div id="fq-result"></div></div>`;
    el.innerHTML=html;
    window.MathUI._fqData=qs;
  }
  function checkFractions(){
    let score=0;
    window.MathUI._fqData.forEach((q,i)=>{
      const n=parseInt(document.getElementById('fq-n'+i).value);
      const d=parseInt(document.getElementById('fq-d'+i).value);
      if(n===q.answer_n&&d===q.answer_d) score++;
    });
    document.getElementById('fq-result').innerHTML=`<p style="text-align:center;margin-top:12px;font-weight:700;color:var(--gold)">${score}/${window.MathUI._fqData.length}</p>`;
  }
  function renderPercent(el){
    const qs=MathTrainers.percentQuiz(5);
    let html='<div class="card card-lg"><h3 style="margin-bottom:12px">💯 Percentage Quiz</h3>';
    qs.forEach((q,i)=>{
      html+=`<div style="margin-bottom:12px"><p style="font-size:1.1rem;font-weight:600">${q.display}</p>
        <input type="number" id="pq${i}" style="width:100px;padding:8px;text-align:center;border:2px solid var(--border);border-radius:var(--radius-sm)" placeholder="?">
      </div>`;
    });
    html+=`<button class="btn btn-primary" style="width:100%" onclick="MathUI.checkPercent()">Check</button><div id="pq-result"></div></div>`;
    el.innerHTML=html;
    window.MathUI._pqData=qs;
  }
  function checkPercent(){
    let score=0;
    window.MathUI._pqData.forEach((q,i)=>{
      if(parseInt(document.getElementById('pq'+i).value)===q.answer) score++;
    });
    document.getElementById('pq-result').innerHTML=`<p style="text-align:center;margin-top:12px;font-weight:700;color:var(--gold)">${score}/${window.MathUI._pqData.length}</p>`;
  }
  function renderTip(el){
    el.innerHTML=`
      <div class="card card-lg">
        <h3 style="margin-bottom:12px">🍽️ Tip Calculator</h3>
        <input type="number" id="tip-bill" placeholder="Bill amount" style="width:100%;padding:12px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;font-size:1rem">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          ${[10,15,18,20,25].map(p=>`<button class="btn btn-sm btn-outline" onclick="MathUI.calcTip(${p})">${p}%</button>`).join('')}
        </div>
        <div id="tip-result"></div>
      </div>`;
  }
  function calcTip(pct){
    const bill=parseFloat(document.getElementById('tip-bill').value);
    if(isNaN(bill)) return;
    const r=Calculators.tipCalculator(bill,pct);
    document.getElementById('tip-result').innerHTML=`
      <p style="font-size:1.1rem">Tip (${pct}%): <strong>${r.tip.toFixed(2)}</strong></p>
      <p style="font-size:1.3rem;color:var(--gold);font-weight:700">Total: ${r.total.toFixed(2)}</p>`;
  }
  function renderCompound(el){
    el.innerHTML=`
      <div class="card card-lg">
        <h3 style="margin-bottom:12px">📈 Compound Interest</h3>
        <input type="number" id="ci-principal" placeholder="Starting amount" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
        <input type="number" id="ci-rate" placeholder="Annual interest rate %" value="7" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
        <input type="number" id="ci-years" placeholder="Years" value="10" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
        <input type="number" id="ci-monthly" placeholder="Monthly contribution (optional)" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:12px">
        <button class="btn btn-primary" style="width:100%" onclick="MathUI.calcCompound()">Calculate</button>
        <div id="ci-result"></div>
      </div>`;
  }
  function calcCompound(){
    const p=parseFloat(document.getElementById('ci-principal').value)||0;
    const r=parseFloat(document.getElementById('ci-rate').value)||0;
    const y=parseFloat(document.getElementById('ci-years').value)||1;
    const m=parseFloat(document.getElementById('ci-monthly').value)||0;
    const total=Calculators.compoundInterest(p,r,y,m);
    document.getElementById('ci-result').innerHTML=`
      <div style="text-align:center;margin-top:16px">
        <p style="font-size:.8rem;color:var(--ink3)">Total after ${y} years</p>
        <p style="font-size:1.8rem;font-weight:700;color:var(--gold)">${total.toLocaleString()}</p>
      </div>`;
  }
  function renderMortgage(el){
    el.innerHTML=`
      <div class="card card-lg">
        <h3 style="margin-bottom:12px">🏠 Mortgage Calculator</h3>
        <input type="number" id="mc-principal" placeholder="Loan amount" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
        <input type="number" id="mc-rate" placeholder="Annual interest rate %" value="7" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
        <input type="number" id="mc-years" placeholder="Years" value="30" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:12px">
        <button class="btn btn-primary" style="width:100%" onclick="MathUI.calcMortgage()">Calculate</button>
        <div id="mc-result"></div>
      </div>`;
  }
  function calcMortgage(){
    const p=parseFloat(document.getElementById('mc-principal').value)||0;
    const r=parseFloat(document.getElementById('mc-rate').value)||0;
    const y=parseFloat(document.getElementById('mc-years').value)||30;
    const{monthly,total}=Calculators.mortgageCalc(p,r,y);
    document.getElementById('mc-result').innerHTML=`
      <div style="text-align:center;margin-top:16px">
        <p style="font-size:.8rem;color:var(--ink3)">Monthly payment</p>
        <p style="font-size:1.8rem;font-weight:700;color:var(--gold)">${monthly.toLocaleString()}</p>
        <p style="font-size:.8rem;color:var(--ink3);margin-top:4px">Total paid: ${total.toLocaleString()}</p>
      </div>`;
  }
  function renderUnits(el){
    const conversions=[
      {from:'km',to:'mile',label:'km → miles'},{from:'mile',to:'km',label:'miles → km'},
      {from:'kg',to:'lb',label:'kg → lbs'},{from:'lb',to:'kg',label:'lbs → kg'},
      {from:'c',to:'f',label:'°C → °F'},{from:'f',to:'c',label:'°F → °C'},
      {from:'l',to:'gal',label:'liters → gallons'},{from:'gal',to:'l',label:'gallons → liters'}
    ];
    el.innerHTML=`
      <div class="card card-lg">
        <h3 style="margin-bottom:12px">🔄 Unit Converter</h3>
        <select id="uc-type" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
          ${conversions.map(c=>`<option value="${c.from}_${c.to}">${c.label}</option>`).join('')}
        </select>
        <input type="number" id="uc-val" placeholder="Value" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:12px">
        <button class="btn btn-primary" style="width:100%" onclick="MathUI.calcUnits()">Convert</button>
        <div id="uc-result"></div>
      </div>`;
  }
  function calcUnits(){
    const [from,to]=document.getElementById('uc-type').value.split('_');
    const val=parseFloat(document.getElementById('uc-val').value);
    if(isNaN(val)) return;
    const result=Calculators.unitConvert(val,from,to);
    document.getElementById('uc-result').innerHTML=`<p style="text-align:center;margin-top:12px;font-size:1.3rem;font-weight:700;color:var(--gold)">${result}</p>`;
  }
  window.MathUI={render,openTool,close,startTimes,checkTimes,checkFractions,checkPercent,calcTip,calcCompound,calcMortgage,calcUnits,
    _ttScore:0,_ttIdx:0,_ttQs:[],_showQ:null,_fqData:[],_pqData:[]};
})();
