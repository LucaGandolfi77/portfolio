/*
 * The screenplay. Original narration and dialogue after Victor Hugo's novel
 * (1862, public domain); the French lines are Hugo's own. Pure data: timing
 * is derived from it in timeline.ts, pictures live in shots/.
 *
 * A line is [speaker, english, italiano, français?]. A line with French is
 * shown as a quotation from the book.
 */

export type Who =
  | 'n' | 'val' | 'guard' | 'inn' | 'woman' | 'myr' | 'mag' | 'gend' | 'gerv'
  | 'fan' | 'mmet' | 'then' | 'merch' | 'jav' | 'fauch' | 'judge' | 'cos'
  | 'mar' | 'gill' | 'epo' | 'enj' | 'gran' | 'gav';

export interface Speaker {
  en: string;
  it: string;
  /** Voice colour for the optional spoken narration. */
  pitch: number;
  color: string;
}

export const SPEAKERS: Record<Who, Speaker> = {
  n: { en: '', it: '', pitch: 1, color: '#e8d9b4' },
  val: { en: 'Jean Valjean', it: 'Jean Valjean', pitch: 0.78, color: '#f0b45a' },
  guard: { en: 'Warder', it: 'Guardiano', pitch: 0.7, color: '#b9b3a5' },
  inn: { en: 'Innkeeper', it: 'Oste', pitch: 0.85, color: '#c99a6c' },
  woman: { en: 'A woman', it: 'Una donna', pitch: 1.2, color: '#c7a7a0' },
  myr: { en: 'Bishop Myriel', it: 'Il vescovo Myriel', pitch: 0.92, color: '#c9a5e6' },
  mag: { en: 'Madame Magloire', it: 'Madame Magloire', pitch: 1.28, color: '#d6c3b0' },
  gend: { en: 'Gendarme', it: 'Gendarme', pitch: 0.8, color: '#8fb0d8' },
  gerv: { en: 'Petit-Gervais', it: 'Petit-Gervais', pitch: 1.6, color: '#d9b27a' },
  fan: { en: 'Fantine', it: 'Fantine', pitch: 1.3, color: '#ffb8b0' },
  mmet: { en: 'Madame Thénardier', it: 'Madame Thénardier', pitch: 1.05, color: '#d98a6a' },
  then: { en: 'Thénardier', it: 'Thénardier', pitch: 0.98, color: '#b8c06a' },
  merch: { en: 'Barber', it: 'Barbiere', pitch: 1.02, color: '#b7b090' },
  jav: { en: 'Javert', it: 'Javert', pitch: 0.65, color: '#8fc3ee' },
  fauch: { en: 'Fauchelevent', it: 'Fauchelevent', pitch: 0.88, color: '#c8b18a' },
  judge: { en: 'The Judge', it: 'Il giudice', pitch: 0.75, color: '#d3796f' },
  cos: { en: 'Cosette', it: 'Cosette', pitch: 1.45, color: '#9fd8ff' },
  mar: { en: 'Marius', it: 'Marius', pitch: 1.04, color: '#a8e0a0' },
  gill: { en: 'Gillenormand', it: 'Gillenormand', pitch: 0.9, color: '#d8b8d8' },
  epo: { en: 'Éponine', it: 'Éponine', pitch: 1.22, color: '#e3a7d8' },
  enj: { en: 'Enjolras', it: 'Enjolras', pitch: 0.95, color: '#ff8a70' },
  gran: { en: 'Grantaire', it: 'Grantaire', pitch: 0.86, color: '#c6a27c' },
  gav: { en: 'Gavroche', it: 'Gavroche', pitch: 1.55, color: '#ffd86a' },
};

export type Line = [who: Who, en: string, it: string, fr?: string];

export interface ShotDef {
  id: string;
  lines: Line[];
}

export interface ChapterDef {
  id: string;
  roman: string;
  fr: string;
  en: string;
  it: string;
  accent: string;
  shots: ShotDef[];
}

export const SCRIPT: ChapterDef[] = [
  {
    id: 'prologue', roman: 'PROLOGUE', fr: 'Le Fil d’Or', en: 'The Golden Thread', it: 'Il Filo d’Oro', accent: '#e6b863',
    shots: [
      { id: 'pr-book', lines: [
        ['n', 'There are nights that decide a whole life. This is the story of one of them — and of everything that came after.', 'Ci sono notti che decidono una vita intera. Questa è la storia di una di quelle notti, e di tutto ciò che venne dopo.'],
        ['n', 'As long as there are ignorance and misery on earth, books like this may not be useless.', 'Finché sulla terra ci saranno ignoranza e miseria, libri come questo potranno non essere inutili.', 'Tant qu’il y aura sur la terre ignorance et misère, des livres de la nature de celui-ci pourront ne pas être inutiles.'],
      ] },
      { id: 'pr-france', lines: [
        ['n', 'France, 1815. An emperor has fallen. The roads are full of soldiers going home, and of men with no home to go to.', 'Francia, 1815. Un imperatore è caduto. Le strade sono piene di soldati che tornano a casa, e di uomini che una casa non l’hanno più.'],
        ['n', 'One of them has spent nineteen years in chains. His crime began with a loaf of bread.', 'Uno di loro ha passato diciannove anni in catene. Il suo delitto cominciò con una pagnotta.'],
      ] },
      { id: 'pr-bread', lines: [
        ['n', 'His sister’s children were starving. He broke a baker’s window. The law gave him five years.', 'I figli di sua sorella morivano di fame. Ruppe la vetrina di un fornaio. La legge gli diede cinque anni.'],
        ['n', 'He tried to escape, and tried again. Five years became nineteen.', 'Tentò di fuggire, e tentò ancora. I cinque anni diventarono diciannove.'],
      ] },
    ],
  },
  {
    id: 'forcat', roman: 'I', fr: 'Le Forçat', en: 'The Convict', it: 'Il Forzato', accent: '#e89a52',
    shots: [
      { id: 'fo-toulon', lines: [
        ['n', 'Toulon. The galleys, where the sea smells of iron and every man is a number.', 'Tolone. Il bagno penale, dove il mare sa di ferro e ogni uomo è un numero.'],
        ['guard', 'Number 24601. Your time is done.', 'Numero 24601. La tua pena è finita.'],
        ['val', 'My name. Say my name.', 'Il mio nome. Di’ il mio nome.'],
        ['guard', 'Take your passport. Yellow. So that everybody knows.', 'Prendi il passaporto. Giallo. Così lo sapranno tutti.'],
      ] },
      { id: 'fo-road', lines: [
        ['n', 'He walked for four days over the mountains. In every village the yellow paper arrived before he did.', 'Camminò quattro giorni tra le montagne. In ogni paese il foglio giallo arrivava prima di lui.'],
        ['val', 'Nineteen years. Somewhere there must be one bed for me.', 'Diciannove anni. Da qualche parte ci sarà pure un letto per me.'],
      ] },
      { id: 'fo-inn', lines: [
        ['inn', 'No room. I know who you are. Get out.', 'Non c’è posto. So chi sei. Fuori.'],
        ['val', 'I have money. I earned it, sou by sou.', 'Ho del denaro. L’ho guadagnato, soldo per soldo.'],
        ['inn', 'Your money is as yellow as your passport.', 'Il tuo denaro è giallo come il tuo passaporto.'],
        ['n', 'Even a dog drove him out of its kennel.', 'Perfino un cane lo cacciò dalla sua cuccia.'],
      ] },
      { id: 'fo-bench', lines: [
        ['n', 'Night fell on Digne. He lay down on a stone bench in the square, in the October cold.', 'Su Digne scese la notte. Si sdraiò su una panca di pietra in piazza, nel freddo di ottobre.'],
        ['woman', 'Have you knocked at that little door? Knock there.', 'Avete bussato a quella porticina? Bussate là.'],
        ['n', 'It was the house of Monseigneur Myriel, whom the poor called Bienvenu: Welcome.', 'Era la casa di monsignor Myriel, che i poveri chiamavano Bienvenu: il Benvenuto.'],
      ] },
    ],
  },
  {
    id: 'eveque', roman: 'II', fr: 'L’Évêque', en: 'The Candlesticks', it: 'I Candelabri', accent: '#f2c66d',
    shots: [
      { id: 'ev-door', lines: [
        ['val', 'My name is Jean Valjean. I am a convict. I was nineteen years in the galleys. Will you let me stay?', 'Mi chiamo Jean Valjean. Sono un forzato. Ho passato diciannove anni in galera. Mi lasciate restare?'],
        ['myr', 'Madame Magloire, lay another place. And light the silver candlesticks.', 'Madame Magloire, aggiungete un coperto. E accendete i candelabri d’argento.'],
        ['mag', 'Monseigneur! A galley slave, at your table!', 'Monsignore! Un galeotto, alla vostra tavola!'],
      ] },
      { id: 'ev-table', lines: [
        ['myr', 'This is not my house. It belongs to whoever is cold. Sit down, sir.', 'Questa non è casa mia. È di chiunque abbia freddo. Sedetevi, signore.'],
        ['val', 'Sir. You called me sir.', 'Signore. Mi avete chiamato signore.'],
        ['myr', 'You told me your name. But I already knew it. Your name is my brother.', 'Mi avete detto il vostro nome. Ma lo sapevo già. Il vostro nome è fratello mio.'],
        ['n', 'He ate like a starving man. Then he slept between white sheets, for the first time in nineteen years.', 'Mangiò come un affamato. Poi dormì tra lenzuola bianche, per la prima volta in diciannove anni.'],
      ] },
      { id: 'ev-night', lines: [
        ['n', 'In the middle of the night he woke. In the dark, the silver in the cupboard seemed to shine.', 'Nel cuore della notte si svegliò. Nel buio, l’argento nella credenza sembrava brillare.'],
        ['val', 'What do they owe me? Nineteen years. And what do I owe them? Nothing.', 'Che cosa mi devono? Diciannove anni. E io che cosa devo a loro? Niente.'],
        ['n', 'He took the silver, climbed the garden wall, and vanished.', 'Prese l’argenteria, scavalcò il muro dell’orto e sparì.'],
      ] },
      { id: 'ev-morning', lines: [
        ['mag', 'The silver is gone! That man was a thief!', 'L’argenteria è sparita! Quell’uomo era un ladro!'],
        ['myr', 'Was the silver ours? It belonged to the poor. And what was that man? Poor.', 'E l’argento era nostro? Apparteneva ai poveri. E quell’uomo che cos’era? Un povero.'],
        ['gend', 'Monseigneur, we caught this man with your silver. He says you gave it to him.', 'Monsignore, abbiamo preso quest’uomo con la vostra argenteria. Dice che gliel’avete regalata.'],
      ] },
      { id: 'ev-gift', lines: [
        ['myr', 'Ah, there you are, my friend! But I gave you the candlesticks too. Why did you leave them?', 'Ah, eccovi, amico mio! Ma vi avevo dato anche i candelabri. Perché li avete lasciati?'],
        ['n', 'The gendarmes let go of him. Valjean trembled as if he had been struck.', 'I gendarmi lo lasciarono. Valjean tremava come se lo avessero colpito.'],
        ['myr', 'Jean Valjean, my brother, you no longer belong to evil, but to good.', 'Jean Valjean, fratello mio, non appartenete più al male, ma al bene.', 'Jean Valjean, mon frère, vous n’appartenez plus au mal, mais au bien.'],
        ['myr', 'With this silver I am buying your soul. Use it to become an honest man.', 'Con questo argento compro la vostra anima. Usatelo per diventare un uomo onesto.'],
      ] },
      { id: 'ev-gervais', lines: [
        ['n', 'That evening, on an empty plain, a little chimney sweep dropped a silver coin. Valjean put his foot on it.', 'Quella sera, in una pianura deserta, a un piccolo spazzacamino cadde una moneta d’argento. Valjean ci mise sopra il piede.'],
        ['gerv', 'My coin, sir! Please, my silver coin!', 'La mia moneta, signore! Vi prego, la mia moneta d’argento!'],
        ['val', 'Go away!', 'Vattene!'],
        ['n', 'The boy ran off crying. Only then did Valjean see what he had done.', 'Il bambino fuggì piangendo. Solo allora Valjean vide ciò che aveva fatto.'],
      ] },
      { id: 'ev-weep', lines: [
        ['val', 'Petit-Gervais! Petit-Gervais! Come back!', 'Petit-Gervais! Petit-Gervais! Torna indietro!'],
        ['n', 'Nothing answered. For the first time in nineteen years, he wept.', 'Nessuno rispose. Per la prima volta in diciannove anni, pianse.'],
        ['n', 'Before dawn, a coachman saw a man kneeling on the pavement outside the bishop’s door.', 'Prima dell’alba un vetturino vide un uomo inginocchiato sul selciato, davanti alla porta del vescovo.'],
      ] },
    ],
  },
  {
    id: 'fantine', roman: 'III', fr: 'Fantine', en: 'Fantine', it: 'Fantine', accent: '#e8877a',
    shots: [
      { id: 'fa-spring', lines: [
        ['n', 'Paris, 1817. Fantine had golden hair and white teeth, and she believed everything said to her in a garden.', 'Parigi, 1817. Fantine aveva capelli d’oro e denti bianchi, e credeva a tutto ciò che le dicevano in un giardino.'],
        ['fan', 'Félix, you will come back on Sunday?', 'Félix, tornerai domenica?'],
        ['n', 'He left her a joking letter of farewell, and a daughter named Cosette.', 'Lui le lasciò una lettera d’addio scritta per scherzo, e una bambina di nome Cosette.'],
      ] },
      { id: 'fa-leave', lines: [
        ['n', 'To find work she had to hide the child. On the road at Montfermeil, an innkeeper’s wife was rocking her little girls.', 'Per trovare lavoro doveva nascondere la figlia. A Montfermeil, sulla strada, la moglie di un oste dondolava le sue bambine.'],
        ['fan', 'Would you keep my Cosette? Only until I find work. I will send money every month.', 'Terreste la mia Cosette? Solo finché trovo lavoro. Manderò i soldi ogni mese.'],
        ['then', 'Seven francs a month. Six months in advance.', 'Sette franchi al mese. Sei mesi anticipati.'],
        ['mmet', 'And fifteen francs for expenses.', 'E quindici franchi per le spese.'],
      ] },
      { id: 'fa-factory', lines: [
        ['n', 'In Montreuil-sur-Mer a stranger had found a new way of making jet beads. The town grew rich, and made Monsieur Madeleine its mayor.', 'A Montreuil-sur-Mer uno sconosciuto aveva trovato un nuovo modo di lavorare il giaietto. La città si arricchì e fece del signor Madeleine il suo sindaco.'],
        ['n', 'Fantine worked in his factory. For a while she was almost happy.', 'Fantine lavorava nella sua fabbrica. Per un po’ fu quasi felice.'],
        ['woman', 'You have a child. A girl with no father. This is an honest workshop.', 'Voi avete una figlia. Una bambina senza padre. Questo è un laboratorio onesto.'],
        ['fan', 'I am honest. I work. Please — what will I send them for her?', 'Io sono onesta. Lavoro. Vi prego, che cosa manderò per lei?'],
      ] },
      { id: 'fa-attic', lines: [
        ['n', 'Every month the Thénardiers asked for more. Cosette was cold. Cosette needed a woollen skirt. Cosette had a fever.', 'Ogni mese i Thénardier chiedevano di più. Cosette aveva freddo. Cosette voleva una gonna di lana. Cosette aveva la febbre.'],
        ['fan', 'How much for my hair?', 'Quanto per i miei capelli?'],
        ['merch', 'Ten francs. A pretty colour.', 'Dieci franchi. Un bel colore.'],
        ['n', 'Then she sold two front teeth. When she smiled, the candle showed the gap.', 'Poi vendette due denti davanti. Quando sorrideva, la candela mostrava il vuoto.'],
        ['fan', 'My child will not die of cold.', 'Mia figlia non morirà di freddo.'],
      ] },
      { id: 'fa-snow', lines: [
        ['n', 'One January night a young dandy pushed snow down her back, to amuse his friends. She flew at him like a wounded animal.', 'Una notte di gennaio un giovane elegantone le infilò la neve nella schiena per divertire gli amici. Lei gli si avventò contro come un animale ferito.'],
        ['jav', 'A street woman attacking a citizen. Six months in prison.', 'Una donna di strada che aggredisce un cittadino. Sei mesi di prigione.'],
        ['fan', 'Six months! Who will pay for Cosette? On my knees, monsieur…', 'Sei mesi! Chi pagherà per Cosette? In ginocchio, signore…'],
      ] },
      { id: 'fa-mayor', lines: [
        ['val', 'Let her go, Inspector. I am the mayor.', 'Lasciatela andare, ispettore. Sono il sindaco.'],
        ['jav', 'The law does not take orders from a mayor.', 'La legge non prende ordini da un sindaco.'],
        ['val', 'In this case it does. Read your code. Set her free.', 'In questo caso sì. Leggete il codice. Liberatela.'],
        ['n', 'She fainted in the snow. He carried her to the infirmary himself.', 'Fantine svenne nella neve. La portò lui stesso in infermeria.'],
        ['val', 'I will pay your debts. I will bring you your child. You will never be ashamed again.', 'Pagherò i tuoi debiti. Ti porterò tua figlia. Non dovrai vergognarti mai più.'],
      ] },
    ],
  },
  {
    id: 'tempete', roman: 'IV', fr: 'Une tempête sous un crâne', en: 'A Tempest in a Mind', it: 'Tempesta in una coscienza', accent: '#9fb6e8',
    shots: [
      { id: 'te-cart', lines: [
        ['n', 'Inspector Javert had been born in a prison, and he trusted only the law. He watched the mayor, and he remembered.', 'L’ispettore Javert era nato in una prigione, e credeva soltanto nella legge. Osservava il sindaco, e ricordava.'],
        ['n', 'One morning a cart sank into the mud with old Fauchelevent beneath it.', 'Una mattina un carro sprofondò nel fango, con sotto il vecchio Fauchelevent.'],
        ['jav', 'I have known only one man who could lift such a weight. A convict, at Toulon.', 'Ho conosciuto un solo uomo capace di sollevare un peso simile. Un forzato, a Tolone.'],
        ['val', 'Then he is not here. Stand back.', 'Allora qui non c’è. Fate largo.'],
      ] },
      { id: 'te-lift', lines: [
        ['n', 'He crawled under the wheel and slowly raised the cart on his back.', 'Strisciò sotto la ruota e lentamente sollevò il carro sulla schiena.'],
        ['fauch', 'You have given me back my life, Monsieur Madeleine. God keep you.', 'Mi avete ridato la vita, signor Madeleine. Dio vi protegga.'],
        ['jav', 'Mr. Mayor, I denounced you. I ask to be dismissed. The real Jean Valjean has been found.', 'Signor sindaco, vi ho denunciato. Chiedo di essere destituito. Hanno trovato il vero Jean Valjean.'],
        ['n', 'A poor man called Champmathieu, accused of stealing apples, was to be tried at Arras under that name.', 'Un poveraccio di nome Champmathieu, accusato di aver rubato delle mele, sarebbe stato giudicato ad Arras con quel nome.'],
      ] },
      { id: 'te-storm', lines: [
        ['val', 'A man will go to the galleys in my place. And I could remain free.', 'Un uomo andrà in galera al mio posto. E io potrei restare libero.'],
        ['n', 'All night the tempest raged inside him. If he spoke, the town lost its mayor and Fantine her hope.', 'Per tutta la notte la tempesta infuriò dentro di lui. Se parlava, la città perdeva il sindaco e Fantine la speranza.'],
        ['n', 'If he kept silent, he would keep everything — except himself.', 'Se taceva, avrebbe conservato tutto. Tranne se stesso.'],
        ['val', 'Old man, you and your candlesticks… what would you have me do?', 'Vecchio, tu e i tuoi candelabri… che cosa vuoi che faccia?'],
      ] },
      { id: 'te-court', lines: [
        ['judge', 'Three former convicts identify the accused. Does anyone doubt it?', 'Tre ex forzati riconoscono l’imputato. Qualcuno ne dubita?'],
        ['val', 'Gentlemen, release this man. Look at me. Do you not know me?', 'Signori, liberate quest’uomo. Guardatemi. Non mi riconoscete?'],
        ['val', 'I am Jean Valjean.', 'Sono io Jean Valjean.', 'Je suis Jean Valjean.'],
        ['n', 'That night his hair turned white.', 'Quella notte i suoi capelli diventarono bianchi.'],
      ] },
      { id: 'te-bed', lines: [
        ['fan', 'Is she here? I can hear her laughing… in the garden…', 'È arrivata? La sento ridere… in giardino…'],
        ['jav', 'Enough! Jean Valjean, in the name of the law!', 'Basta! Jean Valjean, in nome della legge!'],
        ['n', 'Fantine saw the inspector seize him by the collar. Her heart could not bear it.', 'Fantine vide l’ispettore afferrarlo per il colletto. Il suo cuore non resse.'],
        ['val', 'Sleep, Fantine. I swear to you: I will find your child.', 'Dormi, Fantine. Te lo giuro: troverò tua figlia.'],
      ] },
    ],
  },
  {
    id: 'cosette', roman: 'V', fr: 'Cosette', en: 'Cosette', it: 'Cosette', accent: '#8fd0ff',
    shots: [
      { id: 'co-sea', lines: [
        ['n', 'He went back to the galleys. In 1823 he saved a sailor hanging from a mast — and fell into the sea.', 'Tornò ai lavori forzati. Nel 1823 salvò un marinaio appeso a un pennone, e cadde in mare.'],
        ['n', 'The newspapers reported him drowned.', 'I giornali scrissero che era annegato.'],
      ] },
      { id: 'co-inn', lines: [
        ['n', 'Christmas Eve at Montfermeil. At the inn, the Thénardiers’ daughters played by the fire.', 'Vigilia di Natale a Montfermeil. Nella locanda, le figlie dei Thénardier giocavano accanto al fuoco.'],
        ['mmet', 'No more water. Little Lark! Off to the spring.', 'È finita l’acqua. Allodola! Alla fontana.'],
        ['cos', 'Madame, it is dark. The woods are dark.', 'Signora, è buio. Il bosco è buio.'],
        ['mmet', 'Buy a loaf on the way back. Lose the coin and you will taste the broom.', 'Al ritorno compra il pane. Perdi la moneta e assaggi la scopa.'],
      ] },
      { id: 'co-forest', lines: [
        ['n', 'She was eight years old. The bucket was almost as big as she was, and the frost bit her fingers.', 'Aveva otto anni. Il secchio era grande quasi quanto lei, e il gelo le mordeva le dita.'],
        ['cos', 'Dear God… please help me…', 'Mio Dio… aiutami…'],
        ['n', 'All at once the bucket grew light. A large hand had taken the handle.', 'All’improvviso il secchio diventò leggero. Una grande mano aveva afferrato il manico.'],
      ] },
      { id: 'co-meet', lines: [
        ['val', 'This is very heavy for you. What is your name?', 'È troppo pesante per te. Come ti chiami?'],
        ['cos', 'Cosette.', 'Cosette.'],
        ['n', 'He stood still, as if the word had struck him.', 'Restò immobile, come se quella parola lo avesse colpito.'],
        ['cos', 'There is a doll at the stall by the church. In a pink dress. Nobody will ever buy her.', 'Nella baracca vicino alla chiesa c’è una bambola. Col vestito rosa. Nessuno la comprerà mai.'],
      ] },
      { id: 'co-doll', lines: [
        ['n', 'That night he walked into the inn with the great doll in his arms.', 'Quella sera entrò nella locanda con la grande bambola in braccio.'],
        ['val', 'She is for you, Cosette.', 'È per te, Cosette.'],
        ['cos', 'For me? May I touch her? Truly?', 'Per me? Posso toccarla? Davvero?'],
        ['then', 'The little one is like a daughter to us. We could not part with her… for less than fifteen hundred francs.', 'La piccola è come una figlia per noi. Non potremmo separarcene… per meno di millecinquecento franchi.'],
        ['val', 'Here they are. And here is her mother’s letter.', 'Eccoli. Ed ecco la lettera di sua madre.'],
      ] },
      { id: 'co-dawn', lines: [
        ['n', 'In the morning a man and a child left Montfermeil hand in hand. He had never had anyone to love.', 'Al mattino un uomo e una bambina lasciarono Montfermeil mano nella mano. Lui non aveva mai avuto nessuno da amare.'],
        ['cos', 'Are you my father now?', 'Adesso sei il mio papà?'],
        ['val', 'If you want me to be.', 'Se vuoi che lo sia.'],
      ] },
    ],
  },
  {
    id: 'couvent', roman: 'VI', fr: 'Le Couvent', en: 'The Wall', it: 'Il Muro', accent: '#b7a8f0',
    shots: [
      { id: 'cv-lesson', lines: [
        ['n', 'Paris was large enough to hide a man, but not a past. In a crumbling house on the edge of town they learned to be happy.', 'Parigi era abbastanza grande per nascondere un uomo, ma non un passato. In una casa cadente alla periferia impararono a essere felici.'],
        ['val', 'A is for apple. B is for… bread.', 'A come ape. B come… bue.'],
        ['cos', 'You are not very good at this, Papa.', 'Non sei molto bravo, papà.'],
      ] },
      { id: 'cv-chase', lines: [
        ['n', 'One evening he heard a step he knew. Javert had followed him to Paris.', 'Una sera riconobbe un passo. Javert lo aveva seguito fino a Parigi.'],
        ['jav', 'Close every street. This one is mine.', 'Chiudete ogni strada. Quello è mio.'],
        ['val', 'Hold tight to my neck. Not a sound.', 'Stringiti forte al mio collo. Non un fiato.'],
      ] },
      { id: 'cv-wall', lines: [
        ['n', 'Trapped in a blind alley, he climbed a wall with the child hanging from a rope.', 'Chiuso in un vicolo cieco, scalò un muro tirando su la bambina con una corda.'],
        ['n', 'They dropped into a convent garden. And the gardener was old Fauchelevent.', 'Caddero nel giardino di un convento. E il giardiniere era il vecchio Fauchelevent.'],
        ['fauch', 'Monsieur Madeleine! Have you fallen from the sky?', 'Signor Madeleine! Siete caduto dal cielo?'],
        ['val', 'From a wall, my friend. Can you hide us?', 'Da un muro, amico mio. Potete nasconderci?'],
      ] },
      { id: 'cv-coffin', lines: [
        ['fauch', 'No man from outside may enter here. To come in by the front door, you must first go out… in a coffin.', 'Nessun uomo di fuori può entrare qui. Per passare dalla porta principale dovete prima uscire… in una bara.'],
        ['n', 'So Jean Valjean was buried alive, rose again, and walked back in as the gardener’s brother.', 'Così Jean Valjean fu sepolto vivo, risorse, e rientrò come fratello del giardiniere.'],
      ] },
      { id: 'cv-years', lines: [
        ['n', 'Years passed behind high walls. Cosette grew. And one day, without knowing it, she grew beautiful.', 'Dietro le alte mura passarono gli anni. Cosette crebbe. E un giorno, senza saperlo, diventò bella.'],
        ['val', 'I would give the whole world to keep this garden closed.', 'Darei il mondo intero perché questo giardino restasse chiuso.'],
      ] },
    ],
  },
  {
    id: 'embuscade', roman: 'VII', fr: 'Marius', en: 'Marius', it: 'Marius', accent: '#a9dc8c',
    shots: [
      { id: 'em-bench', lines: [
        ['n', 'In the Luxembourg Gardens a young student, Marius Pontmercy, walked past the same bench every afternoon.', 'Ai Giardini del Lussemburgo un giovane studente, Marius Pontmercy, passava ogni pomeriggio davanti alla stessa panchina.'],
        ['mar', 'I have looked at her a hundred times. Today she looked at me.', 'L’ho guardata cento volte. Oggi lei ha guardato me.'],
        ['val', 'Come, Cosette. We will walk somewhere else.', 'Vieni, Cosette. Passeggeremo altrove.'],
      ] },
      { id: 'em-grand', lines: [
        ['n', 'Marius had quarrelled with his royalist grandfather over the memory of his father, a colonel of Waterloo.', 'Marius aveva rotto con il nonno monarchico per la memoria di suo padre, un colonnello di Waterloo.'],
        ['gill', 'A Bonapartist in my own house! Go, then! Go and starve with your republic!', 'Un bonapartista in casa mia! Vattene! Va’ a morire di fame con la tua repubblica!'],
        ['n', 'His father had left him one debt: to find the man who had saved his life. A man named Thénardier.', 'Il padre gli aveva lasciato un solo debito: ritrovare l’uomo che gli aveva salvato la vita. Un certo Thénardier.'],
      ] },
      { id: 'em-trap', lines: [
        ['n', 'Thénardier, too, was in Paris under a false name. He recognised the man who had taken Cosette.', 'Anche Thénardier era a Parigi, sotto falso nome. Riconobbe l’uomo che si era portato via Cosette.'],
        ['then', 'Look at him, the rich benefactor! Tie him up. Two hundred thousand francs, or the girl.', 'Guardatelo, il ricco benefattore! Legatelo. Duecentomila franchi, o la ragazza.'],
        ['mar', 'Thénardier… The man my father told me to protect!', 'Thénardier… L’uomo che mio padre mi ha chiesto di proteggere!'],
      ] },
      { id: 'em-iron', lines: [
        ['val', 'Poor wretches. Do not fear me. And do not think that I fear you.', 'Poveri disgraziati. Non abbiate paura di me. E non crediate che io ne abbia di voi.'],
        ['n', 'He pressed a red-hot iron to his own arm, and did not cry out.', 'Premette sul proprio braccio un ferro rovente, e non gridò.'],
        ['n', 'When Javert burst in, the prisoner had already vanished through the window.', 'Quando Javert irruppe, il prigioniero era già sparito dalla finestra.'],
      ] },
    ],
  },
  {
    id: 'plumet', roman: 'VIII', fr: 'La Rue Plumet', en: 'The Garden', it: 'Il Giardino', accent: '#f0a6c0',
    shots: [
      { id: 'pl-epo', lines: [
        ['epo', 'I know where she lives, Monsieur Marius. I can take you. What will you give me?', 'So dove abita, signor Marius. Posso portarvici. Che cosa mi date?'],
        ['mar', 'Anything you like.', 'Tutto quello che vuoi.'],
        ['epo', 'No. Not money.', 'No. Non denaro.'],
        ['n', 'Éponine, the Thénardiers’ eldest, ragged now, had loved him for a long time, in silence.', 'Éponine, la figlia maggiore dei Thénardier, ormai coperta di stracci, lo amava da tempo, in silenzio.'],
      ] },
      { id: 'pl-letter', lines: [
        ['n', 'One April evening, in a wild garden in the Rue Plumet, Cosette found a letter under a stone.', 'Una sera d’aprile, in un giardino selvatico di rue Plumet, Cosette trovò una lettera sotto un sasso.'],
        ['mar', 'To love, or to have loved, is enough.', 'Amare, o avere amato, basta.', 'Aimer, ou avoir aimé, cela suffit.'],
        ['cos', 'It is you. The young man from the bench.', 'Siete voi. Il giovane della panchina.'],
      ] },
      { id: 'pl-gate', lines: [
        ['mar', 'Since I stopped seeing you, I have been dying. Tell me your name.', 'Da quando ho smesso di vedervi, muoio. Ditemi il vostro nome.'],
        ['cos', 'Cosette. And yours?', 'Cosette. E il vostro?'],
        ['mar', 'Marius.', 'Marius.'],
        ['n', 'Every evening for six weeks they said nothing important, and it was the most important thing in the world.', 'Ogni sera, per sei settimane, non si dissero nulla di importante, ed era la cosa più importante del mondo.'],
      ] },
      { id: 'pl-leave', lines: [
        ['cos', 'My father is taking me to England. In a week.', 'Mio padre mi porta in Inghilterra. Tra una settimana.'],
        ['mar', 'If you go, I shall die.', 'Se partite, ne morirò.'],
        ['n', 'And while two lovers wept in a garden, the whole city began to tremble.', 'E mentre due innamorati piangevano in un giardino, l’intera città cominciò a tremare.'],
      ] },
      { id: 'pl-abc', lines: [
        ['n', 'In the back room of a café met the Friends of the ABC: abaissé, the people brought low.', 'Nel retrobottega di un caffè si riunivano gli Amici dell’ABC: l’abaissé, il popolo umiliato.'],
        ['enj', 'The people are hungry. Children sleep under bridges. How long shall we call this order?', 'Il popolo ha fame. I bambini dormono sotto i ponti. Per quanto ancora lo chiameremo ordine?'],
        ['gran', 'Wake me when the revolution begins. Or when the wine runs out.', 'Svegliatemi quando comincia la rivoluzione. O quando finisce il vino.'],
        ['enj', 'Grantaire, you believe in nothing.', 'Grantaire, tu non credi in niente.'],
        ['gran', 'I believe in you. That is enough to ruin any man.', 'Credo in te. Basta e avanza per rovinare un uomo.'],
        ['gav', 'Citizens! General Lamarque is dead! The whole faubourg is talking!', 'Cittadini! Il generale Lamarque è morto! Ne parla tutto il sobborgo!'],
      ] },
    ],
  },
  {
    id: 'barricade', roman: 'IX', fr: 'La Barricade', en: 'The Barricade', it: 'La Barricata', accent: '#ff6a4d',
    shots: [
      { id: 'ba-rise', lines: [
        ['n', 'The fifth of June, 1832. At the general’s funeral a red flag rose over the crowd, and the streets rose with it.', 'Cinque giugno 1832. Al funerale del generale una bandiera rossa si alzò sulla folla, e con lei si sollevarono le strade.'],
        ['enj', 'Tear up the paving stones! Chairs, carts, barrels! Here we stop them!', 'Divellete il selciato! Sedie, carri, botti! Qui li fermiamo!'],
        ['n', 'In the Rue de la Chanvrerie, before the Corinth tavern, a barricade grew as high as the first floor.', 'In rue de la Chanvrerie, davanti all’osteria Corinto, crebbe una barricata alta fino al primo piano.'],
      ] },
      { id: 'ba-spy', lines: [
        ['gav', 'That man there! I know that face. He is a police spy! It is Javert!', 'Quello lì! La conosco quella faccia. È una spia della polizia! È Javert!'],
        ['jav', 'I do not deny it. Do what you must.', 'Non lo nego. Fate ciò che dovete.'],
        ['n', 'They bound him to a post inside the tavern.', 'Lo legarono a un palo dentro l’osteria.'],
      ] },
      { id: 'ba-eponine', lines: [
        ['n', 'Believing Cosette lost for ever, Marius came to the barricade to die. A musket was aimed at him; a thin hand closed over its mouth.', 'Credendo Cosette perduta per sempre, Marius venne alla barricata per morire. Un fucile lo mirò; una mano sottile ne chiuse la canna.'],
        ['epo', 'It was me… I am glad you are not hurt. Take this letter. I kept it from you.', 'Ero io… Sono contenta che non siate ferito. Prendete questa lettera. Ve l’avevo nascosta.'],
        ['epo', 'And then, you know, Monsieur Marius, I think I was a little in love with you.', 'E poi, vedete, signor Marius, credo che fossi un poco innamorata di voi.', 'Et puis, tenez, monsieur Marius, je crois que j’étais un peu amoureuse de vous.'],
        ['n', 'He kissed her forehead, as she had asked. It was beginning to rain.', 'Le baciò la fronte, come lei aveva chiesto. Cominciava a piovere.'],
      ] },
      { id: 'ba-night', lines: [
        ['n', 'Marius sent Cosette a farewell. Valjean read it first. For a moment he was glad; then he took his old National Guard uniform and went out into the night.', 'Marius mandò a Cosette un addio. Valjean lo lesse per primo. Per un istante fu contento; poi prese la vecchia divisa della Guardia nazionale e uscì nella notte.'],
        ['enj', 'Citizens, the nineteenth century is great, but the twentieth will be happy.', 'Cittadini, il diciannovesimo secolo è grande, ma il ventesimo sarà felice.', 'Citoyens, le dix-neuvième siècle est grand, mais le vingtième siècle sera heureux.'],
      ] },
      { id: 'ba-spare', lines: [
        ['val', 'Give me the spy. I will deal with him.', 'Datemi la spia. Me ne occupo io.'],
        ['n', 'In a dark alley Valjean raised the pistol. Then he cut the ropes.', 'In un vicolo buio Valjean alzò la pistola. Poi tagliò le corde.'],
        ['val', 'You are free. If you want me, I live in the Rue de l’Homme-Armé, number seven.', 'Siete libero. Se mi cercate, abito in rue de l’Homme-Armé, al numero sette.'],
        ['jav', 'You trouble me. I would rather you killed me.', 'Voi mi turbate. Preferirei che mi uccideste.'],
        ['val', 'Go.', 'Andate.'],
      ] },
      { id: 'ba-gavroche', lines: [
        ['gav', 'No more cartridges? I will fetch some. The dead have no use for them.', 'Finite le cartucce? Vado a prenderne. Ai morti non servono più.'],
        ['enj', 'Gavroche! Come back!', 'Gavroche! Torna indietro!'],
        ['n', 'He ran out before the soldiers, laughing and filling his basket, mocking every bullet that missed him.', 'Corse davanti ai soldati ridendo e riempiendo il paniere, sbeffeggiando ogni pallottola che lo mancava.'],
        ['n', 'One did not miss. That little great soul had flown away.', 'Una non lo mancò. Quella piccola grande anima era volata via.'],
      ] },
      { id: 'ba-fall', lines: [
        ['n', 'At dawn the soldiers broke through. Enjolras stood alone against the wall, when Grantaire woke and walked to his side.', 'All’alba i soldati sfondarono. Enjolras era solo contro il muro, quando Grantaire si svegliò e venne al suo fianco.'],
        ['gran', 'Long live the Republic. Will you allow me?', 'Viva la Repubblica. Me lo permetti?'],
        ['n', 'Enjolras took his hand, and smiled.', 'Enjolras gli prese la mano, e sorrise.'],
      ] },
    ],
  },
  {
    id: 'egout', roman: 'X', fr: 'L’Égout', en: 'The Sewer', it: 'La Fogna', accent: '#b9c970',
    shots: [
      { id: 'eg-down', lines: [
        ['n', 'Marius fell, badly wounded. Valjean caught him, lifted him, and found one way out: an iron grating in the street.', 'Marius cadde, ferito gravemente. Valjean lo afferrò, lo sollevò, e trovò una sola via d’uscita: una grata di ferro nella strada.'],
        ['n', 'Beneath Paris lies another Paris: a night of vaults and black water, where no sound of the world arrives.', 'Sotto Parigi c’è un’altra Parigi: una notte di volte e acqua nera, dove non arriva alcun rumore del mondo.'],
      ] },
      { id: 'eg-water', lines: [
        ['val', 'Stay alive, boy. For her. Stay alive.', 'Resta vivo, ragazzo. Per lei. Resta vivo.'],
        ['n', 'He walked for hours, the filth rising to his chest, holding the wounded man above it.', 'Camminò per ore, con la melma che gli saliva fino al petto, tenendo il ferito più in alto.'],
        ['val', 'One step. Only one more step. One more.', 'Un passo. Solo un altro passo. Ancora uno.'],
      ] },
      { id: 'eg-gate', lines: [
        ['n', 'At last, daylight. A grating by the river — locked. And in the shadow, a thief with a key.', 'Infine, la luce. Una grata sul fiume, chiusa. E nell’ombra, un ladro con la chiave.'],
        ['then', 'A dead man? Share what you took, friend, and I will open.', 'Un morto? Dividi il bottino, amico, e ti apro.'],
        ['n', 'Thénardier did not know him under the mud. Secretly he tore a scrap from the wounded man’s coat.', 'Sotto il fango Thénardier non lo riconobbe. Di nascosto strappò un lembo dalla giacca del ferito.'],
      ] },
      { id: 'eg-javert', lines: [
        ['n', 'The gate swung open. And waiting on the riverbank stood Javert.', 'Il cancello si aprì. E sulla riva, ad aspettare, c’era Javert.'],
        ['val', 'Inspector. Let me take this boy to his family. After that, I am yours.', 'Ispettore. Lasciatemi portare questo ragazzo dalla sua famiglia. Poi sono vostro.'],
        ['jav', '…Get into the carriage.', '…Salite in carrozza.'],
      ] },
    ],
  },
  {
    id: 'etoile', roman: 'XI', fr: 'Javert', en: 'The Star', it: 'La Stella', accent: '#9fd0ff',
    shots: [
      { id: 'et-street', lines: [
        ['n', 'They left Marius at his grandfather’s door. Valjean asked to go up to his rooms for a moment.', 'Consegnarono Marius a casa del nonno. Valjean chiese di salire un momento nella sua stanza.'],
        ['n', 'When he looked down from the window, the street was empty.', 'Quando guardò dalla finestra, la strada era vuota.'],
      ] },
      { id: 'et-bridge', lines: [
        ['jav', 'He could have killed me. He gave me my life. A convict who is good…', 'Poteva uccidermi. Mi ha ridato la vita. Un forzato che è buono…'],
        ['n', 'All his life he had walked one straight road. Now he saw two, and both were straight.', 'Per tutta la vita aveva camminato su una strada diritta. Ora ne vedeva due, ed erano diritte entrambe.'],
        ['jav', 'If a thief can be just, what is the law? And what am I?', 'Se un ladro può essere giusto, che cos’è la legge? E io che cosa sono?'],
      ] },
      { id: 'et-star', lines: [
        ['n', 'He wrote a note to the Prefect, listing things in the prisons that ought to be made more humane.', 'Scrisse un biglietto al prefetto, elencando ciò che nelle prigioni andava reso più umano.'],
        ['n', 'Then he walked to the parapet above the Seine, took off his hat, and set it on the stone.', 'Poi raggiunse il parapetto sulla Senna, si tolse il cappello e lo posò sulla pietra.'],
        ['n', 'The river closed. The stars kept their places.', 'Il fiume si richiuse. Le stelle rimasero al loro posto.'],
      ] },
    ],
  },
  {
    id: 'pardon', roman: 'XII', fr: 'Le Pardon', en: 'Forgiveness', it: 'Il Perdono', accent: '#ffd48a',
    shots: [
      { id: 'pa-wake', lines: [
        ['n', 'For months Marius hovered between life and death. At last he opened his eyes and asked for Cosette.', 'Per mesi Marius restò tra la vita e la morte. Infine aprì gli occhi e chiese di Cosette.'],
        ['gill', 'Marry her, my boy! Marry her and be happy! You shall have my whole old heart!', 'Sposala, figliolo! Sposala e sii felice! Avrai tutto il mio vecchio cuore!'],
        ['mar', 'Grandfather…', 'Nonno…'],
      ] },
      { id: 'pa-wedding', lines: [
        ['n', 'In February 1833, on a night of carnival, Marius and Cosette were married.', 'Nel febbraio del 1833, in una notte di carnevale, Marius e Cosette si sposarono.'],
        ['cos', 'Father, stay for supper. Sit beside me.', 'Padre, restate a cena. Sedete accanto a me.'],
        ['val', 'Not tonight, my child. My hand hurts.', 'Non stasera, bambina mia. Mi duole la mano.'],
      ] },
      { id: 'pa-confess', lines: [
        ['val', 'I am not her father. I am a former convict. You must know it, for you are her husband.', 'Non sono suo padre. Sono un ex forzato. Dovete saperlo, perché siete suo marito.'],
        ['mar', 'A convict…', 'Un forzato…'],
        ['val', 'To share your name I would have had to steal it. I would rather lose everything and stay honest.', 'Per portare il vostro nome avrei dovuto rubarlo. Preferisco perdere tutto e restare onesto.'],
        ['n', 'Marius, appalled, let him visit less and less.', 'Marius, sconvolto, lasciò che venisse sempre meno.'],
      ] },
      { id: 'pa-alone', lines: [
        ['n', 'Each evening Valjean walked to the corner of their street, stood there, and turned back.', 'Ogni sera Valjean camminava fino all’angolo della loro via, restava lì, e tornava indietro.'],
        ['n', 'He stopped eating. He sat with two silver candlesticks and a little black dress that a child had worn.', 'Smise di mangiare. Sedeva accanto a due candelabri d’argento e a un vestitino nero che una bambina aveva portato.'],
      ] },
      { id: 'pa-truth', lines: [
        ['then', 'Baron! For a few banknotes I will tell you who that man is. A murderer! I saw him in the sewer, and here is a scrap of his victim’s coat.', 'Barone! Per pochi biglietti vi dico chi è quell’uomo. Un assassino! L’ho visto nella fogna, ed ecco un lembo della giacca della sua vittima.'],
        ['mar', 'This cloth… is from my own coat. It was he. He carried me!', 'Questa stoffa… è della mia giacca. Era lui. Mi ha portato in salvo lui!'],
        ['mar', 'Cosette! Your father! Quickly!', 'Cosette! Tuo padre! Presto!'],
      ] },
      { id: 'pa-return', lines: [
        ['val', 'Is it you? Cosette… I thought I should not see you again.', 'Sei tu? Cosette… Credevo che non ti avrei più rivista.'],
        ['cos', 'You wicked father, to leave us! You will come and live in our house.', 'Cattivo papà, che ci avete lasciati! Verrete a vivere in casa nostra.'],
        ['val', 'There is one more journey for me. Light the candles.', 'Mi resta un ultimo viaggio. Accendete le candele.'],
        ['val', 'These candlesticks are yours. I do not know if the man who gave them to me is pleased with me. I did what I could.', 'Questi candelabri sono vostri. Non so se chi me li ha donati è contento di me. Ho fatto quello che ho potuto.'],
      ] },
      { id: 'pa-last', lines: [
        ['val', 'Love each other well, always. There is hardly anything else in the world but that: to love.', 'Amatevi sempre. Al mondo non c’è quasi altro che questo: amarsi.', 'Aimez-vous bien toujours. Il n’y a guère autre chose que cela dans le monde : s’aimer.'],
        ['cos', 'Father… stay…', 'Papà… resta…'],
        ['val', 'It is nothing to die. It is dreadful not to live.', 'Morire è nulla. È spaventoso non vivere.', 'Ce n’est rien de mourir ; c’est affreux de ne pas vivre.'],
        ['n', 'The night was starless and very dark. In the shadow, surely, some great angel stood with open wings, waiting for the soul.', 'La notte era senza stelle e profondamente buia. Nell’ombra, di certo, un grande angelo attendeva quell’anima ad ali spiegate.'],
      ] },
    ],
  },
  {
    id: 'epilogue', roman: 'ÉPILOGUE', fr: 'La Lumière', en: 'The Light', it: 'La Luce', accent: '#ffe0a8',
    shots: [
      { id: 'ep-grave', lines: [
        ['n', 'In the cemetery of Père-Lachaise, far from the grand tombs, there is a stone with no name.', 'Al cimitero del Père-Lachaise, lontano dalle tombe sontuose, c’è una pietra senza nome.'],
        ['n', 'Someone once wrote four lines on it in pencil. The rain washed them away.', 'Un giorno qualcuno vi scrisse quattro versi a matita. La pioggia li cancellò.'],
      ] },
      { id: 'ep-dawn', lines: [
        ['n', 'But the thread did not break. It passed to Cosette, to the children of Cosette, to whoever opens a door in the night.', 'Ma il filo non si spezzò. Passò a Cosette, ai figli di Cosette, a chiunque apra una porta nella notte.'],
        ['n', 'And now it is in your hands.', 'E ora è nelle tue mani.'],
      ] },
    ],
  },
];
