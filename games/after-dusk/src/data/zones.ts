export type ZoneKind = 'home' | 'street' | 'park' | 'interior' | 'bar' | 'shop' | 'cemetery' | 'harbour' | 'metro' | 'hospital' | 'mall' | 'campus';

export interface ZoneExit {
  at: [number, number];
  label: string;
  target: string;
  spawn?: string;
  requires?: string;
}

export interface ZoneProp {
  kind: 'clue' | 'charger' | 'powerbank' | 'note' | 'photo' | 'errand';
  at: [number, number];
  label: string;
  reveal?: string;
  text?: string;
  errandId?: string;
}

export interface ZoneLight {
  at: [number, number, number];
  color: number;
  power: number;
  radius?: number;
}

export interface ZoneDef {
  id: string;
  name: string;
  kind: ZoneKind;
  subtitle: string;
  description: string;
  spawn: [number, number];
  bounds: [number, number, number, number];
  exits: ZoneExit[];
  props: ZoneProp[];
  lights: ZoneLight[];
  shadowSpawns: [number, number][];
  reveal?: string;
  safe?: boolean;
  palette: { ground: string; wall: string; accent: string; sky: number; fog: number };
  car?: boolean;
}

export const ZONES: ZoneDef[] = [
  {
    id: 'home', name: "EMMA'S APARTMENT", kind: 'home',
    subtitle: 'Warm indoors, lengthening shadows outside',
    description: 'Your apartment is lit and familiar. Beyond the front door, dusk is settling.',
    spawn: [0, 1], bounds: [-13, -11, 13, 12],
    exits: [{ at: [0, -5.5], label: 'Step outside to Oaklane Street', target: 'street', spawn: 'home' }],
    props: [],
    lights: [
      { at: [-4.5, 2.5, -3], color: 0xffcf94, power: 2.4, radius: 5.5 },
      { at: [4.5, 2.5, -3], color: 0xffd7a4, power: 2.1, radius: 5.5 },
      { at: [-4.5, 2.5, 3], color: 0xffc98a, power: 2.0, radius: 5.0 },
      { at: [6.2, 2.5, 3], color: 0xffd2a0, power: 1.7, radius: 4.5 },
      { at: [0, 2.6, 0], color: 0xffd9a8, power: 1.7, radius: 5.0 },
      { at: [0, 2.4, -6.7], color: 0xffc478, power: 1.8, radius: 4.5 }, // porch light
    ],
    shadowSpawns: [[-11, 10], [11, 10], [-11, -9], [11, -9]],
    palette: { ground: '#5a4a45', wall: '#b9b1a2', accent: '#ffd9a8', sky: 0x0b1020, fog: 0x0c111e }
  },
  {
    id: 'street', name: 'OAKLANE STREET', kind: 'street',
    subtitle: 'Pools of amber light separated by dark alleys',
    description: 'Stay under the streetlamps. Every dark stretch between them makes your chest tighten.',
    spawn: [0, 12], bounds: [-40, -20, 40, 20],
    exits: [
      { at: [-14, 3.6], label: "Sophie's apartment", target: 'sophie', spawn: 'street' },
      { at: [-7, 3.6], label: "Parents' house", target: 'parents', spawn: 'street' },
      { at: [0, 3.6], label: 'Back home', target: 'home', spawn: 'street' },
      { at: [7, 3.6], label: "Daniel's old apartment", target: 'daniel', spawn: 'street' },
      { at: [14, 3.6], label: 'The Lantern Bar', target: 'bar', spawn: 'street' },
      { at: [-22, -16], label: 'Night Market', target: 'market', spawn: 'street' },
      { at: [22, -16], label: 'Wellness Block', target: 'wellness', spawn: 'street' },
      { at: [0, 18], label: 'Maple Park', target: 'park', spawn: 'street' },
      { at: [30, -16], label: 'Old Cemetery', target: 'cemetery', spawn: 'street' },
      { at: [-34, -16], label: 'Greystone Harbour', target: 'harbour', spawn: 'street' },
      { at: [34, -16], label: 'Oaklane Metro', target: 'metro', spawn: 'street' },
      { at: [-34, 16], label: 'St. Anne Hospital', target: 'hospital', spawn: 'street' },
      { at: [34, 16], label: 'Grand Mall', target: 'mall', spawn: 'street' },
      { at: [0, -18], label: 'Westfield Campus', target: 'campus', spawn: 'street' }
    ],
    props: [
      { kind: 'clue', at: [-12, -8], label: 'Inspect the parked car', reveal: 'street_tracks', text: 'The windshield is frosted from inside. Someone was watching your building.' },
      { kind: 'charger', at: [19, 2], label: 'Use the street charging kiosk' },
      { kind: 'powerbank', at: [-28, 12], label: 'Take the lost power bank' }
    ],
    lights: [
      { at: [-24, 3.4, 4.7], color: 0xffcf94, power: 2.2, radius: 6.2 },
      { at: [-12, 3.4, 4.7], color: 0xffcf94, power: 2.2, radius: 6.2 },
      { at: [0, 3.4, 4.7], color: 0xffcf94, power: 2.4, radius: 6.5 },
      { at: [12, 3.4, 4.7], color: 0xffcf94, power: 2.2, radius: 6.2 },
      { at: [24, 3.4, 4.7], color: 0xffcf94, power: 2.2, radius: 6.2 },
    ],
    shadowSpawns: [[-36, -18], [36, -18], [0, -19], [-36, 18], [36, 18], [0, 19]],
    palette: { ground: '#1a2029', wall: '#2c3540', accent: '#ffd9a8', sky: 0x070c17, fog: 0x0a101c },
    car: true
  },
  {
    id: 'park', name: 'MAPLE PARK', kind: 'park',
    subtitle: 'Quiet trees and a frozen pond',
    description: 'The path lamps cast narrow circles on the grass. Beyond them, the maple trees whisper.',
    spawn: [0, 18], bounds: [-35, -22, 35, 22],
    exits: [{ at: [0, 20], label: 'Back to Oaklane Street', target: 'street', spawn: 'park' }],
    props: [
      { kind: 'clue', at: [-14, -6], label: 'Examine the bench', reveal: 'park_bench', text: 'Two coffee cups, still warm. One has your name written on the sleeve.' },
      { kind: 'powerbank', at: [18, -10], label: 'Take the abandoned power bank' },
      { kind: 'clue', at: [0, -14], label: 'Look across the frozen lake', reveal: 'park_lake', text: 'A silhouette stands on the ice. It casts no reflection.' },
      { kind: 'charger', at: [-22, 10], label: 'Use the park kiosk charger' }
    ],
    lights: [
      { at: [-14, 3.2, 0], color: 0xa8d0c0, power: 1.6, radius: 5.5 },
      { at: [16, 3.2, -6], color: 0xa8d0c0, power: 1.6, radius: 5.5 }
    ],
    shadowSpawns: [[-30, -18], [30, -18], [0, -20], [-30, 18], [30, 18]],
    palette: { ground: '#1c2b21', wall: '#2a3a2c', accent: '#9fe8bd', sky: 0x06101a, fog: 0x08131c }
  },
  {
    id: 'sophie', name: "SOPHIE'S APARTMENT", kind: 'interior',
    subtitle: 'Her kettle is still warm',
    description: 'Soft lamp light, familiar books, and an unread note on the table.',
    spawn: [0, 5], bounds: [-10, -8, 10, 9],
    exits: [{ at: [0, -7.4], label: 'Back to Oaklane Street', target: 'street', spawn: 'sophie' }],
    props: [
      { kind: 'errand', errandId: 'return_keys', at: [-6, 2], label: "Leave spare keys & read Sophie's note", reveal: 'sophie_note', text: '"Call me the second you get here. Whatever you do, do not answer the landline."' },
      { kind: 'charger', at: [6, -3], label: 'Charge the phone' },
      { kind: 'photo', at: [6, 5], label: 'Inspect the photograph' }
    ],
    lights: [
      { at: [0, 2.5, 1], color: 0xffc98a, power: 2.2, radius: 6.5 },
      { at: [-6, 2.5, 4], color: 0xffc98a, power: 1.7, radius: 5.5 }
    ],
    shadowSpawns: [[-9, 7], [9, 7]], reveal: 'sophie_away',
    palette: { ground: '#6b5a4d', wall: '#c2b3a6', accent: '#ffd9a8', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'parents', name: 'THE OLD FAMILY HOUSE', kind: 'interior',
    subtitle: 'Nothing has moved since 1998',
    description: 'Framed photographs line the hallway. Your grandmother’s journal sits open.',
    spawn: [0, 5], bounds: [-10, -8, 10, 9],
    exits: [{ at: [0, -7.4], label: 'Back to Oaklane Street', target: 'street', spawn: 'parents' }],
    props: [
      { kind: 'clue', at: [-6, 2], label: 'Look at the family photograph', reveal: 'family_photo', text: 'A tall figure stands behind your mother in every picture. Her face is scratched away.' },
      { kind: 'errand', errandId: 'family_journal', at: [6, 4], label: "Read grandmother's journal", reveal: 'journal_city', text: '"When the line goes quiet, the dark learns your name. Keep a voice in the room."' },
      { kind: 'charger', at: [-6, -4], label: 'Use the old wall charger' }
    ],
    lights: [{ at: [0, 2.5, 0], color: 0xffd9a8, power: 2.2, radius: 6.5 }],
    shadowSpawns: [[-9, 7], [9, 7]], reveal: 'family_house',
    palette: { ground: '#5a4a45', wall: '#b9b1a2', accent: '#ffd9a8', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'daniel', name: "DANIEL'S OLD APARTMENT", kind: 'interior',
    subtitle: 'Notes taped across the walls',
    description: 'Drawers stand empty. Sketches of streetlamp light circles cover the desk.',
    spawn: [0, 5], bounds: [-10, -8, 10, 9],
    exits: [{ at: [0, -7.4], label: 'Back to Oaklane Street', target: 'street', spawn: 'daniel' }],
    props: [
      { kind: 'clue', at: [-6, 2], label: "Read Daniel's last note", reveal: 'daniel_note', text: '"I was right about the Shadows. Keep the phone charged and stay in the light."' },
      { kind: 'powerbank', at: [6, -2], label: "Take Daniel's power bank" },
      { kind: 'note', at: [6, 6], label: 'Look at the mirror', reveal: 'daniel_mirror', text: 'Your reflection blinks half a second after you do.' }
    ],
    lights: [{ at: [0, 2.5, 1], color: 0xa8b0ff, power: 1.9, radius: 6.0 }],
    shadowSpawns: [[-9, 7], [9, 7]], reveal: 'daniel_apartment',
    palette: { ground: '#4a4458', wall: '#9a95ad', accent: '#c0b8ff', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'bar', name: 'THE LANTERN BAR', kind: 'bar',
    subtitle: 'Warmth, music, and a crowd of voices',
    description: 'Neon lanterns glow over wooden tables. The Shadows refuse to cross this doorway.',
    spawn: [0, 5], bounds: [-11, -8, 11, 10],
    exits: [{ at: [0, -7.4], label: 'Back to Oaklane Street', target: 'street', spawn: 'bar' }],
    props: [
      { kind: 'charger', at: [-7, -3], label: 'Charge behind the bar' },
      { kind: 'errand', errandId: 'lantern_shelter', at: [7, 2], label: 'Talk to the bartender', reveal: 'bar_rumour', text: '"Stay as long as you need, kid. Nobody lets the dark in here."' },
      { kind: 'note', at: [-7, 6], label: 'Read the chalkboard', reveal: 'bar_board', text: 'Tonight: KEEP YOUR PHONE CHARGED.' }
    ],
    lights: [
      { at: [-6, 2.5, 0], color: 0xffb060, power: 2.4, radius: 8.5 },
      { at: [6, 2.5, 0], color: 0xff6fa8, power: 2.0, radius: 8.5 }
    ],
    shadowSpawns: [], reveal: 'bar_safe', safe: true,
    palette: { ground: '#3a2a30', wall: '#6b4a52', accent: '#ffb060', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'market', name: 'NIGHT MARKET', kind: 'shop',
    subtitle: 'Fluorescent aisles humming at night',
    description: 'The 24-hour pharmacy counter is lit, though the clerk has stepped away.',
    spawn: [0, 6], bounds: [-12, -9, 12, 10],
    exits: [{ at: [0, -8.4], label: 'Back to Oaklane Street', target: 'street', spawn: 'market' }],
    props: [
      { kind: 'powerbank', at: [-8, -3], label: 'Take the emergency power bank' },
      { kind: 'charger', at: [8, -4], label: 'Use the counter charger' },
      { kind: 'errand', errandId: 'pick_up_medicine', at: [0, -4], label: 'Pick up your prescription', reveal: 'market_receipt', text: 'Inhaler & prescription collected. The receipt is stamped 05:59 AM.' },
      { kind: 'note', at: [8, 6], label: 'Inspect the freezer glass', reveal: 'market_freezer', text: 'Frost on the inside spells out your own phone number.' }
    ],
    lights: [
      { at: [-4, 3, 1], color: 0xc8f0ff, power: 2.5, radius: 7.0 },
      { at: [5, 3, 1], color: 0xc8f0ff, power: 2.5, radius: 7.0 }
    ],
    shadowSpawns: [[-11, 8], [11, 8]], reveal: 'market_visited',
    palette: { ground: '#6b7078', wall: '#c0c8d0', accent: '#c8f0ff', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'wellness', name: 'WELLNESS BLOCK', kind: 'shop',
    subtitle: 'Covered mirrors and quiet halls',
    description: 'Every studio mirror is draped with a sheet.',
    spawn: [0, 5], bounds: [-11, -8, 11, 10],
    exits: [{ at: [0, -7.4], label: 'Back to Oaklane Street', target: 'street', spawn: 'wellness' }],
    props: [
      { kind: 'clue', at: [-7, 2], label: 'Peek under the salon sheet', reveal: 'salon_mirror', text: 'The mirror reflects a silhouette standing right behind you.' },
      { kind: 'charger', at: [7, -3], label: 'Use the reception charger' },
      { kind: 'note', at: [7, 6], label: 'Check the locker room', reveal: 'wellness_locker', text: 'A dead phone inside is still ringing.' }
    ],
    lights: [{ at: [0, 2.5, 1], color: 0xffd8f0, power: 2.1, radius: 6.5 }],
    shadowSpawns: [[-10, 8], [10, 8]], reveal: 'wellness_visited',
    palette: { ground: '#5a5060', wall: '#c8b9cc', accent: '#ffd8f0', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'cemetery', name: 'OLD CEMETERY', kind: 'cemetery',
    subtitle: 'Where the 1998 rule began',
    description: 'Stone headstones circle a single lantern-lit bench.',
    spawn: [0, 18], bounds: [-30, -20, 30, 22],
    exits: [{ at: [0, 20], label: 'Back to Oaklane Street', target: 'street', spawn: 'cemetery' }],
    props: [
      { kind: 'clue', at: [0, -8], label: 'Read the oldest headstone', reveal: 'cemetery_name', text: 'Your family name is carved in weathered stone.' },
      { kind: 'powerbank', at: [-14, 4], label: 'Take the lantern battery' },
      { kind: 'note', at: [15, -10], label: 'Look inside the mausoleum', reveal: 'cemetery_crypt', text: 'A phone is charging on the stone shelf.' }
    ],
    lights: [{ at: [0, 3, -4], color: 0x9fb7d8, power: 1.6, radius: 6.0 }],
    shadowSpawns: [[-26, -18], [26, -18], [0, -19]],
    palette: { ground: '#2c3430', wall: '#4c5850', accent: '#c0d8c8', sky: 0x05080c, fog: 0x070b10 }
  },
  {
    id: 'harbour', name: 'GREYSTONE HARBOUR', kind: 'harbour',
    subtitle: 'Still water under fog lamps',
    description: 'Wooden piers creak above dark water.',
    spawn: [0, 16], bounds: [-38, -18, 38, 20],
    exits: [{ at: [0, 18], label: 'Back to Oaklane Street', target: 'street', spawn: 'harbour' }],
    props: [
      { kind: 'clue', at: [-18, -8], label: 'Inspect the mooring rope', reveal: 'harbour_rope', text: 'The rope is knotted from the shore side.' },
      { kind: 'powerbank', at: [22, -10], label: "Take the dock worker's battery" },
      { kind: 'charger', at: [-26, 8], label: 'Use the harbour post charger' }
    ],
    lights: [
      { at: [-18, 3.2, 0], color: 0xa8c8e8, power: 1.7, radius: 6.0 },
      { at: [18, 3.2, -4], color: 0xa8c8e8, power: 1.7, radius: 6.0 }
    ],
    shadowSpawns: [[-34, -16], [34, -16], [0, -17]], reveal: 'harbour_visited',
    palette: { ground: '#1e2c38', wall: '#2f4152', accent: '#a8c8e8', sky: 0x060c16, fog: 0x091420 }
  },
  {
    id: 'metro', name: 'OAKLANE METRO', kind: 'metro',
    subtitle: 'The last train never arrived',
    description: 'Platform fluorescents blink down an empty tunnel.',
    spawn: [0, 9], bounds: [-16, -10, 16, 12],
    exits: [{ at: [0, 10], label: 'Back to Oaklane Street', target: 'street', spawn: 'metro' }],
    props: [
      { kind: 'clue', at: [-10, 2], label: 'Read the departure board', reveal: 'metro_board', text: 'Every service cancelled except 06:00, Platform Zero.' },
      { kind: 'charger', at: [10, 2], label: 'Use the platform charger' },
      { kind: 'note', at: [10, 8], label: 'Look down the tunnel', reveal: 'metro_tunnel', text: 'Two red eyes move between the rails—too low to be a train.' }
    ],
    lights: [
      { at: [-8, 3, 0], color: 0xb0c8e0, power: 2.0, radius: 6.5 },
      { at: [8, 3, 0], color: 0xb0c8e0, power: 2.0, radius: 6.5 }
    ],
    shadowSpawns: [[-14, -8], [14, -8]], reveal: 'metro_visited',
    palette: { ground: '#2b3038', wall: '#414a58', accent: '#b0c8e0', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'hospital', name: 'ST. ANNE HOSPITAL', kind: 'hospital',
    subtitle: 'Quiet wards after midnight',
    description: 'Curtained beds and pale blue hallway lights.',
    spawn: [0, 11], bounds: [-18, -12, 18, 14],
    exits: [{ at: [0, 12], label: 'Back to Oaklane Street', target: 'street', spawn: 'hospital' }],
    props: [
      { kind: 'clue', at: [-12, 2], label: 'Read the patient bracelet', reveal: 'hospital_bracelet', text: 'Your name is printed on it, dated 1998.' },
      { kind: 'charger', at: [12, -4], label: 'Use the ward charger' },
      { kind: 'powerbank', at: [-12, 8], label: 'Take the emergency battery' }
    ],
    lights: [
      { at: [-8, 3, 0], color: 0xc8e8ff, power: 2.2, radius: 7.0 },
      { at: [8, 3, 0], color: 0xc8e8ff, power: 2.2, radius: 7.0 }
    ],
    shadowSpawns: [[-16, -10], [16, -10]], reveal: 'hospital_visited',
    palette: { ground: '#4a585c', wall: '#b8c8cc', accent: '#c8e8ff', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'mall', name: 'GRAND MALL', kind: 'mall',
    subtitle: 'Shutters down, food court lit',
    description: 'Closed storefronts echo every footstep.',
    spawn: [0, 14], bounds: [-24, -16, 24, 18],
    exits: [{ at: [0, 16], label: 'Back to Oaklane Street', target: 'street', spawn: 'mall' }],
    props: [
      { kind: 'clue', at: [-16, 2], label: 'Check the directory', reveal: 'mall_desk', text: 'One marker reads: EXIT — KEEP WALKING.' },
      { kind: 'powerbank', at: [16, -6], label: 'Take the lost power bank' },
      { kind: 'charger', at: [16, 10], label: 'Use the food court charger' },
      { kind: 'note', at: [-16, 10], label: 'Peek inside the closed cinema', reveal: 'mall_cinema', text: 'Every screen shows a lit porch at dawn.' }
    ],
    lights: [
      { at: [-12, 3, 0], color: 0xffe0b8, power: 2.3, radius: 7.5 },
      { at: [12, 3, 0], color: 0xffe0b8, power: 2.3, radius: 7.5 }
    ],
    shadowSpawns: [[-22, -14], [22, -14], [0, -15]], reveal: 'mall_visited',
    palette: { ground: '#6a6270', wall: '#b9b0c4', accent: '#ffe0b8', sky: 0x05070c, fog: 0x080b12 }
  },
  {
    id: 'campus', name: 'WESTFIELD CAMPUS', kind: 'campus',
    subtitle: 'Empty field under floodlights',
    description: 'The library windows glow softly across the grass.',
    spawn: [0, 18], bounds: [-36, -20, 36, 24],
    exits: [{ at: [0, 20], label: 'Back to Oaklane Street', target: 'street', spawn: 'campus' }],
    props: [
      { kind: 'clue', at: [-18, -6], label: 'Read the noticeboard', reveal: 'campus_notice', text: 'An old flyer from 1998: "Stay under the lamps after dusk."' },
      { kind: 'powerbank', at: [20, -10], label: 'Take the sports bag battery' },
      { kind: 'charger', at: [-22, 10], label: 'Use the library charger' }
    ],
    lights: [
      { at: [-16, 3.2, 0], color: 0xffd9a8, power: 1.8, radius: 6.5 },
      { at: [16, 3.2, 0], color: 0xffd9a8, power: 1.8, radius: 6.5 }
    ],
    shadowSpawns: [[-32, -18], [32, -18], [0, -19]], reveal: 'campus_visited',
    palette: { ground: '#2c3a2c', wall: '#5c6b5c', accent: '#ffd9a8', sky: 0x070d14, fog: 0x0a1218 }
  }
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<string, ZoneDef>;
export const TAXI_COST = 6;
export const TAXI_SECONDS = 45;

export function taxiCost(fromId: string, toId: string): number {
  const a = ZONE_BY_ID[fromId], b = ZONE_BY_ID[toId];
  if (!a || !b) return TAXI_COST;
  const dx = a.spawn[0] - b.spawn[0];
  const dz = a.spawn[1] - b.spawn[1];
  return Math.min(18, TAXI_COST + Math.round(Math.hypot(dx, dz) / 14));
}
