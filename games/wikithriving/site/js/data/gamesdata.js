/* Games Data — Playground mini-games */
(function(){
  window.GAMES_DATA = {

    // ═══════════════════════════════════════════════════
    //  1. Budget Sandbox
    // ═══════════════════════════════════════════════════
    budget: {
      stage: 'young_adult',
      title: '\uD83D\uDCB0 Budget Sandbox',
      desc: 'Allocate your monthly income wisely',
      salaries: [
        { amount: 1800, currency: 'EUR', scenario: 'Part-time barista in Lisbon' },
        { amount: 3200, currency: 'USD', scenario: 'Junior developer in Austin' },
        { amount: 250000, currency: 'JPY', scenario: 'Recent grad in Tokyo' },
        { amount: 4500, currency: 'GBP', scenario: 'Nurse in Manchester' },
        { amount: 800, currency: 'BRL', scenario: 'Freelance designer in São Paulo' },
        { amount: 6200, currency: 'CAD', scenario: 'Electrician in Toronto' },
        { amount: 2200, currency: 'AUD', scenario: 'Retail manager in Melbourne' }
      ],
      categories: [
        { id: 'needs', name: 'Needs', color: '#4ac07c', emoji: '\uD83C\uDFE0' },
        { id: 'wants', name: 'Wants', color: '#c0a84a', emoji: '\uD83C\uDFAE' },
        { id: 'savings', name: 'Savings', color: '#4a7ec0', emoji: '\uD83C\uDFE6' },
        { id: 'debt', name: 'Debt', color: '#c04a5a', emoji: '\uD83D\uDCB3' }
      ],
      feedback: function(allocations) {
        var needs = allocations.needs || 0;
        var wants = allocations.wants || 0;
        var savings = allocations.savings || 0;
        var debt = allocations.debt || 0;
        var messages = [];

        if (needs < 40) {
          messages.push('Your Needs allocation is below 40\u0025. Rent, food, and transport come first \u2014 make sure the basics are covered.');
        } else if (needs > 60) {
          messages.push('Needs are eating up more than 60\u0025. Look for small wins: a cheaper phone plan, cooking at home, or splitting bills.');
        } else {
          messages.push('Nice work \u2014 your Needs are in a healthy range.');
        }

        if (savings < 10) {
          messages.push('Savings below 10\u0025 makes emergencies scary. Even setting aside a tiny amount builds a safety net over time.');
        } else if (savings >= 20) {
          messages.push('Saving 20\u0025 or more? That\u2019s future-you saying thank you.');
        } else {
          messages.push('Good start on savings. Try to grow it toward 20\u0025 when you can.');
        }

        if (wants > 40) {
          messages.push('Wants above 40\u0025 \u2014 fun matters, but so does stability. Pick the wants that truly add joy and cut the rest.');
        } else if (wants < 10 && savings >= 20 && needs >= 40) {
          messages.push('You\u2019re being very disciplined! A small treat now and then keeps you motivated.');
        }

        if (debt > 20) {
          messages.push('High debt payments are a heavy load. Consider the avalanche method: target the highest-interest debt first.');
        } else if (debt > 0 && debt <= 20) {
          messages.push('Managing debt well. Keep paying it down while building savings.');
        }

        if (needs >= 40 && needs <= 60 && savings >= 10 && wants <= 40 && debt <= 20) {
          messages.push('\uD83C\uDF1F Balanced budget \u2014 you\u2019re covering your bases and planning ahead.');
        }

        return messages.join(' ');
      },
      rules: { minNeeds: 40, minSavings: 10, maxWants: 40 }
    },

    // ═══════════════════════════════════════════════════
    //  2. Conversation Dojo
    // ═══════════════════════════════════════════════════
    dojo: {
      stage: 'teen',
      title: '\uD83D\uDDE3\uFE0F Conversation Dojo',
      desc: 'Practice real conversations',
      scenarios: [
        {
          id: 'salary_negotiate',
          situation: 'Salary Negotiation',
          context: 'You just got a job offer for \u20AC32,000. You know the market rate is closer to \u20AC38,000.',
          nodes: [
            {
              text: 'You sit down with the hiring manager. How do you start?',
              options: [
                {
                  text: '"I\u2019m really excited about this role. Based on my research, similar positions pay \u20AC38k\u2013\u20AC42k. Can we discuss the package?"',
                  empathy: 7,
                  assertiveness: 8,
                  response: 'The manager nods. They appreciate the data and say they\u2019ll check with HR.'
                },
                {
                  text: '"The offer is too low. I won\u2019t accept less than \u20AC40k."',
                  empathy: 2,
                  assertiveness: 9,
                  response: 'The manager looks uncomfortable. The conversation gets tense and they may withdraw the offer.'
                },
                {
                  text: '"Thank you so much for the offer! I\u2019m really happy." (You don\u2019t mention money.)',
                  empathy: 8,
                  assertiveness: 1,
                  response: 'You accept and later feel frustrated knowing you\u2019re underpaid.'
                }
              ]
            }
          ]
        },
        {
          id: 'saying_no',
          situation: 'Saying No to a Friend',
          context: 'Your friend asks to borrow \u20AC200. You know they haven\u2019t paid you back from last time.',
          nodes: [
            {
              text: 'How do you respond?',
              options: [
                {
                  text: '"I can\u2019t lend money right now, but I\u2019m happy to help you brainstorm other options."',
                  empathy: 7,
                  assertiveness: 8,
                  response: 'Your friend is a bit disappointed but respects your honesty.'
                },
                {
                  text: '"Sure, no problem!" (You secretly resent it.)',
                  empathy: 4,
                  assertiveness: 1,
                  response: 'You feel resentful and the friendship\u2019s trust quietly erodes.'
                },
                {
                  text: '"You still owe me from last time. I\u2019m not comfortable lending again."',
                  empathy: 3,
                  assertiveness: 9,
                  response: 'Your friend gets defensive. The relationship feels strained.'
                }
              ]
            }
          ]
        },
        {
          id: 'sincere_apology',
          situation: 'Apologising Sincerely',
          context: 'You forgot your friend\u2019s birthday. They\u2019re hurt and told you so.',
          nodes: [
            {
              text: 'What do you say?',
              options: [
                {
                  text: '"I completely forgot, and I\u2019m really sorry. Your birthday matters to me and I messed up. What can I do to make it right?"',
                  empathy: 9,
                  assertiveness: 6,
                  response: 'Your friend feels heard. They say it\u2019s okay and you plan something together.'
                },
                {
                  text: '"I\u2019m sorry you feel that way."',
                  empathy: 2,
                  assertiveness: 3,
                  response: 'Your friend senses the apology isn\u2019t genuine. The hurt lingers.'
                },
                {
                  text: '"I\u2019m sorry, but you know how busy I am!"',
                  empathy: 1,
                  assertiveness: 4,
                  response: 'Your friend feels dismissed and stops bringing things up with you.'
                }
              ]
            }
          ]
        },
        {
          id: 'asking_help',
          situation: 'Asking for Help',
          context: 'You\u2019re overwhelmed with schoolwork and your mental health is suffering. You need to tell someone.',
          nodes: [
            {
              text: 'Who do you reach out to first and what do you say?',
              options: [
                {
                  text: '"Hey Mum, I\u2019m struggling. I can\u2019t keep up with everything and I need help figuring out what to do."',
                  empathy: 8,
                  assertiveness: 7,
                  response: 'Your mum listens and helps you make a plan. You feel lighter.'
                },
                {
                  text: '"I\u2019m fine. Everyone handles this much work." (You stay quiet.)',
                  empathy: 3,
                  assertiveness: 1,
                  response: 'You keep drowning. The stress compounds and you burn out.'
                },
                {
                  text: '"This school is a joke. The teachers give us too much and nobody cares."',
                  empathy: 2,
                  assertiveness: 5,
                  response: 'People hear anger but not the real problem underneath. Nobody knows how to help.'
                }
              ]
            }
          ]
        },
        {
          id: 'giving_feedback',
          situation: 'Giving Honest Feedback',
          context: 'A classmate asked you to review their presentation. It has major errors but they seem proud of it.',
          nodes: [
            {
              text: 'How do you give your feedback?',
              options: [
                {
                  text: '"I like how passionate you are about this topic! I noticed a few things we could tighten up \u2014 want to go through them together?"',
                  empathy: 8,
                  assertiveness: 7,
                  response: 'Your classmate is grateful. They fix the issues without feeling attacked.'
                },
                {
                  text: '"It\u2019s good!" (You skip the real feedback.)',
                  empathy: 5,
                  assertiveness: 1,
                  response: 'They present with errors and feel embarrassed. Your silence didn\u2019t help.'
                },
                {
                  text: '"There are a lot of mistakes. You should redo most of it."',
                  empathy: 1,
                  assertiveness: 8,
                  response: 'Your classmate feels crushed and doesn\u2019t ask you for help again.'
                }
              ]
            }
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  3. Bias Buster
    // ═══════════════════════════════════════════════════
    bias: {
      stage: 'explorer',
      title: '\uD83E\uDDE9 Bias Buster',
      desc: 'Spot the thinking trap',
      fallacies: [
        {
          id: 'f1',
          text: '"You can\u2019t trust Dr. Rivera\u2019s climate research \u2014 she\u2019s a terrible cook."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 0,
          explanation: 'Attacking the person instead of engaging with their argument is an ad hominem fallacy.'
        },
        {
          id: 'f2',
          text: '"Either you support building the new highway, or you don\u2019t care about jobs."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 1,
          explanation: 'Presenting only two options when many exist is a false dilemma.'
        },
        {
          id: 'f3',
          text: '"Everyone is buying this phone, so it must be the best one."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 2,
          explanation: 'Assuming something is good because it\u2019s popular is the bandwagon fallacy.'
        },
        {
          id: 'f4',
          text: '"Famous actor X says this vitamin works, so it must be scientifically proven."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 3,
          explanation: 'Citing a celebrity as scientific authority is an appeal to authority fallacy.'
        },
        {
          id: 'f5',
          text: '"If we allow students to use calculators in maths, soon nobody will know how to add."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 4,
          explanation: 'Jumping to an extreme consequence without evidence is a slippery slope fallacy.'
        },
        {
          id: 'f6',
          text: '"My grandfather smoked every day and lived to 95, so smoking can\u2019t be that bad."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 5,
          explanation: 'This isn\u2019t a recognised named fallacy, but it\u2019s a classic case of cherry-picking one anecdote to ignore overwhelming evidence.'
        },
        {
          id: 'f7',
          text: '"Why should I listen to a teenager about climate change? They don\u2019t even have a degree."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 0,
          explanation: 'Dismissing someone\u2019s argument based on their age, not their reasoning, is an ad hominem.'
        },
        {
          id: 'f8',
          text: '"You\u2019re either with us or against us."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 1,
          explanation: 'Forcing a binary choice ignores nuance and middle ground \u2014 that\u2019s a false dilemma.'
        },
        {
          id: 'f9',
          text: '"Most people in our town support the new policy, so it must be the right thing to do."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 2,
          explanation: 'Popularity doesn\u2019t equal correctness \u2014 this is the bandwagon fallacy.'
        },
        {
          id: 'f10',
          text: '"If we raise the minimum wage, businesses will close, unemployment will skyrocket, and the economy will collapse."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 4,
          explanation: 'Assuming each step will inevitably lead to the worst outcome is a slippery slope.'
        },
        {
          id: 'f11',
          text: '"Professor Li is the world\u2019s top economist, so her prediction about the market must be right."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 3,
          explanation: 'Even an expert can be wrong \u2014 expertise doesn\u2019t make a claim automatically true.'
        },
        {
          id: 'f12',
          text: '"Either we ban all social media for kids, or we don\u2019t care about their mental health."',
          options: ['Ad Hominem', 'False Dilemma', 'Bandwagon', 'Appeal to Authority', 'Slippery Slope', 'No Fallacy'],
          correct: 1,
          explanation: 'There are many possible approaches between doing nothing and a total ban \u2014 this is a false dilemma.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  4. News Detective
    // ═══════════════════════════════════════════════════
    news: {
      stage: 'teen',
      title: '\uD83D\uDD0D News Detective',
      desc: 'Real or fake? Think before you share',
      headlines: [
        {
          id: 'n1',
          text: 'Scientists Discover New Species of Glowing Deep-Sea Jellyfish off Coast of Japan',
          real: true,
          source: 'National Geographic',
          explanation: 'Marine biologists documented this species in the Mariana Trench during a 2024 expedition.'
        },
        {
          id: 'n2',
          text: 'Local Man Claims His Cat Can Predict Earthquakes With 100\u0025 Accuracy',
          real: false,
          source: 'Viral post',
          explanation: 'No controlled study supports this claim. Animal behaviour before earthquakes is still poorly understood.'
        },
        {
          id: 'n3',
          text: 'European Parliament Votes to Ban Single-Use Plastics by 2029',
          real: true,
          source: 'Reuters',
          explanation: 'The EU passed phased legislation targeting single-use plastics with a 2029 deadline.'
        },
        {
          id: 'n4',
          text: 'NASA Confirms Aliens Have Been Living on the Moon Since 1969',
          real: false,
          source: 'Viral post',
          explanation: 'No credible space agency has ever confirmed extraterrestrial life on the Moon.'
        },
        {
          id: 'n5',
          text: 'Study Finds That Walking 30 Minutes a Day Can Reduce Risk of Heart Disease by 25\u0025',
          real: true,
          source: 'The Lancet',
          explanation: 'A large-scale meta-analysis published in The Lancet found significant cardiovascular benefits from regular walking.'
        },
        {
          id: 'n6',
          text: 'Government Announces Free Public Transport for All Citizens Starting Next Month',
          real: false,
          source: 'Viral post',
          explanation: 'Multiple countries have experimented with this, but no government has announced universal free transport nationwide on that timeline.'
        },
        {
          id: 'n7',
          text: 'WHO Warns of Rising Antibiotic Resistance as a Global Health Threat',
          real: true,
          source: 'World Health Organization',
          explanation: 'The WHO has repeatedly flagged antimicrobial resistance as one of the top ten global health threats.'
        },
        {
          id: 'n8',
          text: 'Famous Pop Star Secretly Donates Entire Fortune to Animal Shelter',
          real: false,
          source: 'Viral post',
          explanation: 'This story circulated on social media with no verified source or confirmation from the artist\u2019s team.'
        },
        {
          id: 'n9',
          text: 'Research Shows Bilingual Children Develop Stronger Cognitive Flexibility',
          real: true,
          source: 'BBC News',
          explanation: 'Studies published in multiple journals confirm that bilingualism is linked to enhanced executive function in children.'
        },
        {
          id: 'n10',
          text: 'Incredible Video Shows Dog Driving a Car Through Downtown Traffic',
          real: false,
          source: 'Viral post',
          explanation: 'The video was staged with hidden wires and a trained animal for a comedy sketch.'
        },
        {
          id: 'n11',
          text: 'New Zealand Reports Highest Recorded Ocean Temperatures in History',
          real: true,
          source: 'Stuff NZ',
          explanation: 'NIWA confirmed record sea surface temperatures around New Zealand in early 2024.'
        },
        {
          id: 'n12',
          text: ' leaked memo Reveals Tech Company Plans to Replace All Workers With Robots by 2025',
          real: false,
          source: 'Viral post',
          explanation: 'The document was fabricated. No legitimate outlet confirmed the memo\u2019s existence.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  5. Emotion Reader
    // ═══════════════════════════════════════════════════
    emotion: {
      stage: 'sprout',
      title: '\uD83D\uDE0A Emotion Reader',
      desc: 'How are they feeling?',
      emotions: [
        {
          emoji: '\uD83D\uDE0A',
          name: 'Happy',
          scenarios: [
            'They just received good news about something they worked hard for.',
            'Their friend said something really nice about them to others.'
          ]
        },
        {
          emoji: '\uD83D\uDE22',
          name: 'Sad',
          scenarios: [
            'They just said goodbye to someone they won\u2019t see for a long time.',
            'They found out they didn\u2019t make the team they tried out for.'
          ]
        },
        {
          emoji: '\uD83D\uDE21',
          name: 'Angry',
          scenarios: [
            'Someone took their things without asking and broke one.',
            'They were accused of something they didn\u2019t do.'
          ]
        },
        {
          emoji: '\uD83D\uDE28',
          name: 'Scared',
          scenarios: [
            'They hear a strange noise in the dark house at night.',
            'They\u2019re about to walk on stage in front of hundreds of people.'
          ]
        },
        {
          emoji: '\uD83E\uDD14',
          name: 'Confused',
          scenarios: [
            'They read the instructions three times but still don\u2019t understand.',
            'A friend is acting differently toward them and they don\u2019t know why.'
          ]
        },
        {
          emoji: '\uD83D\uDE0D',
          name: 'Loved',
          scenarios: [
            'Their parent left a sweet note in their lunchbox.',
            'A friend surprised them with a handmade birthday card.'
          ]
        },
        {
          emoji: '\uD83D\uDE2B',
          name: 'Tired',
          scenarios: [
            'They stayed up late finishing homework and still have more to do.',
            'They\u2019ve been running around all day and just want to sit down.'
          ]
        },
        {
          emoji: '\uD83E\uDD73',
          name: 'Proud',
          scenarios: [
            'They finally solved a problem they\u2019d been stuck on for days.',
            'Their little sibling showed them something they learned because of their help.'
          ]
        },
        {
          emoji: '\uD83D\uDE10',
          name: 'Bored',
          scenarios: [
            'They\u2019re sitting in a long car ride with nothing to do.',
            'The lesson they\u2019re in has nothing to do with their interests.'
          ]
        },
        {
          emoji: '\uD83E\uDD72',
          name: 'Embarrassed',
          scenarios: [
            'They tripped in front of everyone in the school hallway.',
            'Their parent told a funny baby story to their crush.'
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  6. Integrity Challenge
    // ═══════════════════════════════════════════════════
    integrity: {
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
    memory: {
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
    speedmath: {
      stage: 'teen',
      title: '\u26A1 Speed Math',
      desc: 'How fast can you calculate?',
      questions: [
        { q: '12 \u00D7 8 = ?', options: ['84', '96', '108', '88'], correct: 1 },
        { q: '15% of 200 = ?', options: ['25', '30', '35', '20'], correct: 1 },
        { q: '3\u00B2 + 4\u00B2 = ?', options: ['25', '49', '7', '12'], correct: 0 },
        { q: '144 \u00F7 12 = ?', options: ['11', '12', '13', '14'], correct: 1 },
        { q: '25 \u00D7 4 = ?', options: ['80', '90', '100', '110'], correct: 2 },
        { q: '1/4 + 3/4 = ?', options: ['1/2', '4/8', '1', '3/2'], correct: 2 },
        { q: '50 \u00D7 50 = ?', options: ['250', '2500', '25000', '500'], correct: 1 },
        { q: '1000 \u00F7 25 = ?', options: ['25', '40', '50', '100'], correct: 1 },
        { q: '9 \u00D7 9 = ?', options: ['72', '81', '90', '99'], correct: 1 },
        { q: '200 \u00F7 8 = ?', options: ['20', '25', '30', '40'], correct: 1 },
        { q: '33 \u00D7 3 = ?', options: ['66', '99', '100', '96'], correct: 1 },
        { q: '72 \u00F7 9 = ?', options: ['7', '8', '9', '6'], correct: 1 },
        { q: '11 \u00D7 11 = ?', options: ['111', '121', '131', '101'], correct: 1 },
        { q: '45 + 55 = ?', options: ['90', '100', '110', '95'], correct: 1 },
        { q: '20% of 150 = ?', options: ['20', '25', '30', '35'], correct: 2 }
      ],
      timePerQuestion: 10
    },

    // ═══════════════════════════════════════════════════
    //  9. Workplace Scenarios
    // ═══════════════════════════════════════════════════
    workplace: {
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
    kitchen: {
      stage: 'explorer',
      title: '\uD83C\uDF73 Kitchen Sequencing',
      desc: 'Put the cooking steps in order',
      recipes: [
        {
          name: 'Scrambled Eggs',
          steps: [
            'Crack 2 eggs into a bowl and whisk',
            'Heat butter in a pan over medium heat',
            'Pour eggs into the pan',
            'Stir gently with a spatula',
            'Remove from heat while still slightly wet',
            'Season with salt and pepper'
          ]
        },
        {
          name: 'Pasta with Garlic & Oil',
          steps: [
            'Boil water and add salt',
            'Cook pasta according to package',
            'Slice garlic thinly',
            'Heat olive oil and saut\u00E9 garlic',
            'Drain pasta and add to garlic oil',
            'Toss, season, and serve'
          ]
        },
        {
          name: 'Simple Sandwich',
          steps: [
            'Lay out two slices of bread',
            'Spread butter or mayo on both slices',
            'Add lettuce and tomato on one slice',
            'Add protein (cheese, meat, or hummus)',
            'Close the sandwich and press gently',
            'Cut diagonally and serve'
          ]
        },
        {
          name: 'Rice',
          steps: [
            'Measure 1 cup rice and rinse it',
            'Add 2 cups water to a pot',
            'Bring water to a boil',
            'Add rice, reduce heat to low, cover',
            'Simmer for 15 minutes without lifting lid',
            'Fluff with a fork and serve'
          ]
        },
        {
          name: 'Fruit Salad',
          steps: [
            'Wash all fruits thoroughly',
            'Peel fruits that need peeling',
            'Cut fruits into bite-sized pieces',
            'Put all pieces in a large bowl',
            'Add a squeeze of lemon juice',
            'Toss gently and serve'
          ]
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    //  11. Values Sort
    // ═══════════════════════════════════════════════════
    valuesort: {
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
    artmatch: {
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
    experiment: {
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
    genre: {
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
    scenedecoder: {
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
    colorlab: {
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
    poetrymatch: {
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
    culturequest: {
      stage: 'young_adult',
      title: '\uD83C\uDF0D Culture Quest',
      desc: 'Match customs to countries',
      questions: [
        { custom: 'Removing shoes before entering a home', options: ['Japan', 'United States', 'Brazil', 'Germany'], correct: 0, explanation: 'In Japan, removing shoes at the door is a fundamental sign of respect and cleanliness.' },
        { custom: 'Eating with hands (right hand only) is traditional', options: ['France', 'India', 'Australia', 'Canada'], correct: 1, explanation: 'In India, eating with the right hand is traditional — the left hand is considered unclean.' },
        { custom: 'The "thumbs up" gesture is offensive', options: ['United Kingdom', 'Germany', 'Iran', 'Canada'], correct: 2, explanation: 'In Iran and parts of the Middle East, the thumbs up is equivalent to the middle finger.' },
        { custom: 'Being early to a social gathering is considered rude', options: ['Japan', 'Germany', 'Brazil', 'Switzerland'], correct: 2, explanation: 'In Brazil, arriving 15-30 minutes "late" to social events is actually on time — it\'s a more relaxed time culture.' },
        { custom: 'Tipping at a restaurant is considered insulting', options: ['United States', 'Japan', 'Mexico', 'Thailand'], correct: 1, explanation: 'In Japan, excellent service is expected, not rewarded with tips. Tipping implies the service needed improvement.' },
        { custom: 'Pointing with your index finger is considered rude', options: ['Germany', 'Thailand', 'United States', 'Australia'], correct: 1, explanation: 'In Thailand, pointing with the index finger is rude. The polite way is to gesture with an open hand or thumb.' },
        { custom: 'Nodding your head means "no" instead of "yes"', options: ['India', 'Bulgaria', 'France', 'South Korea'], correct: 1, explanation: 'In Bulgaria and parts of Greece, a nod means "no" and a head shake means "yes" — the opposite of most countries.' },
        { custom: 'Gifts should never be opened in front of the giver', options: ['China', 'United States', 'Brazil', 'Australia'], correct: 0, explanation: 'In China, gifts are typically opened privately to avoid any potential embarrassment for either party.' }
      ]
    }
  };
})();
