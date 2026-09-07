/* Game: scenedecoder */
window.GameRegistry.register("scenedecoder",
{
      stage: 'teen',
      title: '\uD83C\uDFAC Scene Decoder',
      desc: 'Read the hidden language of film',
      questions: [
        { description: 'The camera looks UP at the character, making them appear powerful and dominant.', options: ['Low angle shot', 'High angle shot', 'Dutch angle', 'Wide shot'], correct: 0, explanation: 'Low angles make subjects appear taller and more powerful — used for heroes and villains alike.' },
        { description: 'The camera looks DOWN at the character, making them seem small and vulnerable.', options: ['Low angle shot', 'High angle shot', 'Eye level', 'Close-up'], correct: 1, explanation: 'High angles diminish subjects — used to show weakness, defeat, or vulnerability.' },
        { description: 'The frame is tinted blue during sad scenes and warm orange during happy ones.', options: ['Color grading', 'Sound design', 'Editing pace', 'Camera movement'], correct: 0, explanation: 'Color grading manipulates color to create mood — blue for sadness, warm tones for happiness.' },
        { description: 'The music suddenly stops right before a jump scare.', options: ['Silence as tension', 'Color symbolism', 'Camera angle', 'Editing'], correct: 0, explanation: 'Removing sound creates anticipation and makes the eventual sound more shocking.' },
        { description: 'Two characters talk in extreme close-up, showing only their eyes.', options: ['Wide shot', 'Close-up', 'Establishing shot', 'Over-the-shoulder'], correct: 1, explanation: 'Close-ups capture emotion — eyes reveal inner thoughts that dialogue doesn\'t express.' },
        { description: 'The scene cuts rapidly between different locations and characters.', options: ['Long take', 'Montage', 'Slow motion', 'Static shot'], correct: 1, explanation: 'Montage compresses time and shows multiple events simultaneously, building energy.' },
        { description: 'A character is framed alone in a doorway, visually separated from the group.', options: ['Framing for isolation', 'Deep focus', 'Tracking shot', 'Shallow focus'], correct: 0, explanation: 'Doorways and frames within frames can visually isolate characters, showing emotional distance.' },
        { description: 'The camera follows the character from behind as they walk through a crowded street.', options: ['Static shot', 'Tracking shot', 'Crane shot', 'Dutch angle'], correct: 1, explanation: 'Tracking shots follow subjects through space, creating immersion and a sense of journey.' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  16. Color Lab
    // ═══════════════════════════════════════════════════
);
