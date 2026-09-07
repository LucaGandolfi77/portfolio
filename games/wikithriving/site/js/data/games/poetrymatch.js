/* Game: poetrymatch */
window.GameRegistry.register("poetrymatch",
{
      stage: 'teen',
      title: '\uD83D\uDCDD Poetry Match',
      desc: 'Match lines to their meaning',
      questions: [
        { line: '"I took the one less traveled by,\nAnd that has made all the difference."', options: ['Choosing conformity', 'Making unique choices', 'Avoiding risk', 'Following the crowd'], correct: 1, explanation: 'Robert Frost\'s "The Road Not Taken" celebrates the courage to choose your own path.' },
        { line: '"Do not go gentle into that good night.\nRage, rage against the dying of the light."', options: ['Accept death peacefully', 'Fight against giving up', 'Sleep more', 'Ignore aging'], correct: 1, explanation: 'Dylan Thomas wrote this to his dying father — a plea to keep fighting, to stay alive in spirit.' },
        { line: '"Hope is the thing with feathers\nThat perches in the soul."', options: ['Hope is fragile', 'Hope is a living, bird-like presence', 'Hope flies away', 'Hope is heavy'], correct: 1, explanation: 'Emily Dickinson compares hope to a bird — it sings even in storms and asks for nothing in return.' },
        { line: '"Two roads diverged in a wood, and I—\nI took the one less traveled by"', options: ['Regret', 'Decision and individuality', 'Confusion', 'Fear'], correct: 1, explanation: 'Frost\'s poem is about the moment of choosing and how that choice defines us.' },
        { line: '"I carry your heart with me\n(I carry it in my heart)"', options: ['Possessiveness', 'Deep, enduring love', 'Physical pain', 'Memory loss'], correct: 1, explanation: 'E.E. Cummings wrote this love poem — the beloved is always present, internalized and cherished.' },
        { line: '"Season of mists and mellow fruitfulness,\nClose bosom-friend of the maturing sun."', options: ['Winter sadness', 'Autumn\'s richness and abundance', 'Spring renewal', 'Summer heat'], correct: 1, explanation: 'John Keats\' "To Autumn" celebrates the season\'s bounty, ripeness, and gentle beauty.' },
        { line: '"I wandered lonely as a cloud\nThat floats on high o\'er vales and hills"', options: ['Joy and celebration', 'Isolation leading to wonder', 'Fear of heights', 'Desire to fly'], correct: 1, explanation: 'William Wordsworth\'s poem begins in loneliness but transforms into joy when he remembers daffodils.' },
        { line: '"Because I could not stop for Death—\nHe kindly stopped for me"', options: ['Death is terrifying', 'Death as a gentle companion', 'Death is avoidable', 'Death is violent'], correct: 1, explanation: 'Emily Dickinson personifies Death as a courteous gentleman caller — making mortality feel peaceful.' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  18. Culture Quest
    // ═══════════════════════════════════════════════════
);
