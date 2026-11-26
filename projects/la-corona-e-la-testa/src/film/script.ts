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
  | 'farm' | 'boy' | 'wid' | 'mast' | 'app' | 'pil';

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
      { id: 'pr-facade', lines: [
        ['n', 'In Fidenza, on the front of the cathedral, there is a man of stone who holds his own head in his hands.', 'A Fidenza, sulla facciata del Duomo, c’è un uomo di pietra che regge tra le mani la propria testa.'],
        ['n', 'For eight hundred years, pilgrims have stopped to look at him. This is his story.', 'Da ottocento anni i pellegrini si fermano a guardarlo. Questa è la sua storia.'],
      ] },
      { id: 'pr-empire', lines: [
        ['n', 'The year 303. The Roman Empire is ruled by four sovereigns. In Milan reigns Maximian, Augustus of the West.', 'Anno 303. L’impero romano è governato da quattro sovrani. A Milano regna Massimiano, Augusto d’Occidente.'],
        ['n', 'An edict commands every subject to sacrifice to the gods. Whoever refuses loses everything: his goods, his freedom, his life.', 'Un editto ordina a ogni suddito di sacrificare agli dei. Chi rifiuta perde tutto: i beni, la libertà, la vita.'],
      ] },
    ],
  },
  {
    id: 'corona', roman: 'I', fr: 'Corona', en: 'The Crown', it: 'La corona', accent: '#f2c460',
    shots: [
      { id: 'co-treasury', lines: [
        ['n', 'Domninus was the emperor’s first chamberlain: the man who kept his crown and watched over his sleep.', 'Donnino era il primo cubiculario dell’imperatore: l’uomo che custodiva la sua corona e vegliava sul suo sonno.'],
        ['eut', 'Every morning you polish it as if it were the first time.', 'Ogni mattina la lucidi come se fosse la prima volta.'],
        ['don', 'Every morning it reminds me who wears it, Eutychius. And how heavy it is.', 'Ogni mattina mi ricorda chi la porta, Eutichio. E quanto pesa.'],
        ['eut', 'Heavy for the one who wears it, or for the one who carries it?', 'Pesa a chi la porta, o a chi la custodisce?'],
        ['don', 'Lately, for both.', 'Da qualche tempo, a tutti e due.'],
      ] },
      { id: 'co-throne', lines: [
        ['n', 'In the great hall of the palace, the court waited in silence for its lord.', 'Nella grande aula del palazzo, la corte attendeva in silenzio il suo signore.'],
        ['max', 'Domninus. Come closer.', 'Donnino. Avvicinati.'],
        ['max', 'You are the only man who touches my head without trembling.', 'Sei l’unico uomo che mi tocca la testa senza tremare.'],
        ['don', 'Because I serve you, Augustus. I do not fear you.', 'Perché ti servo, Augusto. Non ti temo.'],
        ['max', 'Then serve me well today. Today Rome will see who is loyal.', 'Allora servimi bene, oggi. Oggi Roma vedrà chi le è fedele.'],
      ] },
      { id: 'co-trial', lines: [
        ['guard', 'Augustus, the Christians taken at the Porta Ticinese.', 'Augusto, i cristiani arrestati alla Porta Ticinese.'],
        ['max', 'One grain of incense on the altar of Hercules, and you will go home free.', 'Un granello d’incenso sull’altare di Ercole, e tornerete a casa liberi.'],
        ['eld', 'We pray for you every day, Augustus. But we cannot pray to your gods.', 'Preghiamo per te ogni giorno, Augusto. Ma non possiamo pregare i tuoi dei.'],
        ['mar', 'We have stolen nothing. We have harmed no one. Why should we die?', 'Non abbiamo rubato nulla. Non abbiamo fatto male a nessuno. Perché dovremmo morire?'],
        ['max', 'Because the empire stands on obedience. Take them away. Tomorrow, the beasts.', 'Perché l’impero si regge sull’obbedienza. Portateli via. Domani, alle belve.'],
      ] },
    ],
  },
  {
    id: 'fides', roman: 'II', fr: 'Fides', en: 'The Night of Water', it: 'La notte dell’acqua', accent: '#9cc4f0',
    shots: [
      { id: 'fi-prison', lines: [
        ['n', 'That night Domninus could not sleep. He went down to the prisons, with bread and a jug of water.', 'Quella notte Donnino non riuscì a dormire. Scese nelle prigioni, con del pane e una brocca d’acqua.'],
        ['eld', 'The emperor’s chamberlain, among the condemned. Have you come to judge us?', 'Il cubiculario dell’imperatore, tra i condannati. Sei venuto a giudicarci?'],
        ['don', 'I have come to understand you. Tomorrow you will die, and tonight you are singing.', 'Sono venuto a capirvi. Domani morirete, e stanotte cantate.'],
        ['eld', 'We are afraid too, my son. But we have found something that weighs more than fear.', 'Anche noi abbiamo paura, figlio mio. Ma abbiamo trovato qualcosa che pesa più della paura.'],
        ['don', 'I have served a crown for twenty years. Tell me about yours.', 'Ho servito una corona per vent’anni. Parlami della vostra.'],
      ] },
      { id: 'fi-baptism', lines: [
        ['eld', 'Ours is a crown of thorns. It was not placed on a king’s head to honour him, but to mock him.', 'La nostra è una corona di spine. Non fu posta sulla testa di un re per onorarlo, ma per deriderlo.'],
        ['eld', 'And that king forgave the men who were killing him.', 'E quel re perdonò gli uomini che lo stavano uccidendo.'],
        ['don', 'Then that is the king I want to serve. If he will have a servant who comes this late.', 'Allora è quel re che voglio servire. Se accetta un servo che arriva così tardi.'],
        ['eld', 'He has never turned anyone away.', 'Non ha mai mandato via nessuno.'],
        ['eld', 'I baptise you in the name of the Father, and of the Son, and of the Holy Spirit.', 'Io ti battezzo nel nome del Padre, del Figlio e dello Spirito Santo.', 'Ego te baptizo in nomine Patris, et Filii, et Spiritus Sancti.'],
        ['n', 'The water of a prison jug ran down the face of the emperor’s chamberlain. Outside, the dawn was coming.', 'L’acqua di una brocca di prigione scese sul volto del cubiculario dell’imperatore. Fuori, stava arrivando l’alba.'],
      ] },
    ],
  },
  {
    id: 'recusatio', roman: 'III', fr: 'Recusatio', en: 'The Refusal', it: 'Il rifiuto', accent: '#d86a5c',
    shots: [
      { id: 're-altar', lines: [
        ['n', 'At the morning sacrifice, the emperor wanted the whole court to see an example of loyalty.', 'Al sacrificio del mattino, l’imperatore volle che tutta la corte vedesse un esempio di fedeltà.'],
        ['max', 'Domninus, your hand is the most faithful in this palace. You will burn the incense, so that everyone may see.', 'Donnino, la tua è la mano più fedele di questo palazzo. Brucerai tu l’incenso, perché tutti vedano.'],
        ['don', 'My hand has served you for twenty years, Augustus. But my soul does not belong to you.', 'La mia mano ti ha servito per vent’anni, Augusto. Ma la mia anima non ti appartiene.'],
        ['max', 'Are you one of them, then?', 'Sei dunque uno di loro?'],
        ['don', 'Yes. Since this night.', 'Sì. Da questa notte.'],
      ] },
      { id: 're-crown', lines: [
        ['n', 'The court held its breath. Domninus climbed the steps of the throne, the crown in his hands.', 'La corte trattenne il respiro. Donnino salì i gradini del trono, con la corona tra le mani.'],
        ['don', 'I give you back your crown. I cannot guard your power and serve another King.', 'Ti restituisco la tua corona. Non posso custodire il tuo potere e servire un altro Re.'],
        ['max', 'You were the only one I trusted.', 'Eri l’unico di cui mi fidassi.'],
        ['don', 'And I have never lied to you. Not even now.', 'E non ti ho mai mentito. Nemmeno adesso.'],
        ['max', 'Seize him!', 'Prendetelo!'],
      ] },
      { id: 're-escape', lines: [
        ['n', 'The captain of the guard was Valerius, who had fought beside him on the Rhine. He led him to a door that no one watched.', 'Il capitano della guardia era Valerio, che aveva combattuto al suo fianco sul Reno. Lo condusse a una porta che nessuno sorvegliava.'],
        ['val', 'Go, before I change my mind. I can give you one hour.', 'Vai, prima che cambi idea. Posso darti un’ora.'],
        ['don', 'They will punish you for this, Valerius.', 'Ti puniranno per questo, Valerio.'],
        ['val', 'Then do not make it be for nothing. Run, and do not look back.', 'Allora fa’ che non sia per niente. Corri, e non voltarti.'],
        ['don', 'May God reward you, my friend.', 'Che Dio te lo renda, amico mio.'],
      ] },
    ],
  },
  {
    id: 'via', roman: 'IV', fr: 'Via', en: 'The Road', it: 'La strada', accent: '#88a8c8',
    shots: [
      { id: 'vi-rain', lines: [
        ['n', 'Domninus fled south, towards Rome, where he hoped to find the Christians of the capital.', 'Donnino fuggì verso sud, verso Roma, dove sperava di trovare i cristiani della capitale.'],
        ['n', 'For two days it rained without stopping. On the second night he knocked at the door of an inn.', 'Per due giorni piovve senza sosta. La seconda notte bussò alla porta di una locanda.'],
      ] },
      { id: 'vi-inn', lines: [
        ['host', 'Come in, you are soaked through. Here nobody asks the name of whoever knocks at night.', 'Entra, sei fradicio. Qui nessuno chiede il nome a chi bussa di notte.'],
        ['don', 'Then I will not tell you mine. It would only put you in danger.', 'Allora non ti dirò il mio. Ti metterebbe solo in pericolo.'],
        ['host', 'You do not need to. You looked at the fish carved on my beam as if it were a friend.', 'Non serve. Hai guardato il pesce inciso sulla mia trave come si guarda un amico.'],
        ['host', 'Come. Downstairs there are others like you.', 'Vieni. Di sotto ce ne sono altri come te.'],
      ] },
      { id: 'vi-cellar', lines: [
        ['n', 'In the cellar, among the barrels, a small community was praying by the light of a single lamp.', 'Nella cantina, tra le botti, una piccola comunità pregava alla luce di una sola lucerna.'],
        ['pres', 'You have left a palace to sleep in a cellar.', 'Hai lasciato un palazzo per dormire in una cantina.'],
        ['don', 'In the palace, no one ever broke bread with me.', 'Nel palazzo nessuno ha mai spezzato il pane con me.'],
        ['pres', 'Then sit down, brother. Here there is bread for everyone.', 'Allora siediti, fratello. Qui il pane basta per tutti.'],
      ] },
      { id: 'vi-patrol', lines: [
        ['sol', 'Open up! We are looking for a man of the court. Tall, with a gold ring on his hand.', 'Aprite! Cerchiamo un uomo della corte. Alto, con un anello d’oro al dito.'],
        ['host', 'Here only carters and rain come by, soldier. Look for yourself, if you like.', 'Qui passano solo carrettieri e pioggia, soldato. Guarda pure, se vuoi.'],
        ['sol', 'Not tonight. But if you see him, the emperor pays well.', 'Non stanotte. Ma se lo vedi, l’imperatore paga bene.'],
        ['n', 'The soldiers went away into the rain. In the cellar, no one had breathed.', 'I soldati si allontanarono nella pioggia. In cantina, nessuno aveva respirato.'],
      ] },
      { id: 'vi-ring', lines: [
        ['don', 'Take this ring. For the bread of tonight, and for the lie: I know what it cost you.', 'Prendi questo anello. Per il pane di stanotte, e per la bugia: so quanto ti è costata.'],
        ['host', 'Keep it. Where you are going, you will need it more than I do.', 'Tienilo. Dove vai, ti servirà più che a me.'],
        ['don', 'Where I am going, I will need nothing.', 'Dove vado, non mi servirà più nulla.'],
      ] },
      { id: 'vi-fork', lines: [
        ['host', 'To the left, the road for Pavia. Straight on, the Via Emilia, towards Parma and towards Rome.', 'A sinistra, la strada per Pavia. Dritto, la via Emilia, verso Parma e verso Roma.'],
        ['host', 'It is the straightest road. But it is also the most watched.', 'È la strada più dritta. Ma è anche la più sorvegliata.'],
        ['don', 'Then I will take that one. I do not want to hide any more.', 'Allora prenderò quella. Non voglio più nascondermi.'],
      ] },
    ],
  },
  {
    id: 'aemilia', roman: 'V', fr: 'Via Aemilia', en: 'The Plain', it: 'La pianura', accent: '#d8c070',
    shots: [
      { id: 'ae-plain', lines: [
        ['n', 'The Via Emilia ran straight as a sword across the plain. Domninus walked from dawn to dusk, among fields and morning mists.', 'La via Emilia correva dritta come una spada attraverso la pianura. Donnino camminava dall’alba al tramonto, tra campi e nebbie del mattino.'],
      ] },
      { id: 'ae-farm', lines: [
        ['farm', 'Traveller, you look like a man who can read. My son is burning with fever, and the doctor is three days away.', 'Viandante, hai l’aria di uno che sa leggere. Mio figlio brucia di febbre, e il medico è a tre giorni di strada.'],
        ['don', 'I am not a doctor. But I can keep watch with him, if you let me.', 'Non sono un medico. Ma posso vegliarlo con te, se me lo permetti.'],
        ['farm', 'The neighbour’s dog bit him four days ago. Since then he will not drink, and he screams if he sees water.', 'Il cane del vicino l’ha morso quattro giorni fa. Da allora non beve, e grida se vede l’acqua.'],
        ['don', 'Then we will pray for him all night. You and I.', 'Allora pregheremo per lui tutta la notte. Tu e io.'],
      ] },
      { id: 'ae-prayer', lines: [
        ['don', 'Lord, I have nothing left to offer you but this night. Take it, and let this child live.', 'Signore, non ho più nulla da offrirti se non questa notte. Prendila, e lascia vivere questo bambino.'],
        ['n', 'Outside, the dog that had bitten him whimpered until dawn. Then it fell silent.', 'Fuori, il cane che l’aveva morso guaì fino all’alba. Poi tacque.'],
      ] },
      { id: 'ae-dawn', lines: [
        ['boy', 'Father… I am thirsty.', 'Papà… ho sete.'],
        ['farm', 'He is drinking. Look, he is drinking! Who are you, that God listens to you?', 'Beve. Guarda, beve! Chi sei tu, che Dio ti ascolta?'],
        ['don', 'A man who has prayed badly for twenty years. Last night, for once, I prayed well.', 'Un uomo che per vent’anni ha pregato male. Stanotte, per una volta, ho pregato bene.'],
      ] },
      { id: 'ae-riders', lines: [
        ['n', 'Along the road, a column of horsemen was riding towards Parma. At its head rode Valerius.', 'Lungo la strada, una colonna di cavalieri avanzava verso Parma. In testa cavalcava Valerio.'],
        ['sol', 'Centurion, the man by the farm. He matches the description.', 'Centurione, l’uomo vicino al podere. Corrisponde alla descrizione.'],
        ['val', 'I know. I would recognise him among a thousand.', 'Lo so. Lo riconoscerei tra mille.'],
        ['val', 'Do not touch him. When the time comes, I will be the one to take him.', 'Nessuno lo tocchi. Quando sarà il momento, sarò io a prenderlo.'],
      ] },
      { id: 'ae-farewell', lines: [
        ['boy', 'Will you come back to see us?', 'Tornerai a trovarci?'],
        ['don', 'Perhaps not, Lucius. But whenever you are afraid, remember this morning.', 'Forse no, Lucio. Ma ogni volta che avrai paura, ricordati di questa mattina.'],
        ['farm', 'Take my staff, at least. The road is still long.', 'Prendi almeno il mio bastone. La strada è ancora lunga.'],
        ['don', 'Not so long, my friend. Not so long any more.', 'Non così lunga, amico mio. Non più così lunga.'],
      ] },
    ],
  },
  {
    id: 'stirone', roman: 'VI', fr: 'Ad Flumen', en: 'The River', it: 'Il torrente', accent: '#ff9a5c',
    shots: [
      { id: 'st-bridge', lines: [
        ['n', 'At the fifteenth mile from Parma the road crosses the Stirone. There, at sunset, the horsemen reached him.', 'Al quindicesimo miglio da Parma, la strada attraversa lo Stirone. Lì, al tramonto, i cavalieri lo raggiunsero.'],
      ] },
      { id: 'st-meet', lines: [
        ['val', 'Domninus. I have ridden for three days, hoping I would not find you.', 'Donnino. Ho cavalcato per tre giorni sperando di non trovarti.'],
        ['don', 'And I have walked for three days, hoping that if anyone came, it would be you.', 'E io ho camminato per tre giorni sperando che, se qualcuno doveva venire, fossi tu.'],
        ['val', 'The emperor will forgive you. One gesture, a pinch of incense, and you come home.', 'L’imperatore ti perdonerà. Un gesto, un pizzico d’incenso, e torni a casa.'],
        ['don', 'My home is elsewhere now, Valerius.', 'La mia casa adesso è altrove, Valerio.'],
      ] },
      { id: 'st-plead', lines: [
        ['val', 'We fought together on the Rhine. You carried me on your back for two miles, under the arrows.', 'Abbiamo combattuto insieme sul Reno. Mi hai portato in spalla per due miglia, sotto le frecce.'],
        ['val', 'Do not make me do this. I am begging you, as a brother.', 'Non costringermi a farlo. Te lo chiedo come a un fratello.'],
        ['don', 'Then do it as a brother would: without hatred. I have none for you.', 'Allora fallo come lo farebbe un fratello: senza odio. Io non ne ho per te.'],
        ['don', 'And look after the child at the farm by the road. His name is Lucius.', 'E veglia sul bambino del podere lungo la strada. Si chiama Lucio.'],
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
        ['n', 'The soldiers left before nightfall. Only Valerius stayed on the bank, beside his friend, until the stars came out.', 'I soldati ripartirono prima di notte. Solo Valerio rimase sulla riva, accanto all’amico, fino a quando spuntarono le stelle.'],
      ] },
      { id: 'mi-rise', lines: [
        ['n', 'And at the first light of dawn, the body of Domninus rose to its feet, wrapped in a light that was not of the sun.', 'E alla prima luce dell’alba, il corpo di Donnino si alzò in piedi, avvolto in una luce che non era quella del sole.'],
        ['n', 'He bent down, took his own head in his hands, and began to walk.', 'Si chinò, prese tra le mani la propria testa, e si mise in cammino.'],
      ] },
      { id: 'mi-widow', lines: [
        ['wid', 'Who are you, walking in the light?', 'Chi sei tu, che cammini nella luce?'],
        ['don', 'Do not be afraid. I am only a man going home.', 'Non avere paura. Sono soltanto un uomo che torna a casa.'],
        ['wid', 'And where is your home?', 'E dov’è la tua casa?'],
        ['don', 'Just beyond the river. Where my head can finally rest.', 'Appena oltre il fiume. Dove la mia testa potrà finalmente riposare.'],
      ] },
      { id: 'mi-cross', lines: [
        ['n', 'He crossed the Stirone, climbed the far bank, and there, where the cathedral stands today, he laid down his head and stopped.', 'Attraversò lo Stirone, risalì la riva opposta, e là, dove oggi sorge il Duomo, depose la propria testa e si fermò.'],
      ] },
      { id: 'mi-valerius', lines: [
        ['val', 'Forgive me, brother. Forgive me.', 'Perdonami, fratello. Perdonami.'],
        ['n', 'Valerius never returned to the army. He was the first to keep watch over that tomb.', 'Valerio non tornò mai più nell’esercito. Fu il primo a vegliare su quella tomba.'],
      ] },
    ],
  },
  {
    id: 'civitas', roman: 'VIII', fr: 'Civitas', en: 'The Town', it: 'La città', accent: '#e8c890',
    shots: [
      { id: 'ci-town', lines: [
        ['n', 'Around his tomb a village grew, and for a thousand years it bore his name: Borgo San Donnino.', 'Attorno alla sua tomba crebbe un borgo, che per mille anni portò il suo nome: Borgo San Donnino.'],
        ['n', 'Pilgrims on their way to Rome stopped there to pray, along the same road he had walked.', 'I pellegrini diretti a Roma vi si fermavano a pregare, lungo la stessa strada che lui aveva percorso.'],
      ] },
      { id: 'ci-workshop', lines: [
        ['n', 'Around the year twelve hundred, a great master came to carve the story of the saint into the cathedral’s stone.', 'Attorno all’anno milleduecento, un grande maestro venne a scolpire nella pietra del Duomo la storia del santo.'],
        ['app', 'Master, why do you carve him holding his head in his hands?', 'Maestro, perché lo scolpite con la testa tra le mani?'],
        ['mast', 'So that whoever looks understands at once what it costs to stay faithful.', 'Perché chi guarda capisca subito quanto costa restare fedeli.'],
        ['app', 'And why is he smiling, if they killed him?', 'E perché sorride, se lo hanno ucciso?'],
        ['mast', 'Because he lost his crown and his head. But not himself.', 'Perché ha perso la corona e la testa. Ma non se stesso.'],
      ] },
      { id: 'ci-pilgrim', lines: [
        ['pil', 'Master, is it true that Saint Domninus protects those bitten by mad dogs? My son was bitten in the spring.', 'Maestro, è vero che San Donnino protegge chi è stato morso dai cani rabbiosi? Mio figlio è stato morso in primavera.'],
        ['mast', 'People have said so for nine hundred years, ever since a sick child drank again at dawn.', 'Lo si dice da novecento anni, da quando un bambino malato tornò a bere all’alba.'],
        ['mast', 'I carve the stone, good woman. The rest belongs to faith. Go inside, and pray for your son.', 'Io scolpisco la pietra, buona donna. Il resto appartiene alla fede. Entra, e prega per tuo figlio.'],
      ] },
    ],
  },
  {
    id: 'epilogue', roman: 'EPILOGUS', fr: 'Quod Manet', en: 'What Remains', it: 'Ciò che resta', accent: '#ffe0a0',
    shots: [
      { id: 'ep-today', lines: [
        ['n', 'Borgo San Donnino is called Fidenza today. The road is still the same: the Via Emilia, straight as a sword.', 'Oggi Borgo San Donnino si chiama Fidenza. La strada è ancora la stessa: la via Emilia, dritta come una spada.'],
        ['n', 'And on the front of the cathedral, a man of stone still holds his head in his hands, and smiles at whoever passes.', 'E sulla facciata del Duomo, un uomo di pietra regge ancora la testa tra le mani, e sorride a chi passa.'],
      ] },
      { id: 'ep-end', lines: [
        ['n', 'A crown can be lost. Even a head can be lost.', 'Si può perdere una corona. Si può perdere perfino la testa.'],
        ['n', 'What we choose to love, that remains.', 'Ciò che scegliamo di amare, quello resta.'],
      ] },
    ],
  },
];
