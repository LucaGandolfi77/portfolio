import type { Season } from './calendar';
import type { PersonLook } from '../world/person';

/*
 * The story of BORGO NOTTE: Quattro Stagioni. Original characters, real
 * places of Fidenza (the businesses are invented). Four chapters, one per
 * season, twelve missions made of a few kinds of steps. Pure data: the
 * runner in app/story-runner.ts plays it.
 */

export type CastId = 'dario' | 'ottavio' | 'giulia' | 'tonino' | 'conte' | 'smilzo' | 'ferrante' | 'rina';

export interface Character {
  id: CastId;
  name: string;
  role: string;
  look: PersonLook;
  color: string;
  bio: string;
}

export const CAST: Record<CastId, Character> = {
  dario: { id: 'dario', name: 'Dario Corradi', role: 'Tu', look: 'dario', color: '#c2553a', bio: 'Torna a Fidenza dopo dieci anni a Milano con una valigia e nessun piano.' },
  ottavio: { id: 'ottavio', name: 'Zio Ottavio', role: 'Corradi Trasporti', look: 'ottavio', color: '#8a6a48', bio: 'Taxi e consegne da quarant\'anni. Testardo, generoso, pieno di debiti.' },
  giulia: { id: 'giulia', name: 'Giulia Sartori', role: 'Officina Stirone', look: 'giulia', color: '#2f5a8a', bio: 'Meccanica, amica d\'infanzia. Ripara tutto tranne le cattive idee.' },
  tonino: { id: 'tonino', name: 'Tonino', role: 'Bar della piazza', look: 'tonino', color: '#6a6a6a', bio: 'Sa tutto di tutti prima che succeda. Il caffè è ottimo, i consigli meno.' },
  conte: { id: 'conte', name: 'il Conte Bertolazzi', role: 'Affari vari', look: 'conte', color: '#7a1e2a', bio: 'Nessuno sa di cosa sia conte. Vuole il garage dei Corradi, e non solo quello.' },
  smilzo: { id: 'smilzo', name: 'lo Smilzo', role: 'Autista del Conte', look: 'smilzo', color: '#c23b2e', bio: 'Guida bene, parla poco, perde male.' },
  ferrante: { id: 'ferrante', name: 'Maresciallo Ferrante', role: 'Carabinieri', look: 'ferrante', color: '#1c2638', bio: 'Ti tiene d\'occhio. Forse è un bene.' },
  rina: { id: 'rina', name: 'Zia Rina', role: 'Famiglia', look: 'rina', color: '#7a5a6a', bio: 'Cucina per un reggimento e ricorda tutto, soprattutto i torti.' }
};

export interface Place {
  x: number;
  z: number;
  name: string;
}

/* Real squares and landmarks; invented businesses at plausible spots. */
export const PLACES = {
  stazione: { x: 190, z: -108, name: 'Piazza della Repubblica' },
  garibaldi: { x: 15, z: -21, name: 'Piazza Garibaldi' },
  bar: { x: 38, z: -8, name: 'Bar della piazza' },
  duomo: { x: -297, z: -4, name: 'Piazza Duomo' },
  porta: { x: -305, z: -48, name: 'Porta di San Donnino' },
  teatro: { x: -94, z: 72, name: 'Teatro Magnani' },
  verdi: { x: -19, z: 105, name: 'Piazza Verdi' },
  matteotti: { x: 44, z: 109, name: 'Piazza Matteotti' },
  granmadre: { x: 416, z: 148, name: 'Gran Madre' },
  museo: { x: 380, z: 186, name: 'Museo Musini' },
  sanpietro: { x: -267, z: 199, name: 'Chiesa di San Pietro' },
  officina: { x: 112, z: 262, name: 'Officina Stirone' },
  garage: { x: -150, z: 330, name: 'Garage Corradi' },
  parcoVV: { x: -234, z: 614, name: 'Parco Vittorio Veneto' },
  parcoPace: { x: 279, z: 798, name: 'Parco della Pace' },
  vivaio: { x: -560, z: 880, name: 'Vivaio Bassi' },
  sanpaolo: { x: -694, z: 391, name: 'San Paolo' },
  santantonio: { x: -676, z: -240, name: 'Sant\'Antonio' },
  stirone: { x: -1060, z: 50, name: 'Parco dello Stirone' },
  scalo: { x: 880, z: 1080, name: 'Magazzini dello scalo' },
  villa: { x: 60, z: 1250, name: 'Villa Bertolazzi' },
  caserma: { x: 230, z: -60, name: 'Caserma' }
} satisfies Record<string, Place>;

export type PlaceId = keyof typeof PLACES;

export interface Line {
  who: CastId;
  text: string;
}

export type Step =
  | { kind: 'talk'; who: CastId; at: PlaceId; lines: Line[] }
  | { kind: 'goto'; at: PlaceId; text: string; car?: boolean; time?: number }
  | { kind: 'deliver'; to: PlaceId; text: string; time: number; fragile?: number }
  | { kind: 'race'; rival: CastId; via: PlaceId[]; text: string }
  | { kind: 'chase'; target: CastId; from: PlaceId; text: string; time: number }
  | { kind: 'tail'; target: CastId; from: PlaceId; to: PlaceId; text: string }
  | { kind: 'collect'; items: PlaceId[]; text: string; time?: number; scatter?: number }
  | { kind: 'escape'; level: number; text: string; time: number }
  | { kind: 'money'; amount: number; text: string }
  | { kind: 'season'; to: Season; card: string }
  | { kind: 'weather'; set: 'nebbia' | 'neve' | 'pioggia' | null }
  | { kind: 'clock'; hours: number };

export interface Mission {
  id: string;
  title: string;
  chapter: number;
  giver: CastId;
  at: PlaceId;
  /** Seasons in which the mission can be started. */
  season: Season;
  steps: Step[];
}

export interface Chapter {
  title: string;
  season: Season;
  intro: string;
}

export const CHAPTERS: Chapter[] = [
  { title: 'Capitolo 1 — Ritorno', season: 'primavera', intro: 'Dieci anni dopo, Dario scende dal treno. Lo zio Ottavio lo aspetta. Anche i suoi debiti.' },
  { title: 'Capitolo 2 — Notte Bianca', season: 'estate', intro: 'L\'estate porta turisti, concerti e lo Smilzo, che non perde mai una corsa.' },
  { title: 'Capitolo 3 — San Donnino', season: 'autunno', intro: 'La festa del patrono è vicina, e qualcuno ha deciso di rovinarla.' },
  { title: 'Capitolo 4 — Nebbia', season: 'inverno', intro: 'La nebbia scende sulla pianura. È il momento di chiudere i conti col Conte.' }
];

export const MISSIONS: Mission[] = [
  {
    id: 'stazione', title: 'La stazione', chapter: 0, giver: 'ottavio', at: 'stazione', season: 'primavera',
    steps: [
      { kind: 'talk', who: 'ottavio', at: 'stazione', lines: [
        { who: 'ottavio', text: 'Dario! Guarda chi si rivede. Sei dimagrito, a Milano non si mangia?' },
        { who: 'dario', text: 'Ciao zio. Si mangia, si paga tanto. Come va la ditta?' },
        { who: 'ottavio', text: 'Va… come un\'utilitaria in salita. Prendi il taxi, andiamo da Giulia: fa rumore.' }
      ] },
      { kind: 'goto', at: 'officina', car: true, text: 'Porta il taxi all\'Officina Stirone' },
      { kind: 'talk', who: 'giulia', at: 'officina', lines: [
        { who: 'giulia', text: 'Dario Corradi. Pensavo fossi una leggenda metropolitana.' },
        { who: 'dario', text: 'Sono reale, purtroppo. Il taxi?' },
        { who: 'giulia', text: 'Freni nuovi, frizione stanca. Se lo tratti bene arriva all\'estate. Qui ripari e salvi quando vuoi.' }
      ] },
      { kind: 'money', amount: 150, text: 'Ottavio ti allunga qualcosa per la benzina' }
    ]
  },
  {
    id: 'primo-giro', title: 'Primo giro', chapter: 0, giver: 'ottavio', at: 'garage', season: 'primavera',
    steps: [
      { kind: 'talk', who: 'ottavio', at: 'garage', lines: [
        { who: 'ottavio', text: 'Due clienti fissi: la signora Pezzani al teatro e il dottore in piazza Matteotti.' },
        { who: 'ottavio', text: 'Puntuale, Dario. La puntualità è l\'unica cosa che ci è rimasta.' }
      ] },
      { kind: 'deliver', to: 'teatro', text: 'Porta la signora Pezzani al Teatro Magnani', time: 75 },
      { kind: 'deliver', to: 'matteotti', text: 'Porta il dottore in Piazza Matteotti', time: 60 },
      { kind: 'talk', who: 'tonino', at: 'bar', lines: [
        { who: 'tonino', text: 'Il nipote di Ottavio! Caffè? Offro io, tanto lo segno a tuo zio.' },
        { who: 'tonino', text: 'Sai che deve cinquemila euro al Conte Bertolazzi? E il Conte vuole il garage.' },
        { who: 'dario', text: 'Cinquemila. Bene. Benissimo.' }
      ] },
      { kind: 'money', amount: 220, text: 'Corse pagate' }
    ]
  },
  {
    id: 'fiori', title: 'Fiori per la piazza', chapter: 0, giver: 'rina', at: 'garibaldi', season: 'primavera',
    steps: [
      { kind: 'talk', who: 'rina', at: 'garibaldi', lines: [
        { who: 'rina', text: 'Dario, tesoro! Il vivaio Bassi ha i fiori per il mercato ma il furgone è rotto.' },
        { who: 'rina', text: 'Le cassette sono in tre posti in città: raccoglile e portale qui prima che apra.' }
      ] },
      { kind: 'collect', items: ['vivaio', 'parcoVV', 'sanpietro'], text: 'Raccogli le cassette di fiori', time: 240 },
      { kind: 'deliver', to: 'garibaldi', text: 'Porta i fiori in Piazza Garibaldi', time: 120, fragile: 40 },
      { kind: 'talk', who: 'conte', at: 'garibaldi', lines: [
        { who: 'conte', text: 'Il giovane Corradi. Che bei fiori. Peccato che appassiscano così in fretta.' },
        { who: 'conte', text: 'Dica a suo zio che ho pazienza fino all\'autunno. Poi il garage è mio.' },
        { who: 'dario', text: 'Gli dirò che lei ama i fiori.' }
      ] },
      { kind: 'money', amount: 300, text: 'La zia Rina insiste: è per il viaggio' },
      { kind: 'season', to: 'estate', card: 'Passano i mesi. È estate, e la città non dorme più.' }
    ]
  },
  {
    id: 'smilzo', title: 'Lo Smilzo', chapter: 1, giver: 'tonino', at: 'bar', season: 'estate',
    steps: [
      { kind: 'talk', who: 'tonino', at: 'bar', lines: [
        { who: 'tonino', text: 'Lo Smilzo, l\'autista del Conte, scommette con chiunque. Cinquecento euro, giro della città.' },
        { who: 'smilzo', text: 'Il taxi contro di me? Mi fai ridere. Partenza al tre.' }
      ] },
      { kind: 'race', rival: 'smilzo', via: ['garibaldi', 'duomo', 'sanpietro', 'parcoVV', 'officina', 'granmadre', 'stazione'], text: 'Batti lo Smilzo: passa dai checkpoint per primo' },
      { kind: 'money', amount: 500, text: 'Scommessa vinta' },
      { kind: 'talk', who: 'smilzo', at: 'stazione', lines: [
        { who: 'smilzo', text: 'Fortuna. Il Conte non sarà contento.' },
        { who: 'dario', text: 'Salutamelo.' }
      ] }
    ]
  },
  {
    id: 'notte-bianca', title: 'Notte Bianca', chapter: 1, giver: 'ottavio', at: 'garage', season: 'estate',
    steps: [
      { kind: 'clock', hours: 21 },
      { kind: 'talk', who: 'ottavio', at: 'garage', lines: [
        { who: 'ottavio', text: 'Notte Bianca! Tutti vogliono un taxi e noi ne abbiamo uno. Lavora finché reggi.' }
      ] },
      { kind: 'deliver', to: 'duomo', text: 'Ragazzi al concerto in Piazza Duomo', time: 70 },
      { kind: 'deliver', to: 'stazione', text: 'Una coppia perde l\'ultimo treno: alla stazione', time: 60 },
      { kind: 'deliver', to: 'verdi', text: 'Un musicista in ritardo in Piazza Verdi', time: 55 },
      { kind: 'money', amount: 450, text: 'Incasso della Notte Bianca' }
    ]
  },
  {
    id: 'furgone', title: 'Il furgone', chapter: 1, giver: 'giulia', at: 'officina', season: 'estate',
    steps: [
      { kind: 'talk', who: 'giulia', at: 'officina', lines: [
        { who: 'giulia', text: 'Il furgone del Conte passa di qui ogni notte e va verso lo scalo. Pieno.' },
        { who: 'giulia', text: 'Seguilo. Non troppo vicino, non troppo lontano.' }
      ] },
      { kind: 'tail', target: 'smilzo', from: 'officina', to: 'scalo', text: 'Segui il furgone senza farti notare' },
      { kind: 'talk', who: 'dario', at: 'scalo', lines: [
        { who: 'dario', text: 'Casse di lanterne votive… di San Donnino? Perché il Conte compra le lanterne della festa?' },
        { who: 'dario', text: 'Guardie. È ora di andare.' }
      ] },
      { kind: 'escape', level: 2, text: 'Semina le pattuglie', time: 120 },
      { kind: 'season', to: 'autunno', card: 'Le foglie cadono sui viali. Si avvicina il 9 ottobre, San Donnino.' }
    ]
  },
  {
    id: 'lanterne', title: 'Le lanterne', chapter: 2, giver: 'rina', at: 'duomo', season: 'autunno',
    steps: [
      { kind: 'talk', who: 'rina', at: 'duomo', lines: [
        { who: 'rina', text: 'Le lanterne della processione sono sparite dalla sacrestia! Il parroco piange.' },
        { who: 'dario', text: 'Io so chi le ha comprate. Quelle dello scalo erano false: le vere le ha nascoste in giro.' }
      ] },
      { kind: 'collect', items: ['santantonio', 'sanpaolo', 'stirone', 'teatro', 'museo', 'granmadre'], text: 'Recupera le sei lanterne', time: 420 },
      { kind: 'deliver', to: 'duomo', text: 'Riporta le lanterne in Piazza Duomo', time: 140 },
      { kind: 'money', amount: 300, text: 'Offerta del comitato della festa' }
    ]
  },
  {
    id: 'processione', title: 'La processione', chapter: 2, giver: 'ferrante', at: 'caserma', season: 'autunno',
    steps: [
      { kind: 'talk', who: 'ferrante', at: 'caserma', lines: [
        { who: 'ferrante', text: 'Corradi. Lei è dappertutto, ultimamente. Le propongo un affare.' },
        { who: 'ferrante', text: 'La reliquia va dal museo al Duomo per la festa. Il nostro furgone è guasto. La porti lei.' },
        { who: 'ferrante', text: 'Piano. Se arriva con un graffio, la arresto per principio.' }
      ] },
      { kind: 'goto', at: 'museo', car: true, text: 'Vai al Museo Musini a prendere la reliquia' },
      { kind: 'deliver', to: 'duomo', text: 'Porta la reliquia al Duomo senza urti', time: 220, fragile: 15 },
      { kind: 'money', amount: 400, text: 'Il comitato ringrazia' }
    ]
  },
  {
    id: 'cassa', title: 'La cassa della festa', chapter: 2, giver: 'tonino', at: 'bar', season: 'autunno',
    steps: [
      { kind: 'talk', who: 'tonino', at: 'bar', lines: [
        { who: 'tonino', text: 'Hanno rubato la cassa delle offerte della festa! Una berlina scura verso via Gramsci.' },
        { who: 'dario', text: 'Lo Smilzo.' },
        { who: 'tonino', text: 'Fermalo, Dario. Fermalo.' }
      ] },
      { kind: 'chase', target: 'smilzo', from: 'garibaldi', text: 'Ferma l\'auto dello Smilzo: speronala', time: 180 },
      { kind: 'talk', who: 'smilzo', at: 'garibaldi', lines: [
        { who: 'smilzo', text: 'Va bene, va bene! Ordini del Conte. Vuole che la festa fallisca e il comitato venda i locali.' },
        { who: 'dario', text: 'Questo lo racconterai al Maresciallo.' }
      ] },
      { kind: 'money', amount: 350, text: 'Cassa recuperata' },
      { kind: 'season', to: 'inverno', card: 'Arriva l\'inverno. La nebbia copre la pianura, e il Conte ha fretta.' }
    ]
  },
  {
    id: 'nebbia', title: 'Nella nebbia', chapter: 3, giver: 'giulia', at: 'officina', season: 'inverno',
    steps: [
      { kind: 'weather', set: 'nebbia' },
      { kind: 'talk', who: 'giulia', at: 'officina', lines: [
        { who: 'giulia', text: 'Il Conte stanotte incontra qualcuno al parco dello Stirone. Con questa nebbia non si vede a dieci metri.' },
        { who: 'dario', text: 'Perfetto per seguirlo.' }
      ] },
      { kind: 'tail', target: 'conte', from: 'villa', to: 'stirone', text: 'Segui l\'auto del Conte nella nebbia' },
      { kind: 'talk', who: 'dario', at: 'stirone', lines: [
        { who: 'dario', text: 'Sta vendendo i locali della festa a un costruttore. Con le firme falsificate del comitato.' }
      ] },
      { kind: 'weather', set: null }
    ]
  },
  {
    id: 'prove', title: 'Le prove', chapter: 3, giver: 'ferrante', at: 'caserma', season: 'inverno',
    steps: [
      { kind: 'talk', who: 'ferrante', at: 'caserma', lines: [
        { who: 'ferrante', text: 'Senza documenti è la sua parola contro quella di un conte. Mi porti le carte.' },
        { who: 'ferrante', text: 'Sono in tre posti: la villa, lo scalo e il notaio vicino al teatro. Non posso aiutarla ufficialmente.' }
      ] },
      { kind: 'collect', items: ['villa', 'scalo', 'teatro'], text: 'Prendi i documenti del Conte', time: 360 },
      { kind: 'escape', level: 3, text: 'Il Conte ha chiamato i suoi amici in divisa: seminali', time: 150 },
      { kind: 'money', amount: 600, text: 'Ottavio vende il vecchio motocarro per aiutarti' }
    ]
  },
  {
    id: 'capodanno', title: 'Capodanno', chapter: 3, giver: 'ottavio', at: 'garage', season: 'inverno',
    steps: [
      { kind: 'clock', hours: 23.2 },
      { kind: 'weather', set: 'neve' },
      { kind: 'talk', who: 'ottavio', at: 'garage', lines: [
        { who: 'ottavio', text: 'Il Maresciallo è in piazza per il Capodanno. Portagli le prove prima di mezzanotte, prima che il Conte firmi.' },
        { who: 'ottavio', text: 'E Dario… comunque vada, sono contento che tu sia tornato.' }
      ] },
      { kind: 'deliver', to: 'garibaldi', text: 'Porta le prove al Maresciallo prima di mezzanotte', time: 150 },
      { kind: 'talk', who: 'ferrante', at: 'garibaldi', lines: [
        { who: 'ferrante', text: 'Firme false, vendite illegali, furto aggravato. Conte Bertolazzi, la vedo male.' },
        { who: 'conte', text: 'Questa città… era quasi mia.' },
        { who: 'ottavio', text: 'E il debito, Conte? Me lo segno come regalo di Capodanno.' },
        { who: 'dario', text: 'Buon anno, Fidenza.' }
      ] },
      { kind: 'money', amount: 1000, text: 'La città ti ringrazia' },
      { kind: 'weather', set: null }
    ]
  }
];

export function missionIndex(id: string): number {
  return MISSIONS.findIndex((m) => m.id === id);
}
