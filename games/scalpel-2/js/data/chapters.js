/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Chapters Data
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Chapters = [
  {
    id: 1,
    title: 'The Appendix',
    subtitle: 'Appendectomy',
    patient: 'marco',
    organ: 'appendix',
    instruments: ['scalpel', 'sutures', 'retractor', 'clamps'],
    difficulty: 'easy',
    timeLimit: 45000,
    steps: 8,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Good morning, Doctor. Your first patient is Marco, a 25-year-old with acute appendicitis.' },
      { speaker: 'DR. REYNOLDS', text: 'The appendix is inflamed and must be removed before it ruptures. I\'ll guide you through the procedure.' },
      { speaker: 'DR. REYNOLDS', text: 'Start by making a precise incision in the lower right abdomen. Use the scalpel carefully.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'Excellent work, Doctor! You\'ve successfully removed the appendix.' },
      { speaker: 'DR. REYNOLDS', text: 'Marco will make a full recovery. You\'re off to a great start.' }
    ]
  },
  {
    id: 2,
    title: 'The Foreign Body',
    subtitle: 'Endoscopic Extraction',
    patient: 'sofia',
    organ: 'esophagus',
    instruments: ['endoscope', 'forceps'],
    difficulty: 'easy',
    timeLimit: 40000,
    steps: 7,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Next patient is Sofia, an 8-year-old who swallowed a toy part.' },
      { speaker: 'DR. REYNOLDS', text: 'The object is lodged in her esophagus. We need to extract it endoscopically.' },
      { speaker: 'DR. REYNOLDS', text: 'Guide the endoscope carefully and use the forceps to grab the object.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'Perfect extraction! Sofia is safe and the object has been removed.' },
      { speaker: 'DR. REYNOLDS', text: 'Her parents are relieved. You handled that beautifully.' }
    ]
  },
  {
    id: 3,
    title: 'The Heart',
    subtitle: 'Pacemaker Replacement',
    patient: 'giuseppe',
    organ: 'heart',
    instruments: ['defib', 'clamps', 'sutures'],
    difficulty: 'medium',
    timeLimit: 50000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'This is Giuseppe, a 70-year-old with a failed pacemaker.' },
      { speaker: 'DR. REYNOLDS', text: 'His heart rhythm is unstable. We need to replace the device quickly.' },
      { speaker: 'DR. REYNOLDS', text: 'Be ready with the defibrillator in case his heart stops.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The new pacemaker is in place and functioning perfectly.' },
      { speaker: 'DR. REYNOLDS', text: 'Giuseppe\'s heart rhythm is stable. Another life saved.' }
    ]
  },
  {
    id: 4,
    title: 'The Mind',
    subtitle: 'Tumor Removal',
    patient: 'elena',
    organ: 'brain',
    instruments: ['laser', 'retractor', 'forceps'],
    difficulty: 'hard',
    timeLimit: 60000,
    steps: 10,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Elena is a musician with a brain tumor affecting her motor skills.' },
      { speaker: 'DR. REYNOLDS', text: 'We must remove the tumor precisely to preserve her brain function.' },
      { speaker: 'DR. REYNOLDS', text: 'Use the laser for precision cutting. One wrong move could be catastrophic.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'Incredible precision, Doctor. The tumor has been completely removed.' },
      { speaker: 'DR. REYNOLDS', text: 'Elena should regain her motor skills over the coming weeks.' }
    ]
  },
  {
    id: 5,
    title: 'The Visitor',
    subtitle: 'Alien Surgery',
    patient: 'xylar',
    organ: 'alien_lungs',
    instruments: ['laser', 'forceps', 'retractor'],
    difficulty: 'hard',
    timeLimit: 55000,
    steps: 10,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Doctor, we have an extraordinary case. An alien being named Xylar needs surgery.' },
      { speaker: 'DR. REYNOLDS', text: 'They have crystalline growths in their respiratory system. We need to remove them.' },
      { speaker: 'DR. REYNOLDS', text: 'The crystals are delicate and must be extracted carefully. Good luck.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'You\'ve just performed surgery on an alien life form! Incredible!' },
      { speaker: 'DR. REYNOLDS', text: 'Xylar is recovering well. This is a first in medical history.' }
    ]
  },
  {
    id: 6,
    title: 'The Bones',
    subtitle: 'Fracture Repair',
    patient: 'luca',
    organ: 'bones',
    instruments: ['bonesaw', 'castapp', 'forceps', 'sutures'],
    difficulty: 'medium',
    timeLimit: 50000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Luca has multiple fractures from a construction accident.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to fix the bones and apply casts to ensure proper healing.' },
      { speaker: 'DR. REYNOLDS', text: 'Use the bone saw carefully and the cast applicator to set the fractures.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The fractures are properly aligned and casted.' },
      { speaker: 'DR. REYNOLDS', text: 'Luca will need physical therapy, but he\'ll walk again.' }
    ]
  },
  {
    id: 7,
    title: 'The Reaction',
    subtitle: 'Anaphylaxis Treatment',
    patient: 'anna',
    organ: 'airway',
    instruments: ['epiinject', 'antihist', 'retractor'],
    difficulty: 'medium',
    timeLimit: 40000,
    steps: 8,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Anna is having a severe allergic reaction. Her airway is swelling.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to administer epinephrine immediately and open her airway.' },
      { speaker: 'DR. REYNOLDS', text: 'Time is critical. Work fast but precise.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The epinephrine worked! Anna\'s airway is opening up.' },
      { speaker: 'DR. REYNOLDS', text: 'She\'ll be monitored for the next few hours. Well done.' }
    ]
  },
  {
    id: 8,
    title: 'The Deep',
    subtitle: 'Decompression Treatment',
    patient: 'yuki',
    organ: 'bloodstream',
    instruments: ['ultrasound', 'hyperbaric', 'sutures'],
    difficulty: 'hard',
    timeLimit: 55000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Yuki has decompression sickness from a diving accident.' },
      { speaker: 'DR. REYNOLDS', text: 'Nitrogen bubbles are forming in her blood. We need to treat her with hyperbaric oxygen.' },
      { speaker: 'DR. REYNOLDS', text: 'Use the ultrasound to locate the bubbles and hyperbaric to dissolve them.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The nitrogen bubbles have been dissolved. Yuki is stable.' },
      { speaker: 'DR. REYNOLDS', text: 'She\'ll make a full recovery. No more deep diving for a while.' }
    ]
  },
  {
    id: 9,
    title: 'The Birth',
    subtitle: 'Emergency C-Section',
    patient: 'marco_jr',
    organ: 'uterus',
    instruments: ['fetalmon', 'csection', 'clamps', 'sutures'],
    difficulty: 'hard',
    timeLimit: 60000,
    steps: 10,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Marco Jr.\'s wife is in labor with complications.' },
      { speaker: 'DR. REYNOLDS', text: 'The baby is in distress. We need to perform an emergency C-section.' },
      { speaker: 'DR. REYNOLDS', text: 'Monitor the fetal heartbeat and be ready to deliver.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The baby is delivered safely! Both mother and child are stable.' },
      { speaker: 'DR. REYNOLDS', text: 'Congratulations, Doctor. You\'ve brought a new life into the world.' }
    ]
  },
  {
    id: 10,
    title: 'The Master',
    subtitle: 'Boss Rush',
    patient: 'reynolds',
    organ: 'heart',
    instruments: ['scalpel', 'defib', 'clamps', 'sutures', 'laser'],
    difficulty: 'hard',
    timeLimit: 70000,
    steps: 12,
    briefing: [
      { speaker: 'DR. CHEN', text: 'Doctor, Dr. Reynolds has suffered a massive heart attack!' },
      { speaker: 'DR. CHEN', text: 'He\'s the best surgeon we have. We need to save him.' },
      { speaker: 'DR. CHEN', text: 'This will be the most challenging surgery of your career. Good luck.' }
    ],
    debriefing: [
      { speaker: 'DR. CHEN', text: 'Incredible! You saved Dr. Reynolds\'s life!' },
      { speaker: 'DR. CHEN', text: 'He\'ll need time to recover, but he\'ll be back. You\'re a true surgeon now.' }
    ]
  },
  {
    id: 11,
    title: 'The Structure',
    subtitle: 'Hip Replacement',
    patient: 'giorgio',
    organ: 'hip',
    instruments: ['bonesaw', 'castapp', 'forceps', 'retractor'],
    difficulty: 'medium',
    timeLimit: 55000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Giorgio has a fractured hip from a fall.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to replace the hip joint with a prosthetic.' },
      { speaker: 'DR. REYNOLDS', text: 'Precision is key. The prosthetic must fit perfectly.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The hip replacement is successful. Giorgio will walk again.' },
      { speaker: 'DR. REYNOLDS', text: 'He\'ll need rehabilitation, but the prognosis is excellent.' }
    ]
  },
  {
    id: 12,
    title: 'The Young',
    subtitle: 'Pediatric Surgery',
    patient: 'sofia_b',
    organ: 'appendix',
    instruments: ['scalpel', 'sutures', 'retractor', 'clamps'],
    difficulty: 'medium',
    timeLimit: 45000,
    steps: 8,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Sofia B. is a 6-year-old with appendicitis.' },
      { speaker: 'DR. REYNOLDS', text: 'Pediatric surgery requires extra care. The organs are smaller.' },
      { speaker: 'DR. REYNOLDS', text: 'Use gentle movements and monitor her vitals closely.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'Sofia B. is safe. The appendix has been removed successfully.' },
      { speaker: 'DR. REYNOLDS', text: 'She\'ll be running around in no time. Children heal fast.' }
    ]
  },
  {
    id: 13,
    title: 'The Mother',
    subtitle: 'Placenta Previa',
    patient: 'elena_b',
    organ: 'uterus',
    instruments: ['fetalmon', 'csection', 'clamps', 'sutures'],
    difficulty: 'hard',
    timeLimit: 60000,
    steps: 10,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Elena B. has placenta previa. The placenta is covering the cervix.' },
      { speaker: 'DR. REYNOLDS', text: 'This is life-threatening for both mother and baby.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to perform an emergency C-section immediately.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'Both mother and baby are safe. The C-section was successful.' },
      { speaker: 'DR. REYNOLDS', text: 'Elena B. will need monitoring, but she\'ll be fine.' }
    ]
  },
  {
    id: 14,
    title: 'The Impalement',
    subtitle: 'Object Removal',
    patient: 'luca_b',
    organ: 'chest',
    instruments: ['forceps', 'retractor', 'clamps', 'sutures'],
    difficulty: 'hard',
    timeLimit: 55000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Luca B. has been impaled by a metal rod through his chest.' },
      { speaker: 'DR. REYNOLDS', text: 'The object must be removed without causing more damage.' },
      { speaker: 'DR. REYNOLDS', text: 'Be extremely careful. One wrong move could be fatal.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The object has been removed safely. Luca B. is stable.' },
      { speaker: 'DR. REYNOLDS', text: 'He\'ll need time to heal, but he\'ll make a full recovery.' }
    ]
  },
  {
    id: 15,
    title: 'The Ligament',
    subtitle: 'ACL Reconstruction',
    patient: 'anna_b',
    organ: 'knee',
    instruments: ['bonesaw', 'laser', 'forceps', 'sutures'],
    difficulty: 'medium',
    timeLimit: 50000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Anna B. tore her ACL during a soccer match.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to reconstruct the ligament using a graft.' },
      { speaker: 'DR. REYNOLDS', text: 'Precision is essential for proper knee function.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The ACL has been reconstructed successfully.' },
      { speaker: 'DR. REYNOLDS', text: 'Anna B. will need physical therapy, but she\'ll play again.' }
    ]
  },
  {
    id: 16,
    title: 'The Newborn',
    subtitle: 'Heart Correction',
    patient: 'yuki_b',
    organ: 'heart',
    instruments: ['scalpel', 'forceps', 'sutures', 'defib'],
    difficulty: 'hard',
    timeLimit: 65000,
    steps: 11,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Yuki B. is a newborn with a congenital heart defect.' },
      { speaker: 'DR. REYNOLDS', text: 'The surgery must be performed with extreme precision.' },
      { speaker: 'DR. REYNOLDS', text: 'Use tiny instruments and monitor the baby\'s vitals constantly.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The heart defect has been corrected. Yuki B. is stable.' },
      { speaker: 'DR. REYNOLDS', text: 'The baby will need follow-up, but the prognosis is good.' }
    ]
  },
  {
    id: 17,
    title: 'The Stroke',
    subtitle: 'Clot Removal',
    patient: 'marco_b2',
    organ: 'brain',
    instruments: ['laser', 'retractor', 'forceps', 'sutures'],
    difficulty: 'hard',
    timeLimit: 60000,
    steps: 10,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Marco B2. has suffered a massive stroke.' },
      { speaker: 'DR. REYNOLDS', text: 'A blood clot is blocking blood flow to his brain.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to remove the clot quickly to restore blood flow.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The clot has been removed. Blood flow is restored.' },
      { speaker: 'DR. REYNOLDS', text: 'Marco B2. will need rehabilitation, but he\'ll recover.' }
    ]
  },
  {
    id: 18,
    title: 'The Stones',
    subtitle: 'Kidney Stone Removal',
    patient: 'giorgio_b',
    organ: 'kidney',
    instruments: ['ultrasound', 'forceps', 'laser', 'sutures'],
    difficulty: 'medium',
    timeLimit: 50000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Giorgio B. has large kidney stones causing severe pain.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to remove the stones surgically.' },
      { speaker: 'DR. REYNOLDS', text: 'Use the ultrasound to locate them and laser to break them up.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The kidney stones have been removed. Giorgio B. is pain-free.' },
      { speaker: 'DR. REYNOLDS', text: 'He\'ll need to drink plenty of water to prevent recurrence.' }
    ]
  },
  {
    id: 19,
    title: 'The Gallbladder',
    subtitle: 'Cholecystectomy',
    patient: 'elena_c',
    organ: 'gallbladder',
    instruments: ['scalpel', 'retractor', 'clamps', 'sutures'],
    difficulty: 'medium',
    timeLimit: 50000,
    steps: 9,
    briefing: [
      { speaker: 'DR. REYNOLDS', text: 'Elena C. has severe gallstones causing inflammation.' },
      { speaker: 'DR. REYNOLDS', text: 'We need to remove the gallbladder laparoscopically.' },
      { speaker: 'DR. REYNOLDS', text: 'Make small incisions and work with precision.' }
    ],
    debriefing: [
      { speaker: 'DR. REYNOLDS', text: 'The gallbladder has been removed successfully.' },
      { speaker: 'DR. REYNOLDS', text: 'Elena C. will recover quickly. No more gallstone pain.' }
    ]
  }
];

window.S2 = window.S2 || {};
window.S2.Chapters = S2.Chapters;
