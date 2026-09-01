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
    }
  };
})();
