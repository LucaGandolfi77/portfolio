/* Game: budget */
window.GameRegistry.register("budget",
{
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
);
