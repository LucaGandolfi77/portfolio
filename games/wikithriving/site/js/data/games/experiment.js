/* Game: experiment */
window.GameRegistry.register("experiment",
{
      stage: 'teen',
      title: '\uD83D\uDD2C Experiment Lab',
      desc: 'Think like a scientist',
      questions: [
        { scenario: 'A student thinks plants grow faster with classical music. She plays music for Plant A and keeps Plant B in silence.', question: 'What is the independent variable?', options: ['Plant growth', 'Type of music', 'Water amount', 'Sunlight'], correct: 1, explanation: 'The independent variable is what the experimenter changes — the type of music.' },
        { scenario: 'You test whether caffeine affects test scores. You give Group A coffee and Group B water before the same test.', question: 'What should you keep the same for both groups?', options: ['Time of day', 'Type of test', 'Amount of liquid', 'All of the above'], correct: 3, explanation: 'All controlled variables should be identical to isolate the effect of caffeine.' },
        { scenario: 'After testing, students who drank coffee scored 10% higher on average.', question: 'What can you conclude?', options: ['Caffeine definitely improves scores', 'Coffee is better than water', 'More research is needed', 'All students should drink coffee'], correct: 2, explanation: 'One study suggests a trend but doesn\'t prove causation. Replication is essential.' },
        { scenario: 'A researcher surveys 500 people and finds that people who sleep more report higher happiness.', question: 'Is this correlation or causation?', options: ['Causation \u2014 sleep causes happiness', 'Correlation \u2014 they\'re related but not proven cause-effect', 'Neither \u2014 data is useless', 'Causation \u2014 happiness causes sleep'], correct: 1, explanation: 'Observing a relationship doesn\'t prove one thing causes the other.' },
        { scenario: 'You test if fertilizer helps plants. Plant A gets fertilizer + water. Plant B gets only water.', question: 'What would make this experiment stronger?', options: ['More plants in each group', 'Different types of fertilizer', 'No control group', 'Measure only once'], correct: 0, explanation: 'Larger sample sizes reduce the impact of random variation and increase reliability.' },
        { scenario: 'Your hypothesis is "Plants need sunlight to grow." You put one plant in sunlight and one in a closet.', question: 'What is wrong with this experiment?', options: ['Nothing \u2014 it\'s well designed', 'Need more plants in the closet', 'The closet also lacks water and heat', 'You should use bigger plants'], correct: 2, explanation: 'The closet changes multiple variables. Both plants should have identical conditions except sunlight.' },
        { scenario: 'A pharmaceutical company funds a study about their own drug\'s effectiveness.', question: 'What should you consider?', options: ['The results are definitely biased', 'Funding source can influence study design and reporting', 'Company-funded studies are always wrong', 'You should ignore the study'], correct: 1, explanation: 'Funding bias doesn\'t automatically invalidate results, but it\'s a red flag to examine methodology carefully.' },
        { scenario: 'You test a new study technique with 3 students and find it works.', question: 'What\'s the main problem?', options: ['The technique is bad', 'Sample size is too small', 'You need a longer study', 'Students should study more'], correct: 1, explanation: 'Three students is too few to draw any general conclusion. Results could be coincidental.' }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  14. Genre Mix
    // ═══════════════════════════════════════════════════
);
