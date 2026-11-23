/* Playbooks and coaching decisions (pure functions) */

export const PLAYBOOKS = {
  pickroll: { name: 'Pick & Roll', three: -0.04, assist: 0.16, turnover: -0.01, pace: 0 },
  horns: { name: 'Horns', three: 0.05, assist: 0.1, turnover: 0.01, pace: -2 },
  iso: { name: 'Isolation', three: -0.08, assist: -0.12, turnover: 0.01, pace: -4 },
  fastbreak: { name: 'Fast Break', three: -0.02, assist: 0.06, turnover: 0.03, pace: 8 },
  zonebuster: { name: 'Zone Buster', three: 0.1, assist: 0.12, turnover: -0.02, pace: -1 },
  bully: { name: 'Bully Ball', three: -0.12, assist: 0.04, turnover: -0.01, pace: -5 }
};

export const DEFENSES = {
  man: { name: 'Man-to-Man', fg: 0, three: 0, turnover: 0 },
  zone: { name: 'Zone', fg: -0.025, three: 0.03, turnover: -0.015 },
  press: { name: 'Full-Court Press', fg: 0.015, three: 0, turnover: 0.05 },
  switch: { name: 'Switch Everything', fg: -0.015, three: -0.01, turnover: 0.01 }
};

export const KEYS = Object.keys(PLAYBOOKS);

export function choosePlay(team, rng = Math.random, down = 0) {
  const style = (team.strategy && team.strategy.style) || 'balanced';
  const preference = {
    balanced: ['pickroll', 'horns', 'fastbreak', 'iso', 'zonebuster', 'bully'],
    perimeter: ['horns', 'zonebuster', 'pickroll', 'fastbreak', 'iso', 'bully'],
    paint: ['bully', 'pickroll', 'fastbreak', 'iso', 'horns', 'zonebuster'],
    pace: ['fastbreak', 'pickroll', 'horns', 'zonebuster', 'iso', 'bully']
  }[style] || KEYS;
  if (down >= 2) return preference[0];
  return preference[Math.floor(rng() * Math.min(4, preference.length))];
}

export function counterDefense(offense, defense, rng = Math.random) {
  if (offense === 'zonebuster') return 'zone';
  if (offense === 'fastbreak') return rng() < 0.5 ? 'press' : 'switch';
  if (offense === 'bully') return 'zone';
  if (offense === 'iso') return 'switch';
  return rng() < 0.6 ? 'man' : 'zone';
}

export function adjustments(team, diff, quarter) {
  const pace = team.strategy.pace;
  if (quarter >= 4 && diff < 0) return { pace: Math.min(100, pace + 14), threeRate: Math.min(100, team.strategy.threeRate + 12) };
  if (quarter >= 4 && diff > 10) return { pace: Math.max(20, pace - 16), threeRate: team.strategy.threeRate };
  return { pace, threeRate: team.strategy.threeRate };
}
