import type { DialogueNode } from './types';

export const DIALOGUE: Record<string, DialogueNode> = {
  sophie_1: {
    speaker: 'Sophie',
    line: 'Emma? Thank God. You sounded out of breath in your text. Are you inside or already out on the street?',
    lineIt: 'Emma? Meno male. Sembravi senza fiato nel messaggio. Sei in casa o già fuori in strada?',
    choices: [
      { text: '"I have to go out in the dark. Stay on the line with me."', textIt: '"Devo uscire al buio. Resta in linea con me."', next: 'sophie_2', effects: { threat: -7, panic: -16, shieldSec: 46, relationship: 2, flags: ['sophie_comfort'] } },
      { text: '"Did you send me that message about the Shadows?"', textIt: '"Mi hai mandato tu quel messaggio sulle Ombre?"', next: 'sophie_3', effects: { reveal: 'message_sophie' } },
      { text: '"I have to go."', textIt: '"Devo andare."', next: null, effects: { end: true, threat: 2 } }
    ]
  },
  sophie_2: {
    speaker: 'Sophie',
    line: 'I am right here. Walk from one streetlamp to the next, okay? Breathe with me: in... out...',
    lineIt: 'Sono qui. Cammina da un lampione all’altro, okay? Respira con me: inspira... espira...',
    choices: [
      { text: '"I can breathe. Tell me something normal."', textIt: '"Respiro. Raccontami qualcosa di normale."', next: 'sophie_4', effects: { threat: -4, panic: -12, shieldSec: 32, relationship: 1, composure: 4 } },
      { text: '"Something moved behind the parked car."', textIt: '"Qualcosa si è mosso dietro l’auto parcheggiata."', next: null, effects: { end: true, threat: -3, panic: -6, shieldSec: 26, relationship: 1 } },
      { text: '"I saw you at the window earlier."', textIt: '"Ti ho vista alla finestra prima."', next: 'sophie_5', effects: { reveal: 'sophie_outside' } }
    ]
  },
  sophie_3: {
    speaker: 'Sophie',
    line: 'What message? Emma, I am at home making tea. Did someone spoof my number?',
    lineIt: 'Quale messaggio? Emma, sono a casa a preparare il tè. Qualcuno ha clonato il mio numero?',
    choices: [
      { text: '"It said: they only come when you are alone."', textIt: '"Diceva: vengono solo quando sei sola."', next: 'sophie_5', effects: { reveal: 'message_sophie', threat: -3 } },
      { text: '"Forget it. Just keep talking to me."', textIt: '"Lascia stare. Continua a parlarmi."', next: 'sophie_2', effects: { shieldSec: 32, threat: -5, panic: -10, relationship: 1 } },
      { text: '"I have to go."', textIt: '"Devo andare."', next: null, effects: { end: true } }
    ]
  },
  sophie_4: {
    speaker: 'Sophie',
    line: 'Remember last summer? You told me you would never let the dark shrink your life. You are still you.',
    lineIt: 'Ricordi l’estate scorsa? Mi avevi promesso che il buio non avrebbe rimpicciolito la tua vita. Sei ancora tu.',
    choices: [
      { text: '"I can do this. One errand at a time."', textIt: '"Posso farcela. Un passo alla volta."', next: null, effects: { end: true, threat: -8, panic: -14, composure: 6, shieldSec: 40, flags: ['courage'] } },
      { text: '"I do not feel brave tonight."', textIt: '"Stasera non mi sento coraggiosa."', next: null, effects: { end: true, relationship: 2, panic: -10, shieldSec: 28, reveal: 'sophie_fear' } }
    ]
  },
  sophie_5: {
    speaker: 'Sophie',
    line: '...Emma, none of my windows face your street. Who else is standing out there?',
    lineIt: '...Emma, nessuna mia finestra dà sulla tua strada. Chi altro c’è lì fuori?',
    choices: [
      { text: '"You are the only one I trust."', textIt: '"Sei l’unica di cui mi fido."', next: 'sophie_2', effects: { threat: -6, panic: -10, shieldSec: 36, flags: ['sophie_trust'] } },
      { text: '"Maybe my eyes are playing tricks."', textIt: '"Forse è solo la stanchezza."', next: null, effects: { end: true, relationship: 1, shieldSec: 20 } }
    ]
  },

  mom_1: {
    speaker: 'Mom',
    line: 'Sweetheart? It is getting dark. Are you home with the deadbolt locked?',
    lineIt: 'Tesoro? Sta facendo buio. Sei in casa con la mandata chiusa?',
    choices: [
      { text: '"I had to step out, Mom. The shadows feel close."', textIt: '"Sono dovuta uscire, mamma. Le ombre sembrano vicinissime."', next: 'mom_2', effects: { threat: -6, panic: -12, shieldSec: 44, relationship: 2 } },
      { text: '"How are you feeling tonight?"', textIt: '"Come ti senti stasera?"', next: 'mom_3', effects: { relationship: 1 } },
      { text: '"Go back to sleep. I love you."', textIt: '"Torna a dormire. Ti voglio bene."', next: null, effects: { end: true, shieldSec: 14 } }
    ]
  },
  mom_2: {
    speaker: 'Mom',
    line: 'Listen to me. Stay under the streetlamps. Keep your phone charged. Never walk into an unlit doorway.',
    lineIt: 'Ascoltami. Resta sotto i lampioni. Tieni il telefono carico. Non entrare mai in un portone spento.',
    choices: [
      { text: '"Okay. I am staying in the light."', textIt: '"Okay. Resto nella luce."', next: null, effects: { end: true, threat: -5, panic: -12, composure: 4, shieldSec: 38, flags: ['secure_advice'] } },
      { text: '"Why do you sound so sure about the dark?"', textIt: '"Perché sembri così sicura di cosa c’è nel buio?"', next: 'mom_4', effects: { reveal: 'mother_knew' } },
      { text: '"There was a shape outside my window."', textIt: '"C’era una sagoma fuori dalla finestra."', next: 'mom_4', effects: { reveal: 'mother_knew', relationship: -1 } }
    ]
  },
  mom_3: {
    speaker: 'Mom',
    line: 'I could not sleep. I kept thinking about your grandmother’s notebook—the one she kept by the front door.',
    lineIt: 'Non riuscivo a dormire. Pensavo al diario di tua nonna, quello che teneva vicino alla porta.',
    choices: [
      { text: '"What did she write?"', textIt: '"Cosa aveva scritto?"', next: 'mom_4', effects: { reveal: 'grandmother' } },
      { text: '"Just stay with me for a minute."', textIt: '"Resta con me solo un minuto."', next: 'mom_2', effects: { shieldSec: 34, threat: -4, panic: -10 } }
    ]
  },
  mom_4: {
    speaker: 'Mom',
    line: '...She wrote: "When the house is silent, the dark learns your name. Keep a voice in the room." Promise me you will.',
    lineIt: '...Scrisse: "Quando la casa tace, il buio impara il tuo nome. Tieni una voce nella stanza." Promettimi che lo farai.',
    choices: [
      { text: '"I promise."', textIt: '"Te lo prometto."', next: null, effects: { end: true, reveal: 'grandmother', shieldSec: 52, threat: -8, panic: -14, flags: ['mother_confession', 'truth_seeker'] } },
      { text: '"What happened to me in 1998?"', textIt: '"Cosa mi successe nel 1998?"', next: null, effects: { end: true, reveal: 'mother_knew', shieldSec: 30, flags: ['mother_confession'] } }
    ]
  },

  dad_1: {
    speaker: 'Dad',
    line: 'Emma? You are out late. Everything all right?',
    lineIt: 'Emma? È tardi per stare fuori. Tutto bene?',
    choices: [
      { text: '"How do I keep the apartment secure?"', textIt: '"Come metto davvero in sicurezza casa?"', next: 'dad_2', effects: { shieldSec: 30, threat: -4, panic: -8 } },
      { text: '"I saw tracks near the garden fence."', textIt: '"Ho visto tracce vicino alla staccionata."', next: 'dad_3', effects: { reveal: 'garden_tracks' } },
      { text: '"I am fine. Goodnight."', textIt: '"Tutto bene. Buonanotte."', next: null, effects: { end: true } }
    ]
  },
  dad_2: {
    speaker: 'Dad',
    line: 'Deadbolt first, curtains drawn, and never open for a voice you cannot see under the porch light.',
    lineIt: 'Mandata chiusa, tende tirate, e non aprire mai a una voce che non vedi sotto la luce del portico.',
    choices: [
      { text: '"Got it. It helps to have a plan."', textIt: '"Capito. Avere un piano aiuta."', next: null, effects: { end: true, threat: -6, panic: -10, composure: 4, shieldSec: 40, flags: ['secured_knowledge'] } },
      { text: '"What if they are already inside?"', textIt: '"E se fossero già dentro?"', next: 'dad_4', effects: { reveal: 'father_knew' } }
    ]
  },
  dad_3: {
    speaker: 'Dad',
    line: 'Tracks? Stay inside the lighted rooms, Emma. Do not go out back alone.',
    lineIt: 'Tracce? Resta nelle stanze illuminate, Emma. Non uscire sul retro da sola.',
    choices: [
      { text: '"You know what is out there."', textIt: '"Tu sai cosa c’è là fuori."', next: 'dad_4', effects: { reveal: 'father_knew' } },
      { text: '"Okay. Stay on the line a bit."', textIt: '"Okay. Resta un attimo in linea."', next: null, effects: { end: true, shieldSec: 34, threat: -4, panic: -8 } }
    ]
  },
  dad_4: {
    speaker: 'Dad',
    line: 'Your mother made me promise never to bring up 1998. You wandered into the dark when you were nine—we barely found you.',
    lineIt: 'Tua madre mi fece promettere di non parlare più del 1998. A nove anni ti perdesti nel buio—ti ritrovammo per un soffio.',
    choices: [
      { text: '"Tell me everything."', textIt: '"Dimmi tutto."', next: null, effects: { end: true, reveal: 'incident', flags: ['father_confession', 'truth_seeker'], threat: -4, shieldSec: 28 } },
      { text: '"Just stay with me until I reach the next lamp."', textIt: '"Resta con me finché arrivo al prossimo lampione."', next: null, effects: { end: true, shieldSec: 46, panic: -12, relationship: 2 } }
    ]
  },

  daniel_1: {
    speaker: 'Daniel',
    line: 'Emma, I have been calling for an hour. You actually went outside after dark?',
    lineIt: 'Emma, ti chiamo da un’ora. Sei davvero uscita dopo il tramonto?',
    choices: [
      { text: '"Do you believe me now? About the Shadows?"', textIt: '"Mi credi adesso? Sulle Ombre?"', next: 'daniel_2', effects: { reveal: 'daniel_truth', threat: -10, panic: -10, shieldSec: 42, flags: ['daniel_trust'], relationship: 2 } },
      { text: '"Why did your line drop earlier?"', textIt: '"Perché è caduta la linea prima?"', next: 'daniel_3', effects: {} },
      { text: '"I just needed to hear a real voice."', textIt: '"Avevo solo bisogno di una voce vera."', next: null, effects: { end: true, shieldSec: 34, panic: -10, relationship: 1 } }
    ]
  },
  daniel_2: {
    speaker: 'Daniel',
    line: 'I read your grandmother’s journal in the old house. The rule is real, Emma. Darkness feeds on silence.',
    lineIt: 'Ho letto il diario di tua nonna nella vecchia casa. La regola è vera, Emma. Il buio si nutre del silenzio.',
    choices: [
      { text: '"Read it to me."', textIt: '"Leggimelo."', next: 'daniel_4', effects: { reveal: 'journal', flags: ['truth_seeker'] } },
      { text: '"What does it say about 6 AM?"', textIt: '"Cosa dice delle sei del mattino?"', next: 'daniel_4', effects: { reveal: 'journal', flags: ['truth_seeker', 'knows_dawn'] } },
      { text: '"Not now. Just walk with me on the phone."', textIt: '"Non ora. Cammina con me al telefono."', next: null, effects: { end: true, shieldSec: 48, panic: -14, threat: -6 } }
    ]
  },
  daniel_3: {
    speaker: 'Daniel',
    line: 'The signal echoed twice. Emma... is someone breathing next to you?',
    lineIt: 'La linea faceva eco. Emma... c’è qualcuno che respira vicino a te?',
    choices: [
      { text: '"I am trying not to panic."', textIt: '"Cerco di non farmi prendere dal panico."', next: 'daniel_2', effects: { threat: -5, panic: -8, shieldSec: 30 } },
      { text: '"Do not say that."', textIt: '"Non dirlo."', next: null, effects: { end: true, shieldSec: 28, relationship: -1 } }
    ]
  },
  daniel_4: {
    speaker: 'Daniel',
    line: '"When the last voice falls silent, the dark has your name." Dawn is a door—keep walking toward it.',
    lineIt: '"Quando l’ultima voce tace, il buio conosce il tuo nome." L’alba è una porta: continua a camminare.',
    choices: [
      { text: '"Say my name. Remind me I am here."', textIt: '"Dimmi il mio nome. Ricordami che sono qui."', next: null, effects: { end: true, shieldSec: 40, panic: -12, threat: -5 } },
      { text: '"I will hold on until six."', textIt: '"Resisterò fino alle sei."', next: null, effects: { end: true, reveal: 'journal', shieldSec: 55, composure: 6, threat: -10, flags: ['knows_dawn'] } }
    ],
    timeout: 14,
    timeoutChoice: 1
  },

  alex_1: {
    speaker: 'Alex',
    line: 'Slow down, Emma. Your breathing is fast. Where are you right now?',
    lineIt: 'Calma, Emma. Hai il respiro corto. Dove sei adesso?',
    choices: [
      { text: '"How do I stop them in the dark?"', textIt: '"Come li fermo nel buio?"', next: 'alex_2', effects: { reveal: 'detection', shieldSec: 32 } },
      { text: '"What are these Shadows, Alex?"', textIt: '"Cosa sono queste Ombre, Alex?"', next: 'alex_3', effects: { reveal: 'shadow_lore' } },
      { text: '"No time—talk later."', textIt: '"Non ho tempo, dopo."', next: null, effects: { end: true, threat: 2 } }
    ]
  },
  alex_2: {
    speaker: 'Alex',
    line: 'Streetlamp pools hold them back, and a steady flashlight beam freezes most of them—except the Tall One. Do not stare too long without breathing.',
    lineIt: 'I coni dei lampioni le trattengono, e la torcia le blocca quasi tutte—tranne l’Alta. Non smettere di respirare.',
    choices: [
      { text: '"Okay. Light pools and flashlight."', textIt: '"Okay. Coni di luce e torcia."', next: 'alex_4', effects: { flags: ['watcher_knowledge'], shieldSec: 30, threat: -5, composure: 4 } },
      { text: '"I still have to find my flashlight."', textIt: '"Devo ancora trovare la torcia."', next: null, effects: { end: true, shieldSec: 22 } }
    ]
  },
  alex_3: {
    speaker: 'Alex',
    line: 'My grandmother called them the Uninvited—not ghosts, just the shape of every night fear left unanswered.',
    lineIt: 'Mia nonna le chiamava le Non Invitate: non fantasmi, ma la forma di ogni paura notturna senza risposta.',
    choices: [
      { text: '"How do I face them?"', textIt: '"Come le affronto?"', next: 'alex_2', effects: { reveal: 'shadow_lore', shieldSec: 24 } },
      { text: '"Do they know my name?"', textIt: '"Conoscono il mio nome?"', next: 'alex_4', effects: { reveal: 'shadow_names', flags: ['watcher_knowledge'] } }
    ]
  },
  alex_4: {
    speaker: 'Alex',
    line: 'If you hear your name from an unlit alley, do not answer. Step into the nearest lamp and breathe for three seconds.',
    lineIt: 'Se senti il tuo nome da un vicolo buio, non rispondere. Entra sotto il lampione più vicino e respira tre secondi.',
    choices: [
      { text: '"Got it. I will ground myself."', textIt: '"Ricevuto. Mi concentro sul respiro."', next: null, effects: { end: true, shieldSec: 44, panic: -12, threat: -7, flags: ['name_warning'] } },
      { text: '"Too late. I already heard it."', textIt: '"Troppo tardi. L’ho già sentito."', next: null, effects: { end: true, threat: 9, panic: 6, reveal: 'shadow_names' } }
    ]
  },

  jessica_1: {
    speaker: 'Jessica',
    line: 'You should not be walking alone tonight, Emma.',
    lineIt: 'Non dovresti camminare da sola stanotte, Emma.',
    choices: [
      { text: '"What are you hiding about 1998?"', textIt: '"Cosa nascondi sul 1998?"', next: 'jessica_2', effects: { reveal: 'family_secret', relationship: -1 } },
      { text: '"I am scared, Jess. Please stay."', textIt: '"Ho paura, Jess. Resta con me."', next: 'jessica_3', effects: { relationship: 2, panic: -12, shieldSec: 40 } },
      { text: '"Then why did you pick up?"', textIt: '"Allora perché hai risposto?"', next: 'jessica_2', effects: { reveal: 'family_secret' } }
    ]
  },
  jessica_2: {
    speaker: 'Jessica',
    line: 'Mom faced the same thing twenty years ago. She survived by refusing to hide forever behind locked curtains.',
    lineIt: 'Mamma affrontò la stessa cosa vent’anni fa. È sopravvissuta rifiutandosi di nascondersi per sempre dietro le tende.',
    choices: [
      { text: '"Then I will finish tonight."', textIt: '"Allora finirò questa notte."', next: null, effects: { end: true, reveal: 'mother_knew', flags: ['sister_confession', 'truth_seeker', 'courage'], composure: 6, shieldSec: 44, threat: -7 } },
      { text: '"Stay on the line a little longer."', textIt: '"Resta in linea ancora un po’."', next: null, effects: { end: true, flags: ['sister_confession'], shieldSec: 50, panic: -10, threat: -6 } }
    ]
  },
  jessica_3: {
    speaker: 'Jessica',
    line: 'I am here. I should have come over before sunset.',
    lineIt: 'Sono qui. Sarei dovuta venire prima del tramonto.',
    choices: [
      { text: '"Tell me the truth."', textIt: '"Dimmi la verità."', next: 'jessica_2', effects: { reveal: 'family_secret', shieldSec: 26 } },
      { text: '"Just keep talking."', textIt: '"Continua a parlare."', next: null, effects: { end: true, shieldSec: 56, panic: -14, threat: -9, relationship: 2 } }
    ]
  },

  mike_1: {
    speaker: 'Mike',
    line: 'Emma? I see your porch light from across the street. Everything okay?',
    lineIt: 'Emma? Vedo la luce del tuo portico da casa mia. Tutto bene?',
    choices: [
      { text: '"There is something standing by the fence."', textIt: '"C’è qualcosa fermo vicino alla staccionata."', next: 'mike_2', effects: { flags: ['mike_watch'], shieldSec: 62, threat: -12 } },
      { text: '"Can you walk with me to the streetlamp?"', textIt: '"Puoi accompagnarmi fino al lampione?"', next: 'mike_3', effects: {} },
      { text: '"All good, Mike. Goodnight."', textIt: '"Tutto bene, Mike. Buonanotte."', next: null, effects: { end: true, shieldSec: 18 } }
    ]
  },
  mike_2: {
    speaker: 'Mike',
    line: 'Grabbing my floodlight now. Stay in the light and keep your phone handy.',
    lineIt: 'Prendo subito la torcia. Resta nella luce e tieni il telefono pronto.',
    choices: [
      { text: '"Thank you, Mike."', textIt: '"Grazie, Mike."', next: null, effects: { end: true, flags: ['mike_guard'], shieldSec: 58, panic: -10, threat: -10 } },
      { text: '"Wait—do not step into the dark!"', textIt: '"Aspetta—non andare nel buio!"', next: 'mike_4', effects: { flags: ['mike_warned'] } }
    ]
  },
  mike_3: {
    speaker: 'Mike',
    line: 'I tried stepping onto the sidewalk, Emma, but... something is between my car and your gate. It is not blinking.',
    lineIt: 'Ho provato a scendere sul marciapiede, Emma, ma... c’è qualcosa tra la mia auto e il tuo cancello. Non sbatte le palpebre.',
    choices: [
      { text: '"Mike? Answer me!"', textIt: '"Mike? Rispondimi!"', next: null, effects: { end: true, reveal: 'mike_lost', threat: 8, relationship: -1 } },
      { text: '"Get back inside now!"', textIt: '"Torna dentro subito!"', next: null, effects: { end: true, shieldSec: 20, reveal: 'mike_lost' } }
    ]
  },
  mike_4: {
    speaker: 'Mike',
    line: 'It turned its head toward me. Emma... it is wearing a familiar smile.',
    lineIt: 'Ha girato la testa verso di me. Emma... ha un sorriso familiare.',
    choices: [
      { text: '"Lock your door, Mike!"', textIt: '"Chiudi la porta a chiave, Mike!"', next: null, effects: { end: true, threat: 6, reveal: 'mimic_reveal', flags: ['mike_warned'] } },
      { text: '"Thank you for watching out for me."', textIt: '"Grazie per avermi guardato le spalle."', next: null, effects: { end: true, shieldSec: 42, threat: -6, flags: ['mike_warned', 'courage'] } }
    ]
  },

  unknown_1: {
    speaker: 'Unknown',
    line: 'Hello, Emma. You finally stepped outside.',
    lineIt: 'Ciao, Emma. Alla fine sei uscita.',
    choices: [
      { text: '"Who is this?"', textIt: '"Chi sei?"', next: 'unknown_2', effects: {} },
      { text: '"How do I make it to sunrise?"', textIt: '"Come arrivo all’alba?"', next: 'unknown_3', effects: { shieldSec: 54, threat: -15, flags: ['unknown_guidance'] } },
      { text: '"Leave me alone."', textIt: '"Lasciami in pace."', next: 'unknown_4', effects: { threat: 6, panic: 8 } }
    ]
  },
  unknown_2: {
    speaker: 'Unknown',
    line: 'Someone who knows how long a dark street feels when your hands are shaking.',
    lineIt: 'Qualcuno che sa quanto è lunga una strada buia quando ti tremano le mani.',
    choices: [
      { text: '"What do you want?"', textIt: '"Cosa vuoi?"', next: 'unknown_3', effects: { reveal: 'unknown_purpose' } },
      { text: '"I am hanging up."', textIt: '"Riattacco."', next: null, effects: { end: true, threat: 5 } },
      { text: '"How do you know my name?"', textIt: '"Come sai il mio nome?"', next: 'unknown_3', effects: { reveal: 'unknown_knows', threat: 3 } }
    ]
  },
  unknown_3: {
    speaker: 'Unknown',
    line: 'Walk from lamp to lamp. Keep a voice in your ear. And do not trust the silhouette standing in your garden.',
    lineIt: 'Cammina da un lampione all’altro. Tieni una voce nell’orecchio. E non fidarti della sagoma nel tuo giardino.',
    choices: [
      { text: '"What is in my garden?"', textIt: '"Cosa c’è nel mio giardino?"', next: 'unknown_5', effects: { reveal: 'unknown_rule', shieldSec: 40, threat: -8, flags: ['knows_rule'] } },
      { text: '"I will keep talking until six."', textIt: '"Continuerò a parlare fino alle sei."', next: null, effects: { end: true, shieldSec: 60, threat: -14, flags: ['knows_rule'] } },
      { text: '"Who are you?!"', textIt: '"Chi sei?!"', next: null, effects: { end: true, threat: 6 } }
    ],
    timeout: 12,
    timeoutChoice: 2
  },
  unknown_4: {
    speaker: 'Unknown',
    line: 'Then walk in silence. The dark prefers it that way.',
    lineIt: 'Allora cammina nel silenzio. Il buio preferisce così.',
    choices: [
      { text: '"WAIT!"', textIt: '"ASPETTA!"', next: 'unknown_3', effects: { threat: 6 } },
      { text: '"Never call again."', textIt: '"Non chiamare mai più."', next: null, effects: { end: true, threat: 12, flags: ['unknown_angry'], relationship: -2 } }
    ]
  },
  unknown_5: {
    speaker: 'Unknown',
    line: 'Look out of your kitchen window. Then call your sister and ask about 1998.',
    lineIt: 'Guarda fuori dalla finestra della cucina. Poi chiama tua sorella e chiedile del 1998.',
    choices: [
      { text: '"I am looking."', textIt: '"Sto guardando."', next: null, effects: { end: true, reveal: 'garden_mimic', event: 'window', shieldSec: 36, flags: ['truth_seeker'] } },
      { text: '"No. Not tonight."', textIt: '"No. Non stanotte."', next: null, effects: { end: true, shieldSec: 26, threat: -5 } }
    ]
  }
};
