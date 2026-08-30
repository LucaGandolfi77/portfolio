/* utilità DOM condivisa (disponibile a tutti i moduli) */
const $=id=>document.getElementById(id);

/* ═════════════════ DATABASE FISICA (ricette precise) ═════════════════ */
const Q = {
  u:{name:'Up',     charge: 2/3, color:'#ff5f6d', gen:1, mass:'2.2 MeV'},
  d:{name:'Down',   charge:-1/3, color:'#3ee6ff', gen:1, mass:'4.7 MeV'},
  s:{name:'Strange',charge:-1/3, color:'#ffd166', gen:2, mass:'95 MeV'},
  c:{name:'Charm',  charge: 2/3, color:'#b28dff', gen:2, mass:'1.27 GeV'},
  t:{name:'Top',    charge: 2/3, color:'#52ff9e', gen:3, mass:'173 GeV'},
  b:{name:'Bottom', charge:-1/3, color:'#ff9f43', gen:3, mass:'4.18 GeV'},
};
// adroni: chiave = quark ordinati; carica totale = somma cariche (deve dare numero intero)
const HADRONS = {
  uud:{sym:'p⁺',  name:'Protone',   em:'🟥', charge:+1, fact:'uud — il cuore di ogni atomo. Massa 938.3 MeV.'},
  udd:{sym:'n⁰',  name:'Neutrone',  em:'🟦', charge:0,  fact:'udd — si trasforma in protone per decadimento beta (15 min).'},
  uds:{sym:'Λ⁰',  name:'Lambda',    em:'🟨', charge:0,  fact:'uds — un "iperone" con un quark strano (s).'},
  uus:{sym:'Σ⁺',  name:'Sigma+',    em:'🟠', charge:+1, fact:'uus — barione con stranezza +1.'},
  dds:{sym:'Σ⁻',  name:'Sigma−',    em:'🟣', charge:-1, fact:'dds — barione con carica negativa.'},
  sss:{sym:'Ω⁻',  name:'Omega−',    em:'⭐', charge:-1, fact:'sss — tre quark strange: previsto da Gell-Mann nel 1962, trovato nel 1964.'},
};
const MESONS = {
  'u,ū':{sym:'π⁺', name:'Pione+',  em:'🍎', charge:+1, fact:'u + anti-u — mesone neutro (miscela).'},
  'd,ū':{sym:'π⁻', name:'Pione−',  em:'🍏', charge:-1, fact:'d + anti-u — antiparticella del π⁺.'},
  'u,d̄':{sym:'π⁺', name:'Pione+',  em:'🍎', charge:+1, fact:'u + anti-d — mesone più leggero, media la forza nucleare.'},
  'd,d̄':{sym:'π⁰', name:'Pione0',  em:'🍑', charge:0,  fact:'d + anti-d — mesone neutro.'},
  'u,s̄':{sym:'K⁺', name:'Kaone+',  em:'🥝', charge:+1, fact:'u + anti-s — contiene stranezza.'},
  's,ū':{sym:'K⁻', name:'Kaone−',  em:'🫐', charge:-1, fact:'s + anti-u — antiparticella del K⁺.'},
  'c,c̄':{sym:'J/ψ',name:'J/Psi',   em:'🔮', charge:0,  fact:'c + anti-c — charm-anticharm, scoperto nel 1974.'},
};
// nuclei: chiave "p,n" (protoni, neutroni)
const NUCLEI = {
  '1,0':{sym:'¹H',  name:'Protone',   em:'🟥', fact:'Un solo protone. L\'idrogeno più leggero.'},
  '1,1':{sym:'²H',  name:'Deuterio',  em:'🟠', fact:'Protone + neutrone legati dalla forza forte. "Acqua pesante".'},
  '1,2':{sym:'³H',  name:'Trizio',    em:'🟡', fact:'Radioattivo: decade in ¹He con emissione beta.'},
  '2,1':{sym:'³He', name:'Elio-3',    em:'🔵', fact:'2 protoni + 1 neutrone. Raro sulla Terra.'},
  '2,2':{sym:'⁴He', name:'Elio-4 (α)',em:'⚪', fact:'Particella alfa. Legame fortissimo: 28.3 MeV di energia di legame.'},
  '3,3':{sym:'⁶Li', name:'Litio-6',   em:'🟩', fact:'3 p + 3 n. Usato nelle batterie e in fusione.'},
  '3,4':{sym:'⁷Li', name:'Litio-7',   em:'🟢', fact:'L\'isotopo più comune del litio.'},
  '6,6':{sym:'¹²C', name:'Carbonio-12',em:'⚫', fact:'6 p + 6 n. La base della chimica organica! Energia di legame 92.2 MeV.'},
  '8,8':{sym:'¹⁶O', name:'Ossigeno-16',em:'🔵', fact:'8 p + 8 n. L\'aria che respiri.'},
};
// atomi: chiave "Z,e" (protoni=elettroni per neutralità)
const ATOMS = {
  '1,1':{sym:'H',  name:'Idrogeno',  em:'💧', shell:'1s¹',      fact:'1 protone, 1 elettrone. L\'elemento più abbondante dell\'universo.'},
  '2,2':{sym:'He', name:'Elio',      em:'🎈', shell:'1s²',      fact:'Gas nobile: guscio 1s pieno, chimicamente inerte.'},
  '3,3':{sym:'Li', name:'Litio',     em:'🔋', shell:'1s² 2s¹',  fact:'1 elettrone nel guscio esterno → reattivo, cede 1e⁻.'},
  '4,4':{sym:'Be', name:'Berillio',  em:'💎', shell:'1s² 2s²',  fact:'2 elettroni esterni. Leggero e rigido.'},
  '6,6':{sym:'C',  name:'Carbonio',  em:'✏️', shell:'1s² 2s² 2p²', fact:'4 elettroni di valenza → 4 legami. La vita si basa su questo!'},
  '8,8':{sym:'O',  name:'Ossigeno',  em:'🌬️', shell:'1s² 2s² 2p⁴', fact:'6 elettroni nel guscio L, ne servono 2 per completarlo → reagisce facilmente.'},
  '10,10':{sym:'Ne', name:'Neon',    em:'✨', shell:'1s² 2s² 2p⁶', fact:'Gas nobile: gusci completi, non reagisce con nulla.'},
  '26,26':{sym:'Fe', name:'Ferro',   em:'🪙', shell:'[Ar] 3d⁶ 4s²', fact:'Il nucleo più stabile dell\'universo: qui si ferma la fusione stellare.'},
};
// decadimento beta: n → p + e⁻ + ν̄  (d → u + W⁻)
// fusione: 4 ¹H → ⁴He + 2e⁺ + 2ν + 26.7 MeV (E=mc², difetto di massa 0.0287 u)

/* ═══════════ MODELLO STANDARD: fermioni e bosoni ═══════════ */
// Le 17 particelle fondamentali del Modello Standard (più il gravitone ipotetico)
const SM = {
  // QUARK (fermioni, sentono la forza forte)
  u:{type:'quark', em:'🟥', name:'Quark up',    mass:'2.2 MeV',   charge:'+2/3', force:'forte + elettro.', fact:'Il quark più leggero. Nel protone (uud).'},
  d:{type:'quark', em:'🟦', name:'Quark down',  mass:'4.7 MeV',   charge:'−1/3', force:'forte + elettro.', fact:'Nel protone e nel neutrone.'},
  s:{type:'quark', em:'🟨', name:'Quark strange',mass:'95 MeV',   charge:'−1/3', force:'forte + elettro.', fact:'Rende "strani" i barioni che lo contengono.'},
  c:{type:'quark', em:'🟣', name:'Quark charm', mass:'1.27 GeV',  charge:'+2/3', force:'forte + elettro.', fact:'Nella particella J/ψ.'},
  b:{type:'quark', em:'🟠', name:'Quark bottom',mass:'4.18 GeV',  charge:'−1/3', force:'forte + elettro.', fact:'Si osserva nei mesoni B.'},
  t:{type:'quark', em:'🟢', name:'Quark top',   mass:'173 GeV',   charge:'+2/3', force:'forte + elettro.', fact:'LA più pesante: quanto un atomo d\'oro, ma puntiforme.'},
  // LEPTONI (fermioni, NON sentono la forza forte)
  e:{type:'leptone', em:'⚪', name:'Elettrone',  mass:'0.511 MeV', charge:'−1',  force:'elettro. + debole', fact:'Gira attorno al nucleo. Fa gli atomi.'},
  mu:{type:'leptone', em:'🎱', name:'Muone',     mass:'105.7 MeV', charge:'−1',  force:'elettro. + debole', fact:'Un "fratello pesante" dell\'elettrone: vive 2.2 μs.'},
  tau:{type:'leptone', em:'🔴', name:'Tau',      mass:'1777 MeV',  charge:'−1',  force:'elettro. + debole', fact:'Il leptone più pesante, decade in fretta.'},
  ve:{type:'neutrino', em:'👻', name:'Neutrino e',mass:'<1 eV',    charge:'0',   force:'SOLO debole',      fact:'Attraversa la Terra senza accorgersene. Miliardi ti attraversano ogni secondo!'},
  vm:{type:'neutrino', em:'👻', name:'Neutrino μ',mass:'<1 eV',    charge:'0',   force:'SOLO debole',      fact:'Nato dai decadimenti dei muoni.'},
  vt:{type:'neutrino', em:'👻', name:'Neutrino τ',mass:'<1 eV',    charge:'0',   force:'SOLO debole',      fact:'Compagno del tau.'},
  // BOSONI (portatori di forza) + Higgs
  g:{type:'bosone', em:'🕸️', name:'Gluone',     mass:'0',         charge:'0',   force:'forte',           fact:'8 gluoni incollano i quark con la carica di colore. Il "collante" del nucleo.'},
  gam:{type:'bosone', em:'⚡', name:'Fotone',    mass:'0',         charge:'0',   force:'elettromagnetica', fact:'La luce! Mediato l\'attrazione tra cariche opposte.'},
  w:{type:'bosone', em:'🌊', name:'Bosone W±',  mass:'80.4 GeV',  charge:'±1',  force:'debole',          fact:'Cambia il sapore dei quark: n → p nel decadimento beta.'},
  z:{type:'bosone', em:'🌫️', name:'Bosone Z⁰',  mass:'91.2 GeV',  charge:'0',   force:'debole',          fact:'Media le interazioni deboli neutre (neutrini).'},
  h:{type:'higgs', em:'✨', name:'Bosone di Higgs', mass:'125 GeV',charge:'0',  force:'dà la massa',      fact:'La "scintilla" del campo di Higgs. Trovato al CERN nel 2012.'},
};
// chiavi per minigiochi
const SM_KEYS=Object.keys(SM);
const FORCES={
  elettromagnetica:{em:'⚡',bosone:'Fotone',carica:'carica elettrica',fact:'Tra cariche opposte attrae, tra uguali respinge. Tiene gli atomi insieme.'},
  forte:{em:'🕸️',bosone:'Gluone',carica:'colore',fact:'La più potente: incolla i quark e tiene il nucleo. Aumenta con la distanza!'},
  debole:{em:'🌊',bosone:'W± / Z⁰',carica:'sapore',fact:'Cambia i sapori dei quark. Permette il decadimento beta e le reazioni solari.'},
  gravita:{em:'🪐',bosone:'Gravitone (ipotetico)',carica:'massa',fact:'La più debole ma infinita. Non ancora nel Modello Standard.'},
};
const HIGGS_FACT='Campo di Higgs: le particelle che interagiscono ricevono massa come chi cammina nella melassa. Fotone e gluoni passano liberi (massa 0); il quark top è il più "intrappolato" (173 GeV).';

/* ═════════════ LOGICA PURE (testabile) ═════════════ */
function baryonOf(flavors){
  // ordine standard della notazione quark: u < d < s < c < b < t
  const order={u:0,d:1,s:2,c:3,b:4,t:5};
  const s=[...flavors].sort((a,b)=>(order[a]??9)-(order[b]??9)).join('');
  return HADRONS[s]||null;
}
function mesonOf(flavors){
  // flavors: array di 2: un quark e un antiquark → chiave 'quark,antiquark'
  if(flavors.length!==2)return null;
  const [a,b]=flavors;
  const isAnti=x=>mapAnti[Object.keys(mapAnti).find(k=>mapAnti[k]===x)]===x; // vero se è un antiquark
  const antiList='ū d̄ s̄ c̄ t̄ b̄'.split(' ');
  const aIsAnti=antiList.indexOf(a)>=0, bIsAnti=antiList.indexOf(b)>=0;
  // deve esserci esattamente un quark e un antiquark
  if(aIsAnti===bIsAnti)return null;
  const q=aIsAnti?b:a;
  const qa=aIsAnti?a:b;
  const m=MESONS[q+','+qa];
  return m?{...m,charge:chargeOf(q)+chargeOf(qa)}:null;
}
function chargeOf(f){
  const base=Q[f]?Q[f].charge:0;
  const anti='ū d̄ s̄ c̄ t̄ b̄'.split(' ');
  if(anti.indexOf(f)>=0){const q=Object.keys(mapAnti).find(k=>mapAnti[k]===f);return -Q[q].charge;}
  return base;
}
const mapAnti={u:'ū',d:'d̄',s:'s̄',c:'c̄',t:'t̄',b:'b̄'};
function hadronOf(flavors){
  const b=baryonOf(flavors);
  if(b)return {kind:'barione',...b,charge:chargeSum(flavors)};
  const m=mesonOf(flavors);
  if(m)return {kind:'mesone',...m};
  return null;
}
function chargeSum(flavors){return flavors.reduce((s,f)=>s+chargeOf(f),0);}
function nucleusOf(p,n){
  return NUCLEI[p+','+n]||null;
}
function atomOf(p,n,e){
  const nu=NUCLEI[p+','+n];
  // l'elemento si identifica dai PROTONI: cerca l'atomo base per Z (elettroni = Z)
  const base=ATOMS[p+','+p];
  if(!base)return null;
  const charge=p-e; // carica netta: protoni - elettroni
  return {nu,sym:base.sym,name:base.name,em:base.em,shell:base.shell,fact:base.fact,charge,neutral:charge===0};
}
function fusionOk(n){
  return n===4; // 4 protoni → elio
}
const FUSION_FACT='4 protoni → ¹He + 2 positroni + 2 neutrini + 26.7 MeV. E=mc²: il difetto di massa è 0.0287 u.';
