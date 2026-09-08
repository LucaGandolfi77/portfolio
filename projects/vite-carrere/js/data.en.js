"use strict";

var DATA_EN = (function () {

  var CHAPTERS = [
    {
      id: "kotelnitch",
      title: "The Train to Kotelnitch",
      book: "Life: A Novel",
      year: 2007,
      subtitle: "The buried origins",
      color: "#8b5e3c",
      narrative: [
        "Paris, 2001. Emmanuel Carrère boards a night train in Russia, heading toward a forgotten town called Kotelnitch. He sleeps in a berth, makes love to his wife, watches the landscapes pass in the darkness.",
        "But the real journey is not geographic. It is into the past. Emmanuel's mother, Hélène Carrère d'Encausse, is one of France's greatest historians, perpetual secretary of the Académie française. She spent her life studying the Russian Empire. But one thing she never told: her own origins.",
        "Emmanuel's grandfather was a Georgian prince. In Paris in the twenties he drove a taxi, and on his taxi he read philosophy. When people asked if he was free, he said no, because he had to finish the chapter.",
        "In September 1944, arrested by men with machine guns, the grandfather got into a Citroën and was never seen again. The family erased everything. The Russian surname was francized. The origins were buried under decades of silence.",
        "Emmanuel, as an adult, goes to search for what was hidden. He walks among the ferns of Kotelnitch, in the clearing flooded with light. He picks up a fern, places it in the casket next to the photo of his wife at twenty. I leave it here."
      ],
      quote: {
        text: "My grandfather was a true Russian intellectual, who felt superbly above daily realities. For him, reading a book was like arguing with the author. He approved of him or insulted him, filling the margins with feverish annotations.",
        source: "Life: A Novel",
        page: "p. 41"
      },
      minigame: {
        type: "puzzle",
        title: "The torn photo",
        description: "Reassemble the family photo: tap two tiles to swap them.",
        rows: 3,
        cols: 3
      }
    },
    {
      id: "baffi",
      title: "The Moustache",
      book: "The Moustache",
      year: 1986,
      subtitle: "The dissolving identity",
      color: "#5c6b7a",
      narrative: [
        "A man shaves off his moustache. A simple thing, almost trivial. But when he gets home, his wife says something that shocks him: you never had one.",
        "It's not a joke. It's not a misunderstanding. Agnès is sincere. The moustache never existed. And yet he remembers perfectly having had it. He saw it in the mirror every day for years.",
        "From that moment, reality begins to crumble. Agnès is not the only one: nobody remembers his moustache. The barber denies it. His mother denies it. The photographs never show it.",
        "The man is prisoner of a truth only he knows — or of a madness only he ignores. The difference between the two is as thin as a razor blade.",
        "Carrère wrote this novel at twenty-eight, and put into it the deepest fear of every writer: the possibility that one's perception of the world is an illusion."
      ],
      quote: {
        text: "\"What would you think if I shaved off my moustache?\" Agnès, who was flipping through a magazine on the sofa, gave a light laugh, then replied: \"That would be a good idea.\"",
        source: "The Moustache",
        page: "p. 11"
      },
      minigame: {
        type: "spotDiff",
        title: "What changed?",
        description: "Observe the scene. A detail has disappeared. Find it.",
        rounds: 5
      }
    },
    {
      id: "dick",
      title: "I Am Alive, You Are Dead",
      book: "I Am Alive, You Are Dead",
      year: 1993,
      subtitle: "Reality and fiction",
      color: "#4a3f6b",
      narrative: [
        "In 1993, Emmanuel Carrère publishes a biography of Philip K. Dick, the paranoid and brilliant science fiction writer who believed he was being followed by the FBI and that his novels were documentaries.",
        "For a year, Carrère lived in Dick's universe: his visions, his obsessions, his certainty of being a man-computer in a world controlled by invisible forces. He read everything, studied everything, breathed every page.",
        "But in the middle of that work, something strange happens: Dick's life and Carrère's begin to overlap. Both write about hidden truths. Both try to understand what is real.",
        "The phrase that opens the book is a warning: \"I am alive, you are dead.\" It is what Dick believed he was telling his readers, but it could be the voice of every writer who ventures into the dangerous territories of truth.",
        "Carrère said of this book that it is the door through which he entered the way of writing that would make him famous: the gray zone between fiction and reality."
      ],
      quote: {
        text: "Like him, both I and Philip Dick adhered to a faith or had a mystical crisis. The mystery is that the starting point is this: to witness a faith and write about it.",
        source: "The Kingdom (Repubblica interview)",
        page: "March 16, 2015"
      },
      minigame: {
        type: "swipe",
        title: "Reality or fiction?",
        description: "Swipe through the cards: right if it's true, left if it's made up.",
        cards: [
          { text: "Carrère lived with the Romand family on the day of the murder", real: false },
          { text: "Philip K. Dick believed he was being monitored by the FBI", real: true },
          { text: "Carrère finished the book on Dick the day before reading about the Romand case", real: true },
          { text: "Carrère's grandfather was a doctor in Russia", real: false },
          { text: "Carrère's mother was secretary of the Académie française", real: true },
          { text: "Dick wrote A Scanner Darkly inspired by Carrère", real: false },
          { text: "Carrère wrote The Moustache inspired by Dick", real: false },
          { text: "Philip K. Dick died in 1982", real: true }
        ]
      }
    },
    {
      id: "avversario",
      title: "The Adversary",
      book: "The Adversary",
      year: 2000,
      subtitle: "The lie and compassion",
      color: "#6b3a3a",
      narrative: [
        "On the morning of January 9, 1993, Jean-Claude Romand kills his wife, his children, his parents, then tries to kill himself. The investigation reveals that he was never a doctor. He was nothing. He had been lying for eighteen years, and that lie covered nothing.",
        "Carrère reads the news on Wednesday, in Libération. The Saturday before he was at a meeting at his son's kindergarten with his son Gabriel, five years old — the same age as Antoine Romand, the son that Romand killed before lunch at his in-laws'.",
        "For years, Carrère is obsessed with this story. He goes to Process, in Switzerland, where Romand lived. He sits in court. He writes him a letter. Romand replies.",
        "In the letter, Carrère writes: \"I wish to make you understand that what drives me toward you is not unhealthy curiosity or the taste for the sensational. In my eyes, what you did is not the act of a common criminal, nor of a madman, but of a man pushed to extremes by forces he cannot control.\"",
        "And then the final phrase: \"I thought that writing this story could only be a crime or a prayer.\" Because telling such a terrible life is an act of compassion — or of violence? Carrère chooses compassion."
      ],
      quote: {
        text: "I thought that writing this story could only be a crime or a prayer.",
        source: "The Adversary",
        page: "p. 168"
      },
      minigame: {
        type: "tower",
        title: "The tower of lies",
        description: "Remove the lies in the right order. Each lie removed reveals a fragment of truth.",
        lies: [
          "I am a doctor at the WHO",
          "I study at the Lyon medical school",
          "My colleagues respect me",
          "I have a normal life",
          "My family photos are everyone's photos",
          "It's not my fault",
          "He was nothing else"
        ]
      }
    },
    {
      id: "regno",
      title: "The Kingdom",
      book: "The Kingdom",
      year: 2014,
      subtitle: "Faith as narrative",
      color: "#5c7a5c",
      narrative: [
        "\"At a certain period of my life I was a Christian.\" So Carrère opens The Kingdom. It is not a declaration of faith. It is a declaration of curiosity.",
        "For years, Carrère studied the origins of Christianity. Not to convert anyone. To understand how a small Jewish sect became the world's greatest religion.",
        "The answer, according to Carrère, is one: literature. The Gospels are not legal documents. They are stories. Luke, the Macedonian doctor, wrote not doctrine but narrative. He transformed an experience of faith into an immortal tale.",
        "And then there is Emmanuel's mother. In the Repubblica interview, Carrère said: \"My mother knew that this dimension existed. This inner kingdom is the only truly desirable one, the treasure for which the Gospel advises giving up all riches.\"",
        "The Kingdom is not a book about the Church. It is a book about the power of stories: how we can believe, or not believe, and yet be transformed by what we read."
      ],
      quote: {
        text: "Faith is a mystery of the person, religion is a collective narrative.",
        source: "Repubblica interview",
        page: "March 16, 2015"
      },
      minigame: {
        type: "fragments",
        title: "The fragments of the Gospel",
        description: "Drag the fragments in the right order to reconstruct Luke's opening.",
        fragments: [
          "Since many have undertaken to compile",
          "a narrative of the events",
          "that have been fulfilled among us,",
          "just as they were handed on to us",
          "by those who were eyewitnesses",
          "and ministers of the word,",
          "I too have decided, after investigating",
          "everything carefully",
          "for you, most excellent Theophilus,",
          "to write an orderly account",
          "so that you may know the certainty",
          "of the things you have been taught."
        ]
      }
    },
    {
      id: "vite",
      title: "Lives That Are Not Mine",
      book: "Lives That Are Not Mine",
      year: 2009,
      subtitle: "The emotional heart",
      color: "#3a5c6b",
      narrative: [
        "The night before the wave, Emmanuel and Hélène talked about separating. It wasn't complicated: they didn't live under the same roof, they had no children in common, they could even imagine staying friends. But it was sad.",
        "They were in Sri Lanka, on vacation. In the days before, Emmanuel had written in his notebook: \"She is precious to me. So precious. I would like her to be old one day, her flesh old and flabby, and to continue loving her.\"",
        "On December 26, 2004, the wave arrives. Emmanuel and Hélène survive. Their friends Jérôme and Delphine lose Juliette, their four-year-old daughter.",
        "And then there is Étienne. Étienne was Hélène's sister. She was thirty-three, a judge, fighting a case against human trafficking. In the same period, she was diagnosed with a tumor. She died a few months after the wave.",
        "Carrère tells these lives that are not his with a slowness that brings tears. He does not judge, he does not explain. He observes. And in observing, he loves."
      ],
      quote: {
        text: "She is precious to me. So precious. I would like her to be old one day, her flesh old and flabby, and to continue loving her.",
        source: "Lives That Are Not Mine",
        page: "p. 12"
      },
      minigame: {
        type: "gentle",
        title: "The Small Things",
        description: "Lights fall slowly. Touch them to hold them for a moment. There's nothing to win. Only to remember.",
        roundDuration: 30
      }
    },
    {
      id: "yoga",
      title: "Yoga",
      book: "Yoga",
      year: 2020,
      subtitle: "The collapse and the return",
      color: "#6b5c3a",
      narrative: [
        "After the end of a love story, Emmanuel Carrère collapses. It is not a normal breakdown: it is a total collapse, medical, chemical. The brain stops working as it should.",
        "He is hospitalized at the Sainte-Anne hospital in Paris. He is diagnosed with bipolar disorder. For months, he lives in a white room. He undergoes electroshock. He learns to breathe.",
        "In the pages of Yoga, Carrère tells of meditation: not as escape, but as encounter. Not as miraculous cure, but as practice that keeps you anchored when everything else collapses.",
        "He writes of the monotony of breathing: inhaling, holding, exhaling. Four seconds, four seconds, six seconds. The rhythm that holds the pieces together.",
        "And then he tells of the exit: gradual, imperfect, without triumph. How one returns to the world after the world has ended. Not with a great revelation. With one step, then another, then another still."
      ],
      quote: {
        text: "I am changeable, we are all changeable, the world is changeable. The only thing that will never change is the fact that everything changes, continuously.",
        source: "Emmanuel Carrère",
        page: ""
      },
      minigame: {
        type: "breathing",
        title: "The Breath",
        description: "Follow the circle. Inhale 4 seconds. Hold 4. Exhale 6. Five cycles.",
        inhale: 4000,
        hold: 4000,
        exhale: 6000,
        cycles: 5
      }
    },
    {
      id: "v13",
      title: "V13",
      book: "V13",
      year: 2022,
      subtitle: "Listening as civilization",
      color: "#4a3a5c",
      narrative: [
        "On September 8, 2021, Carrère passes through the metal detectors of the Paris Palace of Justice. The trial for the November 13, 2015 attacks begins. In the 149 days that follow, he will listen to everything.",
        "He listens to the victims: the girl from the Bataclan who said \"it's absurd, I'm going to die at a concert of California rednecks that cost me thirty euros and seventy.\" The lawyer who says: \"After all these years we've grown fond of it. It's like a family.\"",
        "He listens to the defendants: Salah Abdeslam who says \"Everything you say about us jihadists is like reading the last page of a book. You should read the book from the beginning.\"",
        "Carrère listens for a year. He does not judge — at least not in the way expected. He wants to understand how a human being can become that. It is not understanding of terrorism. It is understanding of the story that led to that point.",
        "And at the end, the Bataclan survivor Pierre-Sylvain says the most beautiful phrase: \"I expect that what happened to us becomes a collective story.\" Writing, together, what happened. So as not to forget."
      ],
      quote: {
        text: "I expect that what happened to us becomes a collective story.",
        source: "V13 (Pierre-Sylvain, survivor)",
        page: "p. 108"
      },
      minigame: {
        type: "listening",
        title: "The Listening",
        description: "Words appear and fade. Read carefully. At the end, answer: what did you hear?",
        testimonies: [
          { word: "Fears", duration: 2500 },
          { word: "Escape", duration: 2500 },
          { word: "Collapse", duration: 2500 },
          { word: "Survival", duration: 3000 },
          { word: "Trust", duration: 3000 },
          { word: "Listening", duration: 3500 },
          { word: "Story", duration: 3500 },
          { word: "Memory", duration: 4000 }
        ],
        question: "Which word do you remember the most?",
        options: ["Fears", "Trust", "Story", "Memory"]
      }
    }
  ];

  var FINALE = {
    title: "The book is for you",
    lines: [
      "I will continue to live and to fight.",
      "Now the book is over.",
      "Accept it.",
      "It is for you."
    ],
    source: "Life: A Novel — Explicit",
    moral: "Every life — even the most broken, even the most ordinary — deserves to be looked at with love and told.",
    final: "I am a man: nothing that is human is alien to me. Not even you.",
    callToAction: "Now it's your turn: tell yours.",
    shareText: "I walked through the lives of Emmanuel Carrère. Every life deserves to be told. 📖"
  };

  var GENTLE_WORDS = [
    "Breath", "Light", "Gaze", "Smile", "Hand", "Voice",
    "Touch", "Kiss", "Embrace", "Thought", "Dream", "Memory",
    "Love", "Sweet", "Tenderness", "Silence", "Now", "World"
  ];

  var DIFF_ITEMS = [
    { name: "Moustache", element: "moustache", desc: "A man should have had a moustache." },
    { name: "Umbrella", element: "umbrella", desc: "The umbrella has disappeared from the scene." },
    { name: "Vase", element: "vase", desc: "The vase of flowers is no longer on the table." },
    { name: "Photo", element: "photo", desc: "The empty frame has changed." },
    { name: "Clock", element: "clock", desc: "The clock no longer shows the same time." }
  ];

  return {
    CHAPTERS: CHAPTERS,
    FINALE: FINALE,
    GENTLE_WORDS: GENTLE_WORDS,
    DIFF_ITEMS: DIFF_ITEMS
  };

})();
