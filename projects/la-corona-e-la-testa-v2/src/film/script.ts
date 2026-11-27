/*
 * The screenplay. Original text after the legend of Saint Domninus (San
 * Donnino), martyr on the Via Emilia in 304 and patron of Fidenza. Pure data:
 * timing is derived from it in timeline.ts, pictures live in shots/.
 *
 * A line is [speaker, english, italiano, latin?]. A line with Latin is shown
 * as an inscription, with its translation below.
 */

export const FILM = {
  title: 'La Corona e la Testa',
  credit: { en: 'THE LEGEND OF SAINT DOMNINUS', it: 'LA LEGGENDA DI SAN DONNINO' },
};

export type Who =
  | 'n' | 'don' | 'max' | 'eut' | 'val' | 'eld' | 'mar' | 'guard' | 'host' | 'pres' | 'sol'
  | 'farm' | 'boy' | 'wid' | 'mast' | 'app' | 'pil' | 'kid' | 'mom';

export interface Speaker {
  en: string;
  it: string;
  /** Voice colour for the optional spoken narration. */
  pitch: number;
  color: string;
}

export const SPEAKERS: Record<Who, Speaker> = {
  n: { en: '', it: '', pitch: 0.95, color: '#ecdcb8' },
  don: { en: 'Domninus', it: 'Donnino', pitch: 0.86, color: '#f2c46a' },
  max: { en: 'Emperor Maximian', it: 'L’imperatore Massimiano', pitch: 0.7, color: '#c88ae8' },
  eut: { en: 'Eutychius', it: 'Eutichio', pitch: 0.92, color: '#c8b48a' },
  val: { en: 'Valerius', it: 'Valerio', pitch: 0.76, color: '#ff8c6a' },
  eld: { en: 'Old Sabinus', it: 'Il vecchio Sabino', pitch: 0.8, color: '#a8d0f0' },
  mar: { en: 'Marcella', it: 'Marcella', pitch: 1.3, color: '#f0b0c8' },
  guard: { en: 'Guard', it: 'Guardia', pitch: 0.8, color: '#b8b0a0' },
  host: { en: 'The innkeeper', it: 'L’ostessa', pitch: 1.12, color: '#e8a878' },
  pres: { en: 'The presbyter', it: 'Il presbitero', pitch: 0.88, color: '#b0d8b0' },
  sol: { en: 'Soldier', it: 'Soldato', pitch: 0.9, color: '#c0a890' },
  farm: { en: 'Secundus', it: 'Secondo', pitch: 0.84, color: '#d8c070' },
  boy: { en: 'Lucius', it: 'Lucio', pitch: 1.6, color: '#ffd87a' },
  wid: { en: 'The widow', it: 'La vedova', pitch: 1.1, color: '#d0b8e8' },
  mast: { en: 'The master sculptor', it: 'Il maestro scultore', pitch: 0.82, color: '#e0c89a' },
  app: { en: 'The apprentice', it: 'L’apprendista', pitch: 1.35, color: '#a8e0c8' },
  pil: { en: 'A pilgrim', it: 'Una pellegrina', pitch: 1.2, color: '#f0c0a0' },
  kid: { en: 'Giulia', it: 'Giulia', pitch: 1.55, color: '#9fe0ff' },
  mom: { en: 'Her mother', it: 'La mamma', pitch: 1.15, color: '#f4c8a8' },
};

export type Line = [who: Who, en: string, it: string, latin?: string];

export interface ShotDef {
  id: string;
  lines: Line[];
}

export interface ChapterDef {
  id: string;
  roman: string;
  /** The Latin title, shown large on the chapter card. */
  fr: string;
  en: string;
  it: string;
  accent: string;
  shots: ShotDef[];
}

export const SCRIPT: ChapterDef[] = [
  {
    id: 'prologue', roman: 'PROLOGUS', fr: 'La Corona e la Testa', en: 'The Stone That Speaks', it: 'La pietra che racconta', accent: '#e8c070',
    shots: [
      { id: 'pr-piazza', lines: [
        ['n', 'In Fidenza, on a winter evening, the cathedral square is almost empty. Only a little girl is looking up, and she will not leave.', 'A Fidenza, in una sera d’inverno, la piazza del Duomo è quasi vuota. Solo una bambina guarda in alto, e non vuole andare via.'],
        ['kid', 'Mum, look up there. That man is holding his head in his hands, and it does not look as if it hurts.', 'Mamma, guarda lassù. Quell’uomo tiene la testa tra le mani, e non sembra che gli faccia male.'],
        ['mom', 'That is Saint Domninus, Giulia. They took everything from him, and the town bore his name for a thousand years.', 'È San Donnino, Giulia. Gli hanno tolto tutto, e la città ha portato il suo nome per mille anni.'],
        ['kid', 'But why is he smiling, if he has no head? I would cry.', 'Ma perché sorride, se non ha più la testa? Io piangerei.'],
        ['mom', 'Sometimes people smile just when they have lost everything, and find out they have lost nothing.', 'A volte si sorride proprio quando si è perso tutto, e si scopre di non avere perso niente.'],
      ] },
      { id: 'pr-statue', lines: [
        ['n', 'To understand that smile, we have to go back seventeen centuries, to the palace of an emperor who could not sleep.', 'Per capire quel sorriso bisogna tornare indietro di diciassette secoli, nel palazzo di un imperatore che non riusciva a dormire.'],
      ] },
      { id: 'pr-empire', lines: [
        ['n', 'The year 303. Four sovereigns share the Roman world. In Milan reigns Maximian, Augustus of the West.', 'Anno 303. Quattro sovrani si dividono il mondo romano. A Milano regna Massimiano, Augusto d’Occidente.'],
        ['n', 'A new edict commands every subject to sacrifice to the gods. Many obey: obeying is easier than choosing.', 'Un nuovo editto ordina a ogni suddito di sacrificare agli dei. Molti obbediscono: obbedire è più facile che scegliere.'],
      ] },
    ],
  },
  {
    id: 'corona', roman: 'I', fr: 'Corona', en: 'The Crown', it: 'La corona', accent: '#f2c460',
    shots: [
      { id: 'co-treasury', lines: [
        ['n', 'Domninus was the emperor’s first chamberlain: the man who kept his crown and watched over his sleep.', 'Donnino era il primo cubiculario dell’imperatore: l’uomo che custodiva la sua corona e vegliava sul suo sonno.'],
        ['eut', 'Every morning you polish it as if it were the first time. I envy you: at least you believe in something, even if it is only gold.', 'Ogni mattina la lucidi come se fosse la prima volta. Ti invidio: tu almeno credi in qualcosa, anche se è soltanto oro.'],
        ['don', 'I do not believe in gold, Eutychius. I polish it because the hands need something to do while the soul keeps silent.', 'Non credo nell’oro, Eutichio. Lo lucido perché le mani hanno bisogno di fare qualcosa, mentre l’anima tace.'],
        ['eut', 'The soul! Nobody in this palace needs a soul. You need to know when to bow.', 'L’anima! A palazzo nessuno ha bisogno di un’anima. Serve sapere quando inchinarsi.'],
        ['don', 'I know. And lately I bow so well that I no longer know before whom.', 'Lo so. E da qualche tempo mi inchino così bene che non so più davanti a chi.'],
      ] },
      { id: 'co-night', lines: [
        ['n', 'That night, as on many others, the emperor could not sleep. The master of the world was afraid of the dark.', 'Quella notte, come tante altre, l’imperatore non riusciva a dormire. Il padrone del mondo aveva paura del buio.'],
        ['max', 'Are you still awake, Domninus? Talk to me. The silence of this room feels like a tribunal.', 'Sei ancora sveglio, Donnino? Parlami. Il silenzio di questa stanza mi sembra un tribunale.'],
        ['don', 'As long as you are, Augustus. And who judges you, at this hour?', 'Finché lo sei tu, Augusto. E chi ti giudica, a quest’ora?'],
        ['max', 'Everyone. They kiss my hands and wish me dead. You are the only one who asks for nothing, and sometimes that frightens me most of all.', 'Tutti. Mi baciano le mani e mi augurano la morte. Tu sei l’unico che non chiede niente, e a volte è questo che mi spaventa di più.'],
        ['don', 'Do not be afraid of me. Rest. I will keep watch at the door, as always, and pray for you, without knowing to whom.', 'Non avere paura di me. Riposa. Io veglio alla porta, come sempre, e prego per te, senza sapere a chi.'],
      ] },
      { id: 'co-throne', lines: [
        ['n', 'In the morning, in the great hall, the court waited in silence for its lord.', 'Al mattino, nella grande aula, la corte attendeva in silenzio il suo signore.'],
        ['max', 'Domninus. Come closer. Let them all see who stands nearest to my head.', 'Donnino. Avvicinati. Che tutti vedano chi sta più vicino alla mia testa.'],
        ['max', 'You are the only man who touches my head without trembling. Tell me why.', 'Sei l’unico uomo che mi tocca la testa senza tremare. Dimmi perché.'],
        ['don', 'Because I serve you, Augustus, and I do not fear you. Whoever fears does not serve: he only obeys.', 'Perché ti servo, Augusto, e non ti temo. Chi teme non serve: obbedisce soltanto.'],
        ['max', 'Then stay at my side today. Today Rome will see the difference between those who serve and those who betray.', 'Allora resta al mio fianco, oggi. Oggi Roma vedrà la differenza tra chi serve e chi tradisce.'],
      ] },
      { id: 'co-trial', lines: [
        ['guard', 'Augustus, the Christians arrested at the Ticinese gate.', 'Augusto, i cristiani arrestati alla porta Ticinese.'],
        ['max', 'I ask you for so little. One grain of incense, a gesture that costs nothing, and you will all go home free.', 'Vi chiedo così poco. Un granello d’incenso, un gesto che non costa niente, e tornerete tutti a casa liberi.'],
        ['eld', 'You ask little, Augustus, and that little is exactly what we cannot give. We pray for you every day, but not to your gods.', 'Ci chiedi poco, Augusto, ed è proprio quel poco che non possiamo darti. Preghiamo per te ogni giorno, ma non ai tuoi dei.'],
        ['mar', 'We have stolen nothing and harmed no one. Only tell me why we must die, and perhaps I will forgive you.', 'Non abbiamo rubato niente e non abbiamo fatto male a nessuno. Dimmi soltanto perché dobbiamo morire, e forse ti perdonerò.'],
        ['max', 'Forgive me? Men do not want truth, they want bread and obedience, and I give them both. Take them away. Tomorrow, the beasts.', 'Perdonarmi? Gli uomini non vogliono la verità, vogliono pane e obbedienza, e io do loro entrambi. Portateli via. Domani, alle belve.'],
      ] },
    ],
  },
  {
    id: 'fides', roman: 'II', fr: 'Fides', en: 'The Night of Water', it: 'La notte dell’acqua', accent: '#9cc4f0',
    shots: [
      { id: 'fi-prison', lines: [
        ['n', 'That night Domninus did not keep watch at the door. He went down to the prisons, with bread and a jug of water.', 'Quella notte Donnino non vegliò alla porta. Scese nelle prigioni, con del pane e una brocca d’acqua.'],
        ['eld', 'The emperor’s chamberlain, among the condemned. Have you come to judge us, or to watch how the disobedient die?', 'Il cubiculario dell’imperatore, tra i condannati. Sei venuto a giudicarci, o a guardare come muore chi non obbedisce?'],
        ['don', 'I have come to understand. Tomorrow you will die, and tonight you are singing. I have not sung once in twenty years at court.', 'Sono venuto a capire. Domani morirete, e stanotte cantate. Io non ho cantato una sola volta in vent’anni di palazzo.'],
        ['eld', 'We are afraid too, my son. I tremble as you do. But we have found something that weighs more than fear.', 'Anche noi abbiamo paura, figlio mio. Tremo come tremi tu. Ma abbiamo trovato qualcosa che pesa più della paura.'],
        ['don', 'For twenty years I have served a crown, and every night I feel emptier. Tell me about yours.', 'Da vent’anni servo una corona, e ogni notte mi sento più vuoto. Parlami della vostra.'],
      ] },
      { id: 'fi-baptism', lines: [
        ['eld', 'Ours is a crown of thorns. They put it on a king’s head to mock him, and he wore it to the end.', 'La nostra è una corona di spine. La misero sulla testa di un re per deriderlo, e lui la portò fino alla fine.'],
        ['eld', 'And that king forgave the men who were killing him. Not afterwards: while they were killing him.', 'E quel re perdonò gli uomini che lo stavano uccidendo. Non dopo: mentre lo uccidevano.'],
        ['don', 'Then that is the king I want to serve. But I come late, with hands worn by twenty years of bowing. Will he still want me?', 'Allora è quel re che voglio servire. Ma arrivo tardi, con le mani consumate da vent’anni di inchini. Mi vorrà ancora?'],
        ['mar', 'Whoever comes at the last hour receives the same wage as the first. He has never sent anyone away.', 'Chi arriva all’ultima ora riceve la stessa paga del primo. Lui non ha mai mandato via nessuno.'],
        ['eld', 'I baptise you in the name of the Father, and of the Son, and of the Holy Spirit.', 'Io ti battezzo nel nome del Padre, del Figlio e dello Spirito Santo.', 'Ego te baptizo in nomine Patris, et Filii, et Spiritus Sancti.'],
        ['n', 'The water of a prison jug ran down the chamberlain’s face. For the first time in many years, he wept. Outside, dawn was breaking.', 'L’acqua di una brocca di prigione scese sul volto del cubiculario. Per la prima volta dopo tanti anni, pianse. Fuori, si faceva giorno.'],
      ] },
    ],
  },
  {
    id: 'recusatio', roman: 'III', fr: 'Recusatio', en: 'The Refusal', it: 'Il rifiuto', accent: '#d86a5c',
    shots: [
      { id: 're-altar', lines: [
        ['n', 'At the morning sacrifice, the emperor wanted the whole court to witness an example of loyalty.', 'Al sacrificio del mattino, l’imperatore volle che tutta la corte assistesse a un esempio di fedeltà.'],
        ['max', 'Domninus, yours is the most faithful hand in this palace. You will burn the incense, for all to see. It is only a gesture.', 'Donnino, la tua è la mano più fedele di questo palazzo. Brucerai tu l’incenso, davanti a tutti. È solo un gesto.'],
        ['don', 'My hand has served you for twenty years, Augustus. But my soul is not yours. It never was: I simply did not know it.', 'La mia mano ti ha servito per vent’anni, Augusto. Ma la mia anima non è tua. Non lo è mai stata: solo che non lo sapevo.'],
        ['max', 'Are you one of them, then? You?', 'Sei dunque uno di loro? Tu?'],
        ['don', 'Yes. Since last night. And I have never been so free, nor so much in your power.', 'Sì. Da questa notte. E non sono mai stato così libero, né così in tuo potere.'],
      ] },
      { id: 're-crown', lines: [
        ['n', 'The court held its breath. Domninus climbed the steps of the throne, the crown in his hands.', 'La corte trattenne il respiro. Donnino salì i gradini del trono, con la corona tra le mani.'],
        ['don', 'I give you back your crown. I cannot guard your power and serve another King. No one can serve two masters.', 'Ti restituisco la tua corona. Non posso custodire il tuo potere e servire un altro Re. Nessuno può servire due padroni.'],
        ['max', 'You were the only one I trusted. The only one! Do you understand what you are taking from me?', 'Eri l’unico di cui mi fidassi. L’unico! Capisci che cosa mi togli?'],
        ['don', 'A lie, Augustus. I have never lied to you, and I will not begin now, not even to save myself.', 'Una menzogna, Augusto. Non ti ho mai mentito, e non comincerò adesso, nemmeno per salvarmi.'],
        ['max', 'Seize him! Seize him, before I change my mind.', 'Prendetelo! Prendetelo, prima che io ci ripensi.'],
      ] },
      { id: 're-escape', lines: [
        ['n', 'The captain of the guard was Valerius, who had fought beside him on the Rhine. He led him to a door that no one watched.', 'Il capitano della guardia era Valerio, che aveva combattuto al suo fianco sul Reno. Lo condusse a una porta che nessuno sorvegliava.'],
        ['val', 'Go, before I change my mind. I can give you one hour. Do not ask me why: I do not know myself.', 'Vai, prima che cambi idea. Posso darti un’ora. Non chiedermi perché: non lo so nemmeno io.'],
        ['don', 'They will punish you for this, Valerius. And you will punish yourself as well. I know you.', 'Ti puniranno per questo, Valerio. E ti punirai anche da solo. Ti conosco.'],
        ['val', 'Then do not let it be for nothing. Run, and do not look back. If you look back, I will lose my courage.', 'Allora fa’ che non sia per niente. Corri, e non voltarti. Se ti volti, io perdo il coraggio.'],
        ['don', 'May God reward you, my friend. Even if you do not believe in him, he believes in you.', 'Che Dio te lo renda, amico mio. Anche se tu non credi in lui, lui crede in te.'],
      ] },
      { id: 're-order', lines: [
        ['max', 'A whole palace of guards, and no one saw him leave. Not even you, Valerius? Look me in the eye.', 'Un intero palazzo di guardie, e nessuno l’ha visto uscire. Nemmeno tu, Valerio? Guardami negli occhi.'],
        ['val', 'No one, Augustus.', 'Nessuno, Augusto.'],
        ['max', 'You were his friend. You know which road he will take, you know his step. Bring him back to me, and I will forget this day.', 'Eri suo amico. Sai quale strada prenderà, conosci il suo passo. Riportamelo, e dimenticherò questo giorno.'],
        ['max', 'Succeed, and you will never forgive yourself. Fail, and I will never forgive you.', 'Se ci riesci, non te lo perdonerai mai. Se fallisci, non te lo perdonerò io.'],
      ] },
    ],
  },
  {
    id: 'via', roman: 'IV', fr: 'Via', en: 'The Road', it: 'La strada', accent: '#88a8c8',
    shots: [
      { id: 'vi-rain', lines: [
        ['n', 'Domninus fled south, towards Rome. As he walked, he wondered whether his was faith, or only pride.', 'Donnino fuggì verso sud, verso Roma. Camminando si chiedeva se la sua fosse fede, o soltanto orgoglio.'],
        ['n', 'For two days it rained without stopping. On the second night, with no strength left, he knocked at the door of an inn.', 'Per due giorni piovve senza sosta. La seconda notte, senza più forze, bussò alla porta di una locanda.'],
      ] },
      { id: 'vi-inn', lines: [
        ['host', 'Come in, you are soaked to the bone. Here no one asks the name of whoever knocks at night: at night we are all the same.', 'Entra, sei fradicio. Qui nessuno chiede il nome a chi bussa di notte: di notte siamo tutti uguali.'],
        ['don', 'Then I will not tell you mine. It would put you in danger, and I have already hurt enough of those who loved me.', 'Allora non ti dirò il mio. Ti metterebbe in pericolo, e ho già fatto abbastanza male a chi mi ha voluto bene.'],
        ['host', 'There is no need. You looked at the fish carved on my beam the way one looks at a friend not seen for a long time.', 'Non serve. Hai guardato il pesce inciso sulla mia trave come si guarda un amico che non si vedeva da tanto.'],
        ['host', 'Come. Downstairs there are others like you. People who have lost everything and do not yet know they are rich.', 'Vieni. Di sotto ce ne sono altri come te. Gente che ha perso tutto e non sa ancora di essere ricca.'],
      ] },
      { id: 'vi-cellar', lines: [
        ['n', 'In the cellar, among the barrels, a small community was praying by the light of a single lamp.', 'In cantina, tra le botti, una piccola comunità pregava alla luce di una sola lucerna.'],
        ['pres', 'You have left a palace to sleep in a cellar. Do you not regret it?', 'Hai lasciato un palazzo per dormire in una cantina. Non te ne penti?'],
        ['don', 'In the palace I had a hundred rooms and no one to break bread with. Here a barrel is my bed, and I feel I have come home.', 'Nel palazzo avevo cento stanze e nessuno con cui spezzare il pane. Qui una botte mi fa da letto, e mi sembra di essere tornato a casa.'],
        ['pres', 'Then sit down, brother. Each of us is guilty before all, for all. That is why there is bread enough for everyone.', 'Allora siediti, fratello. Ognuno di noi è colpevole di tutto, davanti a tutti. Per questo il pane basta per tutti.'],
      ] },
      { id: 'vi-patrol', lines: [
        ['sol', 'Open up! We are looking for a man of the court. Tall, with a gold ring on his finger.', 'Aprite! Cerchiamo un uomo della corte. Alto, con un anello d’oro al dito.'],
        ['host', 'Only carters and rain pass this way, soldier. Look around, if you like.', 'Qui passano solo carrettieri e pioggia, soldato. Guarda pure, se vuoi.'],
        ['sol', 'Not tonight. But if you see him, the emperor pays well. Everyone has a price, innkeeper.', 'Non stanotte. Ma se lo vedi, l’imperatore paga bene. Tutti hanno un prezzo, ostessa.'],
        ['n', 'The soldiers rode off into the rain. In the cellar no one had dared to breathe. Someone, softly, was giving thanks.', 'I soldati si allontanarono nella pioggia. In cantina nessuno aveva osato respirare. Qualcuno, piano, ringraziava.'],
      ] },
      { id: 'vi-ring', lines: [
        ['don', 'Take this ring. For tonight’s bread, and for the lie: I know what it costs to lie, for someone who never does.', 'Prendi questo anello. Per il pane di stanotte, e per la bugia: so quanto costa mentire, a chi non mente mai.'],
        ['host', 'Keep it. Where you are going, you will need it more than I do. And leave my lie to me: I will settle it with God.', 'Tienilo. Dove vai, ti servirà più che a me. E la mia bugia lasciala a me: me la vedrò io con Dio.'],
        ['don', 'Where I am going, I will need nothing more. I am learning that one only grows light by losing.', 'Dove vado, non mi servirà più nulla. Sto imparando che si diventa leggeri soltanto perdendo.'],
      ] },
      { id: 'vi-fork', lines: [
        ['host', 'To the left, the road to Pavia. Straight ahead, the Via Emilia, towards Parma and Rome.', 'A sinistra, la strada per Pavia. Dritto, la via Emilia, verso Parma e verso Roma.'],
        ['host', 'It is the straightest road, but also the most watched. Straight roads are always the most dangerous.', 'È la strada più dritta, ma anche la più sorvegliata. Le strade dritte sono sempre le più pericolose.'],
        ['don', 'Then I will take that one. I have spent my life hiding behind another man’s throne. I do not want to hide any more.', 'Allora prenderò quella. Ho passato la vita a nascondermi dietro il trono di un altro. Non voglio più nascondermi.'],
      ] },
    ],
  },
  {
    id: 'aemilia', roman: 'V', fr: 'Via Aemilia', en: 'The Plain', it: 'La pianura', accent: '#d8c070',
    shots: [
      { id: 'ae-plain', lines: [
        ['n', 'The Via Emilia ran straight as a sword across the plain. Domninus walked from dawn to dusk, and in that solitude, for the first time, he did not feel alone.', 'La via Emilia correva dritta come una spada attraverso la pianura. Donnino camminava dall’alba al tramonto, e in quella solitudine, per la prima volta, non si sentiva solo.'],
      ] },
      { id: 'ae-farm', lines: [
        ['farm', 'Traveller! You look like a man who knows things. My son is burning with fever, and the doctor is three days away.', 'Viandante! Hai l’aria di uno che sa le cose. Mio figlio brucia di febbre, e il medico è a tre giorni di strada.'],
        ['don', 'I know nothing, friend, and I am no doctor. But I can keep watch with you, if you let me. That much I have learned.', 'Non so niente, amico, e non sono un medico. Ma posso vegliare con te, se me lo permetti. Questo almeno l’ho imparato.'],
        ['farm', 'The neighbour’s dog bit him four days ago. Since then he will not drink, and he screams at the sight of water. I beat that dog, and it did no good.', 'Il cane del vicino l’ha morso quattro giorni fa. Da allora non beve, e grida se vede l’acqua. Ho bastonato quel cane, e non è servito a niente.'],
        ['don', 'Then we will pray for him all night. For the child, and for the dog as well. You and I together.', 'Allora pregheremo per lui tutta la notte. Per il bambino, e anche per il cane. Tu e io insieme.'],
      ] },
      { id: 'ae-prayer', lines: [
        ['don', 'Lord, all my life I asked you for things, for myself. Tonight I ask nothing for me. I have only this night: take it, and let this child live.', 'Signore, per tutta la vita ti ho chiesto cose per me. Stanotte non chiedo niente per me. Ho soltanto questa notte: prendila, e lascia vivere questo bambino.'],
        ['n', 'Outside, the dog that had bitten him whimpered until dawn. Then it fell silent.', 'Fuori, il cane che lo aveva morso guaì fino all’alba. Poi tacque.'],
      ] },
      { id: 'ae-dawn', lines: [
        ['boy', 'Father… I am thirsty.', 'Papà… ho sete.'],
        ['farm', 'He is drinking. Look, he is drinking! Who are you, that God listens to you? Tell me, I beg you.', 'Beve. Guarda, beve! Chi sei tu, che Dio ti ascolta? Dimmelo, ti prego.'],
        ['don', 'A man who for twenty years prayed badly, asking God to stand in his place. Last night, for once, I prayed well.', 'Un uomo che per vent’anni ha pregato male, chiedendo a Dio di mettersi al suo posto. Stanotte, per una volta, ho pregato bene.'],
      ] },
      { id: 'ae-riders', lines: [
        ['n', 'Along the road, a column of horsemen was riding towards Parma. At its head rode Valerius.', 'Lungo la strada, una colonna di cavalieri avanzava verso Parma. In testa cavalcava Valerio.'],
        ['sol', 'Centurion, the man by the farm. He matches the description.', 'Centurione, l’uomo vicino al podere. Corrisponde alla descrizione.'],
        ['val', 'I know. I would recognise him among a thousand, even in the dark. He walks as if no one were following him.', 'Lo so. Lo riconoscerei tra mille, anche al buio. Cammina come se nessuno lo inseguisse.'],
        ['val', 'No one touches him. When the time comes, I will be the one to take him. I owe him that much.', 'Nessuno lo tocchi. Quando sarà il momento, sarò io a prenderlo. Almeno questo glielo devo.'],
      ] },
      { id: 'ae-farewell', lines: [
        ['boy', 'Will you come back to see us?', 'Tornerai a trovarci?'],
        ['don', 'Perhaps not, Lucius. But when you are afraid, remember this morning. And if someone hurts you, try to forgive him: it is hard, but it sets you free.', 'Forse no, Lucio. Ma quando avrai paura, ricordati di questa mattina. E se qualcuno ti farà del male, prova a perdonarlo: è difficile, ma rende liberi.'],
        ['farm', 'At least take my staff. The road is still long.', 'Prendi almeno il mio bastone. La strada è ancora lunga.'],
        ['don', 'Not so long, my friend. Not any more. I can feel it ending, and I am not afraid.', 'Non così lunga, amico mio. Non più. La sento finire, e non ho paura.'],
      ] },
    ],
  },
  {
    id: 'stirone', roman: 'VI', fr: 'Ad Flumen', en: 'The River', it: 'Il torrente', accent: '#ff9a5c',
    shots: [
      { id: 'st-bridge', lines: [
        ['n', 'At the fifteenth mile from Parma the road crosses the Stirone. There, at sunset, the horsemen caught up with him.', 'Al quindicesimo miglio da Parma la strada attraversa lo Stirone. Lì, al tramonto, i cavalieri lo raggiunsero.'],
      ] },
      { id: 'st-meet', lines: [
        ['val', 'Domninus. I have ridden for three days hoping not to find you. Every evening I prayed you would be faster than me.', 'Donnino. Ho cavalcato per tre giorni sperando di non trovarti. Ogni sera pregavo che tu fossi più veloce di me.'],
        ['don', 'And I walked slowly, Valerius, hoping that if someone had to come, it would be you.', 'E io ho camminato piano, Valerio, sperando che, se qualcuno doveva venire, fossi tu.'],
        ['val', 'The emperor will forgive you. One gesture, a pinch of incense, and you come home. What does it cost you?', 'L’imperatore ti perdonerà. Un gesto, un pizzico d’incenso, e torni a casa. Che cosa ti costa?'],
        ['don', 'It would cost me myself. And my home, now, is somewhere else.', 'Mi costerebbe me stesso. E la mia casa, adesso, è altrove.'],
      ] },
      { id: 'st-plead', lines: [
        ['val', 'We fought together on the Rhine. You carried me on your back for two miles, under the arrows. You saved my life, and now you want me to take yours?', 'Abbiamo combattuto insieme sul Reno. Mi hai portato in spalla per due miglia, sotto le frecce. Mi hai salvato la vita, e adesso vuoi che ti tolga la tua?'],
        ['val', 'Do not make me do this. I ask you as a brother. If your God exists, how can he allow it?', 'Non costringermi a farlo. Te lo chiedo come a un fratello. Se il tuo Dio esiste, come può permetterlo?'],
        ['don', 'I do not know, Valerius. I only know I do not hate you. Do it as a brother would, without hatred. And then forgive yourself.', 'Non lo so, Valerio. So soltanto che non ti odio. Fallo come lo farebbe un fratello, senza odio. E poi perdonati.'],
        ['don', 'And watch over the child at the farm by the road. His name is Lucius. If you do, my death will not have been yours alone.', 'E veglia sul bambino del podere lungo la strada. Si chiama Lucio. Se lo farai, la mia morte non sarà stata soltanto tua.'],
      ] },
      { id: 'st-kneel', lines: [
        ['n', 'Domninus knelt on the bank, facing the setting sun.', 'Donnino si inginocchiò sulla riva, rivolto al sole che tramontava.'],
        ['don', 'Into your hands, Lord, I commend my spirit.', 'Nelle tue mani, Signore, affido il mio spirito.', 'In manus tuas, Domine, commendo spiritum meum.'],
        ['n', 'Valerius turned his face to the river. It was the ninth of October, in the year three hundred and four.', 'Valerio voltò il viso verso il fiume. Era il nove ottobre dell’anno trecentoquattro.'],
      ] },
    ],
  },
  {
    id: 'miraculum', roman: 'VII', fr: 'Miraculum', en: 'The Miracle', it: 'Il miracolo', accent: '#fff0c0',
    shots: [
      { id: 'mi-night', lines: [
        ['n', 'The soldiers rode away before nightfall. Only Valerius stayed on the bank beside his friend until the stars came out. He did not pray: he did not know how.', 'I soldati ripartirono prima di notte. Solo Valerio rimase sulla riva, accanto all’amico, finché spuntarono le stelle. Non pregava: non sapeva come si fa.'],
      ] },
      { id: 'mi-rise', lines: [
        ['n', 'At the first light of dawn, the body of Domninus rose to its feet, wrapped in a light that was not the sun’s.', 'Alla prima luce dell’alba, il corpo di Donnino si alzò in piedi, avvolto in una luce che non era quella del sole.'],
        ['n', 'He bent down, took his own head in his hands, and set out.', 'Si chinò, prese tra le mani la propria testa, e si mise in cammino.'],
      ] },
      { id: 'mi-widow', lines: [
        ['wid', 'Who are you, walking in the light? I buried my husband, and I fear nothing any more. And yet I tremble.', 'Chi sei tu, che cammini nella luce? Ho seppellito mio marito, e non ho più paura di niente. Eppure tremo.'],
        ['don', 'Do not be afraid. I am only a man going home, as one day he will go home too.', 'Non avere paura. Sono soltanto un uomo che torna a casa, come un giorno ci tornerà anche lui.'],
        ['wid', 'And where is your home?', 'E dov’è la tua casa?'],
        ['don', 'Just beyond the river. Where my head can rest at last, and my heart has nothing left to defend.', 'Appena oltre il fiume. Dove la mia testa potrà finalmente riposare, e il cuore non avrà più niente da difendere.'],
      ] },
      { id: 'mi-cross', lines: [
        ['n', 'He crossed the Stirone, climbed the far bank, and there, where the cathedral stands today, he laid down his head and was still.', 'Attraversò lo Stirone, risalì la riva opposta, e là, dove oggi sorge il Duomo, depose la propria testa e si fermò.'],
      ] },
      { id: 'mi-valerius', lines: [
        ['val', 'Forgive me, brother. I killed you, and you looked at me as one looks at a child. How am I to live now?', 'Perdonami, fratello. Ti ho ucciso, e tu mi hai guardato come si guarda un bambino. Come faccio a vivere, adesso?'],
        ['n', 'Valerius never went back to the army. He was the first to keep watch over that tomb, and he kept watch for the rest of his life.', 'Valerio non tornò mai più nell’esercito. Fu il primo a vegliare su quella tomba, e ci vegliò per il resto della sua vita.'],
        ['n', 'Some weeks later a farmer came with his son. The boy laid a jug of water on the stone and said thank you. That day, Valerius learned to pray.', 'Qualche settimana dopo arrivò un contadino con suo figlio. Il bambino posò sulla pietra una brocca d’acqua e disse grazie. Quel giorno Valerio imparò a pregare.'],
      ] },
    ],
  },
  {
    id: 'civitas', roman: 'VIII', fr: 'Civitas', en: 'The Town', it: 'La città', accent: '#e8c890',
    shots: [
      { id: 'ci-town', lines: [
        ['n', 'Around his tomb a village grew, and for a thousand years it bore his name: Borgo San Donnino.', 'Attorno alla sua tomba crebbe un borgo, che per mille anni portò il suo nome: Borgo San Donnino.'],
        ['n', 'Pilgrims bound for Rome stopped there to pray, on the same road he had walked.', 'I pellegrini diretti a Roma vi si fermavano a pregare, lungo la stessa strada che lui aveva percorso.'],
      ] },
      { id: 'ci-workshop', lines: [
        ['n', 'Around the year twelve hundred, a great master came to carve the story of the saint into the stone of the cathedral.', 'Attorno all’anno milleduecento, un grande maestro venne a scolpire nella pietra del Duomo la storia del santo.'],
        ['app', 'Master, why do you carve him holding his head in his hands?', 'Maestro, perché lo scolpite con la testa tra le mani?'],
        ['mast', 'So that whoever looks understands at once what it costs to stay faithful. No one stops before a comfortable saint.', 'Perché chi guarda capisca subito quanto costa restare fedeli. Nessuno si ferma davanti a un santo comodo.'],
        ['app', 'And why is he smiling, if they killed him? It almost frightens me.', 'E perché sorride, se lo hanno ucciso? A me fa quasi paura.'],
        ['mast', 'Because he lost his crown and his head, but not himself. That is what frightens, boy: a man who can no longer be bought.', 'Perché ha perso la corona e la testa, ma non se stesso. È questo che fa paura, ragazzo: un uomo che non si può più comprare.'],
      ] },
      { id: 'ci-pilgrim', lines: [
        ['pil', 'Master, is it true that Saint Domninus protects those bitten by mad dogs? My son was bitten in the spring.', 'Maestro, è vero che San Donnino protegge chi è stato morso dai cani rabbiosi? Mio figlio è stato morso in primavera.'],
        ['mast', 'People have said so for nine hundred years, ever since a sick child drank again at dawn.', 'Lo si dice da novecento anni, da quando un bambino malato tornò a bere all’alba.'],
        ['mast', 'I carve the stone, good woman, and I too doubt every day. The rest belongs to faith. Go inside and pray for your son. I will pray with you.', 'Io scolpisco la pietra, buona donna, e anch’io dubito ogni giorno. Il resto appartiene alla fede. Entra, e prega per tuo figlio. Io pregherò con te.'],
      ] },
    ],
  },
  {
    id: 'epilogue', roman: 'EPILOGUS', fr: 'Quod Manet', en: 'What Remains', it: 'Ciò che resta', accent: '#ffe0a0',
    shots: [
      { id: 'ep-today', lines: [
        ['n', 'Borgo San Donnino is called Fidenza today. The road is still the same: the Via Emilia, straight as a sword.', 'Oggi Borgo San Donnino si chiama Fidenza. La strada è ancora la stessa: la via Emilia, dritta come una spada.'],
        ['kid', 'So he lost everything, Mum? Really everything?', 'Allora ha perso tutto, mamma? Proprio tutto?'],
        ['mom', 'He lost his crown, and even his head. But not what he loved. No one could take that from him: he had already given it away.', 'Ha perso la corona, e perfino la testa. Ma non quello che amava. Quello nessuno poteva toglierglielo: lo aveva già regalato.'],
        ['kid', 'Then that is why he smiles. Because he had already given everything.', 'Allora è per questo che sorride. Perché aveva già regalato tutto.'],
      ] },
      { id: 'ep-end', lines: [
        ['n', 'A crown can be lost. Even a head can be lost.', 'Si può perdere una corona. Si può perdere perfino la testa.'],
        ['n', 'What we choose to love, that remains.', 'Ciò che scegliamo di amare, quello resta.'],
      ] },
    ],
  },
];
