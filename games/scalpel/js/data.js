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
  },
  xylar: {
    id:'xylar', name:'Xylar-7', age:342, emoji:'👽',
    condition:'Traumatic injuries from spaceship crash',
    desc:'Xylar-7 is a Zeta Reticulan explorer whose ship crashed in the hospital parking lot. The being has a three-lobed heart, crystal lungs, a triple-brain system, liquid mercury liver, cosmic kidneys, bioluminescent skin, and titanium bones. Despite the anatomical differences, the surgical principles remain the same: identify damage, stabilize, repair. You are the first human to operate on an extraterrestrial life form.',
    vitals:{ hr:45, bp:'60/35', temp:28.5, o2:82 }
  },
  marco_b: {
    id:'marco_b', name:'Marco B.', age:40, emoji:'👨‍🔧',
    condition:'Severe burns (40% body surface)',
    desc:'Marco B. is a 40-year-old factory worker admitted after an industrial explosion. He has second and third-degree burns across 40% of his body. Necrotic tissue, exposed muscle, and severe pain. Emergency escharectomy and skin grafting required. Multiple surgeries will be needed, but the first priority is debridement and stabilization.',
    vitals:{ hr:130, bp:'95/60', temp:38.9, o2:94 }
  },
  sofia_b: {
    id:'sofia_b', name:'Sofia B.', age:10, emoji:'👧',
    condition:'Acute appendicitis with peritonitis',
    desc:'Sofia B. is a 10-year-old girl with high fever, rigid abdomen, and severe right lower quadrant pain. Imaging confirms appendicitis with early peritonitis — the appendix is inflamed and at risk of rupture. Emergency laparoscopic appendectomy required. Her parents are devastated. You must be gentle but swift.',
    vitals:{ hr:125, bp:'95/55', temp:39.2, o2:97 }
  },
  giorgio_b: {
    id:'giorgio_b', name:'Giorgio B.', age:78, emoji:'👴',
    condition:'Femoral neck fracture (hip fracture)',
    desc:'Giorgio B. is a 78-year-old retired carpenter who fell in his bathroom. X-ray confirms a displaced femoral neck fracture of the left hip. His bone density is poor (osteoporosis). He needs either internal fixation with screws or partial hip replacement. The surgery is critical — without it, he will never walk again.',
    vitals:{ hr:95, bp:'140/85', temp:36.6, o2:96 }
  },
  elena_b: {
    id:'elena_b', name:'Elena B.', age:32, emoji:'🤰',
    condition:'Placenta previa with massive hemorrhage',
    desc:'Elena B. is a 32-year-old pregnant woman at 38 weeks with sudden severe vaginal bleeding. Ultrasound confirms placenta previa — the placenta is covering the cervix. Both mother and baby are in immediate danger. Emergency C-section required. Every second counts.',
    vitals:{ hr:135, bp:'80/45', temp:37.2, o2:93 }
  },
  luca_b: {
    id:'luca_b', name:'Luca B.', age:45, emoji:'👷',
    condition:'Impalement injury (chest trauma)',
    desc:'Luca B. is a 45-year-old construction worker who fell onto a metal barrier at a building site. A 30cm metal rod is embedded in his left chest, penetrating the lung. The object is tamponading the wound — removing it too quickly could cause fatal hemorrhage. You must extract it under endoscopic guidance while controlling the bleeding.',
    vitals:{ hr:120, bp:'100/65', temp:36.8, o2:91 }
  },
  anna_b: {
    id:'anna_b', name:'Anna B.', age:22, emoji:'⚽',
    condition:'ACL tear (anterior cruciate ligament)',
    desc:'Anna B. is a 22-year-old professional soccer player who tore her ACL during a championship match. She wants to return to professional play and needs a perfect arthroscopic reconstruction. The graft must be positioned with millimeter precision or she\'ll never compete at the same level again.',
    vitals:{ hr:85, bp:'120/75', temp:36.7, o2:99 }
  },
  yuki_b: {
    id:'yuki_b', name:'Yuki B.', age:5, emoji:'👶',
    condition:'Congenital heart defect (PFO with septal defect)',
    desc:'Yuki B. is a 5-year-old girl born with a patent foramen ovale and atrial septal defect. She has been cyanotic (blue) since birth, with difficulty breathing and poor growth. Without surgery, she won\'t reach her next birthday. You must repair her tiny heart — the size of your fist — with perfect precision.',
    vitals:{ hr:130, bp:'85/50', temp:36.5, o2:82 }
  },
  marco_b2: {
    id:'marco_b2', name:'Dr. Marco B.', age:68, emoji:'👨‍⚕️',
    condition:'Intracerebral hemorrhage (massive stroke)',
    desc:'Dr. Marco B., one of Ospedale Miraggio\'s best neurosurgeons, has suffered a massive intracerebral hemorrhage while in the operating room. His brain is swelling rapidly. Emergency craniotomy required to evacuate the hematoma and decompress. The student must now operate on the master. This is the hardest surgery you\'ll ever perform.',
    vitals:{ hr:110, bp:'180/100', temp:37.0, o2:89 }
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
  ],
  chapter11: [
    { id:'scan_body',  type:'tap',     tool:'xray',       name:'Scan Entire Body',  points:4,            accuracy:80, time:12, desc:'Use x-ray to reveal all alien organs' },
    { id:'analyze_blood',type:'tap',   tool:'microscope', name:'Analyze Alien Blood',points:2,           accuracy:90, time:8,  desc:'Identify the composition of the purple plasma' },
    { id:'laser_rib',  type:'swipe',   tool:'laser',      name:'Laser Incision',    path:'alien_chest', accuracy:75, time:14, desc:'Cut through titanium ribcage with laser' },
    { id:'stabilize_heart',type:'tap', tool:'stabilizer', name:'Stabilize Tri-Lobe Heart',points:3,       accuracy:85, time:10, desc:'The heart pulses in 3 directions — stabilize it' },
    { id:'repair_valve',type:'stitch', tool:'patch',      name:'Repair Heart Valve', points:6,            accuracy:90, time:14, desc:'Patch the crystalline heart valve with biotech' },
    { id:'scan_lungs',  type:'tap',    tool:'xray',       name:'Analyze Crystal Lungs',points:3,          accuracy:85, time:10, desc:'Identify fracture points in the crystal structure' },
    { id:'rebuild_crystal',type:'draw',tool:'microscope', name:'Rebuild Crystals',   path:'alien_lung',  accuracy:80, time:16, desc:'Reconstruct the shattered crystal lung tissue' },
    { id:'regen_lungs', type:'tap',    tool:'syringe',    name:'Inject Regen Serum', points:2,            accuracy:90, time:8,  desc:'The serum causes temporary vision effects — be careful' },
    { id:'scan_brain',  type:'tap',    tool:'xray',       name:'Map Triple Brain',   points:3,            accuracy:85, time:10, desc:'Identify all three connected brain structures' },
    { id:'drain_energy',type:'tap',    tool:'zapper',     name:'Drain Brain Energy', points:4,            accuracy:80, time:12, desc:'The brains have excess cosmic energy — discharge it' },
    { id:'extract_fragment',type:'draw',tool:'laser',     name:'Extract Ship Fragment',path:'alien_brain', accuracy:90, time:14, desc:'Laser out the embedded spaceship fragment with precision' },
    { id:'locate_liver',type:'navigate',tool:'magnet',    name:'Locate Liquid Liver', path:'alien_liver', accuracy:70, time:10, desc:'The mercury liver is liquid and moves — track it' },
    { id:'attract_liver',type:'tap',   tool:'magnet',     name:'Attract Liver',       points:3,            accuracy:80, time:8,  desc:'Use magnetone to pull the liver into position' },
    { id:'solidify_liver',type:'tap',  tool:'patch',      name:'Solidify Liver',      points:2,            accuracy:85, time:10, desc:'Biotech patch stabilizes the liquid mercury liver' },
    { id:'scan_kidneys',type:'tap',    tool:'xray',       name:'Scan Cosmic Kidneys', points:2,            accuracy:85, time:8,  desc:'The kidneys contain stored cosmic energy' },
    { id:'zap_kidneys', type:'tap',    tool:'zapper',     name:'Discharge Kidneys',   points:3,            accuracy:80, time:10, desc:'Discharge the cosmic energy — watch for explosion!' },
    { id:'analyze_nerves',type:'tap',  tool:'microscope', name:'Map Nerve Network',   points:3,            accuracy:85, time:10, desc:'The bioluminescent nerves light up when touched' },
    { id:'nerve_serum', type:'tap',    tool:'syringe',    name:'Anti-Inflammatory',   points:2,            accuracy:90, time:8,  desc:'Calm the nerves — but only temporarily' },
    { id:'nerve_repair',type:'stitch', tool:'patch',      name:'Repair Nerve Links',  points:6,            accuracy:85, time:14, desc:'Reconnect severed nerve pathways with biotech patches' },
    { id:'suture_alien',type:'draw',   tool:'laser',      name:'Laser Suture Close',  path:'alien_close',  accuracy:80, time:16, desc:'Standard sutures won\'t work — use laser to seal' },
    { id:'final_serum', type:'tap',    tool:'syringe',    name:'Final Recovery Serum',points:2,            accuracy:90, time:8,  desc:'The alien begins to recover... what happens next?' }
  ],
  chapter12: [
    { id:'assess_burns',type:'tap',    tool:'ultrasound',  name:'Assess Burn Depth',  points:3,            accuracy:80, time:10, desc:'Determine the depth and extent of burns across the body' },
    { id:'debride_necrotic',type:'swipe',tool:'laser',     name:'Debride Necrotic Tissue',path:'burn_chest',accuracy:75, time:14, desc:'Remove dead tissue with laser precision' },
    { id:'clean_wound', type:'tap',    tool:'antihist',    name:'Clean Burn Wounds',  points:2,            accuracy:85, time:10, desc:'Irrigate and clean the burn surfaces' },
    { id:'harvest_graft',type:'tap',   tool:'scalpel',     name:'Harvest Skin Graft', points:3,            accuracy:80, time:12, desc:'Take healthy skin from donor site for grafting' },
    { id:'apply_graft', type:'stitch', tool:'sutures',     name:'Apply Skin Graft',   points:6,            accuracy:90, time:16, desc:'Carefully place and secure the skin graft' },
    { id:'seal_graft',  type:'swipe',  tool:'laser',       name:'Seal Graft Edges',   path:'graft_edge',   accuracy:85, time:12, desc:'Laser-seal the graft edges to prevent lifting' },
    { id:'hyperbaric',  type:'tap',    tool:'hyperbaric',  name:'Hyperbaric Therapy', points:2,            accuracy:90, time:8,  desc:'Apply hyperbaric oxygen to promote healing' }
  ],
  chapter13: [
    { id:'examine_child',type:'tap',   tool:'ultrasound',  name:'Examine Abdomen',   points:3,            accuracy:80, time:10, desc:'Gently examine the child\'s tender abdomen' },
    { id:'insert_scope',type:'navigate',tool:'endoscope',  name:'Insert Laparoscope',path:'child_abdomen',accuracy:75, time:12, desc:'Carefully insert the laparoscopic camera' },
    { id:'locate_appendix',type:'tap', tool:'endoscope',   name:'Locate Appendix',    points:2,            accuracy:85, time:10, desc:'Find the inflamed appendix with the camera' },
    { id:'clamp_vessels',type:'tap',   tool:'clamps',      name:'Clamp Blood Vessels',points:3,           accuracy:80, time:8,  desc:'Clamp the appendicular artery and mesoappendix' },
    { id:'cut_appendix', type:'swipe', tool:'scalpel',     name:'Cut Appendix Base',  path:'appendix',     accuracy:90, time:12, desc:'Carefully cut the appendix at its base' },
    { id:'stitch_site', type:'stitch', tool:'sutures',     name:'Suture Removal Site',points:6,           accuracy:85, time:14, desc:'Close the tiny incision with fine sutures' },
    { id:'drain_fluid', type:'tap',    tool:'retractor',   name:'Drain Peritoneal Fluid',points:2,         accuracy:90, time:8,  desc:'Drain any infected fluid from the abdomen' }
  ],
  chapter14: [
    { id:'xray_hip',    type:'tap',    tool:'ultrasound',  name:'X-Ray Hip Joint',    points:3,            accuracy:80, time:10, desc:'Image the fractured femoral neck' },
    { id:'expose_joint',type:'swipe',  tool:'scalpel',     name:'Expose Hip Joint',   path:'hip_joint',    accuracy:75, time:14, desc:'Make incision to access the hip joint' },
    { id:'reduce_fracture',type:'tap', tool:'retractor',   name:'Reduce Fracture',    points:3,            accuracy:85, time:12, desc:'Realign the fractured bone fragments' },
    { id:'insert_screws',type:'tap',   tool:'bonesaw',     name:'Insert Cannulated Screws',points:4,         accuracy:80, time:14, desc:'Insert screws to fix the fracture in place' },
    { id:'check_alignment',type:'tap', tool:'ultrasound',  name:'Verify Alignment',   points:2,            accuracy:90, time:8,  desc:'Confirm proper alignment of the fracture' },
    { id:'close_wound', type:'stitch', tool:'sutures',     name:'Close Incision',     points:6,            accuracy:85, time:12, desc:'Suture the surgical wound closed' }
  ],
  chapter15: [
    { id:'preop_check', type:'tap',    tool:'fetalmon',    name:'Monitor Fetal Heart',points:3,            accuracy:80, time:10, desc:'Check the baby\'s heartbeat before surgery' },
    { id:'incision_abd',type:'swipe',  tool:'scalpel',     name:'Make Abdominal Incision',path:'abdomen', accuracy:75, time:12, desc:'Carefully open the abdomen layer by layer' },
    { id:'expose_uterus',type:'tap',   tool:'retractor',   name:'Expose Uterus',      points:3,            accuracy:85, time:10, desc:'Retract tissue to access the uterus' },
    { id:'incision_uterus',type:'swipe',tool:'scalpel',    name:'Incise Uterus',      path:'uterus',       accuracy:90, time:12, desc:'Make precise incision in the uterus' },
    { id:'deliver_baby', type:'tap',   tool:'forceps',     name:'Deliver Baby',       points:4,            accuracy:85, time:10, desc:'Gently deliver the baby from the uterus' },
    { id:'clamp_vessels',type:'tap',   tool:'clamps',      name:'Control Bleeding',   points:3,            accuracy:80, time:12, desc:'Clamp bleeding vessels to control hemorrhage' },
    { id:'suture_uterus',type:'stitch',tool:'sutures',     name:'Suture Uterus',      points:6,            accuracy:90, time:14, desc:'Close the uterine incision with care' },
    { id:'close_abdomen',type:'stitch',tool:'sutures',     name:'Close Abdomen',      points:6,            accuracy:85, time:12, desc:'Close the abdominal wall in layers' }
  ],
  chapter16: [
    { id:'scan_chest',  type:'tap',    tool:'ultrasound',  name:'Scan Chest Trauma',  points:3,            accuracy:80, time:10, desc:'Image the impaled object and surrounding damage' },
    { id:'scope_in',    type:'navigate',tool:'endoscope',  name:'Insert Endoscope',   path:'chest',        accuracy:75, time:12, desc:'Guide the endoscope around the embedded object' },
    { id:'assess_damage',type:'tap',   tool:'endoscope',   name:'Assess Lung Damage', points:3,            accuracy:85, time:10, desc:'Evaluate the extent of lung penetration' },
    { id:'prepare_extract',type:'tap', tool:'clamps',      name:'Prepare Extraction', points:2,            accuracy:80, time:8,  desc:'Set up clamps and suction to control bleeding' },
    { id:'extract_object',type:'tap',  tool:'forceps',     name:'Extract Metal Rod',  points:4,            accuracy:90, time:14, desc:'Carefully remove the impaled object' },
    { id:'repair_lung', type:'stitch', tool:'sutures',     name:'Repair Lung Tissue', points:6,            accuracy:85, time:14, desc:'Suture the lung wound to stop air leak' },
    { id:'insert_chest_tube',type:'tap',tool:'retractor',  name:'Insert Chest Tube',  points:2,            accuracy:90, time:8,  desc:'Place a chest tube to drain fluid and air' }
  ],
  chapter17: [
    { id:'scope_knee',  type:'navigate',tool:'endoscope',  name:'Insert Arthroscope', path:'knee',         accuracy:75, time:12, desc:'Guide the arthroscope into the knee joint' },
    { id:'assess_acl',  type:'tap',    tool:'endoscope',   name:'Assess ACL Tear',    points:3,            accuracy:85, time:10, desc:'Examine the torn anterior cruciate ligament' },
    { id:'harvest_graft',type:'tap',   tool:'scalpel',     name:'Harvest Tendon Graft',points:3,           accuracy:80, time:12, desc:'Take a tendon graft from the patellar tendon' },
    { id:'drill_tunnels',    type:'tap',    tool:'bonesaw',     name:'Drill Bone Tunnels', points:4,            accuracy:90, time:14, desc:'Drill precise tunnels in the tibia and femur' },
    { id:'thread_graft',type:'tap',    tool:'forceps',     name:'Thread Graft',       points:3,            accuracy:85, time:10, desc:'Guide the tendon graft through the bone tunnels' },
    { id:'fix_graft',   type:'stitch', tool:'sutures',     name:'Fix Graft in Place', points:6,            accuracy:90, time:14, desc:'Secure the graft at the correct tension' },
    { id:'close_ports', type:'stitch', tool:'sutures',     name:'Close Arthroscopy Ports',points:2,         accuracy:85, time:8,  desc:'Close the small arthroscopic incisions' }
  ],
  chapter18: [
    { id:'echo_heart',  type:'tap',    tool:'fetalmon',    name:'Echocardiogram',     points:3,            accuracy:80, time:10, desc:'Image the child\'s heart defect with ultrasound' },
    { id:'prep_chest',  type:'swipe',  tool:'scalpel',     name:'Make Chest Incision',path:'chest',        accuracy:75, time:12, desc:'Open the chest to access the heart' },
    { id:'expose_heart',type:'tap',    tool:'retractor',   name:'Expose Heart',       points:3,            accuracy:85, time:10, desc:'Retract ribs to access the beating heart' },
    { id:'cannulate',   type:'tap',    tool:'clamps',      name:'Cannulate Vessels',  points:3,            accuracy:80, time:12, desc:'Connect to heart-lung bypass machine' },
    { id:'stop_heart',  type:'tap',    tool:'defib',       name:'Stop Heart',         points:4,            accuracy:90, time:10, desc:'Induce cardiac arrest for repair' },
    { id:'patch_defect',type:'stitch', tool:'sutures',     name:'Patch Septal Defect',points:6,            accuracy:90, time:16, desc:'Patch the hole between the heart chambers' },
    { id:'restart_heart',type:'tap',   tool:'defib',       name:'Restart Heart',      points:4,            accuracy:85, time:10, desc:'Defibrillate to restore normal rhythm' },
    { id:'close_chest', type:'stitch', tool:'sutures',     name:'Close Chest',        points:6,            accuracy:85, time:12, desc:'Close the chest wall in layers' }
  ],
  chapter19: [
    { id:'ct_brain',    type:'tap',    tool:'ultrasound',  name:'CT Brain Scan',      points:3,            accuracy:80, time:10, desc:'Image the brain hemorrhage location' },
    { id:'shave_head',  type:'tap',    tool:'scalpel',     name:'Prepare Craniotomy Site',points:2,         accuracy:90, time:8,  desc:'Prepare the surgical site on the skull' },
    { id:'craniotomy',  type:'swipe',  tool:'bonesaw',     name:'Perform Craniotomy', path:'skull',        accuracy:85, time:14, desc:'Remove a bone flap to access the brain' },
    { id:'dura_incision',type:'swipe', tool:'scalpel',     name:'Open Dura Mater',    path:'dura',         accuracy:90, time:12, desc:'Carefully open the protective brain covering' },
    { id:'evacuate_hematoma',type:'tap',tool:'forceps',     name:'Evacuate Hematoma',  points:4,            accuracy:85, time:14, desc:'Remove the blood clot pressing on brain tissue' },
    { id:'coagulate',   type:'tap',    tool:'laser',       name:'Coagulate Bleeding', points:3,            accuracy:90, time:10, desc:'Stop active bleeding with laser coagulation' },
    { id:'decompress',  type:'tap',    tool:'retractor',   name:'Decompress Brain',   points:3,            accuracy:85, time:10, desc:'Relieve pressure on swollen brain tissue' },
    { id:'close_dura',  type:'stitch', tool:'sutures',     name:'Close Dura',         points:6,            accuracy:90, time:12, desc:'Watertight closure of the dura mater' },
    { id:'replace_bone',type:'tap',    tool:'forceps',     name:'Replace Bone Flap',  points:3,            accuracy:85, time:10, desc:'Replace the bone flap and secure with titanium plates' },
    { id:'close_scalp', type:'stitch', tool:'sutures',     name:'Close Scalp',        points:6,            accuracy:80, time:10, desc:'Close the scalp incision' }
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
  },
  {
    id:11, title:'The Roswell File', icon:'👽', unlocked:false, isAlien:true,
    patient:'xylar',
    briefing:[
      { speaker:'???', text:'*static* ...help... *alien signal* ...crashed... *interference*' },
      { speaker:'Dr. Reynolds', text:'What was that? Did you hear that? It came from the parking lot. Something... just landed.' },
      { speaker:'You', text:'Is that... an alien? An actual alien?!' },
      { speaker:'Dr. Reynolds', text:'Whatever it is, it needs help. It\'s injured. We don\'t ask questions — we save lives. All of them. Even the ones from other planets.' },
      { speaker:'Xylar', text:'*telepathic voice* Human... I am Xylar-7. My ship fell from orbit. I need... surgical intervention. My organs are... different from yours.' },
      { speaker:'Dr. Reynolds', text:'Different? How different?' },
      { speaker:'Xylar', text:'*telepathic voice* I have three hearts... no wait, one heart with three chambers. My bones are titanium. My blood is... liquid plasma. And my brain... it\'s actually three brains.' },
      { speaker:'Dr. Reynolds', text:'Doctor... this is unprecedented. But the principle is the same: identify the damage, stabilize, repair. We can do this.' },
      { speaker:'You', text:'I\'ll need alien tools — laser, x-ray, that strange syringe thing. Let me adapt.' }
    ],
    debriefing:[
      { speaker:'Xylar', text:'*telepathic voice* You have done what few humans could. You saved a life from another world. The Galactic Council will know of your compassion.' },
      { speaker:'Dr. Reynolds', text:'I\'ve been a surgeon for 30 years. And today... I operated on an alien. I think I need to retire after this. Or maybe I\'m just getting started.' },
      { speaker:'You', text:'We saved a life today. That\'s what we do. Doesn\'t matter if the patient is from Earth or from Zeta Reticuli.' },
      { speaker:'Xylar', text:'*telepathic voice* When my people return... we will remember you. The Human Healer. The one who saw no difference between stars.' },
      { speaker:'SYSTEM', text:'👽 FIRST CONTACT ACHIEVED — You have performed surgery on an extraterrestrial being. You are the first Human Healer recognized by the Galactic Council. The universe is now your operating room. 🌌✨' }
    ]
  },
  {
    id:12, title:'Burning Bright', icon:'🔥', unlocked:false,
    patient:'marco_b',
    briefing:[
      { speaker:'Dr. Reynolds', text:'Emergency call from the steel mill. Explosion. Multiple burn victims incoming.' },
      { speaker:'Dr. Reynolds', text:'Marco B., 40, severe burns across 40% of his body. Necrotic tissue, exposed muscle. This will be a long surgery.' },
      { speaker:'You', text:'What tools do we have?' },
      { speaker:'Dr. Reynolds', text:'Laser for debridement, hyperbaric for healing, and your standard kit. This is going to test your endurance.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Marco is in stable condition. The grafts are holding. You did well under pressure.' }
    ]
  },
  {
    id:13, title:'Little Fighter', icon:'🧒', unlocked:false,
    patient:'sofia_b',
    briefing:[
      { speaker:'Nurse Ada', text:'Doctor, we have a 10-year-old with acute appendicitis. Peritonitis is setting in.' },
      { speaker:'Nurse Ada', text:'Her parents are distraught. We need to operate immediately.' },
      { speaker:'You', text:'Prep the laparoscopic equipment. I need to be gentle with her.' },
      { speaker:'Dr. Reynolds', text:'Remember: children are not small adults. Their tissues are delicate. Precision is everything.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Sofia is recovering well. Her parents are grateful. You handled that beautifully.' }
    ]
  },
  {
    id:14, title:'Autumn Fall', icon:'🍂', unlocked:false,
    patient:'giorgio_b',
    briefing:[
      { speaker:'ER Doctor', text:'Giorgio B., 78, fell in his bathroom. Hip fracture, femoral neck. He\'s in severe pain.' },
      { speaker:'ER Doctor', text:'We need to decide: partial hip replacement or internal fixation. His bone density is poor.' },
      { speaker:'You', text:'Let me assess the fracture. Get me the bone saw and imaging.' },
      { speaker:'Dr. Reynolds', text:'This is a common but tricky surgery in elderly patients. The bone is fragile. Be careful with the osteosynthesis.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'The implant is secure. Giorgio will need physical therapy, but he\'ll walk again.' }
    ]
  },
  {
    id:15, title:'Two Lives', icon:'🤰', unlocked:false,
    patient:'elena_b',
    briefing:[
      { speaker:'Dr. Reynolds', text:'Elena B., 32 weeks pregnant. Placenta previa with massive hemorrhage.' },
      { speaker:'Dr. Reynolds', text:'We need to deliver the baby immediately and control the bleeding. Two lives are at stake.' },
      { speaker:'You', text:'Prep for emergency C-section. I need clamps and sutures ready.' },
      { speaker:'Dr. Reynolds', text:'This is the most critical moment. The mother is losing blood fast. Move quickly but carefully.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Both mother and baby are stable. You saved two lives today. Remember this.' }
    ]
  },
  {
    id:16, title:'Impaled', icon:'⚡', unlocked:false,
    patient:'luca_b',
    briefing:[
      { speaker:'ER Doctor', text:'Luca B., 45, impaled on a metal barrier at the construction site. The object is still embedded in his chest.' },
      { speaker:'ER Doctor', text:'We can\'t remove it until we\'re ready to control the bleeding. One wrong move and he bleeds out.' },
      { speaker:'You', text:'Get me endoscopic equipment. I need to see the damage before we extract.' },
      { speaker:'Dr. Reynolds', text:'This is the most dangerous kind of trauma. The object is tamponading the wound. Remove it too fast, and he dies.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'The object is out, the lung is repaired, and the bleeding is controlled. Incredible work.' }
    ]
  },
  {
    id:17, title:'Game Changer', icon:'⚽', unlocked:false,
    patient:'anna_b',
    briefing:[
      { speaker:'Sports Medicine', text:'Anna B., 22, professional soccer player. ACL tear during the championship match.' },
      { speaker:'Sports Medicine', text:'She wants to return to professional play. We need a perfect reconstruction.' },
      { speaker:'You', text:'Arthroscopic approach. I need the laser and specialized sutures.' },
      { speaker:'Dr. Reynolds', text:'ACL reconstruction is precise work. The graft must be positioned perfectly or she\'ll never play at the same level.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'The reconstruction is solid. With rehabilitation, she\'ll be back on the field in 6 months.' }
    ]
  },
  {
    id:18, title:'Tiny Heart', icon:'💔', unlocked:false,
    patient:'yuki_b',
    briefing:[
      { speaker:'Pediatric Cardiologist', text:'Yuki B., 5 years old. Congenital heart defect — patent foramen ovale with septal defect.' },
      { speaker:'Pediatric Cardiologist', text:'She\'s been blue since birth. Without surgery, she won\'t make it to her next birthday.' },
      { speaker:'You', text:'I need the endoscope and cardiac tools. This is the most delicate surgery I\'ll ever perform.' },
      { speaker:'Dr. Reynolds', text:'A child\'s heart is the size of your fist. One wrong stitch and it\'s over. You can do this.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Yuki\'s lips are pink for the first time in her life. Her heart is beating strong. You gave her a future.' }
    ]
  },
  {
    id:19, title:'The Surgeon\'s Surgeon', icon:'🧠', unlocked:false,
    patient:'marco_b2',
    briefing:[
      { speaker:'Nurse Ada', text:'Doctor! Dr. Marco B.— one of our best neurosurgeons— has had a massive stroke. He\'s on the table.' },
      { speaker:'Nurse Ada', text:'Intracerebral hemorrhage. His brain is swelling. He needs emergency craniotomy.' },
      { speaker:'You', text:'The student becomes the master. Let me see the imaging.' },
      { speaker:'Dr. Reynolds', text:'This is the hardest surgery you\'ll ever do. Operating on a colleague, a friend. But you must be precise. He\'d want you to be.' }
    ],
    debriefing:[
      { speaker:'Dr. Reynolds', text:'Dr. Marco is in critical but stable condition. The hematoma is evacuated. He has a long road ahead, but he\'ll survive.' },
      { speaker:'Dr. Reynolds', text:'You just operated on one of the best. That took incredible courage. I\'m proud of you.' }
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
  },
  chapter11: {
    title:'Xenobiology & Extraterrestrial Anatomy',
    facts:[
      'If extraterrestrial life exists, its biochemistry could be radically different from Earth\'s. Silicon-based life, for example, could survive temperatures that would destroy carbon-based organisms.',
      'The concept of "convergent evolution" suggests that alien life might develop similar solutions to Earth organisms — eyes, limbs, circulatory systems — despite different chemistry.',
      'Titanium is used in aerospace and medical implants because it\'s both strong and lightweight. An alien skeleton made of titanium-like material would be incredibly durable.',
      'Bioluminescence (producing light through chemical reactions) exists in many Earth organisms — jellyfish, fireflies, deep-sea fish. Alien life might use similar mechanisms for communication.',
      'Mercury (quicksilver) is liquid at room temperature and highly toxic to humans. A being with a liquid mercury liver would need an entirely different metabolic system to process it.',
      'The human brain has ~86 billion neurons. A triple-brain system with 3 separate processing centers could theoretically solve complex problems in parallel — like a biological supercomputer.',
      'Cosmic rays from space constantly bombard Earth. On other planets with less magnetic protection, life might evolve to incorporate or resist high-energy radiation.',
      'If alien blood uses plasma instead of hemoglobin, it might carry oxygen differently — perhaps using copper-based compounds (like Earth\'s hemocyanin in horseshoe crabs) or something entirely unknown.'
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
  10: { timeMod:0.75,  compChance:0.25, compMax:4 },
  11: { timeMod:0.7,   compChance:0.30, compMax:5 },
  12: { timeMod:0.85,  compChance:0.18, compMax:2 },
  13: { timeMod:0.9,   compChance:0.15, compMax:2 },
  14: { timeMod:0.8,   compChance:0.20, compMax:3 },
  15: { timeMod:0.8,   compChance:0.22, compMax:3 },
  16: { timeMod:0.75,  compChance:0.25, compMax:4 },
  17: { timeMod:0.85,  compChance:0.18, compMax:2 },
  18: { timeMod:0.75,  compChance:0.28, compMax:4 },
  19: { timeMod:0.7,   compChance:0.30, compMax:5 }
};

/* ───────────── SPEED RUN BONUS ───────────── */
G.SPEED_BONUS = [
  { maxSec:30,  bonus:3.0, label:'LEGENDARY' },
  { maxSec:60,  bonus:2.0, label:'BLAZING' },
  { maxSec:90,  bonus:1.5, label:'FAST' },
  { maxSec:120, bonus:1.2, label:'GOOD' },
  { maxSec:9999,bonus:1.0, label:'CLEAR' }
];

/* ───────────── BOSS RUSH ───────────── */
G.BOSS_RUSH = {
  bosses: [5, 9, 10],
  difficulty: {
    timeMod: 0.8,
    compChance: 0.3,
    compMax: 5
  },
  ratings: [
    { minSec:120, grade:'S', label:'LEGENDARY', emoji:'🏆' },
    { minSec:180, grade:'A', label:'EPIC',      emoji:'⭐' },
    { minSec:240, grade:'B', label:'STRONG',    emoji:'👍' },
    { minSec:9999,grade:'C', label:'SURVIVED',  emoji:'📋' }
  ]
};

/* ───────────── ALIEN SURGERY ───────────── */
G.ALIEN_TOOLS = {
  laser:     { name:'Laser Medico',     icon:'🔫', color:'#e74c3c' },
  xray:      { name:'Scansione X-ray',  icon:'📡', color:'#3498db' },
  syringe:   { name:'Siringa Aliena',   icon:'💉', color:'#9b59b6' },
  magnet:    { name:'Magnetone',         icon:'🧲', color:'#f39c12' },
  zapper:    { name:'Scaricatore',      icon:'⚡', color:'#f1c40f' },
  microscope:{ name:'Microscopio Eterico', icon:'🔬', color:'#1abc9c' },
  stabilizer:{ name:'Stabilizzatore',   icon:'🌀', color:'#27ae60' },
  patch:     { name:'Patch Biotech',     icon:'🩹', color:'#e67e22' }
};

G.ALIEN_ORGANS = {
  heart:  { name:'Cuore Tri-Lobe',       icon:'💜', color:'#9b59b6', desc:'3 camere, pulsa in 3 direzioni' },
  lungs:  { name:'Polmoni di Cristallo', icon:'💎', color:'#3498db', desc:'Trasparenti, si frantumano facilmente' },
  brain:  { name:'Cervello Multi-Nucleo',icon:'🧠', color:'#1abc9c', desc:'3 cervelli collegati tra loro' },
  liver:  { name:'Fegato di Mercurio',   icon:'🪩', color:'#bdc3c7', desc:'Liquido, cambia forma' },
  kidneys:{ name:'Reni Cosmici',         icon:'🌌', color:'#8e44ad', desc:'Contengono energia cosmica' },
  nerves: { name:'Sistema Nervoso Verde',icon:'💚', color:'#27ae60', desc:'Nervi bioluminescenti' },
  bones:  { name:'Ossa di Titanio',      icon:'⚪', color:'#95a5a6', desc:'Metalliche, necessitano di laser' },
  skin:   { name:'Pelle Bioluminescente',icon:'🟢', color:'#2ecc71', desc:'Cambia colore con il dolore' }
};

G.ALIEN_COMPILATIONS = [
  { id:'alien_allergy',    name:'Reazione Allergica',     icon:'🟢', desc:'Veleno verde si diffonde',            tool:'syringe' },
  { id:'alien_cardiac',    name:'Arresto Tri-Cardiaco',   icon:'💜', desc:'Cuore si ferma in 3 modi',            tool:'zapper' },
  { id:'alien_crystal',    name:'Cristalli Esplosivi',    icon:'💎', desc:'Polmoni rischiano di esplodere',      tool:'stabilizer' },
  { id:'alien_psi',        name:'Psicosi Multi-Nucleo',   icon:'🧠', desc:'Cervelli si separano',                tool:'microscope' },
  { id:'alien_mercury',    name:'Fuga di Mercurio',       icon:'🪩', desc:'Fegato si disperde',                  tool:'magnet' },
  { id:'alien_cosmic',     name:'Esplosione Cosmica',     icon:'🌌', desc:'Energia rilasciata nell\'aria',       tool:'zapper' },
  { id:'alien_nerves',     name:'Nervi in Cortocircuito', icon:'💚', desc:'Paralisi totale del sistema',         tool:'syringe' },
  { id:'alien_bacteria',   name:'Infezione Batterica',    icon:'🟡', desc:'Batteri viola si moltiplicano',       tool:'microscope' }
];

G.ALIEN_POWERUPS = [
  { id:'shield',   name:'Scudo Energetico',   icon:'🛡️', desc:'Blocca danni',              dur:10 },
  { id:'slowmo',   name:'Dilatazione Temporale',icon:'⏱️', desc:'Rallenta il tempo',        dur:8  },
  { id:'recharge', name:'Ricarica Cosmica',    icon:'🔋', desc:'Ripristina tutti gli strumenti', dur:0 },
  { id:'xray_vision',name:'Vista a Raggi X',  icon:'👁️', desc:'Vedi tutto trasparente',   dur:12 },
  { id:'forcefield',name:'Campo di Forza',     icon:'🌀', desc:'Protegge un organo',        dur:15 }
];

G.ALIEN_SECRET = {
  title: 'The Roswell File',
  subtitle: 'An alien has crashed near Ospedale Miraggio. You are the only one can help.',
  unlockCondition: 'Complete 8+ chapters with 3+ A ranks',
  easterEgg: 'Tap the logo 5 times rapidly to unlock'
};

/* ───────────── ENDLESS MODE ───────────── */
G.ENDLESS = {
  levels: [
    { patients:5,  timeMod:1.0, compChance:0.15, minAcc:50 },
    { patients:10, timeMod:0.9, compChance:0.20, minAcc:55 },
    { patients:15, timeMod:0.8, compChance:0.25, minAcc:60 },
    { patients:20, timeMod:0.7, compChance:0.30, minAcc:65 },
    { patients:25, timeMod:0.6, compChance:0.35, minAcc:70 },
    { patients:30, timeMod:0.5, compChance:0.40, minAcc:75 },
    { patients:35, timeMod:0.4, compChance:0.45, minAcc:80 },
    { patients:40, timeMod:0.35,compChance:0.50, minAcc:85 },
    { patients:45, timeMod:0.3, compChance:0.55, minAcc:90 },
    { patients:999,timeMod:0.25,compChance:0.60, minAcc:95 }
  ],
  pool: ['marco','sofia','giuseppe','elena','luca','giorgio','yuki','anna'],
  stepPool: {
    easy:   ['incision','expose','clamp','suture'],
    medium: ['incision','expose','clamp','suture','laser_cut','extract'],
    hard:   ['incision','expose','clamp','suture','laser_cut','extract','scope_in','defib_shock']
  },
  stepConfig: {
    incision:   { type:'swipe',   tool:'scalpel',   name:'Incision',      path:'abdomen',   accuracy:70, time:12 },
    expose:     { type:'tap',     tool:'retractor', name:'Expose',        points:3,         accuracy:75, time:8  },
    clamp:      { type:'tap',     tool:'clamps',    name:'Clamp',         points:4,         accuracy:80, time:10 },
    suture:     { type:'stitch',  tool:'sutures',   name:'Suture',        points:8,         accuracy:70, time:18 },
    laser_cut:  { type:'draw',    tool:'laser',     name:'Laser Cut',     path:'tissue',    accuracy:80, time:14 },
    extract:    { type:'tap',     tool:'forceps',   name:'Extract',       points:3,         accuracy:85, time:10 },
    scope_in:   { type:'navigate',tool:'endoscope', name:'Endoscope',     path:'cavity',    accuracy:60, time:12 },
    defib_shock:{ type:'timing',  tool:'defib',     name:'Defibrillate',  target_bpm:150,   accuracy:85, time:8  }
  }
};

/* ───────────── ZOMBIE OUTBREAK ───────────── */
G.ZOMBIE = {
  tools: {
    flamethrower:{ name:'Fiammetta Sterilizzante', icon:'🔥', color:'#e74c3c' },
    antisero:    { name:'Siero Anti-Zombie',       icon:'💉', color:'#9b59b6' },
    rainbowdefib:{ name:'Defibrillatore Arcobaleno',icon:'⚡', color:'#f1c40f' },
    bloodtest:   { name:'Analisi Sangue',          icon:'🧪', color:'#3498db' },
    shield:      { name:'Scudo Proteico',          icon:'🛡️', color:'#27ae60' },
    magicpatch:  { name:'Cerotto Magico',          icon:'🩹', color:'#e67e22' },
    couragepill: { name:'Pillola del Coraggio',    icon:'💊', color:'#1abc9c' },
    musicbox:    { name:'Music Box',               icon:'🎵', color:'#f39c12' }
  },
  complications: [
    { id:'fast_transform', name:'Trasformazione Accelerata', icon:'🧟', tool:'antisero',   desc:'Il paziente si sta trasformando velocemente!' },
    { id:'infection_spread',name:'Infezione Diffusa',        icon:'🦠', tool:'flamethrower',desc:'L\'infezione si sta diffondendo!' },
    { id:'overheat_crit',  name:'Overheat Critico',          icon:'🔥', tool:'rainbowdefib',desc:'Lo strumento sta per esplodere!' },
    { id:'zombie_bleed',   name:'Sanguinamento Zombie',      icon:'🩸', tool:'magicpatch',  desc:'Sangue infetto ovunque!' },
    { id:'brain_hunger',   name:'Fame di Cervelli',          icon:'🧠', tool:'musicbox',    desc:'Il paziente vuole mangiare il tuo cervello!' },
    { id:'clinical_death', name:'Morte Clinica',             icon:'💀', tool:'rainbowdefib',desc:'Il paziente è morto... per ora.' },
    { id:'zombie_mosquito',name:'Zombie Mosquito',           icon:'🦟', tool:'flamethrower',desc:'Un zombie volante!' },
    { id:'pizza_delivery', name:'Pizza Delivery',            icon:'🍕', tool:'shield',      desc:'Un consegna pizza è entrato!' }
  ],
  powerups: [
    { id:'zshield',   name:'Scudo Proteico',        icon:'🛡️', dur:10 },
    { id:'zslowmo',   name:'Dilatazione Temporale', icon:'⏱️', dur:8  },
    { id:'zrecharge', name:'Ricarica Virale',       icon:'🔋', dur:0  },
    { id:'zvision',   name:'Vista Zombie',          icon:'👁️', dur:12 },
    { id:'zforce',    name:'Campo di Forza',        icon:'🌀', dur:15 },
    { id:'zpizzapower',name:'Pizza Power',          icon:'🍕', dur:10 }
  ],
  pool: ['marco','sofia','giuseppe','elena','luca','giorgio','yuki','anna'],
  stepPool: {
    easy:   ['infection_burn','blood_test','siero_inject','patch_wound'],
    medium: ['infection_burn','blood_test','siero_inject','patch_wound','flame_sterilize','music_calm'],
    hard:   ['infection_burn','blood_test','siero_inject','patch_wound','flame_sterilize','music_calm','defib_rainbow','courage_pill']
  },
  stepConfig: {
    infection_burn: { type:'draw',    tool:'flamethrower', name:'Burn Virus',       path:'zombie_tissue', accuracy:75, time:14 },
    blood_test:     { type:'tap',     tool:'bloodtest',    name:'Analyze Blood',    points:2,              accuracy:85, time:8  },
    siero_inject:   { type:'tap',     tool:'antisero',     name:'Inject Siero',     points:3,              accuracy:80, time:10 },
    patch_wound:    { type:'stitch',  tool:'magicpatch',   name:'Patch Wound',      points:8,              accuracy:70, time:18 },
    flame_sterilize:{ type:'draw',    tool:'flamethrower', name:'Sterilize Area',   path:'zombie_area',    accuracy:80, time:14 },
    music_calm:     { type:'tap',     tool:'musicbox',     name:'Calm Patient',     points:3,              accuracy:75, time:10 },
    defib_rainbow:  { type:'timing',  tool:'rainbowdefib', name:'Rainbow Defib',    target_bpm:150,        accuracy:85, time:8  },
    courage_pill:   { type:'tap',     tool:'couragepill',  name:'Courage Pill',     points:2,              accuracy:90, time:6  }
  }
};

/* ───────────── ANATOMY VIEWER ───────────── */
G.ANATOMY = {
  organs: {
    heart: {
      name:'Cuore', icon:'❤️', color:'#e74c3c',
      pos:'Centro del petto, leggermente a sinistra',
      size:'Circa la grandezza di un pugno chiuso',
      weight:'250-350 grammi',
      func:'Pompa il sangue attraverso tutto il corpo. Il sangue fornisce ossigeno e nutrienti agli organi e rimuove l\'anidride carbonica e i rifiuti.',
      structure:'4 camere: 2 atri (superiori) e 2 ventricoli (inferiori). Valvole: mitrale, tricuspide, polmonare, aortica. Miocardio: muscolo cardiaco.',
      facts:[
        'Il cuore batte circa 100.000 volte al giorno',
        'Pompa circa 7.500 litri di sangue al giorno',
        'Il suono "lub-dub" è causato dalla chiusura delle valvole',
        'Il cuore inizia a battere 4 settimane dopo il concepimento',
        'Un cuore umano può continuare a batterre anche dopo essere stato disconnesso dal corpo'
      ],
      diseases:['Infarto miocardico','Insufficienza cardiaca','Aritmie','Cardiopatia coronarica'],
      connections:['lungs','brain','kidneys']
    },
    lungs: {
      name:'Polmoni', icon:'🫁', color:'#3498db',
      pos:'Nella cavità toracica, ai lati del cuore',
      size:'Circa 25 cm di altezza',
      weight:'1.100-1.200 grammi (entrambi)',
      func:'Scambiano ossigena e anidride carbonica con il sangue. L\'aria entra dalle vie aeree, raggiunge gli alveoli dove avviene lo scambio gassoso.',
      structure:'2 polmoni: destro (3 lobi) e sinistro (2 lobi). Bronchi: tubi che portano l\'aria. Alveoli: piccole sacche per lo scambio gassoso. Pleura: membrane protettive.',
      facts:[
        'I polmoni hanno una superficie totale di circa 70 m²',
        'Si espandono e si contraggono circa 20.000 volte al giorno',
        'Il polmone sinistro è leggermente più piccolo per fare spazio al cuore',
        'Gli alveoli, se messi in fila, coprirebbero un campo da tennis',
        'Respiriamo circa 20.000 volte al giorno'
      ],
      diseases:['Polmonite','Asma','BPCO','Embolia polmonare','Cancro ai polmoni'],
      connections:['heart','brain']
    },
    brain: {
      name:'Cervello', icon:'🧠', color:'#9b59b6',
      pos:'Nella scatola cranica',
      size:'Circa 17 cm di lunghezza',
      weight:'1.300-1.400 grammi',
      func:'Centro di controllo del sistema nervoso. Gestisce pensieri, emozioni, movimenti, memoria, linguaggio e tutte le funzioni vitali del corpo.',
      structure:'Cervello: pensiero, memoria, emozioni. Cerebellum: coordinazione, equilibrio. Tronco encefalico: funzioni vitali. 4 lobi: frontale, parietale, occipitale, temporale.',
      facts:[
        'Il cervello ha circa 86 miliardi di neuroni',
        'Consuma circa il 20% dell\'energia totale del corpo',
        'È più attivo durante il sonno che durante la veglia',
        'Il cervello umano può generare circa 23 watt di energia',
        'La memoria a lungo termine può immagazzinare circa 2.5 petabyte'
      ],
      diseases:['Tumori al cervello','Ictus','Alzheimer','Parkinson','Epilessia'],
      connections:['heart','spinal cord']
    },
    liver: {
      name:'Fegato', icon:'🟤', color:'#8b4513',
      pos:'Quadrante superiore destro dell\'addome',
      size:'Circa 21 cm di altezza',
      weight:'1.400-1.600 grammi',
      func:'Filtra il sangue, produce bile per la digestione, immagazzina glicogeno, sintetizza proteine, disintossica sostanze nocive.',
      structure:'2 lobi: destro (grande) e sinistro (piccolo). Lobuli: unità funzionali. Dotti biliari: trasportano la bile. Vena porta: porta il sangue dall\'intestino.',
      facts:[
        'Il fegato è l\'organo interno più grande del corpo',
        'Ha oltre 500 funzioni documentate',
        'È l\'unico organo in grado di rigenerarsi completamente',
        'Filtra circa 1.400 litri di sangue al giorno',
        'La bile prodotta aiuta a digerire i grassi'
      ],
      diseases:['Epatite','Cirrosi epatica','Steatosi epatica','Cancro al fegato'],
      connections:['stomach','intestine','heart']
    },
    kidneys: {
      name:'Reni', icon:'🫘', color:'#e67e22',
      pos:'Nella parte posteriore dell\'addome, ai lati della colonna',
      size:'Circa 11 cm di altezza',
      weight:'120-170 grammi (ciascuno)',
      func:'Filtrano il sangue, rimuovono rifiuti e liquidi in eccesso, regolano la pressione sanguigna, producono ormoni.',
      structure:'2 reni: forma a fagiolo. Nefroni: unità filtranti (circa 1 milione per rene). Medulla e Corteccia. Ureteri: tubi che collegano i reni alla vescica.',
      facts:[
        'I reni filtrano circa 180 litri di sangue al giorno',
        'Producono circa 1-2 litri di urina al giorno',
        'I nefroni hanno una lunghezza totale di circa 80 km',
        'I reni ricevono circa il 20-25% del sangue pompato dal cuore',
        'Un solo rene può mantenere in vita una persona'
      ],
      diseases:['Insufficienza renale','Calcoli renali','Infezioni delle vie urinarie','Glomerulonefrite'],
      connections:['heart','bladder']
    },
    stomach: {
      name:'Stomaco', icon:'🟠', color:'#f39c12',
      pos:'Quadrante superiore sinistro dell\'addome',
      size:'Circa 25 cm di lunghezza',
      weight:'150-200 grammi',
      func:'Digere il cibo con acidi cloridrici ed enzimi. Trasforma il cibo in chimo per l\'assorbimento nell\'intestino tenue.',
      structure:'Cardias: ingresso. Fundo: parte superiore. Corpo: parte centrale. Piloro: uscita. Rughe: pieghe interne che si espandono.',
      facts:[
        'L\'acido dello stomaco può dissolvere metalli',
        'Lo stomaco produce un nuovo strato di muco ogni 2 settimane',
        'Il cibo rimane nello stomaco per 2-5 ore',
        'Lo stomaco può espandersi fino a 40 volte la sua dimensione',
        'Il suono dello stomaco è causato dalla contrazione dei muscoli'
      ],
      diseases:['Gastrite','Ulcere peptiche','Reflusso gastroesofageo','Cancro allo stomaco'],
      connections:['esophagus','intestine','liver']
    },
    intestine: {
      name:'Intestino', icon:'🟡', color:'#f1c40f',
      pos:'Nella cavità addominale',
      size:'Circa 7-8 metri di lunghezza',
      weight:'2-3 kilogrammi',
      func:'Assorbe i nutrienti dall\'alimento digerito ed espelle i rifiuti solidi attraverso il retto e l\'ano.',
      structure:'Intestino tenue: circa 6 metri (digiuno, ileo). Intestino crasso: circa 1.5 metri (cieco, colon, retto). Villi: proiezioni per l\'assorbimento.',
      facts:[
        'La superficie interna è circa grande quanto un campo da tennis',
        'L\'intestino crasso ospita circa 100 trilioni di batteri',
        'Il cibo impiega 12-36 ore per attraversare l\'intero tratto',
        'L\'appendice potrebbe servire come riserva di batteri benefici',
        'L\'intestino è lungo circa 2.5 volte l\'altezza di una persona'
      ],
      diseases:['Appendicite','Morbo di Crohn','Colite ulcerosa','Sindrome dell\'intestino irritabile','Cancro al colon'],
      connections:['stomach','liver']
    },
    spleen: {
      name:'Milza', icon:'🟣', color:'#8e44ad',
      pos:'Quadrante superiore sinistro dell\'addome',
      size:'Circa 12 cm di lunghezza',
      weight:'150-200 grammi',
      func:'Filtra il sangue, rimuove i globuli rossi vecchi o danneggiati, immagazzina piastrine e globuli bianchi, supporta il sistema immunitario.',
      structure:'Polpa rossa: filtra il sangue. Polpa bianca: supporta il sistema immunitario. Capsula: involucro esterno.',
      facts:[
        'La milza contiene circa 250 ml di sangue',
        'È l\'organo più grande del sistema linfatico',
        'Può crescere fino a 20 volte la sua dimensione normale in risposta a infezioni',
        'Alcune persone vivono senza milza',
        'La milza aiuta a combattere le infezioni batteriche'
      ],
      diseases:['Splenomegalia','Rottura della milza','Anemia emolitica','Trombocitopenia'],
      connections:['heart','intestine']
    },
    pancreas: {
      name:'Pancreas', icon:'🔵', color:'#2980b9',
      pos:'Nella parte posteriore dell\'addome, dietro lo stomaco',
      size:'Circa 15 cm di lunghezza',
      weight:'80-100 grammi',
      func:'Produce insulina e glucagone per regolare la glicemia, enzimi digestivi per il duodeno.',
      structure:'Testa: parte vicina al duodeno. Corpo: parte centrale. Coda: parte vicina alla milza. Dotti pancreatici: trasportano enzimi e insulina.',
      facts:[
        'Il pancreas produce circa 1 litro di succo pancreatico al giorno',
        'Le isole di Langerhans producono insulina e glucagone',
        'Il pancreas inizia a formarsi circa 3 settimane dopo il concepimento',
        'Il diabete di tipo 1 è causato dalla distruzione delle cellule che producono insulina',
        'Il pancreas ha sia funzioni esocrine che endocrine'
      ],
      diseases:['Pancreatite','Diabete di tipo 1 e 2','Cancro al pancreas','Insufficienza pancreatica'],
      connections:['stomach','intestine','liver']
    },
    bladder: {
      name:'Vescica', icon:'💧', color:'#1abc9c',
      pos:'Nella pelvi, dietro l\'osso pubico',
      size:'Circa 12 cm di altezza',
      weight:'40-80 grammi',
      func:'Immagazzina l\'urina prodotta dai reni fino a quando non viene espulsa attraverso l\'uretra.',
      structure:'Detrusore: muscolo che contrae la vescica. Sfintere interno (involontario) ed esterno (volontario). Trigona: area triangolare.',
      facts:[
        'La vescica può espandersi fino a 20 volte la sua dimensione vuota',
        'L\'urina viene prodotta dai reni e scende attraverso gli ureteri',
        'Il bisogno di urinare inizia quando la vescica è circa mezza piena',
        'Una persona media urina circa 6-8 volte al giorno',
        'La vescica può contenere fino a 600 ml di urina'
      ],
      diseases:['Infezioni delle vie urinarie','Vescica iperattiva','Calcoli vescicali','Cancro alla vescica'],
      connections:['kidneys']
    }
  },
  quiz: [
    { q:'Quante camere ha il cuore?', a:['2','3','4','5'], correct:2 },
    { q:'Quale organo produce l\'insulina?', a:['Fegato','Pancreas','Reni','Milza'], correct:1 },
    { q:'Quanti neuroni ha il cervello circa?', a:['1 miliardo','10 miliardi','86 miliardi','100 miliardi'], correct:2 },
    { q:'Quale organello è l\'unico in grado di rigenerarsi completamente?', a:['Cuore','Polmoni','Fegato','Reni'], correct:2 },
    { q:'Quanti litri di sangue filtrano i reni al giorno?', a:['10 litri','50 litri','180 litri','500 litri'], correct:2 },
    { q:'Quale organo ha una superficie di circa 70 m²?', a:['Cuore','Polmoni','Fegato','Intestino'], correct:1 },
    { q:'Dove si trova il cuore nel corpo?', a:['Destro del petto','Centro del petto','Sinistra del petto','Sotto le costole'], correct:2 },
    { q:'Quanti litri di sangue pompa il cuore al giorno?', a:['1.000 litri','3.000 litri','7.500 litri','15.000 litri'], correct:2 },
    { q:'Quale organo supporta il sistema immunitario filtrando il sangue?', a:['Fegato','Milza','Pancreas','Reni'], correct:1 },
    { q:'Quanto cibo rimane nello stomaco in media?', a:['30 minuti','1-2 ore','2-5 ore','8-12 ore'], correct:2 },
    { q:'Quanti battiti al giorno fa il cuore?', a:['50.000','100.000','200.000','500.000'], correct:1 },
    { q:'Quale parte del cervello controlla la coordinazione?', a:['Cervello','Cerebellum','Tronco encefalico','Lobo frontale'], correct:1 },
    { q:'Quanti reni ha un essere umano normalmente?', a:['1','2','3','4'], correct:1 },
    { q:'Quale organo produce la bile?', a:['Pancreas','Fegato','Milza','Stomaco'], correct:1 },
    { q:'Quanto è lungo l\'intestino in totale?', a:['2-3 metri','5-6 metri','7-8 metri','10-12 metri'], correct:2 }
  ]
};

/* ───────────── PANDEMIC MODE ───────────── */
G.PANDEMIC = {
  difficulties: {
    easy:   { dnaStart:50,  cureSpeed:0.5, doctorSpeed:0.3, label:'Beginner Virus',  emoji:'🟢' },
    normal: { dnaStart:30,  cureSpeed:0.8, doctorSpeed:0.5, label:'Common Flu',      emoji:'🟡' },
    hard:   { dnaStart:20,  cureSpeed:1.0, doctorSpeed:0.7, label:'Deadly Pathogen',  emoji:'🔴' },
    extreme:{ dnaStart:10,  cureSpeed:1.5, doctorSpeed:1.0, label:'COVID-24',        emoji:'⚫' }
  },
  countries: {
    italia:    { name:'Italia',    emoji:'🇮🇹', pop:60000000,   density:206, healthcare:85, travel:90 },
    usa:       { name:'USA',       emoji:'🇺🇸', pop:330000000,  density:36,  healthcare:90, travel:95 },
    cina:      { name:'Cina',      emoji:'🇨🇳', pop:1400000000, density:153, healthcare:80, travel:85 },
    brasil:    { name:'Brasile',   emoji:'🇧🇷', pop:210000000,  density:25,  healthcare:70, travel:80 },
    india:     { name:'India',     emoji:'🇮🇳', pop:1400000000, density:464, healthcare:60, travel:75 },
    uk:        { name:'UK',        emoji:'🇬🇧', pop:67000000,   density:281, healthcare:88, travel:92 },
    giappone:  { name:'Giappone',  emoji:'🇯🇵', pop:126000000,  density:347, healthcare:92, travel:88 },
    australia: { name:'Australia', emoji:'🇦🇺', pop:26000000,   density:3,   healthcare:87, travel:82 },
    canada:    { name:'Canada',    emoji:'🇨🇦', pop:38000000,   density:4,   healthcare:89, travel:87 },
    germania:  { name:'Germania',  emoji:'🇩🇪', pop:83000000,   density:240, healthcare:91, travel:93 }
  },
  mutations: [
    { id:'airborne',   name:'Trasmissione Aerea',     icon:'🦅', cost:30, effect:{trans:30} },
    { id:'waterborne', name:'Trasmissione Acqua',      icon:'💧', cost:25, effect:{trans:20} },
    { id:'vector',     name:'Trasmissione Vettoriale', icon:'🦟', cost:28, effect:{trans:25} },
    { id:'lethal_low', name:'Letalità Bassa',          icon:'💀', cost:15, effect:{let:-10,inc:20} },
    { id:'lethal_high',name:'Letalità Alta',           icon:'💀', cost:35, effect:{let:40,inc:-10} },
    { id:'antibiotic', name:'Resistenza Antibiotici',  icon:'🛡️', cost:30, effect:{res:50} },
    { id:'vaccine_res',name:'Resistenza Vaccino',      icon:'💉', cost:32, effect:{res:40} },
    { id:'silent',     name:'Incubazione Silenziosa',  icon:'⏱️', cost:28, effect:{inc:60} },
    { id:'fast_mut',   name:'Mutazione Veloce',        icon:'🧬', cost:40, effect:{adapt:50} },
    { id:'hospital',   name:'Resistenza Ospedaliera',  icon:'🏥', cost:35, effect:{res:30} }
  ],
  doctors: [
    { id:'reynolds', name:'Dr. Reynolds', emoji:'👨‍⚕️', action:'Cerca cura',       effect:10, desc:'Searching for a cure...' },
    { id:'ada',      name:'Dr. Ada',      emoji:'👩‍⚕️', action:'Prepara vaccino',  effect:5,  desc:'Developing vaccine...' },
    { id:'marco',    name:'Dr. Marco',    emoji:'👨‍⚕️', action:'Isola pazienti',   effect:-20,desc:'Quarantining patients...' },
    { id:'sofia',    name:'Dr. Sofia',    emoji:'👩‍⚕️', action:'Campagna info',    effect:-15,desc:'Public awareness campaign...' },
    { id:'giuseppe', name:'Dr. Giuseppe', emoji:'👨‍⚕️', action:'Test di massa',    effect:8,  desc:'Mass testing in progress...' }
  ],
  events: [
    { id:'mutation',    name:'Mutazione Casuale',     icon:'🧬', desc:'Your virus has mutated randomly!' },
    { id:'cure_boost',  name:'Cura Avanzata',         icon:'🔬', desc:'Doctors found a breakthrough!' },
    { id:'travel_ban',  name:'Viaggi Sospesi',        icon:'✈️', desc:'Countries closed borders!' },
    { id:'vaccine',     name:'Vaccino Scoperto',      icon:'💉', desc:'A vaccine has been developed!' },
    { id:'super_spreader',name:'Super Spreader',      icon:'🦠', desc:'One person infected 100 others!' },
    { id:'drug_resist', name:'Farmaco Resistenza',    icon:'💊', desc:'Your virus resists treatment!' }
  ]
};

/* ───────────── VETERINARY MODE ───────────── */
G.VETERINARY = {
  animals: {
    cane:      { name:'Cane',      emoji:'🐶', hearts:1, difficulty:1,   desc:'Man\'s best friend', special:'Loyalty bond', complications:['bite_infection','hip_dysplasia','gastric_torsion','road_trauma'] },
    gatto:     { name:'Gatto',     emoji:'🐱', hearts:1, difficulty:2,   desc:'Independent and agile', special:'Stealth mode', complications:['kidney_disease','urinary_block','fight_wounds','parasites'] },
    coniglio:  { name:'Coniglio',  emoji:'🐰', hearts:1, difficulty:2,   desc:'Delicate and fragile', special:'Quick healing', complications:['dental_disease','gi_stasis','myxomatosis','leg_fracture'] },
    delfino:   { name:'Delfino',   emoji:'🐳', hearts:1, difficulty:3,   desc:'Aquatic mammal', special:'Echolocation', complications:['fin_infection','respiratory_distress','algae_poisoning','boat_trauma'] },
    cavallo:   { name:'Cavallo',   emoji:'🐴', hearts:1, difficulty:3,   desc:'Gentle giant', special:'Endurance', complications:['laminitis','colic','fractures','wound_infection'] },
    aquila:    { name:'Aquila',    emoji:'🦅', hearts:2, difficulty:4,   desc:'Majestic predator', special:'Eagle eye vision', complications:['wing_fracture','prey_poison','parasites','collision_trauma'] },
    polpo:     { name:'Polpo',     emoji:'🐙', hearts:3, difficulty:4,   desc:'Eight-armed genius', special:'Ink cloud', complications:['tentacle_infection','beak_block','food_poisoning','predator_attack'] },
    drago:     { name:'Drago',     emoji:'🐉', hearts:4, difficulty:5,   desc:'Legendary creature', special:'Dragon fire', complications:['internal_fire','scale_infection','wing_damage','dragon_venom'] },
    mucca:     { name:'Mucca',     emoji:'🐄', hearts:1, difficulty:1,   desc:'Gentle farm giant', special:'Magic milk', complications:['retained_placenta','mastitis','gastric_rotation','hoof_wound'] },
    maiale:    { name:'Maiale',    emoji:'🐷', hearts:1, difficulty:1,   desc:'Smart and sensitive', special:'Super nose', complications:['pig_pneumonia','lameness','ear_necrosis','heat_stress'] },
    pecora:    { name:'Pecora',    emoji:'🐑', hearts:1, difficulty:2,   desc:'Woolly and gentle', special:'Warm wool', complications:['pregnancy_toxemia','flystrike','bloat','foot_rot'] },
    tartaruga: { name:'Tartaruga', emoji:'🐢', hearts:1, difficulty:2,   desc:'Ancient and wise', special:'Shell armor', complications:['shell_fracture','resp_infection','eye_infection','vitamin_deficiency'] },
    leone:     { name:'Leone',     emoji:'🦁', hearts:2, difficulty:3,   desc:'King of the jungle', special:'Raw power', complications:['paw_infection','territory_wounds','heat_exhaustion','dental_disease'] },
    orso:      { name:'Orso',      emoji:'🐻', hearts:2, difficulty:3,   desc:'Mighty hibernator', special:'Hibernation', complications:['claw_injury','hibernation_complications','parasites','food_poisoning'] },
    squalo:    { name:'Squalo',    emoji:'🦈', hearts:2, difficulty:4,   desc:'Apex marine predator', special:'Electric sense', complications:['fin_rot','gill_disease','skin_parasites','boat_strike'] },
    unicorno:  { name:'Unicorno',  emoji:'🦄', hearts:3, difficulty:5,   desc:'Magical being', special:'Healing horn', complications:['horn_fracture','magic_loss','wing_damage','rainbow_poison'] }
  },
  instruments: [
    { id:'vet_stethoscope',   name:'Stetoscopio Vet',   emoji:'🩺', desc:'Detect hidden problems',      animals:'all' },
    { id:'claw_forceps',      name:'Forceps Artigli',   emoji:'🩹', desc:'Contain dangerous claws',     animals:['gatto','drago'] },
    { id:'micro_forceps',     name:'Micro-Forceps',     emoji:'🔬', desc:'Miniaturized interventions',  animals:['coniglio'] },
    { id:'aquatic_tools',     name:'Strumenti Acquatici',emoji:'🌊',desc:'Operate underwater',          animals:['delfino','polpo'] },
    { id:'equine_tools',      name:'Strumenti Equini',  emoji:'🐴', desc:'Hoof and leg tools',          animals:['cavallo'] },
    { id:'avian_tools',       name:'Strumenti Aviari',  emoji:'🪶', desc:'Flight system instruments',   animals:['aquila'] },
    { id:'containment_net',   name:'Rete Contenimento', emoji:'🥅', desc:'Contain nervous animals',     animals:'all' },
    { id:'antidote',          name:'Veleno Antidoto',   emoji:'💉', desc:'Neutralize venoms',           animals:['drago','polpo'] },
    { id:'farm_tools',        name:'Strumenti Fattoria', emoji:'🌾', desc:'Farm animal tools',          animals:['mucca','maiale','pecora'] },
    { id:'reptile_tools',     name:'Strumenti Rettili',  emoji:'🐢', desc:'Shell and scale tools',      animals:['tartaruga'] },
    { id:'bigcat_tools',      name:'Strumenti Grandi Felini',emoji:'🦁',desc:'Contain big cats',         animals:['leone'] },
    { id:'bear_tools',        name:'Strumenti Orso',     emoji:'🐻', desc:'Bear examination tools',     animals:['orso'] },
    { id:'marine_predator_tools',name:'Strumenti Predatori Marini',emoji:'🦈',desc:'Deep sea tools',     animals:['squalo'] },
    { id:'magic_tools',       name:'Strumenti Magici',   emoji:'✨', desc:'Magical healing instruments',animals:['unicorno'] }
  ],
  complications: [
    { id:'bite_infection',      name:'Morso Infetto',         emoji:'🦷', severity:2, animal:'cane',     desc:'Infected bite wound' },
    { id:'hip_dysplasia',       name:'Displasia',             emoji:'🦴', severity:3, animal:'cane',     desc:'Hip joint problems' },
    { id:'gastric_torsion',     name:'Torsione Gastrica',     emoji:'🌀', severity:4, animal:'cane',     desc:'Stomach twist emergency' },
    { id:'road_trauma',         name:'Trauma Stradale',       emoji:'🚑', severity:3, animal:'cane',     desc:'Road accident injuries' },
    { id:'kidney_disease',      name:'Malattia Renale',       emoji:'🫘', severity:3, animal:'gatto',    desc:'Kidney function decline' },
    { id:'urinary_block',       name:'Blocco Urinario',       emoji:'💧', severity:4, animal:'gatto',    desc:'Urinary tract blockage' },
    { id:'fight_wounds',        name:'Ferite da Lotta',       emoji:'⚔️', severity:2, animal:'gatto',    desc:'Cat fight injuries' },
    { id:'parasites',           name:'Parassiti',             emoji:'🪱', severity:1, animal:'all',      desc:'Internal parasites' },
    { id:'dental_disease',      name:'Malattia Dentale',      emoji:'🦷', severity:2, animal:'coniglio', desc:'Dental malocclusion' },
    { id:'gi_stasis',           name:'Stasi Intestinale',     emoji:'🐰', severity:3, animal:'coniglio', desc:'GI tract shutdown' },
    { id:'myxomatosis',         name:'Mixomatosi',            emoji:'🤒', severity:4, animal:'coniglio', desc:'Viral disease' },
    { id:'leg_fracture',        name:'Frattura Zampe',        emoji:'🦵', severity:3, animal:'coniglio', desc:'Leg bone fracture' },
    { id:'fin_infection',       name:'Infezione Pinne',       emoji:'🐬', severity:3, animal:'delfino',  desc:'Fin rot infection' },
    { id:'respiratory_distress',name:'Distress Respiratorio', emoji:'💨', severity:4, animal:'delfino',  desc:'Breathing difficulty' },
    { id:'algae_poisoning',     name:'Avvelenamento Alghe',   emoji:'🌿', severity:3, animal:'delfino',  desc:'Algae toxin exposure' },
    { id:'boat_trauma',         name:'Trauma Barca',          emoji:'⛵', severity:4, animal:'delfino',  desc:'Boat propeller strike' },
    { id:'laminitis',           name:'Laminiti',              emoji:'🐴', severity:3, animal:'cavallo',  desc:'Hoof inflammation' },
    { id:'colic',               name:'Colica',                emoji:'💊', severity:4, animal:'cavallo',  desc:'Abdominal pain crisis' },
    { id:'fractures',           name:'Fratture',              emoji:'🦴', severity:3, animal:'cavallo',  desc:'Bone fractures' },
    { id:'wound_infection',     name:'Infezione Ferite',      emoji:'🩹', severity:2, animal:'cavallo',  desc:'Open wound infection' },
    { id:'wing_fracture',       name:'Frattura Ala',          emoji:'🦅', severity:4, animal:'aquila',   desc:'Broken wing bone' },
    { id:'prey_poison',         name:'Avvelenamento Preda',   emoji:'☠️', severity:3, animal:'aquila',   desc:'Toxic prey ingestion' },
    { id:'collision_trauma',    name:'Trauma Collisione',     emoji:'💥', severity:4, animal:'aquila',   desc:'High-speed collision' },
    { id:'tentacle_infection',  name:'Infezione Tentacoli',   emoji:'🐙', severity:3, animal:'polpo',    desc:'Arm infection' },
    { id:'beak_block',          name:'Blocco Becco',          emoji:'🪶', severity:2, animal:'polpo',    desc:'Beak obstruction' },
    { id:'food_poisoning',      name:'Avvelenamento Cibo',    emoji:'🤢', severity:3, animal:'polpo',    desc:'Toxic food exposure' },
    { id:'predator_attack',     name:'Attacco Predatori',     emoji:'🦈', severity:4, animal:'polpo',    desc:'Shark or whale attack' },
    { id:'internal_fire',       name:'Fuoco Interno',         emoji:'🔥', severity:5, animal:'drago',    desc:'Internal reflux fire' },
    { id:'scale_infection',     name:'Scaglie Infette',       emoji:'🐉', severity:3, animal:'drago',    desc:'Scale rot disease' },
    { id:'wing_damage',         name:'Danno Ali',             emoji:'🦇', severity:4, animal:'drago',    desc:'Damaged flight wings' },
    { id:'dragon_venom',        name:'Veleno Drago',          emoji:'💉', severity:5, animal:'drago',    desc:'Dragon venom toxicity' },
    { id:'retained_placenta',   name:'Ritenzione Placenta',   emoji:'🐄', severity:3, animal:'mucca',    desc:'Post-birth emergency' },
    { id:'mastitis',            name:'Mastite',               emoji:'🥛', severity:3, animal:'mucca',    desc:'Udder infection' },
    { id:'gastric_rotation',    name:'Rotazione Stomaco',     emoji:'🌀', severity:4, animal:'mucca',    desc:'Stomach torsion' },
    { id:'hoof_wound',          name:'Ferita Zampa',          emoji:'🦶', severity:2, animal:'mucca',    desc:'Hoof injury' },
    { id:'pig_pneumonia',       name:'Polmonite',             emoji:'💨', severity:3, animal:'maiale',   desc:'Lung infection' },
    { id:'lameness',            name:'Zoppia',                emoji:'🦵', severity:2, animal:'maiale',   desc:'Walking difficulty' },
    { id:'ear_necrosis',        name:'Necrosi Orecchie',      emoji:'👂', severity:3, animal:'maiale',   desc:'Ear tissue death' },
    { id:'heat_stress',         name:'Stress Calore',         emoji:'☀️', severity:3, animal:'maiale',   desc:'Heat exhaustion' },
    { id:'pregnancy_toxemia',   name:'Tossicosi Gravidica',   emoji:'🤰', severity:4, animal:'pecora',   desc:'Pregnancy poisoning' },
    { id:'flystrike',           name:'Miasi',                 emoji:'🪰', severity:3, animal:'pecora',   desc:'Fly larvae infestation' },
    { id:'bloat',               name:'Timpanite',             emoji:'🎈', severity:4, animal:'pecora',   desc:'Gas retention' },
    { id:'foot_rot',            name:'Podagra',               emoji:'🦶', severity:2, animal:'pecora',   desc:'Hoof rot disease' },
    { id:'shell_fracture',      name:'Frattura Guscio',       emoji:'🐢', severity:4, animal:'tartaruga',desc:'Broken shell' },
    { id:'resp_infection',      name:'Infezione Respiratoria',emoji:'🫁', severity:3, animal:'tartaruga',desc:'Breathing infection' },
    { id:'eye_infection',       name:'Infezione Occhi',       emoji:'👁️', severity:2, animal:'tartaruga',desc:'Eye infection' },
    { id:'vitamin_deficiency',  name:'Carenza Vitaminica',    emoji:'💊', severity:2, animal:'tartaruga',desc:'Vitamin deficiency' },
    { id:'paw_infection',       name:'Infezione Zampe',       emoji:'🦁', severity:3, animal:'leone',    desc:'Paw infection' },
    { id:'territory_wounds',    name:'Ferite Territoriale',   emoji:'⚔️', severity:4, animal:'leone',    desc:'Fight wounds' },
    { id:'heat_exhaustion',     name:'Esaurimento Calore',    emoji:'🥵', severity:3, animal:'leone',    desc:'Heat stroke' },
    { id:'dental_disease',      name:'Malattia Dentale',      emoji:'🦷', severity:2, animal:'leone',    desc:'Tooth problems' },
    { id:'claw_injury',         name:'Infezione Artigli',     emoji:'🐾', severity:3, animal:'orso',     desc:'Claw infection' },
    { id:'hibernation_complications',name:'Complicazioni Ibernazione',emoji:'😴',severity:4,animal:'orso',desc:'Hibernation issues' },
    { id:'food_poisoning',      name:'Avvelenamento Cibo',    emoji:'🤢', severity:3, animal:'orso',     desc:'Toxic food' },
    { id:'fin_rot',             name:'Ruggine Pinne',         emoji:'🦈', severity:3, animal:'squalo',   desc:'Fin rot disease' },
    { id:'gill_disease',        name:'Malattia Branchie',     emoji:'🫧', severity:4, animal:'squalo',   desc:'Gill infection' },
    { id:'skin_parasites',      name:'Parassiti Pelle',       emoji:'🪱', severity:2, animal:'squalo',   desc:'Skin parasites' },
    { id:'boat_strike',         name:'Trauma Barca',          emoji:'⛵', severity:4, animal:'squalo',   desc:'Propeller strike' },
    { id:'horn_fracture',       name:'Frattura Corno',        emoji:'🦄', severity:4, animal:'unicorno', desc:'Broken horn' },
    { id:'magic_loss',          name:'Perdita Magia',         emoji:'✨', severity:3, animal:'unicorno', desc:'Lost magic powers' },
    { id:'rainbow_poison',      name:'Veleno Arcobaleno',     emoji:'🌈', severity:4, animal:'unicorno', desc:'Rainbow toxicity' }
  ],
  procedures: {
    cane: [
      { step:1, text:'Examine the wound',              tool:'vet_stethoscope', target:'wound',     time:6000, points:100 },
      { step:2, text:'Clean the infection',             tool:'sutures',         target:'infection', time:5000, points:120 },
      { step:3, text:'Apply antibiotic ointment',       tool:'antihist',        target:'skin',      time:4000, points:100 },
      { step:4, text:'Suture the wound closed',         tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply protective bandage',        tool:'castapp',         target:'body',      time:3000, points:80 }
    ],
    gatto: [
      { step:1, text:'Locate the injury stealthily',    tool:'vet_stethoscope', target:'hidden',    time:5000, points:110 },
      { step:2, text:'Restrain with claw forceps',      tool:'claw_forceps',    target:'claws',     time:4000, points:120 },
      { step:3, text:'Clean and disinfect',             tool:'sutures',         target:'wound',     time:5000, points:100 },
      { step:4, text:'Suture with precision',           tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply healing salve',             tool:'antihist',        target:'skin',      time:3000, points:80 }
    ],
    coniglio: [
      { step:1, text:'Gently examine the delicate body', tool:'vet_stethoscope', target:'body',      time:5000, points:110 },
      { step:2, text:'Use micro-forceps on tiny wound',  tool:'micro_forceps',   target:'wound',     time:6000, points:140 },
      { step:3, text:'Clean with antiseptic',            tool:'antihist',        target:'skin',      time:4000, points:100 },
      { step:4, text:'Apply tiny sutures',               tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Wrap in protective bandage',       tool:'castapp',         target:'body',      time:3000, points:80 }
    ],
    delfino: [
      { step:1, text:'Use echolocation to find problem', tool:'vet_stethoscope', target:'internal',  time:6000, points:130 },
      { step:2, text:'Operate underwater with aquatic tools', tool:'aquatic_tools', target:'fin',  time:7000, points:150 },
      { step:3, text:'Clean the infection site',         tool:'sutures',         target:'infection', time:5000, points:110 },
      { step:4, text:'Suture the fin tissue',            tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply healing compound',           tool:'antihist',        target:'skin',      time:3000, points:80 }
    ],
    cavallo: [
      { step:1, text:'Examine the massive body',         tool:'vet_stethoscope', target:'body',      time:6000, points:120 },
      { step:2, text:'Use equine tools on the hoof',     tool:'equine_tools',    target:'hoof',      time:7000, points:150 },
      { step:3, text:'Clean and disinfect',              tool:'sutures',         target:'wound',     time:5000, points:110 },
      { step:4, text:'Suture with heavy thread',         tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply protective cast',            tool:'castapp',         target:'leg',       time:4000, points:100 }
    ],
    aquila: [
      { step:1, text:'Use eagle eye to locate damage',   tool:'vet_stethoscope', target:'internal',  time:6000, points:130 },
      { step:2, text:'Use avian tools on wing',          tool:'avian_tools',     target:'wing',      time:7000, points:150 },
      { step:3, text:'Clean feather follicles',          tool:'antihist',        target:'skin',      time:5000, points:110 },
      { step:4, text:'Suture wing membrane',             tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply flight bandage',             tool:'castapp',         target:'wing',      time:4000, points:100 }
    ],
    polpo: [
      { step:1, text:'Navigate ink cloud to find patient', tool:'vet_stethoscope', target:'hidden',  time:6000, points:130 },
      { step:2, text:'Use aquatic tools on tentacles',   tool:'aquatic_tools',    target:'arm',      time:7000, points:150 },
      { step:3, text:'Clean beak area',                  tool:'antihist',         target:'beak',     time:5000, points:110 },
      { step:4, text:'Suture tentacle tissue',           tool:'sutures',          target:'incision', time:6000, points:150 },
      { step:5, text:'Apply marine healing salve',       tool:'antihist',         target:'skin',     time:3000, points:80 }
    ],
    drago: [
      { step:1, text:'Shield from dragon fire',          tool:'containment_net',  target:'fire',     time:6000, points:150 },
      { step:2, text:'Use antidote on venom',            tool:'antidote',         target:'venom',    time:7000, points:160 },
      { step:3, text:'Operate on scaled hide',           tool:'equine_tools',     target:'scales',   time:7000, points:150 },
      { step:4, text:'Suture internal organs',           tool:'sutures',          target:'incision', time:8000, points:180 },
      { step:5, text:'Apply dragon healing salve',       tool:'antihist',         target:'skin',     time:4000, points:100 },
      { step:6, text:'Reinforce wing membrane',          tool:'castapp',          target:'wing',     time:5000, points:120 }
    ],
    mucca: [
      { step:1, text:'Examine the massive body',         tool:'vet_stethoscope', target:'body',      time:6000, points:100 },
      { step:2, text:'Use farm tools on udder',          tool:'farm_tools',      target:'udder',     time:6000, points:120 },
      { step:3, text:'Clean infection site',             tool:'antihist',        target:'infection', time:5000, points:110 },
      { step:4, text:'Suture tissue',                    tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply healing bandage',            tool:'castapp',         target:'body',      time:3000, points:80 }
    ],
    maiale: [
      { step:1, text:'Use sensitive nose to find problem',tool:'vet_stethoscope', target:'hidden',    time:5000, points:110 },
      { step:2, text:'Use farm tools on affected area',  tool:'farm_tools',      target:'wound',     time:5000, points:120 },
      { step:3, text:'Clean and disinfect',              tool:'antihist',        target:'skin',      time:4000, points:100 },
      { step:4, text:'Suture with care',                 tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply protective wrap',            tool:'castapp',         target:'body',      time:3000, points:80 }
    ],
    pecora: [
      { step:1, text:'Shear wool to expose wound',       tool:'vet_stethoscope', target:'hidden',    time:5000, points:110 },
      { step:2, text:'Use farm tools on hoof',           tool:'farm_tools',      target:'hoof',      time:6000, points:120 },
      { step:3, text:'Clean infection',                  tool:'antihist',        target:'wound',     time:5000, points:100 },
      { step:4, text:'Suture wound',                     tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply healing salve',              tool:'antihist',        target:'skin',      time:3000, points:80 }
    ],
    tartaruga: [
      { step:1, text:'Use reptile tools on shell',       tool:'reptile_tools',   target:'shell',     time:6000, points:130 },
      { step:2, text:'Repair shell fracture',            tool:'reptile_tools',   target:'fracture',  time:7000, points:150 },
      { step:3, text:'Clean respiratory tract',          tool:'antihist',        target:'lungs',     time:5000, points:110 },
      { step:4, text:'Suture internal tissue',           tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply shell patch',                tool:'castapp',         target:'shell',     time:4000, points:100 }
    ],
    leone: [
      { step:1, text:'Contain with net',                 tool:'containment_net', target:'body',      time:5000, points:120 },
      { step:2, text:'Use big cat tools on wound',       tool:'bigcat_tools',    target:'wound',     time:6000, points:140 },
      { step:3, text:'Clean infection',                  tool:'antihist',        target:'infection', time:5000, points:110 },
      { step:4, text:'Suture deep wound',                tool:'sutures',         target:'incision',  time:7000, points:160 },
      { step:5, text:'Apply healing compound',           tool:'antihist',        target:'skin',      time:4000, points:100 },
      { step:6, text:'Apply protective bandage',         tool:'castapp',         target:'body',      time:3000, points:80 }
    ],
    orso: [
      { step:1, text:'Use bear tools to examine',        tool:'bear_tools',      target:'body',      time:6000, points:130 },
      { step:2, text:'Clean claw infection',             tool:'antihist',        target:'claws',     time:5000, points:110 },
      { step:3, text:'Operate on hibernation gland',     tool:'bigcat_tools',    target:'internal',  time:7000, points:160 },
      { step:4, text:'Suture tissue',                    tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Apply antidote',                   tool:'antidote',        target:'toxin',     time:5000, points:120 },
      { step:6, text:'Apply healing wrap',               tool:'castapp',         target:'body',      time:3000, points:80 }
    ],
    squalo: [
      { step:1, text:'Navigate underwater to find patient',tool:'vet_stethoscope', target:'hidden',    time:6000, points:130 },
      { step:2, text:'Use marine predator tools',        tool:'marine_predator_tools',target:'fin',  time:7000, points:150 },
      { step:3, text:'Clean fin rot',                    tool:'antihist',        target:'fin',       time:5000, points:110 },
      { step:4, text:'Repair gills',                     tool:'marine_predator_tools',target:'gills',time:6000, points:150 },
      { step:5, text:'Remove skin parasites',            tool:'micro_forceps',   target:'skin',      time:6000, points:140 },
      { step:6, text:'Apply healing gel',                tool:'antihist',        target:'skin',      time:3000, points:80 }
    ],
    unicorno: [
      { step:1, text:'Use magic tools to assess horn',   tool:'magic_tools',     target:'horn',      time:6000, points:150 },
      { step:2, text:'Repair horn fracture',             tool:'magic_tools',     target:'fracture',  time:7000, points:160 },
      { step:3, text:'Restore magic energy',             tool:'antidote',        target:'magic',     time:6000, points:140 },
      { step:4, text:'Suture wing membrane',             tool:'sutures',         target:'incision',  time:6000, points:150 },
      { step:5, text:'Clean rainbow toxins',             tool:'antihist',        target:'skin',      time:5000, points:110 },
      { step:6, text:'Apply magical healing salve',      tool:'antihist',        target:'body',      time:4000, points:120 }
    ]
  }
};

/* ───────────── SOUND EFFECTS ───────────── */
G.SOUNDS = {
  scalpel:    { freq:800,  dur:0.08, type:'sawtooth', vol:0.15 },
  sutures:    { freq:400,  dur:0.04, type:'sine',     vol:0.12 },
  clamp:      { freq:2200, dur:0.02, type:'square',   vol:0.10 },
  defib:      { freq:80,   dur:0.4,  type:'sawtooth', vol:0.25 },
  laser:      { freq:1200, dur:0.25, type:'sawtooth', vol:0.12 },
  endoscope:  { freq:300,  dur:0.1,  type:'sine',     vol:0.08 },
  forceps:    { freq:1800, dur:0.03, type:'square',   vol:0.08 },
  retractor:  { freq:500,  dur:0.06, type:'triangle', vol:0.10 },
  bonesaw:    { freq:600,  dur:0.15, type:'sawtooth', vol:0.14 },
  castapp:    { freq:350,  dur:0.08, type:'sine',     vol:0.10 },
  epiinject:  { freq:1000, dur:0.05, type:'square',   vol:0.12 },
  antihist:   { freq:700,  dur:0.1,  type:'sine',     vol:0.08 },
  ultrasound: { freq:250,  dur:0.12, type:'sine',     vol:0.06 },
  hyperbaric: { freq:150,  dur:0.2,  type:'triangle', vol:0.10 },
  fetalmon:   { freq:500,  dur:0.06, type:'sine',     vol:0.10 },
  csection:   { freq:900,  dur:0.1,  type:'sawtooth', vol:0.12 },
  hit:        { freq:880,  dur:0.12, type:'sine',     vol:0.18 },
  miss:       { freq:180,  dur:0.25, type:'square',   vol:0.15 },
  alert:      { freq:600,  dur:0.15, type:'square',   vol:0.20 },
  fanfare:    { freq:523,  dur:0.35, type:'sine',     vol:0.20 },
  heartbeat:  { freq:70,   dur:0.08, type:'sine',     vol:0.18 },
  complication:{ freq:400, dur:0.2,  type:'square',   vol:0.22 },
  click:      { freq:1200, dur:0.02, type:'sine',     vol:0.08 },
  powerup:    { freq:880,  dur:0.15, type:'sine',     vol:0.20 }
};

/* ───────────── TUTORIAL ───────────── */
G.TUTORIAL = {
  instruments: {
    scalpel:   { uses:['Making initial incisions','Cutting tissue','Removing organs'], stepTypes:['swipe'], chapters:[1,4,6,12], tip:'Follow the red line precisely for max accuracy!' },
    sutures:   { uses:['Closing wounds','Stitching tissue','Repairing organs'], stepTypes:['stitch'], chapters:[1,3,4,15], tip:'Tap each point in order — precision matters!' },
    endoscope: { uses:['Viewing inside the body','Guiding instruments','Locating objects'], stepTypes:['navigate'], chapters:[2,5,11], tip:'Navigate carefully — one wrong move and you lose visibility!' },
    forceps:   { uses:['Grabbing small objects','Extracting foreign bodies','Holding tissue'], stepTypes:['tap','swipe'], chapters:[2,6,16], tip:'Be gentle with forceps — they grip tightly!' },
    defib:     { uses:['Restoring heart rhythm','Cardiac resuscitation'], stepTypes:['timing'], chapters:[3,18], tip:'Watch the ECG — shock at the perfect moment!' },
    clamps:    { uses:['Stopping bleeding','Clamping arteries','Securing vessels'], stepTypes:['tap'], chapters:[3,9,15], tip:'Quick taps to clamp — speed saves lives!' },
    laser:     { uses:['Precise cutting','Tumor removal','Coagulation'], stepTypes:['swipe'], chapters:[4,17,19], tip:'Laser is ultra-precise — follow the path exactly!' },
    retractor: { uses:['Holding tissue open','Exposing organs','Improving visibility'], stepTypes:['tap'], chapters:[1,4,14], tip:'Retractors create space — tap to position them!' },
    bonesaw:   { uses:['Cutting bone','Removing casts','Drilling tunnels'], stepTypes:['swipe'], chapters:[6,14,17], tip:'Bone saw is powerful — control your speed!' },
    castapp:   { uses:['Applying casts','Wrapping fractures','Setting bones'], stepTypes:['tap'], chapters:[6,12,17], tip:'Wrap evenly — a good cast heals faster!' },
    epiinject: { uses:['Emergency injections','Treating anaphylaxis','Opening airways'], stepTypes:['tap'], chapters:[7], tip:'Epinephrine is time-critical — inject fast!' },
    antihist:  { uses:['Blocking allergic response','Reducing inflammation','Treating reactions'], stepTypes:['spray'], chapters:[7,13], tip:'Antihistamine calms the immune system!' },
    ultrasound:{ uses:['Seeing inside the body','Diagnosing conditions','Guiding procedures'], stepTypes:['tap'], chapters:[8,14], tip:'Ultrasound uses sound waves — no radiation!' },
    hyperbaric:{ uses:['Oxygen therapy','Decompression treatment','Wound healing'], stepTypes:['tap'], chapters:[8], tip:'Hyperbaric increases oxygen in your blood!' },
    fetalmon:  { uses:['Monitoring baby heartbeat','Tracking fetal health'], stepTypes:['tap'], chapters:[9,15], tip:'Fetal monitor tracks the baby\'s vital signs!' },
    csection:  { uses:['Emergency delivery','Cesarean section','Maternal rescue'], stepTypes:['swipe'], chapters:[9,15], tip:'C-section saves two lives — mother and baby!' }
  },
  stepTypes: {
    tap:      { name:'Tap', icon:'👆', desc:'Tap marked points quickly and accurately', uses:'Clamping vessels, injecting medication, positioning tools', example:'Chapter 1: Tap the artery points to clamp them' },
    swipe:    { name:'Swipe', icon:'👆', desc:'Swipe along the marked path precisely', uses:'Making incisions, cutting tissue, extracting objects', example:'Chapter 1: Swipe along the red line to open the abdomen' },
    stitch:   { name:'Stitch', icon:'🧵', desc:'Tap each stitch point in order', uses:'Closing wounds, repairing tissue, suturing organs', example:'Chapter 1: Tap each stitch point to close the wound' },
    navigate: { name:'Navigate', icon:'🔭', desc:'Guide the instrument through the body', uses:'Endoscopy, exploring cavities, locating objects', example:'Chapter 2: Guide the endoscope down the esophagus' },
    timing:   { name:'Timing', icon:'⏱️', desc:'Act at the perfect moment', uses:'Defibrillation, rhythm restoration', example:'Chapter 3: Shock when the ECG shows the right moment' },
    draw:     { name:'Draw', icon:'✏️', desc:'Draw a shape or pattern', uses:'Laser reconstruction, tissue repair', example:'Chapter 11: Draw crystal patterns to rebuild alien lungs' },
    spray:    { name:'Spray', icon:'💧', desc:'Apply treatment to an area', uses:'Medication, antiseptic, healing compounds', example:'Chapter 2: Spray to treat irritated tissue' }
  },
  quiz: [
    { q:'Which instrument do you use to close a wound?', a:['Scalpel 🔪','Sutures 🧵','Clamps 🔧','Ultrasound 📡'], correct:1, explain:'Sutures (thread and needle) are used to stitch wounds closed.' },
    { q:'What does the defibrillator do?', a:['Cut tissue','Stop bleeding','Restore heart rhythm','See inside body'], correct:2, explain:'Defibrillator delivers electric shock to restore normal heart rhythm.' },
    { q:'When do you use the endoscope?', a:['Making incisions','Viewing inside the body','Closing wounds','Stopping bleeding'], correct:1, explain:'Endoscope is a camera probe that lets you see inside the body.' },
    { q:'What stops bleeding vessels?', a:['Scalpel 🔪','Sutures 🧵','Clamps 🔧','Laser 🔴'], correct:2, explain:'Clamps pinch blood vessels to stop bleeding.' },
    { q:'What is the laser used for?', a:['Precise cutting','Viewing inside','Stopping heart','Applying casts'], correct:0, explain:'Laser provides ultra-precise cutting and coagulation.' },
    { q:'What does the retractor do?', a:['Hold tissue open','Cut bone','Suture wounds','Deliver shocks'], correct:0, explain:'Retractors hold tissue open to improve visibility.' },
    { q:'When do you use epinephrine?', a:['Broken bones','Allergic reactions','Brain tumors','Heart attacks'], correct:1, explain:'Epinephrine is emergency treatment for anaphylactic shock.' },
    { q:'What does the bone saw cut?', a:['Soft tissue','Bone and cast','Blood vessels','Skin'], correct:1, explain:'Bone saw cuts through bone and removes casts.' },
    { q:'What monitors the baby\'s heartbeat?', a:['Ultrasound 📡','Fetal Monitor 👶','Endoscope 🔭','Defibrillator ⚡'], correct:1, explain:'Fetal Monitor tracks the baby\'s heartbeat during pregnancy.' },
    { q:'When do you use hyperbaric therapy?', a:['Burns','Decompression sickness','Fractures','Allergies'], correct:1, explain:'Hyperbaric oxygen therapy treats decompression sickness (the bends).' },
    { q:'What does the cast applicator do?', a:['Cut bone','Apply casts','Stop bleeding','See inside'], correct:1, explain:'Cast Applicator wraps and sets fractures properly.' },
    { q:'Which step type uses timed precision?', a:['Tap 👆','Swipe 👆','Timing ⏱️','Stitch 🧵'], correct:2, explain:'Timing steps require you to act at the perfect moment.' },
    { q:'What is the purpose of forceps?', a:['Cutting tissue','Grabbing objects','Viewing inside','Stopping heart'], correct:1, explain:'Forceps provide precision grip for small objects and tissue.' },
    { q:'Which instrument treats allergic reactions?', a:['Scalpel 🔪','Epinephrine 💉','Antihistamine 💊','Laser 🔴'], correct:2, explain:'Antihistamine blocks histamine to treat allergic responses.' },
    { q:'What does the ultrasound use?', a:['Light waves','Sound waves','Electricity','Laser'], correct:1, explain:'Ultrasound uses sound waves to see inside the body.' }
  ]
};

/* ───────────── SANDBOX ORGANS ───────────── */
G.SANDBOX_ORGANS = [
  { id:'appendix',  name:'Appendix',       emoji:'🔴', chapter:1, tools:['scalpel','sutures','retractor','clamps'] },
  { id:'esophagus', name:'Esophagus',      emoji:'🟤', chapter:2, tools:['endoscope','forceps','sutures'] },
  { id:'heart',     name:'Heart',          emoji:'❤️', chapter:3, tools:['defib','clamps','sutures'] },
  { id:'brain',     name:'Brain',          emoji:'🧠', chapter:4, tools:['scalpel','laser','retractor','forceps'] },
  { id:'arm',       name:'Arm (Fracture)', emoji:'🦴', chapter:6, tools:['bonesaw','castapp','forceps','sutures','ultrasound'] },
  { id:'throat',    name:'Throat',         emoji:'🫁', chapter:7, tools:['epiinject','antihist','scalpel','clamps'] },
  { id:'vessels',   name:'Blood Vessels',  emoji:'🔴', chapter:8, tools:['ultrasound','hyperbaric','clamps'] },
  { id:'womb',      name:'Uterus',         emoji:'👶', chapter:9, tools:['ultrasound','fetalmon','csection','forceps','clamps','sutures'] }
];

/* ───────────── DAILY POOL ───────────── */
G.DAILY_TOOLS = ['scalpel','sutures','endoscope','forceps','defib','clamps','laser','retractor','bonesaw','castapp','epiinject','antihist','ultrasound','hyperbaric','fetalmon','csection'];

G.DAILY_STEP_POOL = [
  { type:'swipe',   tool:'scalpel',   name:'Incision',     path:'right_lower', time:10 },
  { type:'swipe',   tool:'scalpel',   name:'Cut Tissue',   path:'skull',       time:10 },
  { type:'swipe',   tool:'scalpel',   name:'Tracheotomy',  path:'throat',      time:8 },
  { type:'swipe',   tool:'bonesaw',   name:'Cut Cast',     path:'arm_cast',    time:10 },
  { type:'swipe',   tool:'forceps',   name:'Extract',      path:'extract',     time:10 },
  { type:'tap',     tool:'clamps',    name:'Clamp Vessel', points:3,           time:8 },
  { type:'tap',     tool:'forceps',   name:'Grab Object',  points:1,           time:6 },
  { type:'tap',     tool:'retractor', name:'Retract',      points:4,           time:8 },
  { type:'tap',     tool:'ultrasound',name:'Scan Area',    points:3,           time:8 },
  { type:'stitch',  tool:'sutures',   name:'Suture',       points:6,           time:14 },
  { type:'stitch',  tool:'sutures',   name:'Close Wound',  points:8,           time:16 },
  { type:'timing',  tool:'defib',     name:'Defibrillate', target_bpm:140,     time:8 },
  { type:'timing',  tool:'hyperbaric',name:'Pressurize',   target_bpm:60,      time:10 },
  { type:'timing',  tool:'fetalmon',  name:'Monitor Fetal',target_bpm:140,     time:8 },
  { type:'draw',    tool:'laser',     name:'Laser Tumor',  path:'tumor',       time:16 },
  { type:'draw',    tool:'laser',     name:'Cauterize',    path:'heart_vessel', time:12 },
  { type:'spray',   tool:'antihist',  name:'Spray Meds',   points:5,           time:8 },
  { type:'spray',   tool:'hyperbaric',name:'Oxygen Therapy',points:6,          time:10 },
  { type:'navigate',tool:'endoscope', name:'Navigate Scope',path:'esophagus',  time:12 },
  { type:'navigate',tool:'ultrasound',name:'Scan Internal',path:'vessels',     time:12 }
];

})();
