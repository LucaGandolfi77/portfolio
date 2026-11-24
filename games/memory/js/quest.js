/** quest.js — progressione della campagna (puro). */

import { QUESTS, findQuest } from './config.js';
import { starRating } from './core.js';

export function isQuestUnlocked(questId, save = {}) {
  const index = QUESTS.findIndex((quest) => quest.id === questId);
  if (index <= 0) return true;
  const previous = QUESTS[index - 1];
  return (save.stars && save.stars[previous.id] || 0) > 0;
}

export function questStars(questId, game) {
  const quest = findQuest(questId);
  return starRating(game.score, quest.stars);
}

export function nextQuestId(questId) {
  const index = QUESTS.findIndex((quest) => quest.id === questId);
  return index >= 0 && index < QUESTS.length - 1 ? QUESTS[index + 1].id : null;
}

export function questStats(save = {}) {
  const stars = save.stars || {};
  const completed = QUESTS.filter((quest) => (stars[quest.id] || 0) > 0).length;
  const total = QUESTS.reduce((sum, quest) => sum + (stars[quest.id] || 0), 0);
  return { completed, total, max: QUESTS.length * 3, ratio: total / (QUESTS.length * 3) };
}

export function questGoalLabel(quest) {
  if (quest.goal === 'moves') return `${quest.target} moves or fewer`;
  if (quest.goal === 'combo') return `combo ×${quest.target}`;
  return 'Complete the board';
}

export function meetsQuestGoal(quest, game) {
  if (quest.goal === 'moves') return game.moves <= quest.target;
  if (quest.goal === 'combo') return game.bestCombo >= quest.target;
  return true;
}
