/* Game: workplace */
window.GameRegistry.register("workplace",
{
      stage: 'young_adult',
      title: '\uD83D\uDCBC Workplace Scenarios',
      desc: 'Navigate office situations',
      scenarios: [
        {
          situation: 'The Missed Deadline',
          context: 'You missed a project deadline. Your manager is asking about it.',
          options: [
            { text: '"I\'m sorry. I hit a snag with X. Here\'s my plan to finish by tomorrow."', wisdom: 9, empathy: 7, response: 'Honesty + solution = respect. Your manager appreciates the accountability.' },
            { text: '"I\'m almost done, just need a few more hours"', wisdom: 4, empathy: 4, response: 'You buy time but lose trust when the few hours become a day.' },
            { text: 'Blame the tools/team for the delay', wisdom: 2, empathy: 2, response: 'Your manager sees through it. Blame-shifting is a career killer.' }
          ]
        },
        {
          situation: 'The Toxic Colleague',
          context: 'A colleague constantly gossip, complains, and pulls you into drama.',
          options: [
            { text: 'Set a boundary: "I don\'t talk about people who aren\'t here"', wisdom: 10, empathy: 7, response: 'They stop coming to you. Your reputation improves. Drama-free zone established.' },
            { text: 'Join in to fit in', wisdom: 2, empathy: 2, response: 'You become part of the toxic culture. Others start distrusting you too.' },
            { text: 'Complain about them to someone else', wisdom: 3, empathy: 3, response: 'You become what you hate. The cycle of gossip continues.' }
          ]
        },
        {
          situation: 'The Credit Steal',
          context: 'Your teammate presents YOUR work as their own in a client meeting.',
          options: [
            { text: 'Address it privately: "I noticed you presented my section as yours"', wisdom: 9, empathy: 7, response: 'Direct conversation resolves it. They either apologize or reveal their character.' },
            { text: 'Let it slide \u2014 not worth the drama', wisdom: 5, empathy: 4, response: 'It happens again. Your silence teaches them it\'s okay to steal from you.' },
            { text: 'Tell everyone else what happened', wisdom: 4, empathy: 3, response: 'Office gossip destroys your credibility more than theirs.' }
          ]
        },
        {
          situation: 'The Impossible Request',
          context: 'Your boss asks you to do something you don\'t have time or skills for.',
          options: [
            { text: '"I want to do this well. Can we discuss timeline or get support?"', wisdom: 10, empathy: 8, response: 'You show commitment AND set realistic expectations. Smart professionalism.' },
            { text: 'Say yes and hope for the best', wisdom: 3, empathy: 3, response: 'You deliver poorly and damage your reputation. Overcommitting is worse than saying no.' },
            { text: 'Just say no, I can\'t', wisdom: 4, empathy: 5, response: 'Honest but blunt. Adding a solution makes it better.' }
          ]
        },
        {
          situation: 'The Harassment',
          context: 'A senior colleague makes inappropriate comments. You\'re not sure if it\'s "just joking."',
          options: [
            { text: 'Document it and report to HR', wisdom: 10, empathy: 9, response: 'You protect yourself and others. Reporting is not overreacting \u2014 it\'s the right thing.' },
            { text: 'Tell them to stop directly', wisdom: 8, empathy: 7, response: 'Good first step. If it continues, escalate. You deserve a safe workplace.' },
            { text: 'Ignore it and hope it stops', wisdom: 2, empathy: 2, response: 'It usually escalates. Silence emboldens the behavior.' }
          ]
        },
        {
          situation: 'The Job Offer',
          context: 'You get a job offer but your current employer counteroffers with more money.',
          options: [
            { text: 'Consider: why did you want to leave? Money fixes that?', wisdom: 9, empathy: 7, response: 'You realize the counteroffer is a band-aid. You leave anyway with clarity.' },
            { text: 'Stay for the money', wisdom: 4, empathy: 4, response: 'The money feels good for 3 months. Then the original problems return.' },
            { text: 'Take the new offer without negotiating', wisdom: 6, empathy: 5, response: 'You got what you wanted but left money on the table.' }
          ]
        },
        {
          situation: 'The Public Failure',
          context: 'You make a big mistake in a meeting and everyone sees it.',
          options: [
            { text: '"I got that wrong. Let me correct it and follow up."', wisdom: 10, empathy: 8, response: 'Owning mistakes publicly is rare and respected. People remember your courage.' },
            { text: 'Try to laugh it off', wisdom: 5, empathy: 5, response: 'Humor helps, but it doesn\'t replace correcting the error.' },
            { text: 'Defend your mistake aggressively', wisdom: 2, empathy: 2, response: 'Defensiveness makes it worse. Everyone makes mistakes \u2014 how you handle them matters.' }
          ]
        },
        {
          situation: 'The Mentorship',
          context: 'A junior colleague asks for your help but you\'re swamped.',
          options: [
            { text: '"I can give you 15 minutes now and we can schedule more later"', wisdom: 9, empathy: 9, response: 'You help without burning out. The junior feels supported. Mentoring builds your leadership.' },
            { text: '"Sorry, I\'m too busy right now"', wisdom: 4, empathy: 3, response: 'They stop asking. You miss a chance to grow a future leader.' },
            { text: 'Spend an hour helping them instead of your work', wisdom: 5, empathy: 8, response: 'Kind but unsustainable. You need boundaries to keep helping long-term.' }
          ]
        },
        {
          situation: 'The Pay Negotiation',
          context: 'You\'re offered a job at \u20AC40,000. You know the market rate is \u20AC48,000.',
          options: [
            { text: '"Based on my research, the range is \u20AC45k\u2013\u20AC50k. Can we discuss?"', wisdom: 10, empathy: 8, response: 'Data-driven negotiation is respected. They counteroffer at \u20AC44k \u2014 still better.' },
            { text: 'Accept gratefully', wisdom: 4, empathy: 5, response: 'You lose \u20AC8k/year. Over a career, that\'s hundreds of thousands.' },
            { text: '"I need at least \u20AC50k or I walk"', wisdom: 3, empathy: 2, response: 'An ultimatum creates tension. Firm is good; aggressive isn\'t.' }
          ]
        },
        {
          situation: 'The Burnout',
          context: 'You\'re exhausted, dreading work, and your performance is slipping.',
          options: [
            { text: 'Schedule a meeting with your manager to discuss workload', wisdom: 10, empathy: 8, response: 'Asking for help is professional, not weak. Most managers want to retain good people.' },
            { text: 'Push through \u2014 everyone is busy', wisdom: 3, empathy: 3, response: 'Pushing through leads to collapse. Burnout is a health crisis, not a scheduling issue.' },
            { text: 'Start looking for a new job immediately', wisdom: 6, empathy: 5, response: 'Running from burnout often follows you. Fix the root cause first.' }
          ]
        },
        {
          situation: 'The Idea Theft',
          context: 'You shared an idea casually at lunch. A week later, someone presents it in a meeting.',
          options: [
            { text: 'Acknowledge: "I\'m glad my idea from lunch is getting traction"', wisdom: 9, empathy: 7, response: 'Subtle credit-claiming. The person knows you noticed. Others do too.' },
            { text: 'Confront them: "That was my idea"', wisdom: 6, empathy: 5, response: 'Direct but potentially confrontational. Works if said calmly.' },
            { text: 'Let it go and be more careful next time', wisdom: 7, empathy: 6, response: 'Practical lesson learned. But the thief faces no consequences.' }
          ]
        },
        {
          situation: 'The Difficult Feedback',
          context: 'Your manager gives you critical feedback you disagree with.',
          options: [
            { text: '"I appreciate the feedback. Can you help me understand the specific concern?"', wisdom: 10, empathy: 8, response: 'You show maturity and seek clarity. Often feedback improves once you understand it.' },
            { text: 'Get defensive and explain why they\'re wrong', wisdom: 2, empathy: 2, response: 'Defensiveness proves their point. You appear unable to accept feedback.' },
            { text: 'Nod and forget it immediately', wisdom: 4, empathy: 4, feedback: 'You miss a growth opportunity. Even bad feedback has a kernel of truth.' }
          ]
        },
        {
          situation: 'The Office Romance',
          context: 'You\'re attracted to a colleague. You\'re unsure if it\'s appropriate.',
          options: [
            { text: 'Check company policy and proceed professionally if allowed', wisdom: 9, empathy: 7, response: 'Transparency and professionalism prevent problems. Many successful relationships start at work.' },
            { text: 'Pursue it secretly', wisdom: 3, empathy: 3, response: 'Secrets at work never stay secret. It becomes awkward or worse when discovered.' },
            { text: 'Do nothing \u2014 too risky', wisdom: 7, empathy: 6, response: 'Sometimes the safest choice. But if it\'s real, life is short.' }
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  10. Kitchen Sequencing
    // ═══════════════════════════════════════════════════
);
