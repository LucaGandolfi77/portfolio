const STORAGE_KEYS = {
  lastGame: "cedole-catastrofi-last-game-v1",
  bestResults: "cedole-catastrofi-best-results-v1",
  preferences: "cedole-catastrofi-preferences-v1"
};

const GAME_TEXT = {
  title: "Slips & Catastrophes",
  subtitle: "A cooperative chronicle of a quasi-legal biotech agritourism",
  lore: "In the heart of an administratively exhausted Italy, six questionable professionals discover that the only way to avoid collapsing under resurfaced exes, predatory recruiters, and mortgages with a personality is to open together the Biofiscal Agritourism \"The Quantum Milk Quota\". Too bad it requires a flawless dossier, three stamps, a legible certified email, and a collective dignity that's still vaguely intact.",
  objectiveTitle: "Open the Biofiscal Agritourism \"The Quantum Milk Quota\"",
  objectiveBody: "Deliver the Regional Dossier of Approximate Wellbeing by Saturday evening, complete the operational plan, and hold together dignity, career, and mental stability while life tries to turn the group into an unsolicited motivational podcast.",
  rules: [
    {
      title: "1. Assembly of Disaster",
      body: "Choose from 3 to 6 characters. Each enters with 2 action points per round, a personal resource, and a special talent that seems invented by an underpaid intern."
    },
    {
      title: "2. The Round and the Turn",
      body: "Each click on an action spends action points and generates a turn. When the group has run out of useful energy or you've squeezed destiny enough, close the round. At the start of each round, at least one event card always arrives."
    },
    {
      title: "3. Shared Resources",
      body: "Watch over Chaos, Dignity, Career, mental Stability, and mission Progress. You also share Funds, tactical Snacks, and Documents. If one bar collapses, you collapse too."
    },
    {
      title: "4. Side Missions",
      body: "The side dramas expire in a few rounds. If you manage them you get huge bonuses; if you ignore them, the group gets bitch-slapped by cosmic bureaucracy."
    },
    {
      title: "5. Synergies",
      body: "Some character pairs activate combos once per round. Translated: the pharmacist calms the lawyer, the engineer patches the mountain, and the project manager steals time from the continuum."
    },
    {
      title: "6. Victory and Defeat",
      body: "You all win together if you bring Progress to the goal before the round limit. You all lose together if Chaos explodes or an essential bar hits zero. Real life is individualistic enough, this isn't."
    },
    {
      title: "7. Solidary Penance Mode",
      body: "If you activate this mode, the most avoidable mistakes suggest micro-donations of 1 euro to a charity of your choice. The game keeps the moral volume low: maximum 2 pending penances at a time."
    },
    {
      title: "8. One Device, Up to 6 Brains",
      body: "On the same device, play in pass-and-play. Each selected character can correspond to a local player: the device gets passed around, and other players' actions remain locked until their turn arrives."
    }
  ],
  victoryLines: [
    "The Region understood nothing about the project, but approved it out of exhaustion. And that, technically, is a victory.",
    "The agritourism opens between a notary goat and a CRM written on napkins. The group celebrates with hysterical composure.",
    "Dignity was saved with metallic points, but it's still standing. The entire country applauds with bewilderment."
  ],
  defeatLines: [
    "The dossier gets lost in a folder called final_definitive_REAL_3. The group contemplates the void and then a pottery class.",
    "A 7-minute voicemail from the toxic boss crashes the mental Stability. End of session, proceed to the front desk to cry in an orderly fashion.",
    "The ex shows up at the ribbon-cutting with a recruiter and a mortgage. The Chaos signs on your behalf."
  ],
  randomLines: [
    "A qualified pigeon judges your roadmap and nods like a weary auditor.",
    "Someone proposes monetizing everything with a webinar. Nobody stops them in time, but at least the log records it.",
    "The printer produces a blank sheet and an unsolicited opinion about your love life.",
    "The group gets a flash of lucidity and wastes it almost immediately arguing about the dossier's font.",
    "An aunt sees the business plan and calls it \"nice but alarming.\" Surprisingly useful assessment.",
    "For a moment everything seems under control. Then a bank notification arrives with the confidence of someone who knows things."
  ]
};

const BOARD_STAGES = [
  { label: "Prologue Bar", icon: "☕", text: "Where the terrible idea that looks like a mission is born." },
  { label: "Stellar Cadastral Office", icon: "🗂️", text: "The forms change shape when you look at them wrong." },
  { label: "Exes Coworking Space", icon: "💔", text: "Every encounter here is a plot twist comeback." },
  { label: "HR with Smoke Bombs", icon: "🧯", text: "Motivational interviews that smell like a trap." },
  { label: "CV Mountain", icon: "🧗", text: "Steep walls made of self-celebratory soft skills." },
  { label: "The Infinite WhatsApp Group", icon: "📱", text: "189 messages, zero information, one toxic poll." },
  { label: "The Quantum Milk Quota", icon: "🚜", text: "The glorious finale or the collapse with buffet." }
];

const CHARACTERS = [
  {
    id: "ubaldo",
    name: "Ubaldo Fiscozappa",
    title: "Farmer / Accountant of the Certified Harvest",
    description: "Grows courgettes, unloads tractors, and separates emotions into first entries. Can talk about compost and tax deductions in the same breath.",
    specialName: "Courtyard Balance Sheet",
    specialText: "Converts filing cabinets and hay into order: reduces Chaos, boosts Dignity, and pushes the dossier forward.",
    flaw: "If he hears the word bonus, he opens a filing cabinet and loses a Fertile Paper the first time he acts in the round.",
    statLabel: "Fertile Papers",
    statMax: 4,
    statStart: 2,
    role: "Patches bureaucracy and turns documents into real progress.",
    tags: ["bureaucracy", "logistics"],
    quotes: [
      "This courgette is tax-deductible, I can feel it in my knees.",
      "Let's sign in triplicate and then fertilize hope.",
      "A certified email is like basil: neglect it, and it hates you."
    ]
  },
  {
    id: "evarista",
    name: "Evarista Cerottini",
    title: "Pharmacist of Slow-Release Emotional Protocols",
    description: "Dispenses tactical chamomile, esoteric patient information leaflets, and reassurances with dosage instructions. Smiles like an antidote that read too much Jung.",
    specialName: "Emergency Chamomile 500",
    specialText: "Puts the group's nerves back together, lowers Chaos, and gives breath back to the other rumpled professionals.",
    flaw: "Always reads the patient information leaflet to the end: at the start of the round, risks using up a Document through excess scruple.",
    statLabel: "Sedative Stock",
    statMax: 4,
    statStart: 2,
    role: "Keeps mental stability high and prevents the group from turning into a reality show.",
    tags: ["wellbeing", "social"],
    quotes: [
      "Breathe, hydrate, and don't respond to anyone before 10:30.",
      "Your anxiety should be shaken before use, not fed.",
      "If HR hisses, it's just a side effect of modernity."
    ]
  },
  {
    id: "brando",
    name: "Brando Arrampicrispr",
    title: "Biotech Engineer and Vertical Balcony Climber",
    description: "Optimizes enzymes, climbs cornices to reflect, and considers every call a via ferrata of the soul.",
    specialName: "The Impossible CRISPR Ascent",
    specialText: "Lands where nobody asked for anything, recovers margin on the project, and converts panic into operational drive.",
    flaw: "If he stays still too long, he starts explaining free climbing to ficus trees and the group loses a point of personal Stability.",
    statLabel: "Ethical Adrenaline",
    statMax: 4,
    statStart: 2,
    role: "Accelerates progress and smashes bottlenecks with disturbing scientific enthusiasm.",
    tags: ["tech", "climb"],
    quotes: [
      "Every problem has a handhold. Some of them are damp, though.",
      "If needed I'll climb the coworking roof and come back with a solution and an ice cream cone.",
      "The protocol is simple: breathe, grip, and ferocious biotechnology."
    ]
  },
  {
    id: "aldo",
    name: "Aldo Spritzforense",
    title: "Alcoholic Lawyer with Endless Aperitivo Eloquence",
    description: "Knows the rules, sidesteps passive-aggressive tone, and turns every objection into a monologue at a glowing bar.",
    specialName: "The Negroni-of-Truth Closing Argument",
    specialText: "Crushes social or bureaucratic events with poetic legal technicalities, puts career back on its feet, and humiliates drama without violence, just with aggressive syntax.",
    flaw: "When he launches into a closing argument, he forgets the volume knob: his ability wears down the group's mental Stability a bit.",
    statLabel: "Legal Audacity",
    statMax: 4,
    statStart: 2,
    role: "Defends the team from relational disasters, HR, and official embarrassments.",
    tags: ["law", "career"],
    quotes: [
      "I object for style, I insist on principle, I drink after filing.",
      "The problem isn't illegal, it's just poorly told.",
      "If the recruiter lies, I'll cross-examine them with a coaster."
    ]
  },
  {
    id: "miro",
    name: "Miro KPI Lupin",
    title: "Operations Engineer, Thief of Time, Pens, and Opportunities",
    description: "Optimizes processes, steals margin, and knows exactly where budgets disappear. Nobody lends him a pen, he owns forty-three of them.",
    specialName: "Opportunistic Optimization",
    specialText: "Siphons resources from the cosmic void, produces Funds and Documents, but does it with a elegance that makes Dignity suspicious.",
    flaw: "When he sees a well-stocked office, he enters professional magpie mode and loses a Dignity point during his ability.",
    statLabel: "Operational Margin",
    statMax: 4,
    statStart: 2,
    role: "Generates shared resources and speeds up the most improbable side missions.",
    tags: ["logistics", "bureaucracy"],
    quotes: [
      "I don't steal, I reallocate the possible toward the necessary.",
      "This budget didn't disappear. It just changed moral ownership.",
      "True leadership is leaving a meeting with more paperclips than when you entered."
    ]
  },
  {
    id: "teo",
    name: "Teo Kernel Tempesta",
    title: "Mad Software Engineer with Unstable Internal Servers",
    description: "Programs with half-closed eyes, talks to toasters, and considers bugs a form of computational folklore.",
    specialName: "Oracle Patch in the Microwave",
    specialText: "Tinkers with destiny, lowers Chaos, increases Progress, and sometimes even solves things that didn't exist yet.",
    flaw: "When doing routine work, he might accidentally open a lateral dimension: you get extra progress but also a bit of Chaos.",
    statLabel: "Bug-Addled Vision",
    statMax: 4,
    statStart: 2,
    role: "Manipulates events, tech missions, and the entire concept of a sensible plan.",
    tags: ["tech", "mission"],
    quotes: [
      "If it stops blinking, it's probably dead or extremely happy.",
      "I wrote a patch that understands human pain in private beta.",
      "The server is singing, so we're alive. Or being surveilled."
    ]
  }
];

const SYNERGIES = [
  {
    id: "catasto-predittivo",
    pair: ["ubaldo", "miro"],
    title: "Predictive Cadastre",
    description: "When the team hits bureaucracy or logistics, Ubaldo and Miro squeeze Documents out of thin air and push the plan forward.",
    tags: ["bureaucracy", "logistics"],
    effects: { documents: 1, progress: 2 }
  },
  {
    id: "difesa-camomilla",
    pair: ["evarista", "aldo"],
    title: "Chamomile Defense",
    description: "If social or legal dramas enter the scene, pharmacological calm supports the closing argument and saves everyone's nerves.",
    tags: ["social", "law"],
    effects: { stability: 1, dignity: 1 }
  },
  {
    id: "patch-alpina",
    pair: ["brando", "teo"],
    title: "Alpine Patch",
    description: "Biotech and software engineering shake hands on an unstable wall: more Progress and less Chaos.",
    tags: ["tech", "climb"],
    effects: { progress: 3, chaos: -1 }
  },
  {
    id: "fattura-omeopatica",
    pair: ["ubaldo", "evarista"],
    title: "Homeopathic Invoice",
    description: "When the team catches its breath, it also produces order. It's inexplicable but fiscally tonic.",
    tags: ["wellbeing"],
    effects: { stability: 1, documents: 1 }
  },
  {
    id: "compliance-creativa",
    pair: ["aldo", "miro"],
    title: "Creative Compliance",
    description: "Between legal technicalities and KPI pilfering, career becomes breathable again and a surprise Fund pops up.",
    tags: ["career", "bureaucracy"],
    effects: { career: 1, funds: 1 }
  },
  {
    id: "furto-quantistico",
    pair: ["teo", "miro"],
    title: "Quantum Time Theft",
    description: "If the plan advances, these two steal minutes from the continuum and turn them into real progress.",
    tags: ["mission"],
    effects: { progress: 2 }
  }
];

const SIDE_MISSION_TEMPLATES = [
  {
    id: "pec-perduta",
    title: "Recover the Lost Certified Email",
    description: "The password ended up on an aperitivo napkin. You need technology or bureaucracy, preferably both without crying.",
    tags: ["tech", "bureaucracy"],
    target: 3,
    duration: 2,
    reward: { progress: 7, documents: 1, dignity: 1 },
    penalty: { chaos: 2, career: -1 }
  },
  {
    id: "colloquio-escape-room",
    title: "Survive the Escape Room Interview",
    description: "HR wants to know your flaws like it's a product demo. You need social skills, law, or therapeutic nerve.",
    tags: ["social", "law", "career"],
    target: 3,
    duration: 2,
    reward: { career: 2, dignity: 1, progress: 5 },
    penalty: { dignity: -2, chaos: 2 }
  },
  {
    id: "formaggi-sintetici",
    title: "Convince the Council on Synthetic Cheese",
    description: "You need a technically sound and socially digestible speech. The town council is hungry and has primitive opinions.",
    tags: ["tech", "climb", "social"],
    target: 4,
    duration: 3,
    reward: { progress: 8, career: 1, funds: 1 },
    penalty: { chaos: 2, stability: -1 }
  },
  {
    id: "whatsapp-zia",
    title: "Tame the Aunts' WhatsApp Group",
    description: "One hundred and twenty-seven voice notes, six good-morning messages, and a request for tax advice. You need wellbeing, law, or a digitally compatible miracle.",
    tags: ["wellbeing", "social", "tech"],
    target: 3,
    duration: 2,
    reward: { chaos: -1, dignity: 2, snacks: 1 },
    penalty: { stability: -2, chaos: 1 }
  },
  {
    id: "bando-latte",
    title: "Decipher the Quantum Milk Grant",
    description: "Three contradictory attachments, a cursed PDF, and a table with too many asterisks. Perfect for bureaucrats, elegant thieves, and rogue programmers.",
    tags: ["bureaucracy", "logistics", "tech"],
    target: 4,
    duration: 3,
    reward: { progress: 9, documents: 2 },
    penalty: { career: -1, chaos: 2 }
  },
  {
    id: "weekend-motivazionale",
    title: "Escape the Motivational Weekend",
    description: "The programme includes screaming in the woods and barefoot networking. You must sabotage it with elegance and keep the collective psyche intact.",
    tags: ["wellbeing", "career", "law"],
    target: 3,
    duration: 2,
    reward: { stability: 2, dignity: 1, progress: 4 },
    penalty: { stability: -2, dignity: -1 }
  }
];

const EVENT_CARDS = [
  {
    id: "ex-coworking",
    title: "Ex in the Coworking with New Laptop and Overtly Displayed Serenity",
    text: "They greet you with a tranquillity that reeks of therapy podcast. The group stiffens like a printer in court.",
    tags: ["social", "romance"],
    effects: { chaos: 2, dignity: -1, stability: -1 }
  },
  {
    id: "recruiter-03",
    title: "Predatory Recruiter at 03:07",
    text: "They write \"hey gorgeous\" and offer you an exciting position paid in visibility and tears.",
    tags: ["career", "social"],
    effects: { chaos: 2, career: -1 }
  },
  {
    id: "mutuo-cosmico",
    title: "The Mortgage Develops Sentience and Demands Attention",
    text: "The banking app breathes slowly and judges you. Even the balance has a passive-aggressive tone.",
    tags: ["career", "bureaucracy"],
    effects: { chaos: 1, dignity: -1, funds: -1 }
  },
  {
    id: "notifiche-3",
    title: "Notifications at 03:00 in Geometric Formation",
    text: "Who's contacting you? Nobody useful. Who's unsettling you? Everyone simultaneously.",
    tags: ["wellbeing", "tech"],
    effects: { chaos: 1, stability: -2 }
  },
  {
    id: "errore-burocratico",
    title: "Bureaucratic Error with Apocryphal Destiny Seal",
    text: "A form changes its date by itself. A stamp appears diagonally. Reality requests a consultant.",
    tags: ["bureaucracy", "logistics"],
    effects: { chaos: 2, career: -1, documents: -1 }
  },
  {
    id: "collega-passivo",
    title: "Passive-Aggressive Colleague in Toxic Zen Mode",
    text: "They say \"do whatever you think\" with the serenity of a serpent who studied Eastern philosophy.",
    tags: ["career", "social"],
    effects: { chaos: 1, dignity: -1, career: -1 }
  },
  {
    id: "triangolo-gantt",
    title: "Love Triangle on a Gantt Chart",
    text: "Everyone has dates, milestones, and a dramatic opinion about your priorities.",
    tags: ["romance", "career"],
    effects: { chaos: 2, stability: -1, progress: -3 }
  },
  {
    id: "burnout-morbido",
    title: "Devastating Burnout Nicely Packaged",
    text: "You feel productive, but only because you're collapsing with excellent penmanship.",
    tags: ["wellbeing"],
    effects: { chaos: 1, stability: -2, dignity: -1 }
  },
  {
    id: "figuraccia-pubblica",
    title: "Public Humiliation During Improvised Presentation",
    text: "The projector opens a very old meme. Unfortunately, it's your desktop.",
    tags: ["career", "tech"],
    effects: { dignity: -2, chaos: 1 }
  },
  {
    id: "senso-colpa",
    title: "Fine-Mist Guilt Rain",
    text: "Nobody accused you, but your brain organized an internal commission.",
    tags: ["wellbeing", "social"],
    effects: { stability: -1, dignity: -1 }
  },
  {
    id: "weekend-stage",
    title: "Motivational Weekend with Drums and Emotional KPIs",
    text: "A barefoot coach wants to teach you to invoice with your diaphragm. You object, but the diaphragm wavers.",
    tags: ["career", "wellbeing"],
    effects: { chaos: 2, stability: -1, career: -1 }
  },
  {
    id: "tentazione-startup",
    title: "Unrealistic Career Dream Fresh Out of the Oven",
    text: "Someone proposes quitting everything to open a platform for relationship advice to surveyors.",
    tags: ["career", "mission"],
    effects: { chaos: 1, progress: -4, dignity: -1 }
  }
];

const SPECIAL_EVENTS = [
  {
    id: "festival-ex",
    title: "National Festival of Resurfacing Exes",
    text: "All together, in the same neighbourhood, with a shared playlist and full confidence in your weak points.",
    tags: ["social", "romance"],
    effects: { chaos: 3, dignity: -2, stability: -1 }
  },
  {
    id: "audit-cosmico",
    title: "Cosmic Audit of the Emotional Cadastre",
    text: "A metaphysical inspector arrives and asks why you classified anxiety as a client entertainment expense.",
    tags: ["bureaucracy", "law"],
    effects: { chaos: 3, career: -2, documents: -1 }
  },
  {
    id: "gruppo-voce",
    title: "Unmanageable WhatsApp Group with 54 Consecutive Voice Notes",
    text: "Each voice note contains three dramas, a questionable piece of advice, and a good-morning message with a dolphin.",
    tags: ["social", "wellbeing"],
    effects: { chaos: 2, stability: -2, dignity: -1 }
  },
  {
    id: "deadline-catastrofica",
    title: "Catastrophic Deadline with Invisible Attachment",
    text: "The regional portal stops distinguishing between saving and praying.",
    tags: ["tech", "bureaucracy", "mission"],
    effects: { chaos: 2, progress: -6, career: -1 }
  }
];

const DEFAULT_BEST_RESULTS = {
  wins: 0,
  losses: 0,
  bestProgress: 0,
  bestDignity: 0,
  bestCareer: 0,
  longestRun: 0
};

const DEFAULT_PREFERENCES = {
  soundOn: true,
  charityModeOn: false
};

const DONATION_AMOUNT = 1;
const DONATION_PENDING_CAP = 2;
const CHARITY_CAUSES = [
  "a local solidarity canteen",
  "a project distributing essential goods",
  "a listening network and concrete support",
  "an initiative for medicine and emergency social aid",
  "an after-school programme for families in difficulty"
];

const MAX_VALUES = {
  chaos: 18,
  dignity: 12,
  career: 12,
  stability: 12,
  progress: 999,
  funds: 9,
  snacks: 9,
  documents: 9
};
