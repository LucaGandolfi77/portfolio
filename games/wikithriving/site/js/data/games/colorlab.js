/* Game: colorlab */
window.GameRegistry.register("colorlab",
{
      stage: 'explorer',
      title: '\uD83C\uDFA8 Color Lab',
      desc: 'Master the color wheel',
      questions: [
        { description: 'Which color is COMPLEMENTARY to blue on the color wheel?', options: ['Green', 'Orange', 'Purple', 'Blue'], correct: 1, explanation: 'Complementary colors sit opposite each other. Blue\'s complement is orange — they create maximum contrast.' },
        { description: 'What mood do warm colors (red, orange, yellow) typically create?', options: ['Calm and sad', 'Energetic and warm', 'Mysterious', 'Cold and distant'], correct: 1, explanation: 'Warm colors advance visually and create feelings of energy, warmth, and excitement.' },
        { description: 'Which colors are ANALOGOUS (next to each other on the wheel)?', options: ['Red and green', 'Blue, blue-green, green', 'Yellow and purple', 'Red and blue'], correct: 1, explanation: 'Analogous colors share a hue family and create harmonious, cohesive designs.' },
        { description: 'What happens when you mix all three primary colors (red, blue, yellow)?', options: ['White', 'Black/brown', 'Green', 'Purple'], correct: 1, explanation: 'Mixing all primary colors in pigment creates black or dark brown — the absence of light reflection.' },
        { description: 'Which color recedes (appears to move away) in a design?', options: ['Red', 'Orange', 'Blue', 'Yellow'], correct: 2, explanation: 'Cool colors (blue, green, purple) recede visually, making spaces feel larger and more distant.' },
        { description: 'Tints are created by adding what to a color?', options: ['Black', 'White', 'Gray', 'Another color'], correct: 1, explanation: 'Tints are lighter versions of a color, created by adding white. They feel softer and more delicate.' },
        { description: 'Shades are created by adding what to a color?', options: ['White', 'Black', 'Water', 'Yellow'], correct: 1, explanation: 'Shades are darker versions of a color, created by adding black. They feel deeper and more serious.' },
        { description: 'Which color combination is most accessible for color-blind viewers?', options: ['Red and green', 'Blue and orange', 'Green and brown', 'Red and brown'], correct: 1, explanation: 'Blue-orange combinations are distinguishable by most types of color blindness, making them safer choices.' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  17. Poetry Match
    // ═══════════════════════════════════════════════════
);
