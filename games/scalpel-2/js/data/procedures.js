/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Procedures Data
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Procedures = {
  /* ─── Chapter 1: Appendectomy ─── */
  chapter1: [
    { type: 'swipe', instrument: 'scalpel', path: 'appendix_incision', desc: 'Make incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Retract tissue', timeLimit: 6000 },
    { type: 'swipe', instrument: 'scalpel', path: 'appendix_expose', desc: 'Expose appendix', timeLimit: 8000 },
    { type: 'tap', instrument: 'clamps', points: 3, desc: 'Clamp vessels', timeLimit: 7000 },
    { type: 'swipe', instrument: 'scalpel', path: 'appendix_remove', desc: 'Remove appendix', timeLimit: 10000 },
    { type: 'tap', instrument: 'clamps', points: 2, desc: 'Stop bleeding', timeLimit: 6000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Suture wound', timeLimit: 10000 },
    { type: 'tap', instrument: 'sutures', points: 1, desc: 'Final knot', timeLimit: 4000 }
  ],

  /* ─── Chapter 2: Foreign Body ─── */
  chapter2: [
    { type: 'navigate', instrument: 'endoscope', path: 'throat', desc: 'Guide endoscope', timeLimit: 10000 },
    { type: 'tap', instrument: 'endoscope', points: 1, desc: 'Locate object', timeLimit: 6000 },
    { type: 'navigate', instrument: 'endoscope', path: 'esophagus', desc: 'Approach object', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Grab object', timeLimit: 5000 },
    { type: 'swipe', instrument: 'forceps', path: 'extract', desc: 'Extract object', timeLimit: 8000 },
    { type: 'navigate', instrument: 'endoscope', path: 'throat_out', desc: 'Retract endoscope', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 3: Pacemaker ─── */
  chapter3: [
    { type: 'swipe', instrument: 'scalpel', path: 'chest_incision', desc: 'Make chest incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Retract chest', timeLimit: 6000 },
    { type: 'swipe', instrument: 'scalpel', path: 'heart_expose', desc: 'Expose heart', timeLimit: 8000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Defibrillate', timeLimit: 5000 },
    { type: 'tap', instrument: 'clamps', points: 3, desc: 'Clamp vessels', timeLimit: 7000 },
    { type: 'swipe', instrument: 'scalpel', path: 'pacemaker_remove', desc: 'Remove old pacemaker', timeLimit: 8000 },
    { type: 'swipe', instrument: 'scalpel', path: 'pacemaker_insert', desc: 'Insert new pacemaker', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Test rhythm', timeLimit: 5000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close chest', timeLimit: 10000 }
  ],

  /* ─── Chapter 4: Brain Tumor ─── */
  chapter4: [
    { type: 'swipe', instrument: 'scalpel', path: 'skull_incision', desc: 'Make skull incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract skull', timeLimit: 7000 },
    { type: 'swipe', instrument: 'laser', path: 'brain_expose', desc: 'Expose brain', timeLimit: 10000 },
    { type: 'draw', instrument: 'laser', desc: 'Cut tumor boundary', timeLimit: 12000 },
    { type: 'tap', instrument: 'forceps', points: 4, desc: 'Remove tumor pieces', timeLimit: 10000 },
    { type: 'swipe', instrument: 'laser', path: 'brain_cauterize', desc: 'Cauterize area', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Clear debris', timeLimit: 6000 },
    { type: 'stitch', instrument: 'sutures', points: 6, desc: 'Suture tissue', timeLimit: 12000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Replace bone flap', timeLimit: 6000 },
    { type: 'stitch', instrument: 'sutures', points: 4, desc: 'Close scalp', timeLimit: 8000 }
  ],

  /* ─── Chapter 5: Alien Surgery ─── */
  chapter5: [
    { type: 'navigate', instrument: 'endoscope', path: 'alien_chest', desc: 'Enter alien chest', timeLimit: 10000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Expand alien ribs', timeLimit: 7000 },
    { type: 'navigate', instrument: 'endoscope', path: 'alien_lungs', desc: 'Locate crystals', timeLimit: 10000 },
    { type: 'draw', instrument: 'laser', desc: 'Draw crystal pattern', timeLimit: 12000 },
    { type: 'tap', instrument: 'forceps', points: 5, desc: 'Extract crystals', timeLimit: 12000 },
    { type: 'swipe', instrument: 'laser', path: 'alien_repair', desc: 'Repair tissue', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 3, desc: 'Clear fragments', timeLimit: 8000 },
    { type: 'swipe', instrument: 'laser', path: 'alien_seal', desc: 'Seal incision', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close chest', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Restore heartbeat', timeLimit: 5000 }
  ],

  /* ─── Chapter 6: Fracture Repair ─── */
  chapter6: [
    { type: 'swipe', instrument: 'bonesaw', path: 'bone_cut', desc: 'Cut bone', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 3, desc: 'Align fragments', timeLimit: 8000 },
    { type: 'swipe', instrument: 'bonesaw', path: 'bone_smooth', desc: 'Smooth edges', timeLimit: 8000 },
    { type: 'tap', instrument: 'castapp', points: 2, desc: 'Apply cast', timeLimit: 7000 },
    { type: 'swipe', instrument: 'castapp', path: 'cast_wrap', desc: 'Wrap cast', timeLimit: 10000 },
    { type: 'tap', instrument: 'castapp', points: 2, desc: 'Set cast', timeLimit: 6000 },
    { type: 'tap', instrument: 'sutures', points: 3, desc: 'Close incision', timeLimit: 7000 },
    { type: 'swipe', instrument: 'castapp', path: 'cast_finish', desc: 'Finish cast', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 7: Anaphylaxis ─── */
  chapter7: [
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Open airway', timeLimit: 6000 },
    { type: 'tap', instrument: 'epiinject', points: 1, desc: 'Inject epinephrine', timeLimit: 5000 },
    { type: 'swipe', instrument: 'antihist', path: 'airway_treat', desc: 'Treat airway', timeLimit: 8000 },
    { type: 'tap', instrument: 'antihist', points: 2, desc: 'Block histamine', timeLimit: 6000 },
    { type: 'navigate', instrument: 'endoscope', path: 'airway_check', desc: 'Check airway', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Clear swelling', timeLimit: 6000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Stabilize heart', timeLimit: 5000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 8: Decompression ─── */
  chapter8: [
    { type: 'navigate', instrument: 'ultrasound', path: 'scan_body', desc: 'Scan body', timeLimit: 10000 },
    { type: 'tap', instrument: 'ultrasound', points: 3, desc: 'Locate bubbles', timeLimit: 8000 },
    { type: 'swipe', instrument: 'hyperbaric', path: 'oxygen_treat', desc: 'Apply oxygen', timeLimit: 10000 },
    { type: 'tap', instrument: 'hyperbaric', points: 2, desc: 'Increase pressure', timeLimit: 7000 },
    { type: 'navigate', instrument: 'ultrasound', path: 'bubble_check', desc: 'Check bubbles', timeLimit: 8000 },
    { type: 'swipe', instrument: 'hyperbaric', path: 'pressure_release', desc: 'Release pressure', timeLimit: 8000 },
    { type: 'tap', instrument: 'hyperbaric', points: 2, desc: 'Normalize', timeLimit: 6000 },
    { type: 'stitch', instrument: 'sutures', points: 4, desc: 'Close access', timeLimit: 8000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Final stabilize', timeLimit: 5000 }
  ],

  /* ─── Chapter 9: C-Section ─── */
  chapter9: [
    { type: 'navigate', instrument: 'fetalmon', path: 'monitor_baby', desc: 'Monitor baby', timeLimit: 8000 },
    { type: 'swipe', instrument: 'csection', path: 'abdomen_incision', desc: 'Make incision', timeLimit: 10000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract tissue', timeLimit: 8000 },
    { type: 'swipe', instrument: 'csection', path: 'uterus_open', desc: 'Open uterus', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Deliver baby', timeLimit: 8000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Stabilize baby', timeLimit: 5000 },
    { type: 'tap', instrument: 'clamps', points: 3, desc: 'Clamp vessels', timeLimit: 7000 },
    { type: 'stitch', instrument: 'sutures', points: 6, desc: 'Close uterus', timeLimit: 12000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close abdomen', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 10: Boss Rush ─── */
  chapter10: [
    { type: 'swipe', instrument: 'scalpel', path: 'chest_open', desc: 'Open chest', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract ribs', timeLimit: 7000 },
    { type: 'swipe', instrument: 'scalpel', path: 'heart_expose', desc: 'Expose heart', timeLimit: 8000 },
    { type: 'timing', instrument: 'defib', target: 0.5, def: 0.3, desc: 'Defibrillate', timeLimit: 5000 },
    { type: 'tap', instrument: 'clamps', points: 4, desc: 'Clamp arteries', timeLimit: 8000 },
    { type: 'swipe', instrument: 'scalpel', path: 'vessel_bypass', desc: 'Bypass vessel', timeLimit: 10000 },
    { type: 'draw', instrument: 'laser', desc: 'Rebuild tissue', timeLimit: 12000 },
    { type: 'tap', instrument: 'forceps', points: 4, desc: 'Clear blockage', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Restore rhythm', timeLimit: 5000 },
    { type: 'stitch', instrument: 'sutures', points: 6, desc: 'Suture heart', timeLimit: 12000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close chest', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Final stabilize', timeLimit: 5000 }
  ],

  /* ─── Chapter 11: Hip Replacement ─── */
  chapter11: [
    { type: 'swipe', instrument: 'scalpel', path: 'hip_incision', desc: 'Make incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract tissue', timeLimit: 7000 },
    { type: 'swipe', instrument: 'bonesaw', path: 'femur_cut', desc: 'Cut femur', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 3, desc: 'Remove old joint', timeLimit: 8000 },
    { type: 'swipe', instrument: 'bonesaw', path: 'socket_prepare', desc: 'Prepare socket', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Insert implant', timeLimit: 7000 },
    { type: 'swipe', instrument: 'castapp', path: 'implant_set', desc: 'Set implant', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close incision', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 12: Pediatric Surgery ─── */
  chapter12: [
    { type: 'swipe', instrument: 'scalpel', path: 'small_incision', desc: 'Make small incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Retract gently', timeLimit: 6000 },
    { type: 'swipe', instrument: 'scalpel', path: 'appendix_expose', desc: 'Expose appendix', timeLimit: 8000 },
    { type: 'tap', instrument: 'clamps', points: 2, desc: 'Clamp vessels', timeLimit: 6000 },
    { type: 'swipe', instrument: 'scalpel', path: 'appendix_remove', desc: 'Remove appendix', timeLimit: 8000 },
    { type: 'tap', instrument: 'clamps', points: 2, desc: 'Stop bleeding', timeLimit: 5000 },
    { type: 'stitch', instrument: 'sutures', points: 4, desc: 'Suture wound', timeLimit: 8000 },
    { type: 'tap', instrument: 'sutures', points: 1, desc: 'Final knot', timeLimit: 4000 }
  ],

  /* ─── Chapter 13: Placenta Previa ─── */
  chapter13: [
    { type: 'navigate', instrument: 'fetalmon', path: 'monitor_baby', desc: 'Monitor baby', timeLimit: 8000 },
    { type: 'swipe', instrument: 'csection', path: 'abdomen_incision', desc: 'Make incision', timeLimit: 10000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract tissue', timeLimit: 8000 },
    { type: 'swipe', instrument: 'csection', path: 'uterus_open', desc: 'Open uterus', timeLimit: 10000 },
    { type: 'tap', instrument: 'clamps', points: 4, desc: 'Clamp placenta', timeLimit: 8000 },
    { type: 'swipe', instrument: 'scalpel', path: 'placenta_remove', desc: 'Remove placenta', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Deliver baby', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 6, desc: 'Close uterus', timeLimit: 12000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close abdomen', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Stabilize', timeLimit: 5000 }
  ],

  /* ─── Chapter 14: Impaled Object ─── */
  chapter14: [
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Expose wound', timeLimit: 6000 },
    { type: 'tap', instrument: 'clamps', points: 3, desc: 'Clamp vessels', timeLimit: 7000 },
    { type: 'swipe', instrument: 'forceps', path: 'object_grab', desc: 'Grab object', timeLimit: 8000 },
    { type: 'swipe', instrument: 'forceps', path: 'object_remove', desc: 'Remove object', timeLimit: 10000 },
    { type: 'tap', instrument: 'clamps', points: 3, desc: 'Stop bleeding', timeLimit: 7000 },
    { type: 'swipe', instrument: 'laser', path: 'tissue_repair', desc: 'Repair tissue', timeLimit: 10000 },
    { type: 'stitch', instrument: 'sutures', points: 6, desc: 'Close wound', timeLimit: 12000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Stabilize', timeLimit: 5000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 15: ACL Reconstruction ─── */
  chapter15: [
    { type: 'swipe', instrument: 'scalpel', path: 'knee_incision', desc: 'Make incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Retract tissue', timeLimit: 6000 },
    { type: 'swipe', instrument: 'bonesaw', path: 'tunnel_drill', desc: 'Drill tunnel', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Remove old ligament', timeLimit: 7000 },
    { type: 'swipe', instrument: 'laser', path: 'graft_prepare', desc: 'Prepare graft', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Insert graft', timeLimit: 7000 },
    { type: 'swipe', instrument: 'laser', path: 'graft_secure', desc: 'Secure graft', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close incision', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 16: Heart Correction ─── */
  chapter16: [
    { type: 'swipe', instrument: 'scalpel', path: 'chest_open', desc: 'Open chest', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract ribs', timeLimit: 7000 },
    { type: 'swipe', instrument: 'scalpel', path: 'heart_expose', desc: 'Expose heart', timeLimit: 8000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Stop heart', timeLimit: 5000 },
    { type: 'swipe', instrument: 'scalpel', path: 'defect_repair', desc: 'Repair defect', timeLimit: 12000 },
    { type: 'tap', instrument: 'forceps', points: 3, desc: 'Place patch', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Suture patch', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Restart heart', timeLimit: 5000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Close chest', timeLimit: 10000 },
    { type: 'timing', instrument: 'defib', target: 0.5, desc: 'Final stabilize', timeLimit: 5000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 17: Clot Removal ─── */
  chapter17: [
    { type: 'swipe', instrument: 'scalpel', path: 'skull_incision', desc: 'Make skull incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Retract skull', timeLimit: 7000 },
    { type: 'navigate', instrument: 'ultrasound', path: 'brain_scan', desc: 'Scan brain', timeLimit: 10000 },
    { type: 'tap', instrument: 'ultrasound', points: 2, desc: 'Locate clot', timeLimit: 6000 },
    { type: 'swipe', instrument: 'laser', path: 'clot_remove', desc: 'Remove clot', timeLimit: 10000 },
    { type: 'swipe', instrument: 'laser', path: 'vessel_repair', desc: 'Repair vessel', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Clear debris', timeLimit: 6000 },
    { type: 'stitch', instrument: 'sutures', points: 5, desc: 'Suture tissue', timeLimit: 10000 },
    { type: 'tap', instrument: 'retractor', points: 2, desc: 'Replace bone', timeLimit: 6000 },
    { type: 'stitch', instrument: 'sutures', points: 4, desc: 'Close scalp', timeLimit: 8000 }
  ],

  /* ─── Chapter 18: Kidney Stones ─── */
  chapter18: [
    { type: 'navigate', instrument: 'ultrasound', path: 'kidney_scan', desc: 'Scan kidney', timeLimit: 10000 },
    { type: 'tap', instrument: 'ultrasound', points: 3, desc: 'Locate stones', timeLimit: 8000 },
    { type: 'swipe', instrument: 'laser', path: 'stone_break', desc: 'Break stones', timeLimit: 10000 },
    { type: 'tap', instrument: 'forceps', points: 4, desc: 'Remove fragments', timeLimit: 10000 },
    { type: 'swipe', instrument: 'laser', path: 'tract_clean', desc: 'Clean tract', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Clear debris', timeLimit: 6000 },
    { type: 'swipe', instrument: 'laser', path: 'tissue_seal', desc: 'Seal tissue', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 4, desc: 'Close incision', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 1, desc: 'Final check', timeLimit: 4000 }
  ],

  /* ─── Chapter 19: Cholecystectomy ─── */
  chapter19: [
    { type: 'swipe', instrument: 'scalpel', path: 'abdomen_incision', desc: 'Make incisions', timeLimit: 8000 },
    { type: 'tap', instrument: 'retractor', points: 3, desc: 'Insert ports', timeLimit: 7000 },
    { type: 'navigate', instrument: 'endoscope', path: 'gallbladder_view', desc: 'View gallbladder', timeLimit: 8000 },
    { type: 'tap', instrument: 'clamps', points: 3, desc: 'Clamp artery', timeLimit: 7000 },
    { type: 'swipe', instrument: 'scalpel', path: 'duct_cut', desc: 'Cut duct', timeLimit: 8000 },
    { type: 'tap', instrument: 'forceps', points: 2, desc: 'Peel gallbladder', timeLimit: 8000 },
    { type: 'swipe', instrument: 'forceps', path: 'gallbladder_remove', desc: 'Remove gallbladder', timeLimit: 10000 },
    { type: 'swipe', instrument: 'laser', path: 'cauterize_area', desc: 'Cauterize area', timeLimit: 8000 },
    { type: 'stitch', instrument: 'sutures', points: 4, desc: 'Close ports', timeLimit: 8000 }
  ]
};

window.S2 = window.S2 || {};
window.S2.Procedures = S2.Procedures;
