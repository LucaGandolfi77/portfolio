import type { Chapter, GameMode } from './types';

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'BEFORE SUNSET',
    titleIt: 'PRIMA DEL TRAMONTO',
    hour: 19.5,
    objective: 'Boil chamomile tea, close the curtains, and take the trash to the curb.',
    objectiveIt: 'Prepara la camomilla, chiudi le tende e porta fuori la spazzatura.',
    intro: '19:30. The sky is turning bruised orange. You tell yourself you are safe inside—until you remember the trash bag by the door.',
    introIt: '19:30. Il cielo si tinge di arancione livido. Ti ripeti che in casa sei al sicuro, finché non ricordi il sacco della spazzatura vicino alla porta.',
    threatRate: 0.08,
  },
  {
    id: 2,
    title: 'OUT OF MEDICINE',
    titleIt: 'SENZA MEDICINE',
    hour: 21,
    objective: 'Walk between the streetlamps to the Night Market and pick up your inhaler.',
    objectiveIt: 'Cammina da un lampione all’altro fino al Night Market per ritirare l’inalatore.',
    intro: 'Your inhaler is empty and your chest is tight. The 24-hour Night Market is three blocks away. Stay in the pools of light.',
    introIt: 'L’inalatore è vuoto e il respiro si fa corto. Il Night Market è a tre isolati. Resta nei coni di luce.',
    threatRate: 0.14,
  },
  {
    id: 3,
    title: 'THE QUIET STREET',
    titleIt: 'LA STRADA SILENZIOSA',
    hour: 23,
    objective: 'Return Sophie’s spare keys to her apartment and cross Maple Park.',
    objectiveIt: 'Riporta le chiavi di scorta a casa di Sophie e attraversa Maple Park.',
    intro: 'Streetlights begin to flicker. A missed call from an Unknown Number leaves three seconds of breathing in your ear.',
    introIt: 'I lampioni iniziano a sfarfallare. Una chiamata persa da un Numero Sconosciuto lascia tre secondi di respiro.',
    threatRate: 0.18,
  },
  {
    id: 4,
    title: 'BORROWED WARMTH',
    titleIt: 'CALORE IN PRESTITO',
    hour: 1,
    objective: 'Take shelter at The Lantern Bar or check Daniel’s old apartment.',
    objectiveIt: 'Rifugiati al Lantern Bar o controlla il vecchio appartamento di Daniel.',
    intro: '1:00 AM. Every unlit alley feels alive. Crowds and familiar voices are the only things the Shadows avoid.',
    introIt: '01:00. Ogni vicolo buio sembra vivo. La folla e le voci familiari sono le uniche cose che le Ombre evitano.',
    threatRate: 0.23,
  },
  {
    id: 5,
    title: '1998',
    titleIt: '1998',
    hour: 3,
    objective: 'Visit the Old Family House to uncover why the Shadows know your name.',
    objectiveIt: 'Visita la vecchia casa di famiglia per scoprire perché le Ombre conoscono il tuo nome.',
    intro: 'Your battery is dropping. Whatever started in 1998 is waiting in your parents’ house—and in the Old Cemetery.',
    introIt: 'La batteria scende. Ciò che è iniziato nel 1998 ti aspetta nella casa dei tuoi genitori e al Vecchio Cimitero.',
    threatRate: 0.27,
  },
  {
    id: 6,
    title: 'WALK INTO DAWN',
    titleIt: 'VERSO L’ALBA',
    hour: 5,
    objective: 'Keep a voice on the line and hold your composure until 6:00 AM.',
    objectiveIt: 'Tieni una voce in linea e mantieni la calma fino alle 06:00.',
    intro: '05:00 AM. One bar of battery left. The horizon is pale indigo, but the hallway behind you is pitch black.',
    introIt: '05:00. Una sola tacca di batteria. L’orizzonte è indaco pallido, ma il corridoio dietro di te è nero pece.',
    threatRate: 0.32,
  },
];

export const NIGHT_END = 24 + 6;
export const NIGHT_REAL_SECONDS = 25 * 60;

export function nightStart(mode: GameMode): number {
  return mode === 'classic' ? 22 : 19.5;
}

export function nightHour(hour: number): number {
  return hour < 12 ? hour + 24 : hour;
}
