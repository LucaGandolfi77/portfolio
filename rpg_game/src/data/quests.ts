export interface QuestObjective {
  id: string
  description: string
  type: 'kill' | 'collect' | 'interact' | 'reach'
  targetId: string
  targetCount: number
  currentCount: number
}

export interface Quest {
  id: string
  name: string
  description: string
  objectives: QuestObjective[]
  reward: {
    experience: number
    gold: number
    items?: { itemId: string; quantity: number }[]
  }
  completed: boolean
  active: boolean
}

export const QUESTS: Quest[] = [
  {
    id: 'tutorial',
    name: 'A New Adventure',
    description: 'Speak with the village elder to begin your journey.',
    objectives: [
      { id: 'talk_elder', description: 'Talk to Elder Aldric', type: 'interact', targetId: 'elder_aldric', targetCount: 1, currentCount: 0 },
    ],
    reward: { experience: 50, gold: 10 },
    completed: false,
    active: true,
  },
  {
    id: 'find_scroll',
    name: 'The Lost Scroll',
    description: 'Find the ancient scroll hidden in the dungeon.',
    objectives: [
      { id: 'find_scroll', description: 'Find the Ancient Scroll', type: 'collect', targetId: 'ancient_scroll', targetCount: 1, currentCount: 0 },
    ],
    reward: { experience: 100, gold: 25, items: [{ itemId: 'health_potion', quantity: 2 }] },
    completed: false,
    active: false,
  },
  {
    id: 'crystal_hunt',
    name: 'Crystal Collection',
    description: 'Collect 3 crystal shards from the caves.',
    objectives: [
      { id: 'collect_shards', description: 'Collect Crystal Shards (0/3)', type: 'collect', targetId: 'crystal_shard', targetCount: 3, currentCount: 0 },
    ],
    reward: { experience: 150, gold: 50, items: [{ itemId: 'iron_sword', quantity: 1 }] },
    completed: false,
    active: false,
  },
  {
    id: 'dragon_egg',
    name: 'Dragon egg',
    description: 'Retrieve the dragon egg from the mountain cave.',
    objectives: [
      { id: 'find_egg', description: 'Find the Dragon Egg', type: 'collect', targetId: 'dragon_egg', targetCount: 1, currentCount: 0 },
    ],
    reward: { experience: 300, gold: 100 },
    completed: false,
    active: false,
  },
]

export const getQuestById = (id: string) => QUESTS.find((q) => q.id === id)
export const getActiveQuests = () => QUESTS.filter((q) => q.active && !q.completed)
