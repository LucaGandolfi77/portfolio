/* ═════════════ TEST FISICA ═════════════ */
function selfTest(){
  const r=[];
  const ok=(n,p,d)=>r.push({name:n,pass:!!p,detail:d||''});
  // 1. cariche dei quark
  ok('up = +2/3', Math.abs(chargeOf('u')-2/3)<1e-9);
  ok('down = -1/3', Math.abs(chargeOf('d')+1/3)<1e-9);
  ok('strange = -1/3', Math.abs(chargeOf('s')+1/3)<1e-9);
  ok('anti-up = -2/3', Math.abs(chargeOf('ū')+2/3)<1e-9);
  // 2. barioni: somma cariche = intero, ricette corrette
  const p=baryonOf(['u','u','d']);
  ok('protone = uud', !!p&&p.name==='Protone'&&Math.abs(chargeSum(['u','u','d'])-1)<1e-9, JSON.stringify(p));
  const n=baryonOf(['d','u','d']);
  ok('neutrone = udd', !!n&&n.name==='Neutrone'&&Math.abs(chargeSum(['u','d','d']))<1e-9);
  const l=baryonOf(['u','d','s']);
  ok('lambda = uds', !!l&&l.name==='Lambda');
  const o=baryonOf(['s','s','s']);
  ok('omega = sss', !!o&&o.name==='Omega−');
  ok('carica barione = intero', Math.abs(chargeSum(['u','u','d'])%1)<1e-9&&Math.abs(chargeSum(['s','s','s'])%1)<1e-9);
  // 3. mesoni
  const pi=mesonOf(['u','d̄']);
  ok('pione+ = u d̄', !!pi&&pi.name==='Pione+'&&Math.abs(pi.charge-1)<1e-9, JSON.stringify(pi));
  const ka=mesonOf(['u','s̄']);
  ok('kaone+ = u s̄', !!ka&&ka.name==='Kaone+', JSON.stringify(ka));
  const bad=mesonOf(['u','u']);
  ok('due quark → nessun mesone', bad===null);
  const bad2=mesonOf(['u','d']);
  ok('u+d non è mesone (servono antiquark)', bad2===null);
  // 4. nuclei
  const d=NUCLEI['1,1'];
  ok('deuterio = 1p+1n', !!d&&d.name==='Deuterio');
  const he=NUCLEI['2,2'];
  ok('elio-4 = 2p+2n', !!he&&he.name==='Elio-4 (α)');
  const c12=NUCLEI['6,6'];
  ok('carbonio-12 = 6p+6n', !!c12&&c12.name==='Carbonio-12');
  // 5. atomi
  const H=atomOf(1,0,1);
  ok('idrogeno neutro', !!H&&H.neutral&&H.name==='Idrogeno', JSON.stringify(H));
  const C=atomOf(6,6,6);
  ok('carbonio neutro 6e⁻', !!C&&C.neutral&&C.shell.includes('2p²'), JSON.stringify(C));
  const He=atomOf(2,2,2);
  ok('elio: guscio 1s² pieno', !!He&&He.shell==='1s²');
  const ion=atomOf(3,3,2);
  ok('ione litio Li⁺ (3p-2e=+1)', !!ion&&ion.charge===1&&!ion.neutral);
  // 6. fusione
  ok('fusione richiede 4 protoni', fusionOk(4)&&!fusionOk(3));
  ok('difetto di massa 0.0287 u → 26.7 MeV', FUSION_FACT.includes('0.0287')&&FUSION_FACT.includes('26.7'));
  // 7. Modello Standard
  ok('17 particelle SM + gravitone', Object.keys(SM).length>=17, 'n='+Object.keys(SM).length);
  ok('fotone senza massa', SM.gam.mass==='0'&&SM.g.mass==='0', SM.gam.mass+' '+SM.g.mass);
  ok('higgs 125 GeV', SM.h.mass==='125 GeV', SM.h.mass);
  ok('quark top il più pesante (173 GeV)', SM.t.mass==='173 GeV', SM.t.mass);
  ok('W 80.4 / Z 91.2 GeV', SM.w.mass==='80.4 GeV'&&SM.z.mass==='91.2 GeV', SM.w.mass+' '+SM.z.mass);
  ok('elettrone 0.511 MeV', SM.e.mass==='0.511 MeV');
  ok('4 forze definite', Object.keys(FORCES).length===4);
  ok('forza forte → gluone', FORCES.forte.bosone==='Gluone');
  ok('debole → W/Z cambia sapore', FORCES.debole.bosone.includes('W±'));
  ok('neutrini solo debole', SM.ve.force==='SOLO debole');
  // 8. quiz 9 domande
  ok('quiz 9 domande', QUIZ.length===9, 'n='+QUIZ.length);
  return r;
}

/* ═════════════ ESPOSTO PER TEST ═════════════ */
window.__QUANTUM__={
  Q,chargeOf,chargeSum,baryonOf,mesonOf,hadronOf,nucleusOf,atomOf,fusionOk,selfTest,
  HADRONS,MESONS,NUCLEI,ATOMS,mapAnti,SM,FORCES,HIGGS_FACT,
  get S(){return S;},get chapter(){return chapter;},get STORY(){return STORY;},get QUIZ(){return QUIZ;},
  get skipChapter(){return typeof skipChapter==='function'?skipChapter:null;},
  get setupSM(){return typeof setupSM==='function'?setupSM:null;},
  get setupHiggs(){return typeof setupHiggs==='function'?setupHiggs:null;},
  get higgsGiveMass(){return typeof higgsGiveMass==='function'?higgsGiveMass:null;},
};
