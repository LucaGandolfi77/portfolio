/* Onboarding UI — 4 steps */
(function(){
  let currentStep=0;
  let data={age:25,gender:'woman',country:'United States'};
  const genders=[{id:'girl',label:'Girl 👧'},{id:'boy',label:'Boy 👦'},{id:'woman',label:'Woman 👩'},{id:'man',label:'Man 👨'},{id:'nonbinary',label:'Non-binary 🌈'}];
  const countryNames=window.COUNTRIES.map(c=>c.n).sort();

  function render(){
    const el=document.getElementById('onboard-content');
    if(currentStep===0) renderWelcome(el);
    else if(currentStep===1) renderAge(el);
    else if(currentStep===2) renderGender(el);
    else if(currentStep===3) renderCountry(el);
    else finish();
  }

  function renderWelcome(el){
    el.innerHTML=`
      <div style="font-size:4rem;margin-bottom:16px">📖</div>
      <h1 style="font-size:2rem;margin-bottom:8px">WikiThriving</h1>
      <p style="color:var(--ink2);font-size:1.1rem;margin-bottom:8px">The Field Guide to Your Life</p>
      <hr class="gold-rule">
      <p style="color:var(--ink3);margin-bottom:24px;font-size:.95rem">A personalized guide to thriving at every age.<br>Math, money, health, character, wisdom — everything you need.</p>
      <button class="btn btn-primary" style="width:100%" onclick="Onboarding.next()">Begin Your Journey →</button>
    `;
  }

  function renderAge(el){
    el.innerHTML=`
      <h2 style="margin-bottom:4px">How old are you?</h2>
      <p style="color:var(--ink3);margin-bottom:16px;font-size:.85rem">This tailors lessons to your life stage</p>
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:3rem;font-weight:700;color:var(--gold);font-family:var(--font-serif)" id="age-display">${data.age}</div>
        <input type="range" id="age-slider" min="4" max="99" value="${data.age}" style="width:100%;accent-color:var(--gold)" oninput="Onboarding.setAge(this.value)">
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px;flex-wrap:wrap">
        ${window.STAGES.map(s=>`<span class="chip${s.id===getStageId(data.age)?' chip-gold':''}" style="font-size:.7rem">${s.emoji} ${s.name}</span>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="Onboarding.next()">Next →</button>
    `;
  }

  function renderGender(el){
    el.innerHTML=`
      <h2 style="margin-bottom:4px">How do you identify?</h2>
      <p style="color:var(--ink3);margin-bottom:16px;font-size:.85rem">This helps personalize health tips and role models</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        ${genders.map(g=>`<button class="btn btn-outline${data.gender===g.id?' btn-primary':''}" style="width:100%;justify-content:flex-start" onclick="Onboarding.setGender('${g.id}')">${g.label}</button>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="Onboarding.next()">Next →</button>
    `;
  }

  function renderCountry(el){
    el.innerHTML=`
      <h2 style="margin-bottom:4px">Where are you from?</h2>
      <p style="color:var(--ink3);margin-bottom:16px;font-size:.85rem">This personalizes currency, units, and local info</p>
      <input type="text" id="country-input" placeholder="Search your country..." value="${data.country}" style="width:100%;padding:12px 16px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:1rem;margin-bottom:8px;background:var(--paper)" oninput="Onboarding.filterCountries(this.value)">
      <div id="country-list" style="max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--paper);margin-bottom:16px">
        ${countryNames.slice(0,20).map(c=>`<button style="display:block;width:100%;text-align:left;padding:10px 14px;border:none;background:none;font-size:.9rem;cursor:pointer;border-bottom:1px solid var(--cream2)" onclick="Onboarding.setCountry('${c}')">${window.COUNTRIES.find(x=>x.n===c).f} ${c}</button>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="Onboarding.finish()">Start Learning 🚀</button>
    `;
  }

  function getStageId(age){
    for(const s of window.STAGES) if(age>=s.range[0]&&age<=s.range[1]) return s.id;
    return 'sprout';
  }

  window.Onboarding={
    init(){currentStep=0;data={age:25,gender:'woman',country:'United States'};render();},
    next(){currentStep++;render();},
    setAge(v){data.age=parseInt(v);document.getElementById('age-display').textContent=v;document.querySelectorAll('.chip').forEach((el,i)=>{el.classList.toggle('chip-gold',window.STAGES[i].id===getStageId(data.age));});},
    setGender(g){data.gender=g;render();},
    setCountry(c){data.country=c;document.getElementById('country-input').value=c;},
    filterCountries(q){
      const filtered=countryNames.filter(c=>c.toLowerCase().includes(q.toLowerCase()));
      document.getElementById('country-list').innerHTML=filtered.slice(0,20).map(c=>`<button style="display:block;width:100%;text-align:left;padding:10px 14px;border:none;background:none;font-size:.9rem;cursor:pointer;border-bottom:1px solid var(--cream2)" onclick="Onboarding.setCountry('${c}')">${window.COUNTRIES.find(x=>x.n===c).f} ${c}</button>`).join('');
    },
    finish(){
      const profile=window.Profile.buildProfile(data);
      const state=window.Progress.initProgress(profile);
      window.App.setState(state);
      window.App.render();
    }
  };
})();
