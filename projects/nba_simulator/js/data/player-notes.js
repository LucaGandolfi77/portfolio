/* Verified quotes and factual trivia for player cards */

const QUOTES = {
  'LeBron James': { en: 'I like criticism. It makes you strong.', it: 'Mi piace la critica. Mi rende più forte.', source: 'assets/quotes/quotes.json' }
};

/* Curated, verifiable career facts (no invented quotes). */
const TRIVIA = {
  'Jayson Tatum': ['Drafted 3rd overall by Boston in 2017.', 'Scelto terzo dai Celtics nel draft 2017.'],
  'Jaylen Brown': ['Selected 3rd overall in the 2016 NBA Draft.', 'Terza scelta assoluta nel draft 2016.'],
  'Stephen Curry': ['Drafted 7th overall in 2009; NBA MVP in 2015 and 2016.', 'Settima scelta nel 2009, MVP NBA nel 2015 e 2016.'],
  'Nikola Jokic': ['Drafted 41st overall in 2014 and later won three MVP awards.', 'Scelto al 41° posto nel 2014, poi tre volte MVP.'],
  'Giannis Antetokounmpo': ['Drafted 15th overall in 2013; 2021 Finals MVP.', 'Quindicesima scelta nel 2013, MVP delle Finali 2021.'],
  'Luka Doncic': ['Drafted 3rd overall in 2018 after EuroLeague stardom.', 'Terza scelta nel 2018 dopo il successo in EuroLeague.'],
  'LeBron James': ['Selected 1st overall in 2003 straight out of high school.', 'Prima scelta assoluta nel 2003 direttamente dalle scuole superiori.'],
  'Anthony Davis': ['First overall pick in 2012; championship in 2020.', 'Prima scelta assoluta nel 2012, campione nel 2020.'],
  'Kevin Durant': ['Drafted 2nd overall in 2007; 2014 NBA MVP.', 'Seconda scelta nel 2007, MVP nel 2014.'],
  'Kyrie Irving': ['First overall pick in 2011; 2016 champion with Cleveland.', 'Prima scelta nel 2011, campione 2016 con Cleveland.'],
  'Joel Embiid': ['Drafted 3rd overall in 2014; 2023 NBA MVP.', 'Terza scelta nel 2014, MVP nel 2023.'],
  'Jalen Brunson': ['Drafted 33rd overall in 2018; All-Star in 2024.', 'Scelto al 33° posto nel 2018, All-Star nel 2024.'],
  'Victor Wembanyama': ['First overall pick in 2023; 2024 Defensive Player of the Year runner-up.', 'Prima scelta assoluta nel 2023, secondo per il DPOY 2024.'],
  'Shai Gilgeous-Alexander': ['Drafted 11th overall in 2018; led the league in scoring in 2025.', 'Undicesima scelta nel 2018, capocannoniere NBA nel 2025.'],
  'Anthony Edwards': ['First overall pick in the 2020 NBA Draft.', 'Prima scelta assoluta nel draft 2020.'],
  'Damian Lillard': ['Drafted 6th overall in 2012; six-time All-Star.', 'Sesta scelta nel 2012, sei volte All-Star.'],
  'Jimmy Butler': ['Drafted 30th overall in 2011; 2023 Finals MVP.', 'Trentesima scelta nel 2011, MVP delle Finali 2023.'],
  'Devin Booker': ['Drafted 13th overall in 2015; scored 70 points in a game.', 'Tredicesima scelta nel 2015, 70 punti in una partita.'],
  'Trae Young': ['Drafted 5th overall in 2018; led the NBA in assists in 2025.', 'Quinta scelta nel 2018, leader NBA in assist nel 2025.'],
  'Bam Adebayo': ['Drafted 14th overall in 2017; three-time All-Star.', 'Quattordicesima scelta nel 2017, tre volte All-Star.'],
  'Draymond Green': ['Drafted 35th overall in 2012; 2017 Defensive Player of the Year.', 'Scelto al 35° posto nel 2012, DPOY nel 2017.'],
  'Rudy Gobert': ['Drafted 27th overall in 2013; multiple-time Defensive Player of the Year.', 'Ventesimasettesima scelta nel 2013, più volte DPOY.'],
  'Kristaps Porzingis': ['Drafted 4th overall in 2015; 2018 All-Star.', 'Quarta scelta nel 2015, All-Star nel 2018.'],
  'Jamal Murray': ['Drafted 7th overall in 2016; 2023 champion with Denver.', 'Settima scelta nel 2016, campione 2023 con Denver.'],
  'Tyrese Maxey': ['Drafted 21st overall in 2020; 2024 Most Improved Player.', 'Ventunesima scelta nel 2020, giocatore più migliorato 2024.'],
  'Domantas Sabonis': ['Drafted 11th overall in 2016; son of Arvydas Sabonis.', 'Undicesima scelta nel 2016, figlio di Arvydas Sabonis.'],
  "De'Aaron Fox": ['Drafted 5th overall in 2017; 2023 Clutch Player of the Year.', 'Quinta scelta nel 2017, Clutch Player of the Year 2023.'],
  'Derrick White': ['Drafted 29th overall in 2017; 2024 champion with Boston.', 'Ventinovesima scelta nel 2017, campione 2024 con Boston.'],
  'Jrue Holiday': ['Drafted 17th overall in 2009; two-time champion.', 'Diciassettesima scelta nel 2009, due titoli NBA.'],
  'Austin Reaves': ['Signed as an undrafted free agent in 2021.', 'Firmato come free agent non draftato nel 2021.']
};

export function playerNotes(player, lang = 'en', teamName = '') {
  const quote = QUOTES[player.name];
  const curated = TRIVIA[player.name];
  const trivia = curated
    ? (lang === 'it' ? curated[1] : curated[0])
    : lang === 'it'
      ? `${player.name} gioca come ${player.pos} per ${teamName || 'la propria squadra'} a ${player.age} anni.`
      : `${player.name} plays ${player.pos} for ${teamName || 'his team'} at age ${player.age}.`;
  return {
    quote: quote ? (lang === 'it' ? quote.it : quote.en) : null,
    quoteSource: quote ? quote.source : null,
    trivia,
    curated: !!curated
  };
}
