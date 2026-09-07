/* Game: emotion */
window.GameRegistry.register("emotion",
{
      stage: 'sprout',
      title: '\uD83D\uDE0A Emotion Reader',
      desc: 'How are they feeling?',
      emotions: [
        {
          emoji: '\uD83D\uDE0A',
          name: 'Happy',
          scenarios: [
            'They just received good news about something they worked hard for.',
            'Their friend said something really nice about them to others.'
          ]
        },
        {
          emoji: '\uD83D\uDE22',
          name: 'Sad',
          scenarios: [
            'They just said goodbye to someone they won\u2019t see for a long time.',
            'They found out they didn\u2019t make the team they tried out for.'
          ]
        },
        {
          emoji: '\uD83D\uDE21',
          name: 'Angry',
          scenarios: [
            'Someone took their things without asking and broke one.',
            'They were accused of something they didn\u2019t do.'
          ]
        },
        {
          emoji: '\uD83D\uDE28',
          name: 'Scared',
          scenarios: [
            'They hear a strange noise in the dark house at night.',
            'They\u2019re about to walk on stage in front of hundreds of people.'
          ]
        },
        {
          emoji: '\uD83E\uDD14',
          name: 'Confused',
          scenarios: [
            'They read the instructions three times but still don\u2019t understand.',
            'A friend is acting differently toward them and they don\u2019t know why.'
          ]
        },
        {
          emoji: '\uD83D\uDE0D',
          name: 'Loved',
          scenarios: [
            'Their parent left a sweet note in their lunchbox.',
            'A friend surprised them with a handmade birthday card.'
          ]
        },
        {
          emoji: '\uD83D\uDE2B',
          name: 'Tired',
          scenarios: [
            'They stayed up late finishing homework and still have more to do.',
            'They\u2019ve been running around all day and just want to sit down.'
          ]
        },
        {
          emoji: '\uD83E\uDD73',
          name: 'Proud',
          scenarios: [
            'They finally solved a problem they\u2019d been stuck on for days.',
            'Their little sibling showed them something they learned because of their help.'
          ]
        },
        {
          emoji: '\uD83D\uDE10',
          name: 'Bored',
          scenarios: [
            'They\u2019re sitting in a long car ride with nothing to do.',
            'The lesson they\u2019re in has nothing to do with their interests.'
          ]
        },
        {
          emoji: '\uD83E\uDD72',
          name: 'Embarrassed',
          scenarios: [
            'They tripped in front of everyone in the school hallway.',
            'Their parent told a funny baby story to their crush.'
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  6. Integrity Challenge
    // ═══════════════════════════════════════════════════
);
