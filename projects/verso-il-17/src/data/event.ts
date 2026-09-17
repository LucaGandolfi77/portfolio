/**
 * event.ts — L'IDENTITÀ DELL'EVENTO, IN UN UNICO POSTO.
 *
 * Questo file raccoglie tutto ciò che riguarda la competizione: nomi, luogo, date
 * e le frasi chiave del gran finale. Modifica qui e si aggiorna in tutta l'app
 * (header, countdown, casella del 17, celebrazione, footer, titolo della pagina).
 *
 * Nessuna logica in questo file: solo dati.
 */

/** Anno dell'edizione. Serve solo per le etichette testuali. */
export const EVENT_YEAR = 2026;

export const EVENT = {
  /** Nome completo della competizione. */
  name: 'Campionati del Mondo',
  /** Specialità, come appare nelle etichette. */
  discipline: 'Pattinaggio artistico a rotelle sincronizzato',
  /** Dove si svolge. */
  place: 'Paraguay',
  /** Etichetta breve, per i badge: "Mondiale · Paraguay" */
  shortLabel: 'Mondiale · Paraguay',
} as const;

export const TEAM = {
  /** Sigla, usata nei badge compatti. */
  code: 'MPT',
  /** Nome esteso. */
  name: 'Monza Precision Team',
  /** Nazione rappresentata. */
  country: 'Italia',
  /** Come si legge tutto insieme, per le etichette lunghe. */
  full: 'Monza Precision Team · Italia',
} as const;

/**
 * I colori della bandiera. Stanno qui e non nel CSS perché sono identità:
 * se un giorno cambiassero i colori del team, si cambiano qui.
 */
export const TRICOLORE = ['#0e8a52', '#f6f2ec', '#d0455a'] as const;

/** Il gran finale, quando non resta che pattinare. */
export const FINALE_COPY = {
  eyebrow: 'È arrivato il giorno',
  date: '17 ottobre',
  event: EVENT.name,
  place: EVENT.place,
  team: TEAM.name,
  lines: ['Hai aperto tutte le caselle.', 'Hai attraversato tutta l’attesa.'],
  cta: 'Adesso non resta che pattinare.',
} as const;

/** Frasi che compaiono sotto l'header: qui il senso di squadra e di viaggio. */
export const AMBIENT_LINES: string[] = [
  'Un altro giorno più vicini alla pista.',
  'Un altro giorno più vicini al Paraguay.',
  'Conta gli otto. Respira. Rilascia.',
  'Si sta preparando qualcosa di grande.',
  'Le ruote girano anche quando riposi.',
  'L’Italia arriva da Monza, con otto ruote.',
  'Otto ruote, una traiettoria sola.',
  'Da Monza al mondo, un allenamento alla volta.',
  'Qualcuno, da qualche parte, sta provando la tua stessa coreografia.',
  'Il corridoio profuma di lacca e attesa.',
  'La pista non dimentica niente.',
];

/** Riga del footer: ruota in base al giorno. */
export const FOOTER_LINES: string[] = [
  'made with love, wheels & music ♡',
  '8 wheels · 1 team · infinite memories ✨',
  `${TEAM.code} · ${TEAM.name}`,
  `${TEAM.country} · ${EVENT.name} ${EVENT.place} ${EVENT_YEAR}`,
  'per chi conta gli otto anche a occhi chiusi 🛼',
];
