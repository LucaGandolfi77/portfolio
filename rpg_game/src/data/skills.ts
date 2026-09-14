export interface Skill {
  id: string
  name: string
  icon: string // emoji
  manaCost: number
  cooldown: number // seconds
  currentCooldown: number
  description: string
  damage?: number
  healAmount?: number
  duration?: number // seconds
  radius?: number // pixels
  type: 'offensive' | 'defensive' | 'utility' | 'heal'
}

export const SKILLS: Skill[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    icon: '🔥',
    manaCost: 15,
    cooldown: 5,
    currentCooldown: 0,
    description: 'Launch a fireball that explodes on impact',
    damage: 30,
    radius: 80,
    type: 'offensive',
  },
  {
    id: 'shield',
    name: 'Shield',
    icon: '🛡️',
    manaCost: 10,
    cooldown: 8,
    currentCooldown: 0,
    description: 'Create a protective barrier for 2 seconds',
    duration: 2,
    type: 'defensive',
  },
  {
    id: 'dash',
    name: 'Dash',
    icon: '💨',
    manaCost: 8,
    cooldown: 3,
    currentCooldown: 0,
    description: 'Quick dash forward with invincibility',
    duration: 0.5,
    type: 'utility',
  },
  {
    id: 'heal',
    name: 'Heal',
    icon: '💚',
    manaCost: 20,
    cooldown: 10,
    currentCooldown: 0,
    description: 'Restore 2 health points',
    healAmount: 2,
    type: 'heal',
  },
]

export const getSkillById = (id: string) => SKILLS.find((s) => s.id === id)
