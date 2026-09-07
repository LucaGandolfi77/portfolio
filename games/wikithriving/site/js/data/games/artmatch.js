/* Game: artmatch */
window.GameRegistry.register("artmatch",
{
      stage: 'explorer',
      title: '\uD83C\uDFA8 Art Match',
      desc: 'Match artworks to movements and emotions',
      questions: [
        { description: 'Thick brushstrokes, bright colors, emotional intensity, shows the artist\'s inner feelings', options: ['Impressionism', 'Expressionism', 'Cubism', 'Pop Art'], correct: 1, explanation: 'Expressionism distorts reality to express emotions — think Munch\'s The Scream.' },
        { description: 'Everyday objects like soup cans and comic strips, bold flat colors, mass culture references', options: ['Surrealism', 'Abstract Expressionism', 'Pop Art', 'Realism'], correct: 2, explanation: 'Pop Art (Warhol, Lichtenstein) elevated consumer culture to high art.' },
        { description: 'Light, fleeting moments, visible brushstrokes, outdoor scenes, captures a瞬间', options: ['Impressionism', 'Renaissance', 'Cubism', 'Minimalism'], correct: 0, explanation: 'Impressionism (Monet, Renoir) captured light and atmosphere over precise detail.' },
        { description: 'Dream imagery, impossible scenes, melting clocks, the subconscious mind', options: ['Cubism', 'Surrealism', 'Realism', 'Impressionism'], correct: 1, explanation: 'Surrealism (Dalí, Magritte) explored dreams and the unconscious.' },
        { description: 'Broken perspectives, multiple viewpoints at once, geometric fragmentation', options: ['Pop Art', 'Impressionism', 'Cubism', 'Expressionism'], correct: 2, explanation: 'Cubism (Picasso, Braque) shattered perspective to show multiple angles simultaneously.' },
        { description: 'Hyper-realistic scenes of everyday life, social commentary, dignity of working people', options: ['Realism', 'Surrealism', 'Abstract Art', 'Pop Art'], correct: 0, explanation: 'Realism (Courbet, Hopper) depicted ordinary life without idealization.' },
        { description: 'Large fields of solid color, minimal form, meditative quality', options: ['Expressionism', 'Minimalism', 'Cubism', 'Impressionism'], correct: 1, explanation: 'Minimalism stripped art to its essentials — color, shape, and space.' },
        { description: 'Dripped and splattered paint, action and energy visible on canvas', options: ['Pop Art', 'Realism', 'Abstract Expressionism', 'Surrealism'], correct: 2, explanation: 'Abstract Expressionism (Pollock, de Kooning) made the act of painting itself the subject.' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  13. Experiment Lab
    // ═══════════════════════════════════════════════════
);
