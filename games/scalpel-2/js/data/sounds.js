/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Sounds Definitions
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Sounds = {
  click:      { freq:800,   dur:0.05, type:'sine',     vol:0.15 },
  hit:        { freq:440,   dur:0.10, type:'square',   vol:0.15 },
  miss:       { freq:200,   dur:0.15, type:'sawtooth', vol:0.12 },
  success:    { freq:523,   dur:0.20, type:'sine',     vol:0.18 },
  fanfare:    { freq:659,   dur:0.40, type:'sine',     vol:0.20 },
  scalpel:    { freq:1200,  dur:0.08, type:'sawtooth', vol:0.10 },
  sutures:    { freq:900,   dur:0.06, type:'triangle', vol:0.10 },
  clamp:      { freq:600,   dur:0.08, type:'square',   vol:0.12 },
  defib:      { freq:300,   dur:0.30, type:'sawtooth', vol:0.25 },
  laser:      { freq:1500,  dur:0.15, type:'sawtooth', vol:0.12 },
  endoscope:  { freq:700,   dur:0.10, type:'sine',     vol:0.08 },
  forceps:    { freq:800,   dur:0.06, type:'triangle', vol:0.10 },
  heartbeat:  { freq:80,    dur:0.15, type:'sine',     vol:0.15 },
  complication:{ freq:200,  dur:0.25, type:'sawtooth', vol:0.18 },
  alert:      { freq:1000,  dur:0.15, type:'square',   vol:0.15 },
  powerup:    { freq:880,   dur:0.15, type:'sine',     vol:0.20 },
  timer_warn: { freq:440,   dur:0.10, type:'square',   vol:0.12 },
  timer_danger:{ freq:660,  dur:0.08, type:'square',   vol:0.15 },
  level_up:   { freq:523,   dur:0.30, type:'sine',     vol:0.18 },
  achievement:{ freq:784,   dur:0.40, type:'sine',     vol:0.20 },
  bone_saw:   { freq:150,   dur:0.20, type:'sawtooth', vol:0.15 },
  cast:       { freq:500,   dur:0.12, type:'triangle', vol:0.12 },
  epi:        { freq:1100,  dur:0.10, type:'sine',     vol:0.15 },
  ultrasound: { freq:2000,  dur:0.15, type:'sine',     vol:0.08 }
};

window.S2 = window.S2 || {};
window.S2.Sounds = S2.Sounds;
