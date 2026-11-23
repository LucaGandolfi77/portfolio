/* Physical and visual profile for the 3D avatar (approximate real traits for stars) */

import { hashSeed, seededRandom } from '../core/rng.js';

/* heightCm, weightKg, hairColor, hairStyle, faceShape, skin, jersey */
const STAR_PROFILE = {
  'LeBron James': [206, 113, '#1c1410', 'buzz', 'oval', '#8d5524', 23],
  'Stephen Curry': [188, 86, '#1c1410', 'short', 'round', '#c68642', 30],
  'Nikola Jokic': [211, 129, '#3b2a1a', 'short', 'round', '#e0ac69', 15],
  'Giannis Antetokounmpo': [211, 110, '#120d0a', 'buzz', 'long', '#6b3f20', 34],
  'Luka Doncic': [201, 104, '#3b2a1a', 'short', 'oval', '#e0ac69', 77],
  'Jayson Tatum': [203, 95, '#1c1410', 'buzz', 'oval', '#8d5524', 0],
  'Jaylen Brown': [198, 100, '#120d0a', 'buzz', 'square', '#6b3f20', 7],
  'Anthony Davis': [208, 101, '#1c1410', 'buzz', 'long', '#c68642', 3],
  'Joel Embiid': [213, 127, '#120d0a', 'buzz', 'oval', '#6b3f20', 21],
  'Kevin Durant': [208, 109, '#3b2a1a', 'buzz', 'long', '#6b3f20', 35],
  'Kyrie Irving': [188, 88, '#1c1410', 'short', 'oval', '#c68642', 11],
  'Damian Lillard': [188, 93, '#1c1410', 'buzz', 'square', '#8d5524', 0],
  'Jimmy Butler': [201, 105, '#120d0a', 'buzz', 'square', '#6b3f20', 22],
  'Bam Adebayo': [206, 116, '#120d0a', 'buzz', 'oval', '#6b3f20', 13],
  'Anthony Edwards': [193, 102, '#120d0a', 'short', 'square', '#6b3f20', 1],
  'Shai Gilgeous-Alexander': [198, 88, '#120d0a', 'braids', 'long', '#8d5524', 2],
  'Trae Young': [185, 74, '#3b2a1a', 'short', 'round', '#e0ac69', 11],
  'Devin Booker': [198, 104, '#3b2a1a', 'short', 'oval', '#e0ac69', 1],
  'Victor Wembanyama': [224, 95, '#3b2a1a', 'buzz', 'long', '#e0ac69', 1],
  'Rudy Gobert': [216, 117, '#120d0a', 'buzz', 'long', '#6b3f20', 27],
  'Draymond Green': [198, 104, '#1c1410', 'buzz', 'square', '#6b3f20', 23],
  'Kristaps Porzingis': [218, 109, '#6b4f2a', 'short', 'long', '#e0ac69', 8],
  'Jamal Murray': [193, 94, '#120d0a', 'short', 'oval', '#c68642', 27],
  'Tyrese Maxey': [191, 87, '#120d0a', 'buzz', 'round', '#6b3f20', 0],
  'Jalen Brunson': [190, 87, '#1c1410', 'short', 'round', '#c68642', 11],
  'Jrue Holiday': [193, 93, '#120d0a', 'buzz', 'oval', '#6b3f20', 4],
  'Austin Reaves': [196, 89, '#3b2a1a', 'short', 'oval', '#e0ac69', 15],
  'Domantas Sabonis': [211, 121, '#3b2a1a', 'short', 'oval', '#e0ac69', 11],
  "De'Aaron Fox": [191, 84, '#120d0a', 'buzz', 'long', '#8d5524', 5],
  'Derrick White': [193, 91, '#3b2a1a', 'short', 'oval', '#e0ac69', 9]
};

const HAIR = ['#120d0a', '#1c1410', '#3b2a1a', '#6b4f2a', '#a97038', '#2b1d12'];
const SKIN = ['#e0ac69', '#c68642', '#8d5524', '#6b3f20', '#f1c27d'];
const STYLES = ['buzz', 'short', 'curly', 'braids'];
const FACES = ['oval', 'round', 'square', 'long'];

export function playerProfile(player) {
  const exact = STAR_PROFILE[player.name];
  if (exact) {
    const [heightCm, weightKg, hairColor, hairStyle, faceShape, skin, jersey] = exact;
    return { heightCm, weightKg, hairColor, hairStyle, faceShape, skin, jersey, curated: true };
  }
  const r = seededRandom(hashSeed('profile-' + (player.id || player.name)));
  const big = player.pos === 'C' || player.pos === 'PF';
  const base = big ? 201 : player.pos === 'SF' ? 198 : 190;
  return {
    heightCm: Math.round(base + (r() - 0.5) * 14),
    weightKg: Math.round((big ? 105 : 92) + (r() - 0.5) * 22),
    hairColor: HAIR[Math.floor(r() * HAIR.length)],
    hairStyle: STYLES[Math.floor(r() * STYLES.length)],
    faceShape: FACES[Math.floor(r() * FACES.length)],
    skin: SKIN[Math.floor(r() * SKIN.length)],
    jersey: 1 + Math.floor(r() * 55),
    curated: false
  };
}

export function enrichTeams(teams) {
  return teams.map(team => ({
    ...team,
    players: team.players.map(p => ({ ...p, ...playerProfile(p) }))
  }));
}
