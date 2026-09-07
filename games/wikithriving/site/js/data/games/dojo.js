/* Game: dojo */
window.GameRegistry.register("dojo",
{
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
);
