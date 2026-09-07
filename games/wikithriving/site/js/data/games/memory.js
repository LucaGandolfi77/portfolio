/* Game: memory */
window.GameRegistry.register("memory",
{
      stage: 'explorer',
      title: '\uD83E\uDDE0 Memory Match',
      desc: 'Match the study concepts',
      pairs: [
        { term: 'Spaced Repetition', match: 'Review material at increasing intervals' },
        { term: 'Active Recall', match: 'Test yourself instead of re-reading' },
        { term: 'Elaboration', match: 'Explain concepts in your own words' },
        { term: 'Interleaving', match: 'Mix different topics in one study session' },
        { term: 'Concrete Examples', match: 'Connect abstract ideas to real things' },
        { term: 'Dual Coding', match: 'Combine words AND visuals when learning' },
        { term: 'Feynman Technique', match: 'Teach it simply to find your gaps' },
        { term: 'Pomodoro', match: '25 min focus, 5 min break, repeat' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  8. Speed Math
    // ═══════════════════════════════════════════════════
);
