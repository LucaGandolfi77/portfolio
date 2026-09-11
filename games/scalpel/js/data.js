(function(){
'use strict';

var G = window.SCALPEL = {};

/* ───────────── INSTRUMENTS ───────────── */
G.INSTRUMENTS = {
  scalpel:   { id:'scalpel',   name:'Scalpel',      icon:'🔪', color:'#ecf0f1', desc:'Sharp blade for precise incisions', chapter:1 },
  sutures:   { id:'sutures',   name:'Sutures',       icon:'🧵', color:'#f39c12', desc:'Thread and needle to close wounds',  chapter:1 },
  endoscope: { id:'endoscope', name:'Endoscope',     icon:'🔭', color:'#9b59b6', desc:'Camera probe for internal viewing',  chapter:2 },
  forceps:   { id:'forceps',   name:'Forceps',       icon:'🪡', color:'#1abc9c', desc:'Precision grip for small objects',   chapter:2 },
  defib:     { id:'defib',     name:'Defibrillator', icon:'⚡', color:'#e74c3c', desc:'Electric shock to restore rhythm',   chapter:3 },
  clamps:    { id:'clamps',    name:'Clamps',        icon:'🔧', color:'#e67e22', desc:'Pinch to stop bleeding vessels',     chapter:3 },
  laser:     { id:'laser',     name:'Laser',         icon:'🔴', color:'#e74c3c', desc:'Focused beam for precise cutting',   chapter:4 },
  retractor: { id:'retractor', name:'Retractor',     icon:'🪝', color:'#3498db', desc:'Hold tissue open for visibility',    chapter:4 }
};

/* ───────────── PATIENTS ───────────── */
G.PATIENTS = {
  marco: {
    id:'marco', name:'Marco', age:25, emoji:'👨',
    condition:'Acute appendicitis',
    desc:'Marco is a 25-year-old office worker admitted to the ER with severe right lower abdominal pain, nausea, and low-grade fever. Imaging confirms an inflamed appendix that must be removed before it ruptures.',
    vitals:{ hr:110, bp:'130/85', temp:37.8, o2:97 }
  },
  sofia: {
    id:'sofia', name:'Sofia', age:8, emoji:'👧',
    condition:'Swallowed foreign body',
    desc:'Sofia is an 8-year-old girl who accidentally swallowed a small plastic bead during play. It is lodged in her upper esophagus. She is coughing and distressed. Immediate extraction is needed to prevent airway obstruction.',
    vitals:{ hr:120, bp:'100/60', temp:36.9, o2:95 }
  },
  giuseppe: {
    id:'giuseppe', name:'Giuseppe', age:65, emoji:'👴',
    condition:'Acute myocardial infarction',
    desc:'Giuseppe is a 65-year-old retired teacher rushed in with crushing chest pain, cold sweats, and irregular heartbeat. ECG confirms ST-elevation MI. He needs emergency defibrillation and a coronary clamp procedure.',
    vitals:{ hr:140, bp:'90/55', temp:36.5, o2:91 }
  },
  elena: {
    id:'elena', name:'Elena', age:45, emoji:'👩',
    condition:'Brain tumor (glioblastoma)',
    desc:'Elena is a 45-year-old journalist with persistent headaches, vision changes, and a newly discovered mass in her left temporal lobe. A delicate laser resection is required to remove the tumor while preserving healthy brain tissue.',
    vitals:{ hr:78, bp:'120/75', temp:36.7, o2:99 }
  },
  multi: {
    id:'multi', name:'Multiple Patients', age:0, emoji:'🏥',
    condition:'Mass casualty event',
    desc:'A multi-vehicle accident has produced several casualties arriving simultaneously. You must triage and operate on the most critical patients in order of priority. Use every instrument at your disposal. The clock is ticking.',
    vitals:{ hr:0, bp:'—', temp:0, o2:0 }
  }
};

/* ───────────── PROCEDURES ───────────── */
G.PROCEDURES = {
  chapter1: [
    { id:'incision',  type:'swipe',   tool:'scalpel',   name:'Make Incision',     path:'right_lower',  accuracy:70, time:12, desc:'Swipe along the marked line to open the abdomen' },
    { id:'expose',    type:'tap',     tool:'retractor', name:'Expose Appendix',   points:3,            accuracy:75, time:8,  desc:'Tap the marked points to retract tissue' },
    { id:'clamp_ax',  type:'tap',     tool:'clamps',    name:'Clamp Artery',      points:2,            accuracy:80, time:6,  desc:'Quickly tap to clamp the appendicular artery' },
    { id:'cut_base',  type:'swipe',   tool:'scalpel',   name:'Cut at Base',       path:'appendix',     accuracy:75, time:10, desc:'Carefully cut the appendix at its base' },
    { id:'stitch',    type:'stitch',  tool:'sutures',    name:'Suture Wound',      points:6,            accuracy:70, time:15, desc:'Stitch the wound closed with precision' }
  ],
  chapter2: [
    { id:'scope_in',  type:'navigate', tool:'endoscope', name:'Insert Endoscope',  path:'esophagus',    accuracy:60, time:12, desc:'Guide the endoscope down the esophagus' },
    { id:'locate',    type:'tap',      tool:'endoscope', name:'Locate Object',     points:1,            accuracy:85, time:8,  desc:'Find the foreign body in the tissue' },
    { id:'grab',      type:'tap',      tool:'forceps',   name:'Grab Object',       points:1,            accuracy:90, time:6,  desc:'Carefully grasp the object with forceps' },
    { id:'extract',   type:'swipe',    tool:'forceps',   name:'Extract Safely',    path:'extract',      accuracy:80, time:10, desc:'Slowly pull the object out without damage' },
    { id:'treat',     type:'spray',    tool:'sutures',    name:'Treat Irritation',  points:4,            accuracy:70, time:8,  desc:'Apply treatment to the irritated tissue' }
  ],
  chapter3: [
    { id:'defib1',    type:'timing',  tool:'defib',     name:'First Shock',       target_bpm:140,     accuracy:85, time:8,  desc:'Watch the ECG — deliver shock at the right moment' },
    { id:'clamp_lad', type:'tap',     tool:'clamps',    name:'Clamp LAD Artery',  points:3,            accuracy:80, time:8,  desc:'Clamp the left anterior descending artery' },
    { id:'defib2',    type:'timing',  tool:'defib',     name:'Second Shock',      target_bpm:120,     accuracy:85, time:8,  desc:'Deliver a second shock to restore rhythm' },
    { id:'stitch_h',  type:'stitch',  tool:'sutures',    name:'Close Incision',    points:8,            accuracy:75, time:15, desc:'Suture the chest incision closed' },
    { id:'defib3',    type:'timing',  tool:'defib',     name:'Final Check Shock', target_bpm:80,      accuracy:90, time:6,  desc:'Final shock to stabilize the heart rate' }
  ],
  chapter4: [
    { id:'drill',     type:'swipe',   tool:'scalpel',   name:'Craniotomy',        path:'skull',        accuracy:85, time:10, desc:'Cut through the skull to access the brain' },
    { id:'retract_b', type:'tap',     tool:'retractor', name:'Retract Brain',     points:4,            accuracy:80, time:8,  desc:'Gently retract brain tissue to expose tumor' },
    { id:'laser_t',   type:'draw',    tool:'laser',     name:'Laser Tumor',       path:'tumor',        accuracy:90, time:18, desc:'Draw around the tumor to cut it free' },
    { id:'remove_t',  type:'tap',     tool:'forceps',   name:'Remove Tumor',      points:1,            accuracy:95, time:6,  desc:'Carefully extract the tumor mass' },
    { id:'seal',      type:'spray',   tool:'laser',     name:'Seal Blood Vessels', points:5,           accuracy:80, time:10, desc:'Use laser to cauterize and seal vessels' }
  ],
  chapter5: [
    { id:'triage',    type:'tap',     tool:'forceps',   name:'Triage Assessment',  points:3,           accuracy:75, time:8,  desc:'Quickly assess the most critical patients' },
    { id:'airway',    type:'swipe',   tool:'scalpel',   name:'Secure Airway',      path:'throat',      accuracy:85, time:10, desc:'Emergency tracheotomy to secure the airway' },
    { id:'stop_bleed',type:'tap',     tool:'clamps',    name:'Stop Bleeding',      points:5,           accuracy:80, time:10, desc:'Clamp all actively bleeding vessels' },
    { id:'cardio',    type:'timing',  tool:'defib',     name:'Cardiac Rescue',     target_bpm:160,    accuracy:85, time:8,  desc:'Patient is in V-fib — shock immediately' },
    { id:'close',     type:'stitch',  tool:'sutures',    name:'Final Sutures',      points:10,          accuracy:75, time:20, desc:'Close all incisions and stabilize patients' }
  ]
};

/* ───────────── CHAPTERS ───────────── */
G.CHAPTERS = [
  {
    id:1, title:'The First Incision', icon:'🔬', unlocked:true,
    patient:'marco',
    briefing:[
      { speaker:'Dr. Reynolds', text:'Welcome to Ospedale Miraggio, Doctor. I\'m Dr. Reynolds, your attending surgeon. Today we have an urgent case.' },
      { speaker:'Dr. Reynolds', text:'Marco, 25, admitted with acute appendicitis. His appendix is inflamed and at risk of rupture. We need to operate now.' },
      { speaker:'You', text:'What\'s the procedure, Doctor?' },
      { speaker:'Dr. Reynolds', text:'Appendectomy. I\'ll guide you through each step. Remember: precision saves lives. Every millimeter matters.' },
      { speaker:'Dr. Reynolds', text:'I\'m unlocking the Scalpel and Sutures for you. These are your most fundamental tools. Let\'s begin.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Excellent work, Doctor. Marco\'s appendix has been successfully removed. He\'ll make a full recovery.' },
      { speaker:'Dr. Reynolds', text:'Remember: in surgery, there are no small decisions. Every cut, every stitch matters. Keep practicing.' }
    ]
  },
  {
    id:2, title:'Foreign Body', icon:'🔭', unlocked:false,
    patient:'sofia',
    briefing:[
      { speaker:'Nurse Ada', text:'Doctor! We have a child in distress. Sofia, age 8, swallowed a plastic bead. It\'s stuck in her upper esophagus.' },
      { speaker:'Nurse Ada', text:'She\'s coughing and can\'t breathe properly. If we don\'t extract it soon, it could obstruct her airway completely.' },
      { speaker:'You', text:'I need an endoscope and forceps. Let me see what I\'m working with.' },
      { speaker:'Nurse Ada', text:'Right away. I\'m also prepping the endoscopic camera. You\'ll need to navigate carefully — her tissues are delicate.' },
      { speaker:'Dr. Reynolds', text:'Good thinking. The Endoscope and Forceps are now available. Guide the scope in, locate the bead, and extract it gently.' }
    ],
    debriefing:[
      { speaker:'Nurse Ada', text:'The bead is out! Sofia is breathing normally again. Her parents are overwhelmed with relief.' },
      { speaker:'Dr. Reynolds', text:'Well done. Foreign body extraction requires patience and steady hands. You\'re developing good instincts.' }
    ]
  },
  {
    id:3, title:'Heart in Crisis', icon:'❤️', unlocked:false,
    patient:'giuseppe',
    briefing:[
      { speaker:'ER Doctor', text:'Code Blue! Giuseppe, 65, massive heart attack. BP dropping, irregular rhythm. He\'s going into cardiac arrest!' },
      { speaker:'ER Doctor', text:'ECG shows ST-elevation in leads II, III, aVF. We need defibrillation and immediate intervention on the coronary artery.' },
      { speaker:'You', text:'Get me the defibrillator and clamps. We need to restore his rhythm and control the bleeding.' },
      { speaker:'Dr. Reynolds', text:'This is critical, Doctor. I\'m unlocking the Defibrillator and Clamps. Time is muscle — every minute of ischemia destroys heart tissue.' },
      { speaker:'Dr. Reynolds', text:'Watch the ECG carefully. You must deliver the shock at precisely the right moment in the cardiac cycle. Too early or too late, and it won\'t work.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Giuseppe is stabilized. His heart rhythm is back to normal. The clamps held, and the bleeding is controlled.' },
      { speaker:'Dr. Reynolds', text:'You just saved a man\'s life. Remember this feeling — this is why we do what we do. Keep your skills sharp.' }
    ]
  },
  {
    id:4, title:'The Hidden Shadow', icon:'🧠', unlocked:false,
    patient:'elena',
    briefing:[
      { speaker:'Dr. Reynolds', text:'This is a delicate one, Doctor. Elena, 45, journalist. She has a glioblastoma in her left temporal lobe.' },
      { speaker:'Dr. Reynolds', text:'The tumor is deep, surrounded by critical brain tissue. One wrong move and she could lose speech, memory, or worse.' },
      { speaker:'You', text:'I\'ll need the Laser for precise cutting and the Retractor to keep the surgical field open.' },
      { speaker:'Dr. Reynolds', text:'Correct. I\'m unlocking both. The Laser can cut through tumor tissue while minimizing damage to healthy neurons.' },
      { speaker:'Dr. Reynolds', text:'Draw precisely around the tumor boundary. Stay inside the margins. This requires the steadiest hand you\'ve ever had.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'The tumor is completely resected. Elena\'s vitals are stable. She\'ll need follow-up, but the hardest part is over.' },
      { speaker:'Dr. Reynolds', text:'Neurosurgery is the pinnacle of precision. You operated in the seat of human consciousness and won. Remarkable.' }
    ]
  },
  {
    id:5, title:'Code Blue', icon:'🚨', unlocked:false,
    patient:'multi',
    briefing:[
      { speaker:'Hospital PA', text:'Attention all surgical teams: Mass casualty alert. Multiple victims from a highway pileup incoming. All surgeons to the OR.' },
      { speaker:'Dr. Reynolds', text:'This is it, Doctor. Everything you\'ve learned comes down to this. Multiple patients, multiple emergencies, one surgeon.' },
      { speaker:'You', text:'I\'m ready. Give me everything we have.' },
      { speaker:'Dr. Reynolds', text:'All instruments are now unlocked. Scalpel, sutures, endoscope, forceps, defibrillator, clamps, laser, retractor — they\'re all yours.' },
      { speaker:'Dr. Reynolds', text:'Triage first: identify who needs surgery NOW. Then execute. This is the ultimate test. Show me what Miraggio Hospital taught you.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'All patients are stable. You performed under pressure that would break most surgeons. I\'m proud of you, Doctor.' },
      { speaker:'Dr. Reynolds', text:'You\'ve earned the title of Chief Surgeon at Ospedale Miraggio. This hospital — and these patients — are alive because of you.' },
      { speaker:'SYSTEM', text:'🎓 CONGRATULATIONS — You\'ve completed all chapters! You are now a Master Surgeon at Ospedale Miraggio.' }
    ]
  }
];

/* ───────────── JOURNAL (Scientific Facts) ───────────── */
G.JOURNAL = {
  chapter1: {
    title:'Appendectomy & Anesthesia',
    facts:[
      'Appendicitis affects ~7% of people in their lifetime. The appendix is a small pouch attached to the cecum in the lower right abdomen.',
      'A laparoscopic appendectomy uses 3-4 tiny incisions instead of one large open cut. Recovery time drops from 6 weeks to 1-2 weeks.',
      'General anesthesia works by blocking nerve signals between the brain and body. Modern anesthetics like propofol act in seconds.',
      'The appendix\'s true function was long debated, but recent research suggests it may harbor beneficial gut bacteria and serve as a "reboot" organ after diarrheal disease.',
      'Surgical sutures come in various materials: absorbable (catgut, Vicryl) dissolve on their own; non-absorbable (nylon, silk) must be removed later.'
    ]
  },
  chapter2: {
    title:'Foreign Body Ingestion',
    facts:[
      'Children under 6 account for 75% of foreign body ingestion cases. Common objects: coins, batteries, beads, and small toy parts.',
      'Button batteries are especially dangerous — they can cause chemical burns in as little as 2 hours if lodged in the esophagus.',
      'Endoscopy uses a flexible tube with a camera to visualize the GI tract. The scope is only 5-10mm in diameter, allowing minimally invasive procedures.',
      'Most ingested objects pass naturally through the digestive system in 24-48 hours. However, objects stuck for >24 hours require intervention.',
      'The esophagus has three natural narrowings where objects commonly lodge: the cricopharyngeus, the aortic arch, and the diaphragmatic hiatus.'
    ]
  },
  chapter3: {
    title:'Cardiac Emergencies',
    facts:[
      'A myocardial infarction (heart attack) occurs when a coronary artery is blocked, starving the heart muscle of oxygen. "Time is muscle" — every minute delays treatment.',
      'Defibrillation delivers an electric shock to the heart to reset abnormal electrical activity. It\'s only effective for ventricular fibrillation and pulseless ventricular tachycardia.',
      'The Left Anterior Descending (LAD) artery supplies 45% of the heart\'s blood flow. A blockage here is called the "widowmaker" due to its high mortality rate.',
      'Modern defibrillators use biphasic waveforms that deliver current in two directions, requiring less energy (120-200J) than older monophasic devices (360J).',
      'CPR (cardiopulmonary resuscitation) alone doubles survival from cardiac arrest. When combined with defibrillation, survival rates can exceed 50%.'
    ]
  },
  chapter4: {
    title:'Neurosurgery & Brain Tumors',
    facts:[
      'The brain contains ~86 billion neurons, each connected to thousands of others. A glioblastoma is the most aggressive primary brain tumor, with a median survival of 15 months.',
      'Awake craniotomy allows surgeons to map brain function in real-time. The patient is conscious during surgery so the surgeon can test speech and movement.',
      'The blood-brain barrier (BBB) protects the brain from toxins but also blocks 98% of drugs. This makes treating brain tumors with chemotherapy extremely challenging.',
      'Laser interstitial thermal therapy (LITT) uses MRI-guided lasers to destroy tumor tissue through a tiny hole in the skull, minimizing damage to surrounding brain.',
      'The temporal lobe processes language (Wernicke\'s area), memory, and auditory processing. Damage can cause aphasia — the inability to comprehend or produce language.'
    ]
  },
  chapter5: {
    title:'Emergency Medicine & Triage',
    facts:[
      'Triage categorizes patients by urgency: Immediate (red), Delayed (yellow), Minor (green), Expectant (black). The goal is to save the most lives, not necessarily the most critical patient first.',
      'The "Golden Hour" in trauma medicine states that survival rates drop dramatically if definitive care isn\'t received within 60 minutes of injury.',
      'A tracheotomy creates an opening in the trachea to secure an airway when normal intubation is impossible. It takes 3-5 minutes in skilled hands.',
      'Hemorrhagic shock kills 40% of trauma patients. The body can compensate for up to 15% blood loss, but beyond 30%, organ failure begins.',
      'Damage control surgery prioritizes stopping bleeding and contamination over definitive repair. The patient is stabilized first, then returned to the OR for final repairs.'
    ]
  }
};

/* ───────────── SCORES / GRADES ───────────── */
G.GRADES = [
  { min:95, grade:'S', label:'Surgical Genius', emoji:'🏆' },
  { min:85, grade:'A', label:'Expert Surgeon',  emoji:'⭐' },
  { min:70, grade:'B', label:'Skilled Doctor',   emoji:'👍' },
  { min:50, grade:'C', label:'Resident',         emoji:'📋' },
  { min:0,  grade:'D', label:'Needs Training',   emoji:'📚' }
];

G.getGrade = function(score){
  for(var i=0;i<G.GRADES.length;i++){ if(score>=G.GRADES[i].min) return G.GRADES[i]; }
  return G.GRADES[G.GRADES.length-1];
};

/* ───────────── COLORS / THEME ───────────── */
G.COLORS = {
  bg:         '#0a1628',
  bgLight:    '#0d2137',
  tissue:     '#1a3a5c',
  tissueLight:'#2a5a8c',
  blood:      '#c0392b',
  bloodLight: '#e74c3c',
  heal:       '#27ae60',
  healLight:  '#2ecc71',
  warning:    '#f39c12',
  white:      '#ecf0f1',
  blue:       '#3498db',
  blueLight:  '#5dade2',
  dim:        '#5a6a80',
  dimLight:   '#8a9bb5',
  purple:     '#9b59b6',
  teal:       '#1abc9c'
};

/* ───────────── HELPER ───────────── */
G.clamp = function(v,min,max){ return Math.max(min,Math.min(max,v)); };

})();
