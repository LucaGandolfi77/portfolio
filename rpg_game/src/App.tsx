import { useEffect } from 'react'
import UIOverlay from './components/UIOverlay'
import Controls from './components/Controls'
import ActionButtons from './components/ActionButtons'
import SkillBar from './components/SkillBar'
import ComboIndicator from './components/ComboIndicator'
import Inventory from './components/Inventory'
import MenuOverlay from './components/MenuOverlay'
import { useGameActions } from './hooks/useGameActions'
import { useStore } from './components/UIOverlay'
import { initAudio } from './sounds/sfx'

function App() {
  const { attack, interact, castSkill, dodge, toggleMenu, toggleInventory } = useGameActions()
  const skills = useStore((s) => s.skills)
  const isMenuOpen = useStore((s) => s.isMenuOpen)
  const isInventoryOpen = useStore((s) => s.isInventoryOpen)

  useEffect(() => {
    // Initialize audio on first interaction
    const initOnInteraction = () => { initAudio(); document.removeEventListener('click', initOnInteraction); document.removeEventListener('touchstart', initOnInteraction) }
    document.addEventListener('click', initOnInteraction)
    document.addEventListener('touchstart', initOnInteraction)

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen || isInventoryOpen) {
        if (e.key === 'Escape') toggleMenu()
        if (e.key === 'i' || e.key === 'I') toggleInventory()
        return
      }
      switch (e.key) {
        case ' ': e.preventDefault(); attack(); break
        case 'e': case 'E': interact(); break
        case '1': castSkill(skills[0]?.id); break
        case '2': castSkill(skills[1]?.id); break
        case '3': castSkill(skills[2]?.id); break
        case '4': castSkill(skills[3]?.id); break
        case 'Tab': e.preventDefault(); dodge(); break
        case 'Escape': toggleMenu(); break
        case 'i': case 'I': toggleInventory(); break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', initOnInteraction)
      document.removeEventListener('touchstart', initOnInteraction)
    }
  }, [isMenuOpen, isInventoryOpen, skills])

  // localStorage persistence - save state every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useStore.getState()
      const saveData = {
        health: state.health, maxHealth: state.maxHealth,
        mana: state.mana, maxMana: state.maxMana,
        gold: state.gold, experience: state.experience, level: state.level,
        inventory: state.inventory, equipment: state.equipment,
        skills: state.skills,
      }
      localStorage.setItem('rpg_game_state', JSON.stringify(saveData))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rpg_game_state')
      if (saved) {
        const data = JSON.parse(saved)
        useStore.setState(data)
      }
    } catch (e) { /* ignore */ }
  }, [])

  // Save on state change (debounced)
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      const saveData = {
        health: state.health, maxHealth: state.maxHealth,
        mana: state.mana, maxMana: state.maxMana,
        gold: state.gold, experience: state.experience, level: state.level,
        inventory: state.inventory, equipment: state.equipment,
        skills: state.skills,
      }
      localStorage.setItem('rpg_game_state', JSON.stringify(saveData))
    })
    return unsub
  }, [])

  return (
    <div className="ui-layer" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <UIOverlay />
      <Controls />
      <ActionButtons />
      <SkillBar />
      <ComboIndicator />
      <Inventory />
      <MenuOverlay />
    </div>
  )
}

export default App
