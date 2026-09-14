import { create } from 'zustand'
import { SKILLS, type Skill } from '../data/skills'
import { ITEMS } from '../data/items'

interface InventoryItem {
  itemId: string
  quantity: number
}

interface Equipment {
  weapon: { id: string; name: string; icon: string; effect?: { type: string; value: number } } | null
  shield: { id: string; name: string; icon: string; effect?: { type: string; value: number } } | null
  armor: { id: string; name: string; icon: string; effect?: { type: string; value: number } } | null
  accessory: { id: string; name: string; icon: string; effect?: { type: string; value: number } } | null
}

export interface GameState {
  // Player stats
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  rupees: number
  gold: number
  experience: number
  level: number

  // Combat state
  isAttacking: boolean
  comboCount: number
  isDodging: boolean
  isShielded: boolean

  // Inventory
  inventory: InventoryItem[]
  equipment: Equipment

  // Skills
  skills: Skill[]
  activeSkillIndex: number

  // UI state
  isMenuOpen: boolean
  isInventoryOpen: boolean

  // Setters
  setHealth: (h: number) => void
  setMana: (m: number) => void
  addRupees: (r: number) => void
  addGold: (g: number) => void
  addXP: (xp: number) => void
  levelUp: () => void
  setComboCount: (c: number) => void
  setIsAttacking: (a: boolean) => void
  setIsDodging: (d: boolean) => void
  setIsShielded: (s: boolean) => void
  setActiveSkillIndex: (i: number) => void
  setIsMenuOpen: (o: boolean) => void
  setIsInventoryOpen: (o: boolean) => void
  addItem: (itemId: string, quantity?: number) => void
  removeItem: (itemId: string, quantity?: number) => void
  equipItem: (itemId: string) => void
  unequipItem: (slot: keyof Equipment) => void
  useSkill: (index: number) => void
  reduceSkillCooldowns: (dt: number) => void
}

const STARTER_INVENTORY: InventoryItem[] = [
  { itemId: 'health_potion', quantity: 3 },
  { itemId: 'wooden_sword', quantity: 1 },
  { itemId: 'wooden_shield', quantity: 1 },
]

export const useStore = create<GameState>((set, get) => ({
  // Player stats
  health: 3,
  maxHealth: 5,
  mana: 50,
  maxMana: 50,
  rupees: 0,
  gold: 100,
  experience: 0,
  level: 1,

  // Combat state
  isAttacking: false,
  comboCount: 0,
  isDodging: false,
  isShielded: false,

  // Inventory
  inventory: STARTER_INVENTORY,
  equipment: {
    weapon: null,
    shield: null,
    armor: null,
    accessory: null,
  },

  // Skills
  skills: SKILLS.map((s) => ({ ...s, currentCooldown: 0 })),
  activeSkillIndex: 0,

  // UI state
  isMenuOpen: false,
  isInventoryOpen: false,

  // Setters
  setHealth: (h) => set({ health: Math.max(0, Math.min(h, get().maxHealth)) }),
  setMana: (m) => set({ mana: Math.max(0, Math.min(m, get().maxMana)) }),

  addRupees: (r) => set((s) => ({ rupees: s.rupees + r })),
  addGold: (g) => set((s) => ({ gold: s.gold + g })),

  addXP: (xp) => {
    const state = get()
    const newXP = state.experience + xp
    if (newXP >= 100) {
      set({
        level: state.level + 1,
        maxHealth: state.maxHealth + 1,
        health: state.maxHealth + 1,
        mana: state.maxMana,
        experience: newXP - 100,
      })
    } else {
      set({ experience: newXP })
    }
  },

  levelUp: () =>
    set((s) => ({
      level: s.level + 1,
      maxHealth: s.maxHealth + 1,
      health: s.maxHealth + 1,
      mana: s.maxMana,
    })),

  setComboCount: (c) => set({ comboCount: c }),
  setIsAttacking: (a) => set({ isAttacking: a }),
  setIsDodging: (d) => set({ isDodging: d }),
  setIsShielded: (s) => set({ isShielded: s }),
  setActiveSkillIndex: (i) => set({ activeSkillIndex: i }),
  setIsMenuOpen: (o) => set({ isMenuOpen: o }),
  setIsInventoryOpen: (o) => set({ isInventoryOpen: o }),

  addItem: (itemId, quantity = 1) =>
    set((s) => {
      const existing = s.inventory.find((i) => i.itemId === itemId)
      if (existing) {
        return {
          inventory: s.inventory.map((i) =>
            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        }
      }
      return { inventory: [...s.inventory, { itemId, quantity }] }
    }),

  removeItem: (itemId, quantity = 1) =>
    set((s) => ({
      inventory: s.inventory
        .map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
        )
        .filter((i) => i.quantity > 0),
    })),

  equipItem: (itemId) => {
    const state = get()
    const itemData = ITEMS.find((i) => i.id === itemId)
    if (!itemData || !itemData.equipmentSlot) return
    const slot = itemData.equipmentSlot as keyof Equipment
    const equipped = state.equipment[slot]
    set({
      equipment: {
        ...state.equipment,
        [slot]: {
          id: itemData.id,
          name: itemData.name,
          icon: itemData.icon,
          effect: itemData.effect,
        },
      },
    })
    if (equipped) {
      get().addItem(equipped.id)
    }
    get().removeItem(itemId)
  },

  unequipItem: (slot) => {
    const state = get()
    const equipped = state.equipment[slot]
    if (!equipped) return
    get().addItem(equipped.id)
    set({
      equipment: {
        ...state.equipment,
        [slot]: null,
      },
    })
  },

  useSkill: (index) => {
    const state = get()
    const skill = state.skills[index]
    if (!skill || skill.currentCooldown > 0 || state.mana < skill.manaCost) return
    set({
      mana: state.mana - skill.manaCost,
      skills: state.skills.map((s, i) =>
        i === index ? { ...s, currentCooldown: s.cooldown } : s
      ),
    })
  },

  reduceSkillCooldowns: (dt) =>
    set((s) => ({
      skills: s.skills.map((skill) => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - dt),
      })),
    })),
}))

const UIOverlay = () => {
  const { health, maxHealth, mana, maxMana, gold, level, experience } = useStore()
  const xpPercent = (experience / 100) * 100

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        fontFamily: 'sans-serif',
        pointerEvents: 'none',
        fontSize: 14,
        color: 'white',
        textShadow: '2px 2px 0 #000',
      }}
    >
      {/* Health */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>❤️</span>
        <div
          style={{
            width: 120,
            height: 14,
            background: '#333',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #555',
          }}
        >
          <div
            style={{
              width: `${(health / maxHealth) * 100}%`,
              height: '100%',
              background: 'linear-gradient(180deg, #e44  #b22)',
              transition: 'width 0.2s',
            }}
          />
        </div>
        <span>{health}/{maxHealth}</span>
      </div>

      {/* Mana */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>💧</span>
        <div
          style={{
            width: 100,
            height: 14,
            background: '#333',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #555',
          }}
        >
          <div
            style={{
              width: `${(mana / maxMana) * 100}%`,
              height: '100%',
              background: 'linear-gradient(180deg, #48f, #22a)',
              transition: 'width 0.2s',
            }}
          />
        </div>
        <span>{mana}/{maxMana}</span>
      </div>

      {/* Gold */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>💰</span>
        <span>{gold}</span>
      </div>

      {/* Level + XP */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>Lv.{level}</span>
        <div
          style={{
            width: 60,
            height: 10,
            background: '#333',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #555',
          }}
        >
          <div
            style={{
              width: `${xpPercent}%`,
              height: '100%',
              background: 'linear-gradient(180deg, #fc0, #a80)',
              transition: 'width 0.2s',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default UIOverlay
