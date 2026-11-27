/* ============================================================
   Bar Blu — the cast
   ------------------------------------------------------------
   Each character is a bust in shadow-theatre style, drawn as SVG
   from a few traits, with a rim light in their own colour. `voice`
   is the pitch of the soft blip their words make as they appear.
   ============================================================ */

export const CAST = {
  luca: { name: 'Luca', color: '#5fb4ff', voice: 220, look: { hair: 'short', extra: ['collar'], sw: 1 } },
  assunta: { name: 'Assunta', color: '#c58cff', voice: 330, look: { hair: 'bun', extra: ['earring', 'coat'], sw: 1.05 } },
  ugo: { name: 'Sor Ugo', color: '#f0d9a4', voice: 140, look: { hair: 'none', hat: 'cap', extra: ['beard', 'scarf', 'coat'], sw: 1.08 } },
  gigi: { name: 'Gigi', color: '#a7bcd2', voice: 180, look: { hair: 'receding', extra: ['tie', 'collar'], sw: 1 } },
  elvira: { name: 'Elvira', color: '#f4cfae', voice: 300, look: { hair: 'bob', extra: ['clip'], sw: 0.82, scale: 0.9 } },
  baldini: { name: 'Prof. Baldini', color: '#dcb676', voice: 160, look: { hair: 'wild', extra: ['glasses', 'collar'], sw: 1.02 } },
  mirella: { name: 'Mirella', color: '#ff6584', voice: 360, look: { hair: 'bob', hat: 'wide', extra: ['earring'], sw: 0.92 } },
  anna: { name: 'Anna', color: '#7fe3c2', voice: 380, look: { hair: 'ponytail', extra: ['glasses'], sw: 0.86, scale: 0.95 } },
  contessa: { name: 'La Contessa', color: '#d8aaff', voice: 320, look: { hair: 'bun', hat: 'veil', extra: ['fur'], sw: 0.95 } },
  nando: { name: 'Nando', color: '#ffb661', voice: 200, look: { hair: 'none', hat: 'beanie', extra: ['coat'], sw: 0.96 } },
  rocco: { name: 'Rocco', color: '#ffdd55', voice: 190, look: { hair: 'curly', extra: ['collar'], sw: 1.04 } },
  maresciallo: { name: 'Maresciallo', color: '#78a5ea', voice: 150, look: { hair: 'none', hat: 'kepi', extra: ['mustache', 'collar'], sw: 1.06 } },
  dario: { name: 'Dario', color: '#a3d8ff', voice: 240, look: { hair: 'long', extra: ['coat'], sw: 0.84 } },
  vera: { name: 'Vera', color: '#74ff9f', voice: 280, look: { hair: 'spiky', extra: ['guitar', 'collar'], sw: 0.9 } },
  giulia: { name: 'Giulia', color: '#b5e874', voice: 340, look: { hair: 'long', extra: ['coat'], sw: 0.88 } },
  macchina: { name: 'Le tre sorelle', color: '#ff3d8b', voice: 660, look: null },
  tu: { name: 'Tu', color: '#e9eef7', voice: 260, look: null },
  cliente: { name: 'Cliente', color: '#c9d2e3', voice: 230, look: { hair: 'short', extra: ['coat'], sw: 1 } },
};

/* Regulars for the quick rounds at the counter: a line, the drink they mean, and how they look. */
export const REGULARS = [
  { name: 'Mario, muratore', line: 'Il solito, capo. Nero, bollente, che mi deve svegliare anche le ginocchia.', drink: 'caffe', look: { hair: 'none', hat: 'beanie', extra: ['coat'] } },
  { name: 'Lucia, infermiera', line: 'Smonto dalla notte. Qualcosa di caldo che non mi tenga sveglia.', drink: 'camomilla', look: { hair: 'ponytail', extra: ['coat'] } },
  { name: 'Franco', line: 'Mezzogiorno è passato, quindi è sera da qualche parte. Un bianchino.', drink: 'vino', look: { hair: 'receding', extra: ['collar'] } },
  { name: 'Sara, studentessa', line: 'Ho l’esame di diritto privato tra un’ora. Mi serve un miracolo, ma va bene anche un caffè.', drink: 'caffe', look: { hair: 'long', extra: ['glasses'] } },
  { name: 'Piero', line: 'Una birra piccola. Piccola, eh. Mia moglie conta.', drink: 'birra', look: { hair: 'short', extra: ['coat'] } },
  { name: 'Marco, rider', line: 'Ho tre minuti. Qualcosa da bere in un sorso solo, che non sia alcolico.', drink: 'caffe', look: { hair: 'none', hat: 'cap', extra: ['coat'] } },
  { name: 'Signor Wang', line: 'Acqua, per favore. Naturale. Il medico dice che devo bere. Il medico dice tante cose.', drink: 'acqua', look: { hair: 'receding', extra: ['glasses'] } },
  { name: 'Teresa del panificio', line: 'Ho le mani bianche di farina fino ai gomiti. Una camomilla, che oggi ho litigato col forno.', drink: 'camomilla', look: { hair: 'bun', extra: ['earring'] } },
  { name: 'Giorgio, pensionato', line: 'Un rosso, giovane. Il dottore ha detto un bicchiere al giorno. Non ha detto quanto grande.', drink: 'vino', look: { hair: 'none', hat: 'cap', extra: ['mustache'] } },
  { name: 'Kevin', line: 'Bro, una birra media. Abbiamo vinto il torneo di calcetto. Cioè, siamo arrivati terzi su tre, ma con stile.', drink: 'birra', look: { hair: 'spiky', extra: ['collar'] } },
  { name: 'Suor Agnese', line: 'Solo un bicchiere d’acqua, figliolo. E una preghiera per la caldaia del convento.', drink: 'acqua', look: { hair: 'none', hat: 'veil', extra: ['coat'] } },
  { name: 'Il postino', line: 'Un caffè volante. Ho trentadue raccomandate e un cane in viale Monza che mi odia personalmente.', drink: 'caffe', look: { hair: 'short', hat: 'kepi', extra: ['collar'] } },
];

export const DRINKS = {
  caffe: { icon: '☕', name: 'Caffè' },
  camomilla: { icon: '🍵', name: 'Camomilla' },
  vino: { icon: '🍷', name: 'Vino' },
  birra: { icon: '🍺', name: 'Birra' },
  acqua: { icon: '💧', name: 'Acqua' },
  grappa: { icon: '🥃', name: 'Grappa' },
};

/* ---------------- silhouettes ---------------- */

const HAIR = {
  none: '',
  short: 'M68 72 Q70 38 100 36 Q132 36 134 70 Q126 54 100 52 Q78 52 68 72 Z',
  receding: 'M68 78 Q66 56 76 52 Q72 66 74 80 Z M132 78 Q134 56 124 52 Q128 66 126 80 Z',
  bun: 'M68 74 Q68 40 100 38 Q132 40 132 74 Q124 56 100 54 Q76 56 68 74 Z M100 34 m-16 0 a16 14 0 1 0 32 0 a16 14 0 1 0 -32 0',
  bob: 'M64 96 Q60 40 100 36 Q140 40 136 96 Q128 98 126 84 Q124 56 100 54 Q76 56 74 84 Q72 98 64 96 Z',
  wild: 'M62 76 L58 52 L72 58 L70 38 L86 48 L92 30 L102 46 L114 30 L118 48 L132 38 L130 58 L142 52 L138 78 Q126 56 100 54 Q76 56 62 76 Z',
  ponytail: 'M68 74 Q68 40 100 38 Q132 40 132 74 Q124 56 100 54 Q76 56 68 74 Z M128 52 Q150 60 146 104 Q140 84 130 70 Z',
  curly: 'M66 70 a10 10 0 1 1 10 -16 a11 11 0 1 1 16 -12 a11 11 0 1 1 18 0 a11 11 0 1 1 16 12 a10 10 0 1 1 10 16 Q124 56 100 54 Q76 56 66 70 Z',
  long: 'M66 130 Q56 40 100 36 Q144 40 134 130 Q126 120 126 90 Q124 56 100 54 Q76 56 74 90 Q74 120 66 130 Z',
  spiky: 'M70 72 L74 50 L84 56 L88 30 L96 50 L104 24 L110 50 L120 32 L122 56 L130 50 L130 72 Q124 56 100 54 Q76 56 70 72 Z',
};

const HAT = {
  cap: 'M64 62 Q66 36 100 34 Q134 36 136 60 L152 66 Q140 70 100 64 Q74 64 64 62 Z',
  beanie: 'M66 66 Q66 30 100 30 Q134 30 134 66 Z M100 22 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0',
  kepi: 'M70 58 L72 30 Q100 22 128 30 L130 58 Z M62 60 L138 60 L146 68 L66 66 Z',
  wide: 'M30 60 Q100 40 170 60 Q150 68 100 64 Q50 68 30 60 Z M72 58 Q74 28 100 28 Q126 28 128 58 Z',
  veil: 'M74 50 Q76 30 100 30 Q124 30 126 50 Z M70 52 L130 52 L128 56 L72 56 Z',
};

function extras(list) {
  const out = [];
  for (const e of list) {
    switch (e) {
      case 'beard': out.push('<path d="M74 92 Q76 132 100 138 Q124 132 126 92 Q116 108 100 108 Q84 108 74 92 Z" class="sh"/>'); break;
      case 'mustache': out.push('<path d="M84 102 Q100 94 116 102 Q100 108 84 102 Z" class="rim-fill"/>'); break;
      case 'glasses': out.push('<g class="rim-line"><circle cx="88" cy="82" r="9"/><circle cx="112" cy="82" r="9"/><path d="M97 82 L103 82"/></g>'); break;
      case 'earring': out.push('<circle cx="68" cy="100" r="3.2" class="rim-fill"/>'); break;
      case 'clip': out.push('<rect x="112" y="46" width="16" height="5" rx="2" class="rim-fill" transform="rotate(-18 120 48)"/>'); break;
      case 'tie': out.push('<path d="M96 132 L104 132 L108 140 L104 196 L100 204 L96 196 L92 140 Z" class="rim-fill" opacity=".55"/>'); break;
      case 'collar': out.push('<path d="M80 128 L100 150 L120 128 L128 136 L100 166 L72 136 Z" class="sh2"/>'); break;
      case 'scarf': out.push('<path d="M72 122 Q100 138 128 122 L130 136 Q100 150 70 136 Z M112 134 L120 176 L106 178 L102 140 Z" class="sh2"/>'); break;
      case 'apron': out.push('<path d="M84 132 L80 200 M116 132 L120 200" class="rim-line" opacity=".6"/>'); break;
      case 'fur': out.push('<path d="M40 150 Q50 120 70 124 Q84 112 100 122 Q116 112 130 124 Q150 120 160 150 Q150 140 130 142 Q116 136 100 140 Q84 136 70 142 Q50 140 40 150 Z" class="sh2"/>'); break;
      case 'guitar': out.push('<path d="M150 40 L160 36 L168 44 L162 52 L124 168 L114 164 Z" class="sh"/><path d="M152 46 L120 160" class="rim-line" opacity=".5"/>'); break;
      case 'coat': out.push('<path d="M100 140 L100 210" class="rim-line" opacity=".35"/>'); break;
      default: break;
    }
  }
  return out.join('');
}

/** A bust silhouette as an SVG string: a solid shadow lit from one side. */
export function silhouette(look, color, id = 'x') {
  if (!look) return '';
  const sw = 66 * (look.sw || 1);
  const L = 100 - sw, R = 100 + sw;
  const body = `M${L} 240 C${L} 178 ${100 - sw * 0.92} 152 ${100 - sw * 0.6} 143 C86 137 89 129 91 121 L109 121 C111 129 114 137 ${100 + sw * 0.6} 143 C${100 + sw * 0.92} 152 ${R} 178 ${R} 240 Z`;
  const hair = HAIR[look.hair || 'short'] || '';
  const hat = look.hat ? HAT[look.hat] : '';
  const g = `g${id}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" class="sil-svg" aria-hidden="true" style="--rim:${color}">
<defs>
  <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0.2">
    <stop offset="0" stop-color="${color}" stop-opacity=".55"/>
    <stop offset=".1" stop-color="#090c16"/>
    <stop offset="1" stop-color="#05070d"/>
  </linearGradient>
  <linearGradient id="${g}r" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${color}" stop-opacity="1"/>
    <stop offset=".45" stop-color="${color}" stop-opacity=".25"/>
    <stop offset="1" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>
</defs>
<style>.sh{fill:url(#${g})}.sh2{fill:#04050a}.rim-fill{fill:${color};opacity:.85}.rim-line{fill:none;stroke:${color};stroke-width:2;opacity:.8}.rim{fill:none;stroke:url(#${g}r);stroke-width:2.4}</style>
<g class="bust">
  <path d="${body}" class="sh"/>
  <path d="M91 104 L109 104 L110 124 L90 124 Z" class="sh"/>
  <ellipse cx="73" cy="86" rx="5" ry="8" class="sh"/>
  <ellipse cx="127" cy="86" rx="5" ry="8" class="sh"/>
  <ellipse cx="100" cy="82" rx="27" ry="33" class="sh"/>
  ${hair ? `<path d="${hair}" class="sh"/>` : ''}
  ${hat ? `<path d="${hat}" class="sh"/>` : ''}
  ${extras(look.extra || [])}
  <path d="${body}" class="rim"/>
  <ellipse cx="100" cy="82" rx="27" ry="33" class="rim"/>
  ${hair ? `<path d="${hair}" class="rim"/>` : ''}
  ${hat ? `<path d="${hat}" class="rim"/>` : ''}
</g>
</svg>`;
}
