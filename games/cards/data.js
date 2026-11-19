/* Card Collector — static game data */

export const RARITY = {
  common: { label: 'Common', color: '#9aa7b8', weight: 60, gems: 10 },
  rare: { label: 'Rare', color: '#4aa8ff', weight: 25, gems: 30 },
  epic: { label: 'Epic', color: '#b478ff', weight: 12, gems: 80 },
  legendary: { label: 'Legendary', color: '#ffd166', weight: 3, gems: 200 }
};

export const CARDS = Object.freeze([
  { id: 1, name: 'Fire Sprite', emoji: '🔥', rarity: 'common', attack: 10, defense: 8, description: 'A small spirit of fire.', specialPower: 'None', element: 'Fire', scopaValue: 2 },
  { id: 2, name: 'Water Drop', emoji: '💧', rarity: 'common', attack: 8, defense: 10, description: 'A droplet of pure water.', specialPower: 'None', element: 'Water', scopaValue: 2 },
  { id: 3, name: 'Leaf Spirit', emoji: '🍃', rarity: 'common', attack: 9, defense: 9, description: 'Protector of the small plants.', specialPower: 'None', element: 'Earth', scopaValue: 2 },
  { id: 4, name: 'Stone Golem', emoji: '🪨', rarity: 'common', attack: 7, defense: 12, description: 'A tough rock creature.', specialPower: 'None', element: 'Earth', scopaValue: 3 },
  { id: 5, name: 'Wind Wisp', emoji: '💨', rarity: 'common', attack: 11, defense: 7, description: 'Fast and elusive.', specialPower: 'None', element: 'Air', scopaValue: 3 },
  { id: 6, name: 'Snow Flake', emoji: '❄️', rarity: 'common', attack: 8, defense: 9, description: 'Cold to the touch.', specialPower: 'Freeze', element: 'Water', scopaValue: 3 },
  { id: 7, name: 'Spark', emoji: '⚡', rarity: 'common', attack: 12, defense: 6, description: 'A tiny electric shock.', specialPower: 'None', element: 'Air', scopaValue: 4 },
  { id: 8, name: 'Mushroom', emoji: '🍄', rarity: 'common', attack: 6, defense: 11, description: 'It might be poisonous.', specialPower: 'None', element: 'Earth', scopaValue: 4 },
  { id: 9, name: 'Phoenix Jr', emoji: '🐦‍🔥', rarity: 'rare', attack: 18, defense: 14, description: 'Will grow into a mighty bird.', specialPower: 'Bomb', element: 'Fire', scopaValue: 4 },
  { id: 10, name: 'Sea Serpent', emoji: '🐍', rarity: 'rare', attack: 16, defense: 16, description: 'Lurks in the deep.', specialPower: 'Water Strike', element: 'Water', scopaValue: 5 },
  { id: 11, name: 'Forest Guardian', emoji: '🌲', rarity: 'rare', attack: 14, defense: 18, description: 'Ancient protector.', specialPower: 'Thief', element: 'Earth', scopaValue: 5 },
  { id: 12, name: 'Crystal Mage', emoji: '🔮', rarity: 'rare', attack: 20, defense: 12, description: 'Master of crystals.', specialPower: 'Ice Wizard', element: 'Water', scopaValue: 6 },
  { id: 13, name: 'Shadow Cat', emoji: '🐈‍⬛', rarity: 'rare', attack: 17, defense: 15, description: 'Silent hunter.', specialPower: 'Stealth', element: 'Air', scopaValue: 6 },
  { id: 14, name: 'Star Dancer', emoji: '⭐', rarity: 'rare', attack: 15, defense: 17, description: 'Dances with the stars.', specialPower: 'Witch', element: 'Air', scopaValue: 7 },
  { id: 15, name: 'Dragon Whelp', emoji: '🐉', rarity: 'epic', attack: 28, defense: 22, description: 'Small but fierce.', specialPower: 'Fire Breath', element: 'Fire', scopaValue: 7 },
  { id: 16, name: 'Unicorn', emoji: '🦄', rarity: 'epic', attack: 24, defense: 26, description: 'Pure and magical.', specialPower: 'Heal Aura', element: 'Air', scopaValue: 8 },
  { id: 17, name: 'Demon Lord', emoji: '👿', rarity: 'epic', attack: 30, defense: 20, description: 'Ruler of the underworld.', specialPower: 'Dark Pact', element: 'Fire', scopaValue: 8 },
  { id: 18, name: 'Angel', emoji: '😇', rarity: 'epic', attack: 22, defense: 28, description: 'Divine messenger.', specialPower: 'Shield', element: 'Air', scopaValue: 9 },
  { id: 19, name: 'Kraken', emoji: '🦑', rarity: 'epic', attack: 26, defense: 24, description: 'Terror of the seas.', specialPower: 'Giant', element: 'Water', scopaValue: 9 },
  { id: 20, name: 'Ancient Dragon', emoji: '🐲', rarity: 'legendary', attack: 45, defense: 40, description: 'The oldest living creature.', specialPower: 'Cataclysm', element: 'Fire', scopaValue: 10 },
  { id: 21, name: 'God of Thunder', emoji: '⚡', rarity: 'legendary', attack: 50, defense: 35, description: 'Wields the power of storms.', specialPower: 'Thunderstrike', element: 'Air', scopaValue: 10 },
  { id: 22, name: 'World Tree', emoji: '🌳', rarity: 'legendary', attack: 35, defense: 50, description: 'Connects all worlds.', specialPower: "Nature's Wrath", element: 'Earth', scopaValue: 10 },
  { id: 23, name: 'Cosmic Entity', emoji: '🌌', rarity: 'legendary', attack: 42, defense: 43, description: 'Born from the stars.', specialPower: 'Black Hole', element: 'Air', scopaValue: 10 },
  { id: 24, name: 'Time Keeper', emoji: '⏳', rarity: 'legendary', attack: 40, defense: 45, description: 'Controls time itself.', specialPower: 'Time Stop', element: 'Water', scopaValue: 10 },
  { id: 25, name: 'Ninja Banana', emoji: '🍌', rarity: 'common', attack: 12, defense: 2, description: 'Potassium with a vengeance.', specialPower: 'Slip', element: 'Earth', scopaValue: 2 },
  { id: 26, name: 'Rubber Duck of Doom', emoji: '🦆', rarity: 'common', attack: 5, defense: 20, description: 'It stares into your soul.', specialPower: 'Squeak', element: 'Water', scopaValue: 2 },
  { id: 27, name: 'Lego Brick', emoji: '🧱', rarity: 'common', attack: 50, defense: 0, description: 'Step on it and you die.', specialPower: 'Critical Pain', element: 'Earth', scopaValue: 3 },
  { id: 28, name: 'Disco Skeleton', emoji: '🕺', rarity: 'rare', attack: 15, defense: 15, description: "He's got a bone to pick with the beat.", specialPower: 'Panic at the Disco', element: 'Earth', scopaValue: 4 },
  { id: 29, name: 'Spicy Burrito', emoji: '🌯', rarity: 'rare', attack: 22, defense: 5, description: 'Explosive flavor warning.', specialPower: 'Gas Cloud', element: 'Fire', scopaValue: 5 },
  { id: 30, name: 'The Glitch', emoji: '👾', rarity: 'rare', attack: 19, defense: 19, description: 'Err0r: D3scripti0n not f0und.', specialPower: 'Randomize', element: 'Air', scopaValue: 6 },
  { id: 31, name: 'WiFi Router', emoji: '📶', rarity: 'epic', attack: 10, defense: 35, description: 'Controls the flow of information.', specialPower: 'Disconnect', element: 'Air', scopaValue: 7 },
  { id: 32, name: 'Karen', emoji: '👱‍♀️', rarity: 'epic', attack: 32, defense: 10, description: 'Demands to speak to the manager.', specialPower: 'Scream', element: 'Fire', scopaValue: 8 },
  { id: 33, name: "Schrödinger's Cat", emoji: '📦', rarity: 'legendary', attack: 40, defense: 40, description: "Is it alive? Is it dead? It's both.", specialPower: 'Quantum State', element: 'Water', scopaValue: 10 },
  { id: 34, name: 'The Delete Button', emoji: '❌', rarity: 'legendary', attack: 99, defense: 1, description: 'The end of all code.', specialPower: 'Erase History', element: 'Air', scopaValue: 10 },
  { id: 35, name: 'Gingerbread Man', emoji: '🍪', rarity: 'common', attack: 12, defense: 4, description: 'Run, run, as fast as you can.', specialPower: 'Evasion', element: 'Earth', scopaValue: 2 },
  { id: 36, name: 'Frosty Snowman', emoji: '☃️', rarity: 'common', attack: 6, defense: 14, description: 'Came to life with a magic hat.', specialPower: 'Freeze', element: 'Water', scopaValue: 2 },
  { id: 37, name: 'Workshop Elf', emoji: '🧝', rarity: 'common', attack: 10, defense: 10, description: 'Works overtime in December.', specialPower: 'Craft', element: 'Earth', scopaValue: 3 },
  { id: 38, name: 'Nutcracker General', emoji: '💂', rarity: 'rare', attack: 22, defense: 12, description: 'Cracks shells and skulls.', specialPower: 'Snap', element: 'Earth', scopaValue: 4 },
  { id: 39, name: 'Rudolph', emoji: '🦌', rarity: 'rare', attack: 18, defense: 18, description: 'His nose guides the way.', specialPower: 'Flash', element: 'Air', scopaValue: 5 },
  { id: 40, name: 'Yule Log', emoji: '🪵', rarity: 'rare', attack: 5, defense: 30, description: 'Burns bright all night long.', specialPower: 'Warmth', element: 'Fire', scopaValue: 6 },
  { id: 41, name: 'The Grinchy Green', emoji: '💚', rarity: 'epic', attack: 28, defense: 20, description: 'Her heart is two sizes too small.', specialPower: 'Steal Gift', element: 'Air', scopaValue: 7 },
  { id: 42, name: 'Krampus', emoji: '👹', rarity: 'epic', attack: 33, defense: 15, description: 'Punisher of naughty children.', specialPower: 'Bag Kidnap', element: 'Fire', scopaValue: 8 },
  { id: 43, name: 'Santa Claus', emoji: '🎅', rarity: 'legendary', attack: 45, defense: 50, description: "He sees you when you're sleeping.", specialPower: 'Gift Rain', element: 'Air', scopaValue: 10 },
  { id: 44, name: 'Mrs. Claus', emoji: '🤶', rarity: 'legendary', attack: 40, defense: 55, description: 'The real boss of the North Pole.', specialPower: 'Cookies', element: 'Fire', scopaValue: 10 }
]);

export const BOXES = Object.freeze([
  { id: 'small', name: 'Small Box', emoji: '📦', cards: 3, goldPrice: 100, gemsPrice: 10 },
  { id: 'medium', name: 'Medium Box', emoji: '🎁', cards: 5, goldPrice: 250, gemsPrice: 25, guaranteedRare: true },
  { id: 'large', name: 'Large Box', emoji: '🎀', cards: 8, goldPrice: 500, gemsPrice: 50, guaranteedRare: true, guaranteedEpic: true },
  { id: 'mega', name: 'Mega Box', emoji: '👑', cards: 12, goldPrice: 1000, gemsPrice: 100, guaranteedRare: true, guaranteedEpic: true, guaranteedLegendary: true },
  { id: 'megamega', name: 'Mega Mega Pack', emoji: '🚀', cards: 25, goldPrice: 5000, gemsPrice: 500, guaranteedRare: true, guaranteedEpic: true, guaranteedLegendary: true },
  { id: 'tzeifala', name: 'Tzeifala Pack', emoji: '👹', cards: 100, goldPrice: 15000, gemsPrice: 1500, guaranteedLegendaryCount: 3 },
  { id: 'lisko', name: 'Lisko Pack', emoji: '🦎', cards: 5, goldPrice: 10000, gemsPrice: 1000, guaranteedLegendaryCount: 5 },
  { id: 'legendary', name: 'Legendary Single', emoji: '💎', cards: 1, goldPrice: 2000, gemsPrice: 200, guaranteedLegendary: true }
]);

export const WHEEL_SEGMENTS = Object.freeze([
  { label: '100 Gold', type: 'gold', amount: 100, color: '#e8b93b', weight: 30 },
  { label: '50 XP', type: 'xp', amount: 50, color: '#4aa8ff', weight: 28 },
  { label: 'Common', type: 'card', rarity: 'common', color: '#95a5a6', weight: 20 },
  { label: '500 Gold', type: 'gold', amount: 500, color: '#e07b39', weight: 10 },
  { label: 'Rare', type: 'card', rarity: 'rare', color: '#3498db', weight: 6 },
  { label: '50 Gems', type: 'gems', amount: 50, color: '#a98bff', weight: 3 },
  { label: 'Epic', type: 'card', rarity: 'epic', color: '#b478ff', weight: 2 },
  { label: 'Legendary', type: 'card', rarity: 'legendary', color: '#ffd166', weight: 1 }
]);

export const SLOT_SYMBOLS = Object.freeze([
  { id: 'gold', char: '💰', weight: 38, value: 1 },
  { id: 'shield', char: '🛡️', weight: 26, value: 2 },
  { id: 'sword', char: '⚔️', weight: 20, value: 3 },
  { id: 'gem', char: '💎', weight: 11, value: 5 },
  { id: 'wild', char: '🃏', weight: 5, value: 10 }
]);

export const CARD_BY_ID = Object.freeze(
  CARDS.reduce((map, card) => { map[card.id] = card; return map; }, {})
);
