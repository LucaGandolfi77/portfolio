import type { RandomEvent } from './types';

export const EVENTS: RandomEvent[] = [
  {
    id: 'window', title: 'THE WINDOW', titleIt: 'LA FINESTRA', minChapter: 1, weight: 12,
    text: 'A tall silhouette stands just beyond the living room glass. Step into the light or call someone.',
    textIt: 'Una sagoma alta è ferma oltre il vetro del soggiorno. Resta nella luce o chiama qualcuno.',
    threat: 6, panic: 10, flag: 'event_window'
  },
  {
    id: 'unknown_call', title: 'UNKNOWN CALL', titleIt: 'CHIAMATA SCONOSCIUTA', minChapter: 2, weight: 11,
    text: 'An unknown number lights up your screen. No caller ID. Only static.',
    textIt: 'Un numero sconosciuto illumina lo schermo. Nessun ID. Solo fruscio.',
    threat: 3, panic: 8, flag: 'event_unknown_call'
  },
  {
    id: 'power_outage', title: 'POWER OUTAGE', titleIt: 'BLACKOUT', minChapter: 3, weight: 9,
    text: 'Every indoor bulb dies at once. Keep your flashlight ready.',
    textIt: 'Tutte le luci di casa si spengono insieme. Tieni pronta la torcia.',
    threat: 8, panic: 16, flag: 'event_blackout'
  },
  {
    id: 'missed_call', title: 'MISSED CALL', titleIt: 'CHIAMATA PERSA', minChapter: 3, weight: 9,
    text: 'A missed call with three seconds of quiet breathing on the voicemail.',
    textIt: 'Una chiamata persa con tre secondi di respiro silenzioso in segreteria.',
    threat: 4, panic: 9, reveal: 'missed_breathing', flag: 'event_missed'
  },
  {
    id: 'silent_room', title: 'THE SILENT STREET', titleIt: 'SILENZIO IMPROVVISO', minChapter: 2, weight: 10,
    text: 'All traffic, wind, and hum stop at once. Your pulse fills your ears.',
    textIt: 'Traffico, vento e ronzii si fermano di colpo. Senti solo il tuo battito.',
    threat: 10, panic: 14, flag: 'event_silence'
  },
  {
    id: 'wrong_number', title: 'THE WRONG NUMBER', titleIt: 'NUMERO SBAGLIATO', minChapter: 3, weight: 8,
    text: 'A voice whispers your full name in your mother’s tone—while Mom is still on hold.',
    textIt: 'Una voce sussurra il tuo nome con il tono di tua madre, mentre lei è in attesa.',
    threat: 8, panic: 12, reveal: 'mimic_reveal', flag: 'event_wrong_number'
  },
  {
    id: 'footsteps', title: 'THE FOOTSTEPS', titleIt: 'PASSI NEL BUIO', minChapter: 2, weight: 11,
    text: 'Slow footsteps match yours—then take one extra step after you stop.',
    textIt: 'Passi lenti seguono i tuoi, poi fanno un passo in più quando ti fermi.',
    threat: 8, panic: 11, flag: 'event_footsteps'
  },
  {
    id: 'last_message', title: 'THE LAST MESSAGE', titleIt: 'L’ULTIMO MESSAGGIO', minChapter: 4, weight: 7,
    text: 'A text arrives from your own number: "I can see you under the streetlamp."',
    textIt: 'Arriva un SMS dal tuo stesso numero: "Ti vedo sotto il lampione."',
    threat: 9, panic: 15, reveal: 'shadow_names', flag: 'event_last_message'
  },
  {
    id: 'empty_street', title: 'THE EMPTY STREET', titleIt: 'STRADA DESERTA', minChapter: 2, weight: 8,
    text: 'Every parked car faces the same direction. One of the windshields fogs from inside.',
    textIt: 'Tutte le auto parcheggiate puntano nello stesso senso. Un parabrezza si appanna dall’interno.',
    threat: 6, panic: 8, reveal: 'street_watcher', flag: 'event_empty_street'
  },
  {
    id: 'park_whisper', title: 'THE PARK WHISPER', titleIt: 'SUSSURRO AL PARCO', minChapter: 2, weight: 8,
    text: 'Something among the maple trees calls your name softly.',
    textIt: 'Qualcosa tra gli aceri del parco ti chiama per nome sottovoce.',
    threat: 8, panic: 12, reveal: 'park_voice', flag: 'event_park_whisper'
  },
  {
    id: 'crowded_bar', title: 'A VOICE IN THE CROWD', titleIt: 'UNA VOCE TRA LA FOLLA', minChapter: 3, weight: 7,
    text: 'Twenty people talk at once, yet one silhouette by the door never blinks.',
    textIt: 'Venti persone parlano insieme, ma una sagoma vicino alla porta non batte ciglio.',
    threat: 5, panic: 6, reveal: 'bar_voice', flag: 'event_crowded_bar'
  },
  {
    id: 'market_blackout', title: 'MARKET FLICKER', titleIt: 'SFARFALLIO AL MARKET', minChapter: 3, weight: 8,
    text: 'The Night Market freezers cut out. Every aisle light dims for two heartbeats.',
    textIt: 'I frigoriferi del Night Market si spengono. Le luci delle corsie tremano per due battiti.',
    threat: 9, panic: 13, flag: 'event_market_blackout'
  }
];

export function pickEvent(chapter: number, done: string[], rand: () => number = Math.random): RandomEvent | null {
  const pool = EVENTS.filter((e) => e.minChapter <= chapter && !done.includes(e.id));
  if (!pool.length) return null;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let roll = rand() * total;
  for (const e of pool) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return pool[pool.length - 1];
}
