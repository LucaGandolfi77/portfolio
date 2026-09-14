/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Patients Data
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Patients = {
  marco: {
    id: 'marco',
    name: 'Marco',
    age: 25,
    emoji: '👨',
    condition: 'Acute appendicitis',
    desc: 'Marco is a 25-year-old office worker admitted to the ER with severe right lower abdominal pain, nausea, and low-grade fever. Imaging confirms an inflamed appendix that must be removed before it ruptures.',
    vitals: { hr: 110, bp: '130/85', temp: 37.8, o2: 97 },
    chapter: 1
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia',
    age: 8,
    emoji: '👧',
    condition: 'Swallowed foreign body',
    desc: 'Sofia is an 8-year-old girl who accidentally swallowed a small toy part. The object is lodged in her esophagus and must be removed endoscopically before it causes obstruction or perforation.',
    vitals: { hr: 95, bp: '100/65', temp: 36.8, o2: 99 },
    chapter: 2
  },
  giuseppe: {
    id: 'giuseppe',
    name: 'Giuseppe',
    age: 70,
    emoji: '👴',
    condition: 'Pacemaker failure',
    desc: 'Giuseppe is a 70-year-old retired teacher with a pacemaker that has stopped functioning. His heart rhythm is unstable and the device must be replaced urgently.',
    vitals: { hr: 45, bp: '90/60', temp: 36.5, o2: 94 },
    chapter: 3
  },
  elena: {
    id: 'elena',
    name: 'Elena',
    age: 45,
    emoji: '👩',
    condition: 'Brain tumor',
    desc: 'Elena is a 45-year-old musician diagnosed with a brain tumor. The tumor is affecting her motor skills and must be removed carefully to preserve brain function.',
    vitals: { hr: 78, bp: '125/80', temp: 36.7, o2: 98 },
    chapter: 4
  },
  xylar: {
    id: 'xylar',
    name: 'Xylar',
    age: 35,
    emoji: '👽',
    condition: 'Crystalline lung disease',
    desc: 'Xylar is an alien being with crystalline growths in their respiratory system. The crystals are spreading rapidly and must be removed using specialized alien instruments.',
    vitals: { hr: 60, bp: '110/70', temp: 34.5, o2: 85 },
    chapter: 5
  },
  luca: {
    id: 'luca',
    name: 'Luca',
    age: 30,
    emoji: '🧑',
    condition: 'Multiple fractures',
    desc: 'Luca is a 30-year-old construction worker who fell from scaffolding. He has multiple fractures in his arm and leg that require surgical fixation.',
    vitals: { hr: 105, bp: '125/80', temp: 36.9, o2: 96 },
    chapter: 6
  },
  anna: {
    id: 'anna',
    name: 'Anna',
    age: 28,
    emoji: '👩',
    condition: 'Severe anaphylaxis',
    desc: 'Anna is a 28-year-old who suffered a severe allergic reaction to a bee sting. Her airway is swelling and she needs emergency epinephrine.',
    vitals: { hr: 130, bp: '85/50', temp: 37.2, o2: 91 },
    chapter: 7
  },
  yuki: {
    id: 'yuki',
    name: 'Yuki',
    age: 35,
    emoji: '👩',
    condition: 'Decompression sickness',
    desc: 'Yuki is a 35-year-old diver who ascended too quickly. She has decompression sickness with nitrogen bubbles in her blood.',
    vitals: { hr: 100, bp: '115/75', temp: 36.6, o2: 92 },
    chapter: 8
  },
  marco_jr: {
    id: 'marco_jr',
    name: 'Marco Jr.',
    age: 29,
    emoji: '👨',
    condition: 'Emergency C-section',
    desc: 'Marco Jr.\'s wife is in labor with complications. The baby is in distress and an emergency cesarean section is required.',
    vitals: { hr: 120, bp: '140/90', temp: 37.0, o2: 98 },
    chapter: 9
  },
  reynolds: {
    id: 'reynolds',
    name: 'Dr. Reynolds',
    age: 55,
    emoji: '👨‍⚕️',
    condition: 'Cardiac arrest',
    desc: 'Dr. Reynolds, the hospital\'s chief surgeon, has suffered a massive heart attack. He needs emergency surgery to save his life.',
    vitals: { hr: 35, bp: '70/40', temp: 36.2, o2: 88 },
    chapter: 10
  },
  giorgio: {
    id: 'giorgio',
    name: 'Giorgio',
    age: 75,
    emoji: '👴',
    condition: 'Hip fracture',
    desc: 'Giorgio is a 75-year-old who fell and fractured his hip. He needs a hip replacement to regain mobility.',
    vitals: { hr: 88, bp: '135/85', temp: 36.8, o2: 95 },
    chapter: 11
  },
  sofia_b: {
    id: 'sofia_b',
    name: 'Sofia B.',
    age: 6,
    emoji: '👧',
    condition: 'Pediatric appendicitis',
    desc: 'Sofia B. is a 6-year-old with appendicitis. The surgery must be performed with pediatric instruments.',
    vitals: { hr: 115, bp: '95/60', temp: 38.1, o2: 98 },
    chapter: 12
  },
  elena_b: {
    id: 'elena_b',
    name: 'Elena B.',
    age: 30,
    emoji: '🤰',
    condition: 'Placenta previa',
    desc: 'Elena B. has placenta previa where the placenta covers the cervix. An emergency C-section is required.',
    vitals: { hr: 105, bp: '120/75', temp: 36.7, o2: 97 },
    chapter: 13
  },
  luca_b: {
    id: 'luca_b',
    name: 'Luca B.',
    age: 22,
    emoji: '🧑',
    condition: 'Impaled chest',
    desc: 'Luca B. was impaled by a metal rod through his chest. The object must be carefully removed without causing more damage.',
    vitals: { hr: 125, bp: '90/55', temp: 36.5, o2: 90 },
    chapter: 14
  },
  anna_b: {
    id: 'anna_b',
    name: 'Anna B.',
    age: 26,
    emoji: '👩',
    condition: 'ACL tear',
    desc: 'Anna B. tore her ACL during a soccer match. She needs ligament reconstruction surgery.',
    vitals: { hr: 82, bp: '118/72', temp: 36.6, o2: 99 },
    chapter: 15
  },
  yuki_b: {
    id: 'yuki_b',
    name: 'Yuki B.',
    age: 0,
    emoji: '👶',
    condition: 'Congenital heart defect',
    desc: 'Yuki B. is a newborn with a congenital heart defect that requires immediate surgical correction.',
    vitals: { hr: 145, bp: '60/35', temp: 36.8, o2: 89 },
    chapter: 16
  },
  marco_b2: {
    id: 'marco_b2',
    name: 'Marco B2.',
    age: 60,
    emoji: '👨',
    condition: 'Massive stroke',
    desc: 'Marco B2. suffered a massive stroke. A blood clot must be removed from his brain to restore blood flow.',
    vitals: { hr: 72, bp: '160/95', temp: 37.1, o2: 94 },
    chapter: 17
  },
  giorgio_b: {
    id: 'giorgio_b',
    name: 'Giorgio B.',
    age: 40,
    emoji: '🧑',
    condition: 'Kidney stones',
    desc: 'Giorgio B. has large kidney stones that are causing severe pain and obstruction. They must be removed surgically.',
    vitals: { hr: 95, bp: '130/82', temp: 37.0, o2: 97 },
    chapter: 18
  },
  elena_c: {
    id: 'elena_c',
    name: 'Elena C.',
    age: 50,
    emoji: '👩',
    condition: 'Gallstones',
    desc: 'Elena C. has severe gallstones causing inflammation. An emergency cholecystectomy is required.',
    vitals: { hr: 90, bp: '125/78', temp: 37.4, o2: 96 },
    chapter: 19
  }
};

window.S2 = window.S2 || {};
window.S2.Patients = S2.Patients;
