/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Instruments Data
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Instruments = {
  scalpel: {
    id: 'scalpel',
    name: 'Scalpel',
    icon: '🔪',
    color: '#ecf0f1',
    desc: 'Sharp blade for precise incisions',
    sound: 'scalpel',
    chapter: 1
  },
  sutures: {
    id: 'sutures',
    name: 'Sutures',
    icon: '🧵',
    color: '#f39c12',
    desc: 'Thread and needle to close wounds',
    sound: 'sutures',
    chapter: 1
  },
  endoscope: {
    id: 'endoscope',
    name: 'Endoscope',
    icon: '🔭',
    color: '#9b59b6',
    desc: 'Camera probe for internal viewing',
    sound: 'endoscope',
    chapter: 2
  },
  forceps: {
    id: 'forceps',
    name: 'Forceps',
    icon: '🪡',
    color: '#1abc9c',
    desc: 'Precision grip for small objects',
    sound: 'forceps',
    chapter: 2
  },
  defib: {
    id: 'defib',
    name: 'Defibrillator',
    icon: '⚡',
    color: '#e74c3c',
    desc: 'Electric shock to restore rhythm',
    sound: 'defib',
    chapter: 3
  },
  clamps: {
    id: 'clamps',
    name: 'Clamps',
    icon: '🔧',
    color: '#e67e22',
    desc: 'Pinch to stop bleeding vessels',
    sound: 'clamp',
    chapter: 3
  },
  laser: {
    id: 'laser',
    name: 'Laser',
    icon: '🔴',
    color: '#e74c3c',
    desc: 'Focused beam for precise cutting',
    sound: 'laser',
    chapter: 4
  },
  retractor: {
    id: 'retractor',
    name: 'Retractor',
    icon: '🪝',
    color: '#3498db',
    desc: 'Hold tissue open for visibility',
    sound: 'click',
    chapter: 4
  },
  bonesaw: {
    id: 'bonesaw',
    name: 'Bone Saw',
    icon: '🦴',
    color: '#bdc3c7',
    desc: 'Precision saw for bone and cast',
    sound: 'bone_saw',
    chapter: 6
  },
  castapp: {
    id: 'castapp',
    name: 'Cast Applicator',
    icon: '🩹',
    color: '#ecf0f1',
    desc: 'Wrap and set fractures properly',
    sound: 'cast',
    chapter: 6
  },
  epiinject: {
    id: 'epiinject',
    name: 'Epinephrine',
    icon: '💉',
    color: '#e74c3c',
    desc: 'Emergency injection for anaphylaxis',
    sound: 'epi',
    chapter: 7
  },
  antihist: {
    id: 'antihist',
    name: 'Antihistamine',
    icon: '💊',
    color: '#2ecc71',
    desc: 'Block histamine allergic response',
    sound: 'heal',
    chapter: 7
  },
  ultrasound: {
    id: 'ultrasound',
    name: 'Ultrasound',
    icon: '📡',
    color: '#3498db',
    desc: 'Sound waves to see inside',
    sound: 'ultrasound',
    chapter: 8
  },
  hyperbaric: {
    id: 'hyperbaric',
    name: 'Hyperbaric',
    icon: '🫁',
    color: '#1abc9c',
    desc: 'Pressurized oxygen therapy',
    sound: 'success',
    chapter: 8
  },
  fetalmon: {
    id: 'fetalmon',
    name: 'Fetal Monitor',
    icon: '👶',
    color: '#f39c12',
    desc: 'Track baby heartbeat in womb',
    sound: 'heartbeat',
    chapter: 9
  },
  csection: {
    id: 'csection',
    name: 'C-Section Kit',
    icon: '🏥',
    color: '#ecf0f1',
    desc: 'Emergency cesarean delivery',
    sound: 'scalpel',
    chapter: 9
  }
};

window.S2 = window.S2 || {};
window.S2.Instruments = S2.Instruments;
