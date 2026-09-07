/* Game: bias */
window.GameRegistry.register("bias",
{
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
);
