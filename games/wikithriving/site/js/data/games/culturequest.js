/* Game: culturequest */
window.GameRegistry.register("culturequest",
{
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
);
