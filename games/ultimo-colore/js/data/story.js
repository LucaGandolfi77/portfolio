/* ============================================================
   Ultimo Colore — Act I, the words (IT + EN, pure data)
   ------------------------------------------------------------
   A beat is [speaker, italian, english]; speaker 'n' is the
   narration. {c: [...]} is a choice: each option has its words,
   an optional bond it strengthens, and the beats that follow.
   ============================================================ */

export const SPEAKERS = {
  n: null, ilario: 'Ilario', nora: 'Nora', tecla: 'Tecla', bastiano: 'Bastiano', vela: '???',
  ada: { it: 'Ada, la fornaia', en: 'Ada, the baker' }, ombra: 'Ombra',
};

export const SCENES = {
  casa: [
    ['n', 'A Velaria il giorno comincia contando.', 'In Velaria the day begins with counting.'],
    ['n', 'Si contano le lanterne rimaste accese sui ponti. Quelle viola non si accendono più da sette anni. Le indaco da cinque. Le blu dall’autunno scorso.', 'People count the lanterns still lit on the bridges. The violet ones have not been lit for seven years. The indigo for five. The blue since last autumn.'],
    ['n', 'Stasera la città spegnerà la prima lanterna verde.', 'Tonight the city will put out its first green lantern.'],
    ['n', 'Ilario Sardi, lanternaio, ha cinquantadue anni, una barca presa in prestito e un cane nero come il fumo.', 'Ilario Sardi, lantern maker, is fifty-two, with a borrowed boat and a dog as black as smoke.'],
    ['ilario', 'Su, Ombra. Il pane. Poi si parte.', 'Come on, Ombra. Bread. Then we leave.'],
    ['n', 'Il forno di Ada Zennaro apre prima dell’alba. Apre da trent’anni. Stamattina le imposte sono già aperte e non esce nessun profumo.', 'Ada Zennaro’s bakery opens before dawn. It has for thirty years. This morning the shutters are open and no smell comes out.'],
    ['ilario', 'Ada?', 'Ada?'],
    ['n', 'È in strada, davanti al banco. Tiene una pagnotta con tutte e due le mani e la porge a qualcuno che non c’è.', 'She is in the street, before her counter. She holds a loaf in both hands, offering it to someone who is not there.'],
    ['n', 'È bianca fino alle ciglia. Il sale le ha preso anche il grembiule.', 'She is white to the eyelashes. The salt has taken her apron too.'],
    ['n', 'Ombra annusa le sue scarpe, a lungo. Poi si siede, come faceva aspettando il pezzo di crosta.', 'Ombra sniffs her shoes for a long time. Then he sits, as he did while waiting for the heel of the loaf.'],
    ['ilario', 'Ieri sera hai detto che il verde non ti piaceva neanche.', 'Last night you said you never even liked green.'],
    ['n', 'Nessuna risposta. Una goccia di rugiada scivola dalla sua guancia e lascia un solco.', 'No answer. A drop of dew slides down her cheek and leaves a groove.'],
    { c: [
      { it: 'Prendere il pane dalle sue mani.', en: 'Take the bread from her hands.', flag: 'pane', beats: [
        ['n', 'Le dita di sale non resistono. La pagnotta è ancora tiepida in mezzo.', 'The salt fingers do not resist. The middle of the loaf is still warm.'],
        ['ilario', 'Grazie, Ada. La mangiamo noi.', 'Thank you, Ada. We will eat it.'],
      ] },
      { it: 'Lasciarglielo: era per qualcun altro.', en: 'Leave it: it was meant for someone else.', flag: 'rispetto', beats: [
        ['ilario', 'Aspettavi qualcuno. Va bene. Aspettalo.', 'You were waiting for someone. All right. Wait.'],
        ['n', 'Le sistema il grembiule, che il vento aveva piegato. Poi compra il silenzio di un minuto, senza pagarlo.', 'He straightens her apron, which the wind had folded. Then he takes a minute of silence, and pays nothing for it.'],
      ] },
    ] },
    ['n', 'Da casa sua si vede il ponte delle Lanterne. Dal ponte arriva un rumore di vetri.', 'From his door you can see the Bridge of Lanterns. From the bridge comes the sound of glass.'],
  ],

  ponte: [
    ['n', 'In mezzo al ponte, il vetro si muove da solo. Cocci di bottiglie verdi si tirano su, uno sull’altro, fino ad avere due occhi.', 'In the middle of the bridge, glass is moving by itself. Shards of green bottles pull themselves up, one onto another, until they have two eyes.'],
    ['ilario', 'Sbiaditi. In pieno giorno.', 'Faded ones. In broad daylight.'],
    ['tecla', 'Non è giorno. È la mattina prima dell’ultima sera. Per loro è diverso.', 'It is not day. It is the morning before the last evening. For them that is different.'],
    ['n', 'La donna che parla ha una borsa di mappe e un fazzoletto rosso al collo. È l’unica cosa rossa che ha addosso. È l’unica cosa che ha di colorato.', 'The woman speaking carries a satchel of maps and a red kerchief at her throat. It is the only red thing on her. It is the only coloured thing on her.'],
    ['tecla', 'Tecla Marin. Cartografa. Ho letto il suo annuncio: cercava qualcuno che sapesse dov’è la Fonte.', 'Tecla Marin. Cartographer. I read your notice: you wanted someone who knows where the Source is.'],
    ['ilario', 'E lei lo sa?', 'And do you?'],
    ['tecla', 'So dove sono finite le spedizioni che non l’hanno trovata. È un inizio.', 'I know where the expeditions that did not find it ended up. It is a start.'],
    ['n', 'Il vetro si abbassa, come un gatto prima del salto.', 'The glass crouches, like a cat before it leaps.'],
    ['tecla', 'Guardi quando caricano. Si schivano. Se è bravo, si parano: e allora si prende fiato.', 'Watch them wind up. You dodge. If you are good, you parry: then you catch your breath.'],
    ['ilario', 'Ho fatto lanterne per trent’anni.', 'I have made lanterns for thirty years.'],
    ['tecla', 'Allora sa tenere in mano un’asta. Andiamo.', 'Then you can hold a pole. Come on.'],
  ],

  darsena: [
    ['n', 'La barca si chiama Pazienza. Il nome è scrostato a metà e dice soltanto Pazien.', 'The boat is called Patience. The name is half peeled off and only says Patien.'],
    ['tecla', 'Sei posti, quattro remi, una vela rattoppata. La Fonte è oltre il Mare di Gesso. Quaranta giorni, se il vento ci vuole bene.', 'Six places, four oars, a patched sail. The Source lies past the Chalk Sea. Forty days, if the wind is fond of us.'],
    ['ilario', 'E se non ci vuole bene?', 'And if it is not?'],
    ['tecla', 'Allora non importa quanti sono.', 'Then it will not matter how many.'],
    ['n', 'Sul molo c’è una statua che guarda il mare. La città ha smesso di spostarle: ce ne sono troppe.', 'On the jetty a statue looks out to sea. The city has stopped moving them: there are too many.'],
    ['tecla', 'Salutava qualcuno che partiva.', 'He was waving someone off.'],
    ['ilario', 'Mi aveva chiesto di venire. Nora. Ho detto di no, le ho lasciato una lettera e la chiave di casa dalla vicina.', 'She asked to come. Nora. I said no, left her a letter, and the house key with the neighbour.'],
    ['tecla', 'Quanti anni ha?', 'How old is she?'],
    ['ilario', 'Diciassette. L’ho presa che ne aveva sei. I suoi sono diventati sale la stessa notte, mano nella mano.', 'Seventeen. I took her in at six. Her parents turned to salt the same night, hand in hand.'],
    ['tecla', 'E lei crede che resterà a casa?', 'And you believe she will stay at home?'],
    ['ilario', 'No. Per questo siamo in partenza due ore prima di quanto le ho detto.', 'No. That is why we are leaving two hours before the time I told her.'],
    ['n', 'Ombra abbaia contro la botola della stiva. Una volta. Due.', 'Ombra barks at the hatch to the hold. Once. Twice.'],
  ],

  stiva: [
    ['n', 'La stiva sa di cera e di pece. Tra due casse, una sciarpa gialla.', 'The hold smells of wax and pitch. Between two crates, a yellow scarf.'],
    ['ilario', 'Esci.', 'Come out.'],
    ['nora', 'Ho portato le gallette. E il coltello. E il tuo cappello buono, che ti eri dimenticato.', 'I brought hardtack. And the knife. And your good hat, which you forgot.'],
    ['ilario', 'Esci.', 'Come out.'],
    ['nora', 'Hai detto alle sette. Sono le cinque. Bugiardo.', 'You said seven. It is five. Liar.'],
    ['ilario', 'Nessuna spedizione è tornata, Nora.', 'No expedition has come back, Nora.'],
    ['nora', 'Lo so. Per questo non ti lascio tornare da solo. Cioè. Non tornare. Insomma, hai capito.', 'I know. That is why I will not let you come back alone. I mean. Not come back. You know what I mean.'],
    ['n', 'La Pazienza è già fuori dalla darsena. Velaria si stringe alle loro spalle, tetto dopo tetto.', 'Patience is already out of the harbour. Velaria narrows behind them, roof after roof.'],
    { c: [
      { it: '«Alla prima secca ti rimando indietro.»', en: '“First sandbar, you go back.”', bond: 'ilario-tecla', beats: [
        ['nora', 'Alla prima secca io faccio finta di non saper remare.', 'At the first sandbar I will pretend I cannot row.'],
        ['tecla', 'La prima secca è tra tre giorni. Ha tre giorni per diventare utile.', 'The first sandbar is three days away. She has three days to become useful.'],
      ] },
      { it: '«Resta. Ma fai quello che dico.»', en: '“Stay. But do as I say.”', bond: 'ilario-nora', beats: [
        ['nora', 'Sempre.', 'Always.'],
        ['ilario', 'Non hai mai fatto quello che dico. Neanche una volta.', 'You have never done as I say. Not once.'],
        ['nora', 'Allora è una novità. Ti piacerà.', 'Then it will be new. You will like it.'],
      ] },
    ] },
    ['n', 'Nora si lega la sciarpa in modo che non le intralci il braccio. Qualcuno le ha insegnato a combattere. Ilario spera di non sapere chi.', 'Nora ties her scarf so it will not catch her arm. Someone has taught her to fight. Ilario hopes never to learn who.'],
  ],

  canale: [
    ['n', 'Il Canale dei Panni. Una volta, il lunedì, tutta la città stendeva qui.', 'The Laundry Canal. On Mondays the whole city used to hang its washing here.'],
    ['n', 'Su una riva, una donna di sale si allunga verso un lenzuolo verde che il vento gonfia ancora.', 'On one bank, a woman of salt stretches toward a green sheet the wind still fills.'],
    ['nora', 'È la signora Perin. Mi sgridava perché correvo.', 'That is Signora Perin. She told me off for running.'],
    ['tecla', 'Il lenzuolo è verde. Stasera sarà grigio.', 'The sheet is green. By tonight it will be grey.'],
    ['n', 'Qualcosa sotto l’acqua ha tirato giù la corda. Ha un guscio coperto d’erba da cortile.', 'Something under the water has pulled the line down. Its shell is covered in backyard grass.'],
    ['nora', 'Granchio. Quello spazza in basso: saltalo, non pararlo.', 'Crab. That one sweeps low: jump it, do not parry it.'],
    ['ilario', 'E tu come lo sai?', 'And how do you know that?'],
    ['nora', 'Secondo te dove andavo, la notte?', 'Where did you think I went at night?'],
  ],

  reti: [
    ['n', 'L’Isola delle Reti non è sulla rotta. Ma sull’isola c’è una luce che si accende e si spegne.', 'The Isle of Nets is not on the course. But on the isle there is a light going on and off.'],
    ['tecla', 'Qui si fermò la terza spedizione. Se c’è qualcosa di loro, ci servirà.', 'The third expedition stopped here. If anything of theirs is left, we will need it.'],
    ['n', 'Tra le reti stese, lanterne senza fiamma camminano su steli di fumo.', 'Among the spread nets, lanterns without flames walk on stalks of smoke.'],
    ['ilario', 'Quella l’ho fatta io. Riconosco la piega della carta.', 'I made that one. I know the fold of the paper.'],
  ],

  campanaro: [
    ['n', 'Il campanile di San Brizio affonda da prima che Nora nascesse. Si inclina verso la laguna come un vecchio che ascolta.', 'The bell tower of San Brizio has been sinking since before Nora was born. It leans to the lagoon like an old man listening.'],
    ['n', 'In cima, un vecchio che non ascolta tira la corda.', 'At the top, an old man who is not listening pulls the rope.'],
    ['bastiano', 'È OCRA! Il terzo rintocco è ocra, l’avete sentito?', 'IT IS OCHRE! The third toll is ochre, did you hear it?'],
    ['nora', 'Abbiamo sentito una campana.', 'We heard a bell.'],
    ['bastiano', 'Come?', 'What?'],
    ['nora', 'UNA CAMPANA.', 'A BELL.'],
    ['bastiano', 'Brava. È già qualcosa. La gente sente le campane e non sente di che colore sono.', 'Good girl. That is something. People hear bells and not what colour they are.'],
    ['tecla', 'Bastiano Toffolo. Quarant’anni campanaro. I medici dicono che è sordo.', 'Bastiano Toffolo. Bell ringer for forty years. The doctors say he is deaf.'],
    ['bastiano', 'I medici hanno ragione. Sento solo quello che conta.', 'The doctors are right. I only hear what matters.'],
    ['bastiano', 'E vi dico una cosa che sento da tre notti. C’è qualcuno, oltre il gesso, che ha smesso di cantare. Non è finita la canzone. L’ha smessa.', 'And I will tell you something I have been hearing for three nights. Somebody, past the chalk, has stopped singing. The song did not end. She stopped it.'],
    ['n', 'Tecla smette di piegare la mappa.', 'Tecla stops folding the map.'],
    { c: [
      { it: '«Venga con noi.»', en: '“Come with us.”', bond: 'ilario-bastiano', beats: [
        ['bastiano', 'Pensavo non me lo chiedesse più. Ho la valigia pronta dal ’31.', 'I thought you would never ask. My bag has been packed since ’31.'],
      ] },
      { it: '«Che cosa sente, di preciso?»', en: '“What exactly do you hear?”', bond: 'tecla-bastiano', beats: [
        ['bastiano', 'Un fiato. Come quando una donna sta per riprendere una nota e invece si porta la mano alla bocca.', 'A breath. Like a woman about to take up a note again, who puts her hand to her mouth instead.'],
        ['tecla', 'Una donna.', 'A woman.'],
        ['bastiano', 'Vengo con voi. Da qui sento male.', 'I am coming. I cannot hear well from here.'],
      ] },
    ] },
    ['n', 'Prima di scendere, Bastiano tocca la campana col palmo e la tiene ferma, finché smette di vibrare.', 'Before going down, Bastiano lays his palm on the bell and holds it until it stops humming.'],
  ],

  campanile: [
    ['n', 'Ai piedi del campanile, la laguna si è riempita di fumo.', 'At the foot of the tower the lagoon has filled with smoke.'],
    ['bastiano', 'Le lanterne spente. Vengono quando suono. Poveracce: sperano che qualcuno le accenda.', 'The dead lanterns. They come when I ring. Poor things: they hope somebody will light them.'],
    ['bastiano', 'Fanno finta di colpire e colpiscono dopo. Come i debitori al contrario.', 'They pretend to strike and strike later. Like debtors, backwards.'],
  ],

  campo1: [
    ['n', 'Un isolotto, una lanterna grande piantata nella sabbia, due tende. La prima notte fuori dalle mura.', 'An islet, one great lantern planted in the sand, two tents. The first night beyond the walls.'],
    ['n', 'All’orizzonte Velaria è una riga di punti. Alcuni, verdi, si spengono uno alla volta.', 'On the horizon Velaria is a line of dots. Some of them, green, go out one at a time.'],
  ],

  secche: [
    ['n', 'Le Secche dei Salici. L’acqua è bassa un palmo e chiara come se non ci fosse.', 'The Willow Shallows. The water is a hand deep and so clear it seems absent.'],
    ['tecla', 'Da qui la barca si spinge a piedi.', 'From here we push the boat on foot.'],
    ['nora', 'I salici sono ancora verdissimi.', 'The willows are still so green.'],
    ['bastiano', 'Perché qui si è concentrato quello che resta. E quello che resta ha fame.', 'Because what is left has gathered here. And what is left is hungry.'],
  ],

  statua: [
    ['n', 'In mezzo all’acqua, un uomo di sale con le braccia alzate. Nella mano destra, una bussola vera, di ottone.', 'In the middle of the water, a man of salt with his arms raised. In his right hand, a real brass compass.'],
    ['n', 'Tecla si ferma. Poi cammina più in fretta di tutti, con l’acqua che le schizza sulle mappe.', 'Tecla stops. Then she walks faster than all of them, water splashing her maps.'],
    ['tecla', 'Elio.', 'Elio.'],
    ['ilario', 'Lo conosceva.', 'You knew him.'],
    ['tecla', 'Era mio fratello. Partì con la sesta spedizione. Disegnava le coste meglio di me e non lo sapeva.', 'He was my brother. He left with the sixth expedition. He drew coastlines better than I do and never knew it.'],
    ['n', 'Sotto la bussola, incisa nel sale con un’unghia: TE. NON È LONTANO.', 'Under the compass, scratched into the salt with a fingernail: TE. IT IS NOT FAR.'],
    ['n', 'Non si capisce se è l’inizio del suo nome o se si rivolge a lei.', 'It is impossible to say whether it is the start of her name or something said to her.'],
    { c: [
      { it: 'Stare con lei in silenzio.', en: 'Stand with her in silence.', bond: 'ilario-tecla', beats: [
        ['n', 'Rimangono con l’acqua alle caviglie finché il sole si sposta di un dito. Tecla non piange. Misura: distanza dalla riva, direzione dello sguardo.', 'They stay, ankle deep, until the sun has moved a finger. Tecla does not cry. She measures: distance from shore, direction of his gaze.'],
        ['tecla', 'Guardava a nord-est. Grazie. Andiamo a nord-est.', 'He was looking north-east. Thank you. We go north-east.'],
      ] },
      { it: '«Mi parli di lui.»', en: '“Tell me about him.”', bond: 'tecla-nora', beats: [
        ['tecla', 'Metteva i nomi agli scogli. Nomi di persone che conosceva, i più antipatici agli scogli più brutti.', 'He named the rocks. After people he knew; the dullest people got the ugliest rocks.'],
        ['nora', 'E a lei?', 'And you?'],
        ['tecla', 'Un’isola. Piccola. Con una sorgente.', 'An island. A small one. With a spring.'],
      ] },
    ] },
    ['n', 'Tecla non prende la bussola. Poi torna indietro e la prende.', 'Tecla does not take the compass. Then she goes back and takes it.'],
  ],

  airone: [
    ['n', 'Un airone alto come una casa sta fermo su una zampa sola. È di vetro verde, e dentro il vetro passano le nuvole.', 'A heron as tall as a house stands on one leg. It is of green glass, and clouds pass inside it.'],
    ['ilario', 'Aspettate.', 'Wait.'],
    ['nora', 'Ila?', 'Ila?'],
    ['ilario', 'Livia lo guardava dalla finestra, ogni mattina, mentre dava l’acqua ai gerani. Diceva che era l’unico in città a non avere fretta.', 'Livia watched it from the window every morning while she watered the geraniums. She said it was the only one in town in no hurry.'],
    ['n', 'Livia Sardi è diventata sale tre anni fa, a quella finestra, con la brocca inclinata. Ilario non ha mai asciugato la macchia sul davanzale.', 'Livia Sardi turned to salt three years ago, at that window, the jug still tilted. Ilario has never wiped the stain off the sill.'],
    ['tecla', 'Non è più quell’airone.', 'It is not that heron any more.'],
    ['ilario', 'Lo so. È quello che ne è rimasto. È proprio questo il guaio.', 'I know. It is what is left of it. That is exactly the trouble.'],
    ['n', 'L’airone abbassa il collo.', 'The heron lowers its neck.'],
  ],

  campo2: [
    ['n', 'La seconda notte nessuno monta le tende. Si dorme in barca, a turno, con la lanterna in mezzo.', 'The second night nobody pitches the tents. They sleep in the boat by turns, the lantern between them.'],
    ['n', 'Nel buio, verso nord-est, qualcosa di enorme muove le corna e fa tintinnare tutto il canneto.', 'In the dark, to the north-east, something enormous moves its antlers and the whole reed bed chimes.'],
  ],

  cervo: [
    ['n', 'Non è un animale. È il posto in cui è andato a finire tutto il verde che mancava: i prati, le persiane, le bottiglie, gli occhi di qualcuno.', 'It is not an animal. It is where all the missing green has gone: meadows, shutters, bottles, somebody’s eyes.'],
    ['n', 'Ha preso la forma di un cervo, perché un cervo, da bambini, è la cosa più verde che non si è mai vista.', 'It has taken the shape of a stag, because a stag is the greenest thing a child has never seen.'],
    ['bastiano', 'Canta. Sentite? Canta male, perché ha paura.', 'It is singing. Hear it? It sings badly, because it is afraid.'],
    ['nora', 'Paura di noi?', 'Afraid of us?'],
    ['bastiano', 'Di stasera.', 'Of tonight.'],
    ['ilario', 'Non possiamo passare di fianco?', 'Can we not go round?'],
    ['tecla', 'Il canale è largo quanto lui.', 'The channel is exactly as wide as it is.'],
  ],

  tramonto: [
    ['n', 'Il Cervo si inginocchia nell’acqua. Non si rompe: si stende, come per dormire.', 'The Stag kneels in the water. It does not shatter: it lies down, as if to sleep.'],
    ['n', 'Il sole tocca la laguna.', 'The sun touches the lagoon.'],
    ['nora', 'I salici.', 'The willows.'],
    ['n', 'Succede senza rumore. Prima i più lontani, poi le canne, poi l’erba sul guscio dei granchi. Il verde non si oscura: se ne va.', 'It happens without a sound. The farthest first, then the reeds, then the grass on the crabs’ shells. The green does not darken: it leaves.'],
    ['n', 'Nora guarda le proprie mani. Ilario guarda Nora.', 'Nora looks at her own hands. Ilario looks at Nora.'],
    ['ilario', 'Tutta intera?', 'All of you there?'],
    ['nora', 'Tutta. Tu?', 'All of me. You?'],
    ['ilario', 'I gerani avevano le foglie. Non mi ricordo più com’erano.', 'The geraniums had leaves. I cannot remember what they looked like.'],
    ['n', 'Tecla scrive la parola «verde» sul diario. Poi la guarda a lungo, come una parola straniera.', 'Tecla writes the word “green” in her journal. Then she gazes at it, as at a foreign word.'],
    ['n', 'Dove il Cervo si è disteso c’è una figura di sale: una ragazza accovacciata, abbracciata a niente.', 'Where the Stag lay down there is a figure of salt: a girl crouching, her arms around nothing.'],
    ['n', 'Ombra le va incontro scodinzolando. Alle statue Ombra non ha mai scodinzolato.', 'Ombra goes to her, wagging his tail. Ombra has never wagged his tail at a statue.'],
    ['n', 'La ragazza di sale solleva la testa.', 'The girl of salt lifts her head.'],
    ['vela', 'Scusate.', 'Excuse me.'],
    ['vela', 'Che colore ero?', 'What colour was I?'],
  ],
};

/** Camp talks: at each camp the player has time for two of them. */
export const TALKS = {
  campo1: [
    { id: 'c1-ila-nora', pair: 'ilario-nora', who: ['ilario', 'nora'], title: { it: 'Il cappello', en: 'The hat' }, beats: [
      ['nora', 'Mettilo. Lo hai sempre messo, per le cose importanti.', 'Wear it. You always did, for important things.'],
      ['ilario', 'L’ultima volta è stata la tua adozione.', 'The last time was your adoption.'],
      ['nora', 'E il funerale di Livia.', 'And Livia’s funeral.'],
      ['ilario', 'Non era un funerale. Non si fanno funerali alle statue.', 'It was not a funeral. You do not bury statues.'],
      ['nora', 'Tu ci sei andato col cappello.', 'You went in your hat.'],
      { c: [
        { it: '«Avevo paura che prendesse freddo.»', en: '“I was afraid she would be cold.”', bond: 'ilario-nora', beats: [
          ['nora', 'Lo so. Le mettevi lo scialle. Ti ho visto.', 'I know. You put the shawl on her. I saw you.'],
          ['n', 'Nora gli calca il cappello sulla testa, storto, e non glielo raddrizza.', 'Nora jams the hat on his head, crooked, and leaves it so.'],
        ] },
        { it: '«Dormi. Domani si rema.»', en: '“Sleep. We row tomorrow.”', beats: [
          ['nora', 'Prima o poi dovrai finire una frase su di lei.', 'One day you will have to finish a sentence about her.'],
        ] },
      ] },
    ] },
    { id: 'c1-tec-bas', pair: 'tecla-bastiano', who: ['tecla', 'bastiano'], title: { it: 'Mappe e rintocchi', en: 'Maps and bells' }, beats: [
      ['bastiano', 'Cosa segna, quella crocetta rossa?', 'What does that little red cross mark?'],
      ['tecla', 'Dove mi aspetto di non farcela più.', 'Where I expect I will not be able to go on.'],
      ['bastiano', 'Come?', 'What?'],
      ['tecla', 'Ho un colore solo. Ogni sera mi guardo il fazzoletto. Quando se ne va il rosso, vado io.', 'I have one colour left. Each evening I look at my kerchief. When red goes, I go.'],
      { c: [
        { it: '«Allora la crocetta la spostiamo.»', en: '“Then we move the cross.”', bond: 'tecla-bastiano', beats: [
          ['tecla', 'Le coste non si spostano per far piacere.', 'Coasts do not move to oblige anyone.'],
          ['bastiano', 'Le campane sì. Le sposta chi le suona.', 'Bells do. The ringer moves them.'],
        ] },
        { it: '«Che suono ha, il suo rosso?»', en: '“What does your red sound like?”', bond: 'tecla-bastiano', beats: [
          ['bastiano', 'Basso. Testardo. Una campana piccola che non si stanca.', 'Low. Stubborn. A small bell that will not tire.'],
          ['n', 'Tecla richiude la mappa senza cancellare la crocetta. Ci mette accanto un punto di domanda.', 'Tecla folds the map without rubbing out the cross. Beside it she draws a question mark.'],
        ] },
      ] },
    ] },
    { id: 'c1-ila-tec', pair: 'ilario-tecla', who: ['ilario', 'tecla'], title: { it: 'Il primo turno', en: 'The first watch' }, beats: [
      ['tecla', 'Perché parte, lei? La verità.', 'Why are you going? The truth.'],
      ['ilario', 'Per accendere di nuovo le lanterne verdi.', 'To light the green lanterns again.'],
      ['tecla', 'La seconda verità.', 'The second truth.'],
      ['ilario', 'Perché se i colori tornano, forse torna chi li ha persi.', 'Because if the colours come back, maybe those who lost them do too.'],
      { c: [
        { it: '«E se non tornano?»', en: '“And if they do not?”', bond: 'ilario-tecla', beats: [
          ['ilario', 'Allora avrò portato mia figlia a morire per una finestra.', 'Then I will have taken my daughter to die for a window.'],
          ['tecla', 'È venuta da sola. Gliene lasci il merito.', 'She came by herself. Give her the credit.'],
        ] },
        { it: '«È una buona ragione.»', en: '“That is a good reason.”', beats: [
          ['tecla', 'È la ragione di tutte le spedizioni. Per questo le disegno e non ci credo.', 'It is every expedition’s reason. That is why I draw them and do not believe them.'],
        ] },
      ] },
    ] },
  ],
  campo2: [
    { id: 'c2-nora-bas', pair: 'nora-bastiano', who: ['nora', 'bastiano'], title: { it: 'Lezione di campana', en: 'A bell lesson' }, beats: [
      ['bastiano', 'Chiudi gli occhi. Di che colore è l’acqua?', 'Shut your eyes. What colour is the water?'],
      ['nora', 'Non lo so, ho gli occhi chiusi.', 'I do not know, my eyes are shut.'],
      ['bastiano', 'Brava. Adesso ascoltala.', 'Good. Now listen to it.'],
      ['n', 'Per un po’ si sente solo il legno della barca.', 'For a while there is only the creak of the boat.'],
      ['nora', 'Verde scuro. Quasi finito.', 'Dark green. Nearly gone.'],
      { c: [
        { it: '«Chi te l’ha insegnato?»', en: '“Who taught you that?”', bond: 'nora-bastiano', beats: [
          ['bastiano', 'Nessuno. Mia moglie faceva la tintora. Quando ho perso l’udito, mi diceva i colori all’orecchio.', 'No one. My wife was a dyer. When my hearing went, she told me colours in my ear.'],
          ['bastiano', 'Adesso li dico io a lei.', 'Now I tell them to her.'],
        ] },
        { it: '«Ancora.»', en: '“Again.”', bond: 'nora-bastiano', beats: [
          ['bastiano', 'Domani. Stasera hai già sentito abbastanza.', 'Tomorrow. You have heard enough for one night.'],
        ] },
      ] },
    ] },
    { id: 'c2-ila-bas', pair: 'ilario-bastiano', who: ['ilario', 'bastiano'], title: { it: 'Due vecchi', en: 'Two old men' }, beats: [
      ['bastiano', 'Se resto indietro, non voltatevi.', 'If I fall behind, do not turn round.'],
      ['ilario', 'Non dica sciocchezze.', 'Do not talk rubbish.'],
      ['bastiano', 'Come? Ah, sciocchezze. Quelle le dico benissimo.', 'What? Ah, rubbish. I talk that very well.'],
      { c: [
        { it: '«Mi volterò.»', en: '“I will turn round.”', bond: 'ilario-bastiano', beats: [
          ['bastiano', 'Lo so. È il suo difetto. Livia lo diceva a mia moglie.', 'I know. That is your weakness. Livia told my wife.'],
        ] },
        { it: '«Va bene.»', en: '“All right.”', beats: [
          ['bastiano', 'Bugiardo. La ragazza ha ragione.', 'Liar. The girl is right about you.'],
        ] },
      ] },
    ] },
    { id: 'c2-tec-nora', pair: 'tecla-nora', who: ['tecla', 'nora'], title: { it: 'La scala', en: 'The scale' }, beats: [
      ['tecla', 'Un dito sulla carta è una giornata di remi. Quanto manca?', 'A finger on the map is a day’s rowing. How far is left?'],
      ['nora', 'Trentasette dita.', 'Thirty-seven fingers.'],
      ['tecla', 'Le dita di chi?', 'Whose fingers?'],
      ['nora', 'Le mie.', 'Mine.'],
      ['tecla', 'Allora sono quarantadue. Ha le dita piccole. Rifaccia i conti.', 'Then forty-two. You have small fingers. Count again.'],
      { c: [
        { it: '«Perché me lo insegna?»', en: '“Why are you teaching me?”', bond: 'tecla-nora', beats: [
          ['tecla', 'Perché qualcuno dovrà saper tornare.', 'Because someone will need to know the way back.'],
        ] },
        { it: 'Rifare i conti.', en: 'Count again.', bond: 'tecla-nora', beats: [
          ['n', 'Al terzo tentativo i conti tornano. Tecla non dice brava. Le regala la matita rossa.', 'On the third try it comes out. Tecla does not say well done. She gives her the red pencil.'],
        ] },
      ] },
    ] },
  ],
};

/** Pages of Tecla’s journal. */
export const DIARY = {
  d1: { title: { it: 'Primo giorno', en: 'First day' }, it: 'Partiti alle cinque. Quattro persone, un cane, un clandestino che non è più clandestino. Il fazzoletto è rosso. Lo annoto ogni mattina, come la marea.', en: 'Left at five. Four people, one dog, one stowaway who is a stowaway no more. The kerchief is red. I note it every morning, like the tide.' },
  d2: { title: { it: 'Primo campo', en: 'First camp' }, it: 'Il vecchio sente i colori. Non ci credo. Gli ho chiesto di che colore fosse la mia voce e ha detto: «Di una che non la usa abbastanza». Non è un colore.', en: 'The old man hears colours. I do not believe it. I asked what colour my voice was and he said: “That of one who does not use it enough.” That is not a colour.' },
  d3: { title: { it: 'Secche', en: 'Shallows' }, it: 'Ilario parla con l’airone anche dopo. Non c’è più niente a cui parlare. Ha finito la frase lo stesso, tutta, fino in fondo.', en: 'Ilario was still talking to the heron afterwards. There is nothing left to talk to. He finished the sentence anyway, all of it, to the end.' },
  d4: { title: { it: 'La sera del verde', en: 'The evening of green' }, it: 'Il verde è finito alle diciotto e ventidue. Per memoria: era il colore delle persiane di nostra madre, della bussola di Elio quando prendeva l’umido, di. Non mi viene il terzo esempio. Era il colore di.', en: 'Green ended at eighteen twenty-two. For the record: it was the colour of our mother’s shutters, of Elio’s compass when the damp got in, of. I cannot find the third example. It was the colour of.' },
};
