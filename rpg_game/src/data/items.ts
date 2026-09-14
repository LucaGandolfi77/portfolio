export type EquipmentSlot = 'weapon' | 'armor' | 'shield' | 'accessory'

export interface ItemEffect {
  type: 'heal' | 'mana' | 'attack' | 'defense'
  value: number
}

export interface Item {
  id: string
  name: string
  icon: string // emoji
  description: string
  type: 'consumable' | 'equipment' | 'quest' | 'material'
  effect?: ItemEffect
  equipmentSlot?: EquipmentSlot
}

export const ITEMS: Item[] = [
  {
    id: 'health_potion',
    name: 'Health Potion',
    icon: '🧪',
    description: 'Restores 1 health point',
    type: 'consumable',
    effect: { type: 'heal', value: 1 },
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    icon: '💧',
    description: 'Restores 10 mana',
    type: 'consumable',
    effect: { type: 'mana', value: 10 },
  },
  {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    icon: '🗡️',
    description: 'A basic wooden sword',
    type: 'equipment',
    equipmentSlot: 'weapon',
    effect: { type: 'attack', value: 2 },
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    icon: '⚔️',
    description: 'A sturdy iron blade',
    type: 'equipment',
    equipmentSlot: 'weapon',
    effect: { type: 'attack', value: 5 },
  },
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    icon: '🥋',
    description: 'Basic protection',
    type: 'equipment',
    equipmentSlot: 'armor',
    effect: { type: 'defense', value: 1 },
  },
  {
    id: 'iron_shield',
    name: 'Iron Shield',
    icon: '🛡️',
    description: 'Blocks incoming damage',
    type: 'equipment',
    equipmentSlot: 'shield',
    effect: { type: 'defense', value: 2 },
  },
  {
    id: 'ruby_ring',
    name: 'Ruby Ring',
    icon: '💍',
    description: 'A ring with a glowing ruby',
    type: 'equipment',
    equipmentSlot: 'accessory',
    effect: { type: 'attack', value: 3 },
  },
]

export const getItemById = (id: string) => ITEMS.find((i) => i.id === id)
