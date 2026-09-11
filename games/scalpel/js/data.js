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
  retractor: { id:'retractor', name:'Retractor',     icon:'🪝', color:'#3498db', desc:'Hold tissue open for visibility',    chapter:4 },
  bonesaw:   { id:'bonesaw',   name:'Bone Saw',      icon:'🦴', color:'#bdc3c7', desc:'Precision saw for bone and cast',    chapter:6 },
  castapp:   { id:'castapp',   name:'Cast Applicator',icon:'🩹', color:'#ecf0f1', desc:'Wrap and set fractures properly',    chapter:6 },
  epiinject: { id:'epiinject', name:'Epinephrine',   icon:'💉', color:'#e74c3c', desc:'Emergency injection for anaphylaxis',chapter:7 },
  antihist:  { id:'antihist',  name:'Antihistamine', icon:'💊', color:'#2ecc71', desc:'Block histamine allergic response',  chapter:7 },
  ultrasound:{ id:'ultrasound',name:'Ultrasound',    icon:'📡', color:'#3498db', desc:'Sound waves to see inside',          chapter:8 },
  hyperbaric:{ id:'hyperbaric',name:'Hyperbaric',    icon:'🫁', color:'#1abc9c', desc:'Pressurized oxygen therapy',         chapter:8 },
  fetalmon:  { id:'fetalmon',  name:'Fetal Monitor', icon:'👶', color:'#f39c12', desc:'Track baby heartbeat in womb',       chapter:9 },
  csection:  { id:'csection',  name:'C-Section Kit', icon:'🏥', color:'#ecf0f1', desc:'Emergency cesarean delivery',        chapter:9 }
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
  },
  luca: {
    id:'luca', name:'Luca', age:6, emoji:'🧒',
    condition:'Fractured radius (broken arm)',
    desc:'Luca is a 6-year-old aspiring artist who fell from a treehouse while building a fort. His left radius is fractured and displaced. He needs the bone set, a cast applied, and lots of reassurance. He keeps asking if he can still draw.',
    vitals:{ hr:105, bp:'95/55', temp:36.8, o2:98 }
  },
  giorgio: {
    id:'giorgio', name:'Giorgio', age:35, emoji:'👨‍🍳',
    condition:'Anaphylactic shock (shellfish allergy)',
    desc:'Giorgio is a celebrity chef who accidentally tasted a dish containing shrimp during a live cooking competition. His throat is swelling, blood pressure is plummeting, and he\'s breaking out in hives. Immediate epinephrine and airway management required.',
    vitals:{ hr:150, bp:'70/40', temp:37.2, o2:88 }
  },
  yuki: {
    id:'yuki', name:'Yuki', age:28, emoji:'🤿',
    condition:'Decompression sickness (the bends)',
    desc:'Yuki is a professional deep-sea diver who explored a WWII shipwreck at 40 meters. She ascended too quickly and now has severe joint pain, dizziness, and tingling in her limbs. Nitrogen bubbles are forming in her blood. She needs hyperbaric oxygen therapy.',
    vitals:{ hr:115, bp:'125/80', temp:37.0, o2:94 }
  },
  anna: {
    id:'anna', name:'Anna', age:30, emoji:'🤰',
    condition:'Placental abruption — emergency C-section',
    desc:'Anna is a 30-year-old pregnant teacher at 38 weeks. She arrived with severe abdominal pain and vaginal bleeding. Ultrasound confirms placental abruption — the placenta is separating from the uterine wall. Both mother and baby are in danger. Emergency C-section now.',
    vitals:{ hr:125, bp:'85/50', temp:37.1, o2:96 }
  },
  reynolds: {
    id:'reynolds', name:'Dr. Marcus Reynolds', age:52, emoji:'👨‍⚕️',
    condition:'Penetrating chest trauma (stabbing)',
    desc:'Your mentor, Dr. Reynolds, was attacked in the parking garage. He has a knife wound to the chest with active bleeding into the pericardial sac, causing cardiac tamponade. He taught you everything you know — now you must save his life. Everything, every instrument, every skill. Now.',
    vitals:{ hr:135, bp:'80/50', temp:36.4, o2:92 }
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
  ],
  chapter6: [
    { id:'xray',      type:'tap',     tool:'ultrasound', name:'X-Ray Fracture',    points:2,            accuracy:70, time:8,  desc:'Image the fracture to see the break clearly' },
    { id:'saw_cast',  type:'swipe',   tool:'bonesaw',    name:'Cut Old Cast',      path:'arm_cast',     accuracy:75, time:10, desc:'Saw through the temporary splint carefully' },
    { id:'set_bone',  type:'tap',     tool:'forceps',    name:'Set the Bone',      points:4,            accuracy:85, time:12, desc:'Align the fractured bone fragments perfectly' },
    { id:'apply_cast',type:'draw',    tool:'castapp',    name:'Apply Cast',        path:'arm_wrap',     accuracy:70, time:14, desc:'Wrap the cast around the arm in a spiral pattern' },
    { id:'stitch_c',  type:'stitch',  tool:'sutures',    name:'Close Incision',    points:6,            accuracy:75, time:12, desc:'Suture the small surgical opening closed' }
  ],
  chapter7: [
    { id:'epi_shot',  type:'tap',     tool:'epiinject',  name:'Epinephrine Shot',  points:1,            accuracy:90, time:5,  desc:'Inject epinephrine into the thigh immediately' },
    { id:'airway',    type:'swipe',   tool:'scalpel',    name:'Secure Airway',     path:'throat',       accuracy:85, time:10, desc:'Emergency cricothyrotomy if airway closes' },
    { id:'iv_line',   type:'tap',     tool:'clamps',     name:'Start IV Line',     points:3,            accuracy:80, time:8,  desc:'Establish IV access for fluids and meds' },
    { id:'antihist',  type:'spray',   tool:'antihist',   name:'Antihistamine',     points:6,            accuracy:70, time:10, desc:'Spray antihistamine to block further reaction' },
    { id:'monitor_e', type:'timing',  tool:'fetalmon',   name:'Monitor Vitals',    target_bpm:90,       accuracy:85, time:10, desc:'Watch vitals — ensure stable recovery' }
  ],
  chapter8: [
    { id:'scan',      type:'navigate',tool:'ultrasound', name:'Scan for Bubbles',  path:'vessels',      accuracy:60, time:14, desc:'Navigate ultrasound to find nitrogen bubbles' },
    { id:'map',       type:'tap',     tool:'ultrasound', name:'Map Affected Areas',points:4,            accuracy:75, time:10, desc:'Mark all affected joints and tissues' },
    { id:'pressurize',type:'timing',  tool:'hyperbaric', name:'Pressurize Chamber',target_bpm:60,       accuracy:80, time:12, desc:'Gradually increase pressure to dissolve bubbles' },
    { id:'oxygen',    type:'spray',   tool:'hyperbaric', name:'Oxygen Therapy',    points:8,            accuracy:70, time:15, desc:'Flood tissues with pure oxygen at pressure' },
    { id:'depress',   type:'timing',  tool:'hyperbaric', name:'Depressurize',      target_bpm:50,       accuracy:85, time:10, desc:'Slowly return to normal pressure safely' }
  ],
  chapter9: [
    { id:'scan_baby', type:'navigate',tool:'ultrasound', name:'Scan Baby Position',path:'womb',         accuracy:65, time:10, desc:'Locate the baby and check placenta position' },
    { id:'monitor_f', type:'timing',  tool:'fetalmon',   name:'Monitor Fetal HR',  target_bpm:140,      accuracy:85, time:8,  desc:'Track the baby\'s heart rate — keep it stable' },
    { id:'incision_c',type:'swipe',   tool:'scalpel',    name:'C-Section Incision',path:'abdomen_c',    accuracy:80, time:12, desc:'Make the low transverse abdominal incision' },
    { id:'deliver',   type:'tap',     tool:'forceps',    name:'Deliver Baby',      points:1,            accuracy:95, time:8,  desc:'Carefully extract the baby from the uterus' },
    { id:'clamp_umb', type:'tap',     tool:'clamps',     name:'Clamp Umbilical',   points:2,            accuracy:85, time:6,  desc:'Clamp and cut the umbilical cord' },
    { id:'close_u',   type:'stitch',  tool:'sutures',    name:'Close Uterus',      points:8,            accuracy:80, time:15, desc:'Suture the uterine wall layer by layer' }
  ],
  chapter10: [
    { id:'tamponade', type:'tap',     tool:'clamps',     name:'Relieve Tamponade', points:3,            accuracy:90, time:8,  desc:'Open pericardium to relieve pressure on heart' },
    { id:'clamp_m',   type:'tap',     tool:'clamps',     name:'Clamp Wound Vessel',points:4,            accuracy:85, time:10, desc:'Identify and clamp the bleeding artery' },
    { id:'defib_m',   type:'timing',  tool:'defib',      name:'Defibrillate',      target_bpm:150,      accuracy:85, time:8,  desc:'Heart is in V-fib — shock now!' },
    { id:'repair_h',  type:'stitch',  tool:'sutures',    name:'Repair Heart Wall', points:8,            accuracy:90, time:18, desc:'Suture the cardiac muscle carefully' },
    { id:'laser_m',   type:'draw',    tool:'laser',      name:'Cauterize Bleeding',path:'heart_vessel', accuracy:85, time:12, desc:'Use laser to seal the damaged vessels' },
    { id:'close_m',   type:'stitch',  tool:'sutures',    name:'Close Chest',       points:12,           accuracy:80, time:20, desc:'Close the chest — layer by layer. He must live.' }
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
  },
  {
    id:6, title:'The Toy Maker', icon:'🧒', unlocked:false,
    patient:'luca',
    briefing:[
      { speaker:'Nurse Ada', text:'Doctor, we have a little one in OR 3. Luca, age 6, fell from a treehouse. His left arm is broken in two places.' },
      { speaker:'Nurse Ada', text:'He\'s scared but trying to be brave. He keeps asking if he can still draw with his right hand. Adorable.' },
      { speaker:'You', text:'Let me see the X-ray. We need to set the bone properly and get a cast on him.' },
      { speaker:'Nurse Ada', text:'I\'m prepping the Bone Saw and Cast Applicator. Also — he asked if you could draw a superhero on his cast. Maybe after surgery?' },
      { speaker:'Dr. Reynolds', text:'Orthopedics is about precision and patience, Doctor. The bone must align perfectly or he\'ll have lifelong issues. Let\'s make sure Luca keeps drawing for years to come.' }
    ],
    debriefing:[
      { speaker:'Nurse Ada', text:'The cast is on, and Luca is already drawing a dinosaur on it with markers. He says you\'re his new hero.' },
      { speaker:'Dr. Reynolds', text:'Well done. Children heal fast when you set things right. Luca will be climbing trees again in 6 weeks — maybe with better judgment this time.' },
      { speaker:'Luca', text:'Thank you, Doctor! Look — I drew you on my cast! You\'re fighting a dragon! 🦕' }
    ]
  },
  {
    id:7, title:'Seafood Surprise', icon:'🍤', unlocked:false,
    patient:'giorgio',
    briefing:[
      { speaker:'ER Nurse', text:'Code Red! Celebrity chef Giorgio Moretti, 35, in anaphylactic shock! He accidentally ate shrimp during a live TV cooking competition!' },
      { speaker:'ER Nurse', text:'Throat swelling, BP 70/40, hives everywhere. He can barely breathe. We need epinephrine NOW.' },
      { speaker:'You', text:'Get me the Epinephrine Injector and set up an IV. We need to secure his airway before it closes completely.' },
      { speaker:'Dr. Reynolds', text:'Anaphylaxis kills in minutes, Doctor. The immune system goes haywire — histamine floods every tissue. You must act fast.' },
      { speaker:'Dr. Reynolds', text:'Epinephrine and Antihistamine are unlocked. Epinephrine first — it\'s the only thing that can reverse this. Go!' }
    ],
    debriefing:[
      { speaker:'ER Nurse', text:'Giorgio is stabilized! His airway is open, BP recovering. He\'s asking about his soufflé in the oven backstage.' },
      { speaker:'Dr. Reynolds', text:'Anaphylaxis is terrifying because it attacks everything at once — airway, circulation, skin. You handled it perfectly.' },
      { speaker:'Giorgio', text:'Doctor... you saved my life. When I get out of here, I\'m cooking you the best meal of your life. No shellfish, I promise. 🍝' }
    ]
  },
  {
    id:8, title:'The Diver\'s Secret', icon:'🤿', unlocked:false,
    patient:'yuki',
    briefing:[
      { speaker:'Dive Team', text:'Mayday, mayday! Yuki Tanaka, 28, deep-sea diver, decompression sickness! She surfaced from a 40-meter wreck dive in under 2 minutes!' },
      { speaker:'Yuki', text:'My joints... it feels like fire in my knees. Everything is tingling. I can\'t feel my fingers...' },
      { speaker:'You', text:'Classic bends. Nitrogen bubbles are forming in her blood and joints. We need ultrasound to map the damage and the hyperbaric chamber.' },
      { speaker:'Dr. Reynolds', text:'At 40 meters, nitrogen dissolves into tissues under pressure. Surfacing too fast is like opening a shaken soda can — bubbles everywhere.' },
      { speaker:'Dr. Reynolds', text:'The Ultrasound and Hyperbaric chamber are ready. Scan her, find the bubbles, then pressurize slowly. Reverse the physics.' }
    ],
    debriefing:[
      { speaker:'Yuki', text:'The pain is fading... I can feel my fingers again. Thank you, Doctor. That wreck held a 200-year-old ship\'s bell. I heard it ring once before I surfaced.' },
      { speaker:'Dr. Reynolds', text:'Decompression sickness teaches respect for physics. The ocean doesn\'t forgive shortcuts. Yuki will dive again — but she\'ll ascend slowly next time.' },
      { speaker:'Yuki', text:'Next dive, I\'m bringing you along. You\'d love the coral reefs. Just... take the stairs back up. 🐠' }
    ]
  },
  {
    id:9, title:'Midnight ER', icon:'👶', unlocked:false,
    patient:'anna',
    briefing:[
      { speaker:'OB Nurse', text:'Emergency! Anna Ferretti, 30, 38 weeks pregnant! Severe abdominal pain and bleeding — we think placental abruption!' },
      { speaker:'Anna', text:'Please... save my baby. I\'m a teacher — my students are waiting for me to come back. Please...' },
      { speaker:'You', text:'The placenta is separating from the uterine wall. The baby is losing oxygen. We need a C-section immediately.' },
      { speaker:'Dr. Reynolds', text:'This is a race against time, Doctor. Every minute the baby stays in, the risk of hypoxia increases. But you must also protect Anna.' },
      { speaker:'Dr. Reynolds', text:'Fetal Monitor and C-Section Kit are ready. Monitor the baby\'s heart, make the incision, and deliver safely. Two lives depend on you.' }
    ],
    debriefing:[
      { speaker:'Anna', text:'Is... is my baby okay? I heard crying... I heard crying!' },
      { speaker:'Nurse Ada', text:'She\'s perfect. 3.2 kilograms, strong lungs. Welcome to the world, little one.' },
      { speaker:'Anna', text:'Thank you, Doctor. I\'m naming her Miraggio. After the hospital that saved us both. 🌟' },
      { speaker:'Dr. Reynolds', text:'Bringing new life into the world — there\'s no greater reward in medicine. You did beautifully, Doctor.' }
    ]
  },
  {
    id:10, title:'The Final Puzzle', icon:'💉', unlocked:false,
    patient:'reynolds',
    briefing:[
      { speaker:'Nurse Ada', text:'Doctor... it\'s Dr. Reynolds. He was attacked in the parking garage. Knife wound to the chest. He\'s losing blood fast.' },
      { speaker:'You', text:'Dr. Reynolds?! No... get him to OR 1 NOW. Page every surgeon in the building.' },
      { speaker:'Dr. Reynolds', text:'Hey... don\'t look so scared, Doc. I taught you everything you know, remember? Now... it\'s your turn to teach me.' },
      { speaker:'You', text:'You\'re going to be fine, Doctor. I\'m not losing you. Not today.' },
      { speaker:'Dr. Reynolds', text:'Cardiac tamponade... the pericardial sac is filling with blood. My heart can\'t pump. You need to open it... relieve the pressure... then repair the damage.' },
      { speaker:'You', text:'All instruments ready. Every skill you taught me — I\'m using them all. Stay with me, Doctor. I\'m not done learning from you.' },
      { speaker:'Nurse Ada', text:'He\'s in V-fib! Heart stopped!' },
      { speaker:'You', text:'No! DEFIBRILLATOR! Clear! ... Come on, Doctor... COME BACK!' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'...You did it. I knew you would. From your first day at Miraggio, I knew you\'d be the one to save me someday.' },
      { speaker:'You', text:'Don\'t talk. Save your strength. You\'re not retiring on my watch.' },
      { speaker:'Dr. Reynolds', text:'I\'ve been doing this for 30 years. I\'ve seen hundreds of surgeons come and go. But you... you have something special. Compassion and skill, together. That\'s rare.' },
      { speaker:'Dr. Reynolds', text:'The Chief Surgeon position is yours. Not because I\'m your mentor — because you earned it. Every patient, every surgery, every life you touched.' },
      { speaker:'Nurse Ada', text:'Dr. Reynolds is stable and recovering well. And the hospital board just approved your promotion. Congratulations, Chief Surgeon.' },
      { speaker:'SYSTEM', text:'🎓 MASTERY ACHIEVED — You are now Chief Surgeon of Ospedale Miraggio. Your journey from first incision to saving your mentor is complete. The hospital is in your hands. 🏥✨' }
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
  },
  chapter6: {
    title:'Pediatric Orthopedics',
    facts:[
      'Children\'s bones are softer and more flexible than adults\', but they fracture just as easily. A "greenstick fracture" is when the bone bends and cracks but doesn\'t break all the way through.',
      'The radius and ulna are the two bones in the forearm. A "both-bones" forearm fracture requires precise alignment to restore full rotation of the wrist.',
      'Casts are made from fiberglass or plaster. Fiberglass is lighter, stronger, and water-resistant — perfect for active kids who will inevitably get their cast dirty.',
      'Bone healing in children takes 4-6 weeks vs. 6-12 weeks in adults. Kids are biological healing machines — their growth plates allow remarkable regeneration.',
      'Pediatric orthopedic surgeons must consider growth plates when setting fractures. Damaging a growth plate can cause the bone to grow crooked or stop growing entirely.'
    ]
  },
  chapter7: {
    title:'Anaphylaxis & Immunology',
    facts:[
      'Anaphylaxis is a severe, life-threatening allergic reaction. It can occur within seconds of exposure to an allergen — peanuts, shellfish, bee stings, or medications.',
      'Epinephrine (adrenaline) is the ONLY first-line treatment for anaphylaxis. It constricts blood vessels, opens airways, and raises blood pressure within minutes.',
      'The "biphasic reaction" can occur 4-12 hours after the initial anaphylaxis. Even after treatment, patients must be monitored for delayed recurrence.',
      'Histamine is released by mast cells during allergic reactions. It causes vasodilation, increased permeability, bronchoconstriction — the classic allergy symptoms.',
      'Anaphylaxis kills 200 people annually in the US alone. Most deaths occur outside hospitals because epinephrine wasn\'t available or wasn\'t used in time.'
    ]
  },
  chapter8: {
    title:'Hyperbaric Medicine & Diving Physiology',
    facts:[
      'At sea level, nitrogen makes up 78% of the air we breathe. Under pressure (diving), nitrogen dissolves into tissues. Surfacing too fast causes it to form bubbles — like opening a shaken soda.',
      'Decompression sickness (DCS) affects joints, lungs, and the nervous system. "The bends" gets its name from the bent posture sufferers adopt due to joint pain.',
      'Hyperbaric oxygen therapy (HBOT) works by pressurizing pure oxygen to 2-3 ATM, forcing dissolved oxygen into tissues and shrinking nitrogen bubbles.',
      'The US Navy Diving Manual tables calculate safe ascent rates based on depth and time. Most recreational dives stay above 30 meters to avoid nitrogen narcosis.',
      'Nitrogen narcosis — "rapture of the deep" — causes impaired judgment, euphoria, and hallucinations at depths below 30 meters. It\'s like underwater drunkenness.'
    ]
  },
  chapter9: {
    title:'Obstetrics & Emergency C-Section',
    facts:[
      'Placental abruption affects 1% of pregnancies. The placenta detaches prematurely, cutting off oxygen to the baby. It\'s the leading cause of emergency C-sections.',
      'A C-section (cesarean delivery) is performed through a low transverse incision (Pfannenstiel) — the same incision used for appendectomies, but lower.',
      'Normal fetal heart rate is 110-160 bpm. Below 100 (bradycardia) indicates fetal distress. The fetal monitor (CTG) tracks heart rate and contractions simultaneously.',
      'The Apgar score (Appearance, Pulse, Grimace, Activity, Respiration) is assessed at 1 and 5 minutes after birth. A score of 7+ is normal; below 4 is critical.',
      'Cesarean sections account for 32% of all US births. The procedure takes 45-60 minutes; emergency C-sections can be completed in under 10 minutes when necessary.'
    ]
  },
  chapter10: {
    title:'Cardiac Surgery & Tamponade',
    facts:[
      'Cardiac tamponade occurs when fluid (usually blood) fills the pericardial sac, compressing the heart. The heart can\'t fill — stroke volume drops — cardiac arrest follows.',
      'Beck\'s Triad diagnoses tamponade: low blood pressure, distended neck veins, and muffled heart sounds. All three together = emergency thoracotomy.',
      'Pericardial window is a surgical procedure to drain fluid from the pericardial sac. A small opening allows blood to drain, relieving pressure on the heart.',
      'Cardiac suturing requires extraordinary precision — the heart wall is only 3-5mm thick in the ventricles. A suture too deep perforates; too shallow dehisces.',
      'Open-heart surgery survival rates have improved from 50% in the 1960s to over 97% today. Technological advances in cardiopulmonary bypass made this possible.'
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

/* ───────────── ACHIEVEMENTS ───────────── */
G.ACHIEVEMENTS = [
  { id:'first_save',    name:'First Save',        icon:'🏅', desc:'Complete Chapter 1', condition:function(s){ return s.chapter > 1; } },
  { id:'perfect_step',  name:'Steady Hands',      icon:'🎯', desc:'Get 100% accuracy on any step', condition:function(s){ return s.perfectSteps >= 1; } },
  { id:'combo_master',  name:'Combo Master',      icon:'🔥', desc:'Reach x10 combo', condition:function(s){ return s.maxCombo >= 10; } },
  { id:'speed_demon',   name:'Speed Demon',       icon:'⚡', desc:'Complete a chapter with >50% time remaining', condition:function(s){ return s.speedClears >= 1; } },
  { id:'no_complications', name:'No Complications', icon:'🛡️', desc:'Complete 3 chapters without any complications', condition:function(s){ return s.noCompChapters >= 3; } },
  { id:'full_journal',  name:'Scholar',           icon:'📖', desc:'Unlock all journal entries', condition:function(s){ return s.journalUnlocked >= 10; } },
  { id:'ortho_pro',     name:'Bone Doctor',       icon:'🦴', desc:'Complete Chapter 6 with S rank', condition:function(s){ return s.scores && s.scores[6] && s.scores[6].grade === 'S'; } },
  { id:'allergy_hero',  name:'Allergy Hero',      icon:'💉', desc:'Complete Chapter 7', condition:function(s){ return s.chapter > 7; } },
  { id:'deep_diver',    name:'Deep Diver',        icon:'🤿', desc:'Complete Chapter 8', condition:function(s){ return s.chapter > 8; } },
  { id:'baby_whisperer',name:'Baby Whisperer',    icon:'👶', desc:'Complete Chapter 9', condition:function(s){ return s.chapter > 9; } },
  { id:'chief_surgeon', name:'Chief Surgeon',     icon:'👨‍⚕️', desc:'Complete Chapter 10 — save Dr. Reynolds', condition:function(s){ return s.chapter > 10; } },
  { id:'master_surgeon',name:'Master Surgeon',    icon:'🏆', desc:'S rank on ALL chapters', condition:function(s){ return s.allSRank; } }
];

/* ───────────── POWERUPS ───────────── */
G.POWERUPS = {
  speed:    { id:'speed',    name:'Speed Boost',     icon:'⚡', desc:'+50% time for next step', duration:1, color:'#f39c12' },
  shield:   { id:'shield',   name:'Accuracy Shield', icon:'🛡️', desc:'1 free mistake per level', duration:1, color:'#3498db' },
  second:   { id:'second',   name:'Second Chance',   icon:'❤️', desc:'Repeat last failed step', duration:1, color:'#e74c3c' },
  precision:{ id:'precision',name:'Precision Bonus', icon:'🎯', desc:'x2 score for 10 seconds', duration:10, color:'#2ecc71' }
};

/* ───────────── COMPLICATIONS ───────────── */
G.COMPLICATIONS = [
  { id:'bleed',     name:'Unexpected Bleeding!',  icon:'🩸', desc:'Rapid bleeding — tap quickly to clamp!', type:'tap', points:4, time:5, penalty:15 },
  { id:'move',      name:'Patient is Moving!',    icon:'🫨', desc:'Patient moved — recalibrate quickly!', type:'swipe', path:'recalibrate', time:6, penalty:20 },
  { id:'equipment', name:'Equipment Malfunction!', icon:'⚠️', desc:'Machine failure — switch to backup tool!', type:'tap', points:2, time:4, penalty:10 },
  { id:'spike',     name:'Vitals Spiking!',       icon:'📈', desc:'Heart rate spiking — stabilize now!', type:'timing', target_bpm:160, time:6, penalty:25 }
];

/* ───────────── DIFFICULTY SCALING ───────────── */
G.DIFFICULTY = {
  1:  { timeMod:1.0,   compChance:0,    compMax:0 },
  2:  { timeMod:1.0,   compChance:0,    compMax:0 },
  3:  { timeMod:1.0,   compChance:0.08, compMax:1 },
  4:  { timeMod:0.9,   compChance:0.12, compMax:1 },
  5:  { timeMod:0.9,   compChance:0.15, compMax:2 },
  6:  { timeMod:0.85,  compChance:0.15, compMax:2 },
  7:  { timeMod:0.85,  compChance:0.18, compMax:2 },
  8:  { timeMod:0.8,   compChance:0.20, compMax:3 },
  9:  { timeMod:0.8,   compChance:0.22, compMax:3 },
  10: { timeMod:0.75,  compChance:0.25, compMax:4 }
};

})();
