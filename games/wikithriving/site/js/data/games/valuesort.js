/* Game: valuesort */
window.GameRegistry.register("valuesort",
{
      stage: 'teen',
      title: '\uD83C\uDFAF Values Sort',
      desc: 'Sort what matters into categories',
      categories: [
        { id: 'creativity', name: 'Creativity', emoji: '\uD83C\uDFA8' },
        { id: 'security', name: 'Security', emoji: '\uD83D\uDEE1\uFE0F' },
        { id: 'adventure', name: 'Adventure', emoji: '\uD83C\uDF0D' },
        { id: 'connection', name: 'Connection', emoji: '\uD83D\uDC9A' }
      ],
      statements: [
        { text: 'I want a job that lets me express myself', correct: 'creativity' },
        { text: 'I need to know my bills are paid', correct: 'security' },
        { text: 'I dream of traveling the world', correct: 'adventure' },
        { text: 'Deep friendships matter most to me', correct: 'connection' },
        { text: 'I want to make something original', correct: 'creativity' },
        { text: 'A steady paycheck gives me peace', correct: 'security' },
        { text: 'I want to try things I\'ve never done', correct: 'adventure' },
        { text: 'Being there for people I love is everything', correct: 'connection' },
        { text: 'I want to write, paint, or make music', correct: 'creativity' },
        { text: 'A home of my own is my dream', correct: 'security' },
        { text: 'The unknown excites me more than the familiar', correct: 'adventure' },
        { text: 'Community and belonging are essential', correct: 'connection' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  12. Art Match
    // ═══════════════════════════════════════════════════
);
