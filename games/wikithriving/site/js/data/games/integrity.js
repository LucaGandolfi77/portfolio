/* Game: integrity */
window.GameRegistry.register("integrity",
{
      stage: 'teen',
      title: '\uD83C\uDFAF Integrity Challenge',
      desc: 'What would you do?',
      scenarios: [
        {
          situation: 'The Found Wallet',
          context: 'You find a wallet with \u20AC200 cash and an ID inside. Nobody saw you pick it up.',
          options: [
            { text: 'Return it to the address on the ID', wisdom: 10, empathy: 8, response: 'You return it. The owner is incredibly grateful. You feel proud.' },
            { text: 'Take the cash, return the wallet', wisdom: 3, empathy: 2, response: 'The owner notices the cash is missing. You feel guilty and the guilt stays.' },
            { text: 'Turn it in to the police', wisdom: 8, empathy: 6, response: 'The police contact the owner. You did the right thing without the awkward face-to-face.' }
          ]
        },
        {
          situation: 'The Test Answer',
          context: 'You see your friend\'s test answers during an exam. You\'re failing and they\'re acing it.',
          options: [
            { text: 'Don\'t look \u2014 fail with integrity', wisdom: 9, empathy: 7, response: 'You fail, but you know you earned that F honestly. You study harder next time.' },
            { text: 'Glance at one answer', wisdom: 4, empathy: 3, response: 'You get one extra point but lose something bigger: trust in yourself.' },
            { text: 'Copy several answers', wisdom: 1, empathy: 1, response: 'You pass the test but learn nothing. The knowledge gap catches up later.' }
          ]
        },
        {
          situation: 'The Broken Vase',
          context: 'You accidentally break something valuable at a friend\'s house. Nobody saw it happen.',
          options: [
            { text: 'Tell your friend immediately and offer to pay', wisdom: 10, empathy: 9, response: 'Your friend appreciates your honesty. The friendship grows stronger.' },
            { text: 'Pretend you didn\'t do it', wisdom: 2, empathy: 2, response: 'Your friend blames their sibling. An argument erupts. You feel terrible.' },
            { text: 'Fix it secretly before anyone notices', wisdom: 6, empathy: 5, response: 'You try to fix it but it\'s obvious. Your friend wonders why you didn\'t just say something.' }
          ]
        },
        {
          situation: 'The Extra Change',
          context: 'The cashier gives you \u20AC15 too much change. They\'re busy and didn\'t notice.',
          options: [
            { text: 'Give it back immediately', wisdom: 9, empathy: 8, response: 'The cashier thanks you. Small honesty builds big character.' },
            { text: 'Keep it \u2014 they made the mistake', wisdom: 3, empathy: 2, response: 'The cashier may get in trouble for the till being short. Was it worth \u20AC15?' },
            { text: 'Leave it on the counter and walk away', wisdom: 7, empathy: 6, response: 'You avoid the awkward conversation but still do the right thing.' }
          ]
        },
        {
          situation: 'The Social Media Post',
          context: 'Someone shares an embarrassing photo of a classmate. It\'s going viral. Everyone is laughing.',
          options: [
            { text: 'Report the post and tell the classmate', wisdom: 10, empathy: 10, response: 'The post gets taken down. Your classmate is grateful someone cared enough to act.' },
            { text: 'Don\'t engage \u2014 scroll past', wisdom: 5, empathy: 3, response: 'Silence lets the bullying continue. The person feels alone and humiliated.' },
            { text: 'Like or share it', wisdom: 1, empathy: 1, response: 'You contribute to someone\'s pain. Screenshots last forever \u2014 including yours.' }
          ]
        },
        {
          situation: 'The Lost Dog',
          context: 'You find a lost dog with a collar tag. You\'re late for school and the owner lives across town.',
          options: [
            { text: 'Call the owner and wait', wisdom: 9, empathy: 10, response: 'The owner arrives in tears of gratitude. You\'re late for school but you saved a family member.' },
            { text: 'Take the dog to school and deal with it later', wisdom: 5, empathy: 5, response: 'The dog is stressed at school. The owner is panicking at home.' },
            { text: 'Keep walking \u2014 someone else will help', wisdom: 2, empathy: 2, response: 'The dog wanders into traffic. "Someone else" didn\'t come in time.' }
          ]
        },
        {
          situation: 'The Group Project',
          context: 'Your group partner did most of the work but you\'re presenting it. The teacher praises you.',
          options: [
            { text: 'Give your partner full credit publicly', wisdom: 10, empathy: 9, response: 'Your partner feels valued. Your teacher respects your honesty. Win-win.' },
            { text: 'Accept the praise quietly', wisdom: 3, empathy: 2, response: 'Your partner feels invisible. You know the praise wasn\'t really yours.' },
            { text: 'Mention them briefly at the end', wisdom: 7, empathy: 6, response: 'It\'s better than nothing, but your partner deserved more than a footnote.' }
          ]
        },
        {
          situation: 'The Promise',
          context: 'A friend tells you a secret and makes you promise not to tell. Later, another friend asks about it.',
          options: [
            { text: 'Keep the promise \u2014 "I can\'t talk about that"', wisdom: 10, empathy: 9, response: 'Your friend learns they can trust you completely. Trust is rare and precious.' },
            { text: 'Hint without revealing', wisdom: 6, empathy: 5, response: 'You sort of keep the promise but your friend feels the boundary was tested.' },
            { text: 'Share the secret', wisdom: 1, empathy: 1, 'response': 'Your friend finds out. The trust is broken. Some things can\'t be undone.' }
          ]
        },
        {
          situation: 'The Shortcut',
          context: 'You can cheat on a certification exam that would get you a better job. Nobody would ever know.',
          options: [
            { text: 'Study and take it honestly', wisdom: 10, empathy: 8, response: 'It takes longer but you actually learn the material. Your competence is real.' },
            { text: 'Cheat \u2014 it\'s just a piece of paper', wisdom: 2, empathy: 2, response: 'You get the job but can\'t do the work. Impostor syndrome kicks in immediately.' },
            { text: 'Cheat but plan to learn it later', wisdom: 4, empathy: 3, response: '"Later" rarely comes. You\'re now in a position you\'re not qualified for.' }
          ]
        },
        {
          situation: 'The Hard Truth',
          context: 'Your friend asks if their presentation was good. It wasn\'t \u2014 the data was wrong and the delivery was confusing.',
          options: [
            { text: '"I think a few things could be stronger \u2014 can I help?"', wisdom: 10, empathy: 9, response: 'Your friend fixes the issues and thanks you for caring enough to be honest.' },
            { text: '"It was great!" (lying)', wisdom: 3, empathy: 4, response: 'They present the same flawed version and feel embarrassed when called out.' },
            { text: '"It was terrible and everyone noticed"', wisdom: 2, empathy: 1, response: 'Honesty without kindness is just cruelty. Your friend feels crushed.' }
          ]
        },
        {
          situation: 'The Bystander',
          context: 'You see someone being bullied in the hallway. The bully is popular and you\'re afraid of becoming a target.',
          options: [
            { text: 'Stand up for the person or get help', wisdom: 10, empathy: 10, response: 'The bullying stops (or at least pauses). The person knows they\'re not alone. You are brave.' },
            { text: 'Look away and walk fast', wisdom: 3, empathy: 2, response: 'The person feels abandoned. You carry the guilt of not acting.' },
            { text: 'Film it on your phone', wisdom: 1, empathy: 1, response: 'Filming bullying without helping is complicity. The video makes things worse.' }
          ]
        },
        {
          situation: 'The Credit',
          context: 'Your colleague presents YOUR idea in a meeting as their own. The boss loves it.',
          options: [
            { text: 'Mention afterward: "I\'m glad my idea resonated"', wisdom: 9, empathy: 7, response: 'You claim your credit professionally. The colleague learns you\'re watching.' },
            { text: 'Confront them publicly in the meeting', wisdom: 4, empathy: 3, response: 'It creates drama and makes you both look bad. The boss is uncomfortable.' },
            { text: 'Let it go silently', wisdom: 5, empathy: 5, response: 'It happens again. And again. Silence teaches people they can take from you.' }
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  7. Memory Match
    // ═══════════════════════════════════════════════════
);
