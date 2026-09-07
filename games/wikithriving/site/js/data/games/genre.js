/* Game: genre */
window.GameRegistry.register("genre",
{
      stage: 'explorer',
      title: '\uD83C\uDFB5 Genre Mix',
      desc: 'Match sounds to genres',
      questions: [
        { description: 'Acoustic guitar, storytelling lyrics, rural themes, twangy vocals', options: ['Country', 'Hip-Hop', 'Electronic', 'Classical'], correct: 0, explanation: 'Country music originated in the American South, blending folk, blues, and storytelling.' },
        { description: 'Heavy bass, rhythmic beats, spoken lyrics, urban culture', options: ['Jazz', 'Hip-Hop', 'Country', 'Rock'], correct: 1, explanation: 'Hip-Hop emerged in the 1970s Bronx, combining MCing, DJing, and urban storytelling.' },
        { description: 'Synthesizers, drum machines, repetitive beats, danceable', options: ['Classical', 'Electronic', 'Folk', 'Blues'], correct: 1, explanation: 'Electronic music uses technology as its primary instrument — from house to techno to EDM.' },
        { description: 'Orchestral instruments, complex compositions, formal structure, no lyrics', options: ['Rock', 'Pop', 'Classical', 'Jazz'], correct: 2, explanation: 'Classical music spans centuries of Western art music, from Baroque to Romantic periods.' },
        { description: 'Improvisation, swing rhythm, brass instruments, syncopation', options: ['Classical', 'Jazz', 'Country', 'Electronic'], correct: 1, explanation: 'Jazz originated in New Orleans, combining African rhythms with European harmony and improvisation.' },
        { description: 'Distorted guitars, loud drums, rebellious lyrics, high energy', options: ['Folk', 'Pop', 'Rock', 'Classical'], correct: 2, explanation: 'Rock evolved from blues and country in the 1950s, becoming the sound of rebellion.' },
        { description: 'Catchy melodies, simple structure, verse-chorus format, mass appeal', options: ['Pop', 'Jazz', 'Classical', 'Blues'], correct: 0, explanation: 'Pop music is designed for wide appeal — catchy hooks, short songs, and polished production.' },
        { description: '12-bar structure, emotional vocals, call-and-response, roots of rock', options: ['Electronic', 'Pop', 'Hip-Hop', 'Blues'], correct: 3, explanation: 'Blues originated in the American South, expressing hardship through raw emotional music.' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  15. Scene Decoder
    // ═══════════════════════════════════════════════════
);
