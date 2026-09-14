import { useStore } from './UIOverlay'
import { SFX } from '../sounds/sfx'

const MenuOverlay = () => {
  const isMenuOpen = useStore((s) => s.isMenuOpen)
  const toggleMenu = () => useStore.setState({ isMenuOpen: false })
  const health = useStore((s) => s.health)
  const maxHealth = useStore((s) => s.maxHealth)
  const mana = useStore((s) => s.mana)
  const maxMana = useStore((s) => s.maxMana)
  const experience = useStore((s) => s.experience)
  const level = useStore((s) => s.level)
  const gold = useStore((s) => s.gold)
  const equipment = useStore((s) => s.equipment)
  
  if (!isMenuOpen) return null
  
  const buttonStyle = {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'left' as const,
    marginBottom: 8,
  }
  
  const statRow = (label: string, value: number, max: number, color: string) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      pointerEvents: 'auto',
    }}>
      <div style={{
        background: 'rgba(20,25,35,0.95)',
        border: '2px solid rgba(244,184,96,0.3)',
        borderRadius: 12,
        padding: 24,
        minWidth: 300,
      }}>
        <h2 style={{ margin: '0 0 16px', color: '#f4b860', fontFamily: 'Georgia, serif', textAlign: 'center' }}>Menu</h2>
        
        {/* Stats */}
        <div style={{ marginBottom: 16 }}>
          {statRow('❤️ Health', health, maxHealth, '#ee786d')}
          {statRow('💧 Mana', mana, maxMana, '#80a9e8')}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>⭐ Level {level}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>✨ XP {experience}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>💰 {gold}</span>
          </div>
        </div>
        
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
        
        {/* Equipment summary */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>Equipment</h3>
          {(['weapon', 'shield', 'armor', 'accessory'] as const).map((slot) => (
            <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              <span style={{ textTransform: 'capitalize' }}>{slot}</span>
              <span>{equipment[slot]?.name || '—'}</span>
            </div>
          ))}
        </div>
        
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
        
        {/* Menu buttons */}
        <button style={buttonStyle} onClick={() => { toggleMenu(); SFX.buttonClick() }}>Resume</button>
        <button style={buttonStyle} onClick={() => { 
          useStore.setState({ 
            health: useStore.getState().maxHealth, 
            mana: useStore.getState().maxMana 
          }); 
          SFX.heal(); 
        }}>Heal (Debug)</button>
        <button style={buttonStyle} onClick={() => {
          if (confirm('Reset all progress?')) {
            localStorage.removeItem('rpg_game_state')
            window.location.reload()
          }
        }}>Reset Progress</button>
        <button style={{ ...buttonStyle, marginTop: 8, textAlign: 'center' }} onClick={toggleMenu}>Close (Esc)</button>
      </div>
    </div>
  )
}

export default MenuOverlay
