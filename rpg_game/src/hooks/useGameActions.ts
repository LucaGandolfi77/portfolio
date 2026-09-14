import { useCallback, useRef } from 'react'
import { useStore } from '../components/UIOverlay'
import { SFX } from '../sounds/sfx'
import { getSkillById } from '../data/skills'
import { getItemById } from '../data/items'

export const useGameActions = () => {
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAttackRef = useRef<number>(0)

  // Attack action with combo system
  const attack = useCallback(() => {
    const now = Date.now()
    const state = useStore.getState()

    if (state.isAttacking || state.isDodging) return

    // Combo logic
    let newCombo = state.comboCount
    if (now - lastAttackRef.current < 3000) {
      newCombo = Math.min(newCombo + 1, 3) // max 3-hit combo
    } else {
      newCombo = 1
    }

    lastAttackRef.current = now
    useStore.setState({ isAttacking: true, comboCount: newCombo })

    // Calculate damage based on combo level
    const baseDamage = state.equipment.weapon?.effect?.value || 0
    const comboDamage = newCombo === 1 ? 10 : newCombo === 2 ? 15 : 25
    const totalDamage = comboDamage + baseDamage

    // Play appropriate SFX
    if (newCombo === 1) SFX.attackSlash()
    else if (newCombo === 2) SFX.attackHit()
    else { SFX.attackHeavy(); SFX.comboComplete() }

    // Emit attack event to Phaser
    window.dispatchEvent(new CustomEvent('game-attack', { detail: { damage: totalDamage, combo: newCombo } }))

    // End attack after animation
    setTimeout(() => {
      useStore.setState({ isAttacking: false })
    }, newCombo === 1 ? 300 : newCombo === 2 ? 400 : 500)

    // Reset combo after 3 seconds of no attacks
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => {
      useStore.setState({ comboCount: 0 })
    }, 3000)
  }, [])

  // Interact action
  const interact = useCallback(() => {
    if (useStore.getState().isAttacking || useStore.getState().isDodging) return
    SFX.doorOpen()
    window.dispatchEvent(new CustomEvent('game-interact'))
  }, [])

  // Skill action
  const castSkill = useCallback((skillId: string) => {
    const state = useStore.getState()
    if (state.isAttacking || state.isDodging) return

    const skill = getSkillById(skillId)
    if (!skill) return

    // Check cooldown
    const skillIndex = state.skills.findIndex((s) => s.id === skillId)
    if (skillIndex === -1) return
    const currentSkill = state.skills[skillIndex]
    if (currentSkill.currentCooldown > 0) return

    // Check mana
    if (state.mana < skill.manaCost) return

    // Consume mana and set cooldown
    const newSkills = [...state.skills]
    newSkills[skillIndex] = { ...currentSkill, currentCooldown: skill.cooldown }
    useStore.setState({ mana: state.mana - skill.manaCost, skills: newSkills })

    // Play SFX
    if (skillId === 'fireball') SFX.fireball()
    else if (skillId === 'shield') SFX.shield()
    else if (skillId === 'dash') SFX.dash()
    else if (skillId === 'heal') SFX.heal()

    // Emit skill event to Phaser
    window.dispatchEvent(new CustomEvent('game-skill', { detail: { skillId, ...skill } }))

    // Apply heal locally
    if (skill.healAmount) {
      useStore.setState({ health: Math.min(state.health + skill.healAmount, state.maxHealth) })
    }

    // Cooldown timer
    const interval = setInterval(() => {
      const s = useStore.getState()
      const i = s.skills.findIndex((sk) => sk.id === skillId)
      if (i === -1) return clearInterval(interval)
      const sk = s.skills[i]
      if (sk.currentCooldown <= 0) { clearInterval(interval); return }
      const newSk = [...s.skills]
      newSk[i] = { ...sk, currentCooldown: Math.max(0, sk.currentCooldown - 0.1) }
      useStore.setState({ skills: newSk })
    }, 100)
  }, [])

  // Dodge action
  const dodge = useCallback(() => {
    const state = useStore.getState()
    if (state.isAttacking || state.isDodging) return
    SFX.dash()
    useStore.setState({ isDodging: true })
    window.dispatchEvent(new CustomEvent('game-dodge'))
    setTimeout(() => { useStore.setState({ isDodging: false }) }, 500)
  }, [])

  // Use item from inventory
  const useItem = useCallback((slotIndex: number) => {
    const state = useStore.getState()
    const item = state.inventory[slotIndex]
    if (!item) return

    const itemDef = getItemById(item.itemId)
    if (!itemDef) return

    if (itemDef.type === 'consumable' && itemDef.effect) {
      if (itemDef.effect.type === 'heal') {
        useStore.setState({ health: Math.min(state.health + itemDef.effect.value, state.maxHealth) })
        SFX.heal()
      } else if (itemDef.effect.type === 'mana') {
        useStore.setState({ mana: Math.min(state.mana + itemDef.effect.value, state.maxMana) })
        SFX.heal()
      }

      // Remove one from stack
      const newInventory = [...state.inventory]
      if (item.quantity > 1) {
        newInventory[slotIndex] = { ...item, quantity: item.quantity - 1 }
      } else {
        newInventory.splice(slotIndex, 1)
      }
      useStore.setState({ inventory: newInventory })
    }
  }, [])

  // Equip item
  const equipItem = useCallback((slotIndex: number) => {
    const state = useStore.getState()
    const item = state.inventory[slotIndex]
    if (!item) return

    const itemDef = getItemById(item.itemId)
    if (!itemDef || !itemDef.equipmentSlot) return

    const slot = itemDef.equipmentSlot
    const currentEquipped = state.equipment[slot]

    // Swap equipment
    const newEquipment = { ...state.equipment, [slot]: itemDef }
    const newInventory = [...state.inventory]

    // Remove new item from inventory
    newInventory.splice(slotIndex, 1)

    // If something was equipped, put it back in inventory
    if (currentEquipped) {
      newInventory.push({ itemId: currentEquipped.id, quantity: 1 })
    }

    useStore.setState({ equipment: newEquipment, inventory: newInventory })
    SFX.buttonClick()

    // Emit equipment change to Phaser for visual update
    window.dispatchEvent(new CustomEvent('game-equip', { detail: { slot, item: itemDef } }))
  }, [])

  // Drop item
  const dropItem = useCallback((slotIndex: number) => {
    const state = useStore.getState()
    const item = state.inventory[slotIndex]
    if (!item) return

    SFX.itemDrop()
    const newInventory = [...state.inventory]
    newInventory.splice(slotIndex, 1)
    useStore.setState({ inventory: newInventory })
  }, [])

  // Toggle menu
  const toggleMenu = useCallback(() => {
    const state = useStore.getState()
    useStore.setState({ isMenuOpen: !state.isMenuOpen })
    if (!state.isMenuOpen) SFX.menuOpen()
    else SFX.menuClose()
  }, [])

  // Toggle inventory
  const toggleInventory = useCallback(() => {
    const state = useStore.getState()
    useStore.setState({ isInventoryOpen: !state.isInventoryOpen })
    if (!state.isInventoryOpen) SFX.menuOpen()
    else SFX.menuClose()
  }, [])

  return {
    attack,
    interact,
    castSkill,
    dodge,
    useItem,
    equipItem,
    dropItem,
    toggleMenu,
    toggleInventory,
  }
}
