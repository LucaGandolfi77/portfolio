import { useGameActions } from '../hooks/useGameActions'
import { useStore } from './UIOverlay'

const ActionButtons = () => {
  const { attack, interact, dodge, toggleMenu, toggleInventory } = useGameActions()
  const isAttacking = useStore((s) => s.isAttacking)
  const isDodging = useStore((s) => s.isDodging)

  const buttonStyle = (active: boolean = false) => ({
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    background: active ? 'rgba(244,184,96,0.4)' : 'rgba(0,0,0,0.5)',
    color: 'white',
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none' as const,
    transition: 'transform 0.1s, background 0.2s',
    boxShadow: active ? '0 0 15px rgba(244,184,96,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
  })

  const labelStyle = {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    marginTop: 4,
  }

  const keyHintStyle = {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    marginTop: 2,
    fontFamily: 'monospace',
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 30,
      right: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      pointerEvents: 'auto',
      zIndex: 10,
    }}>
      {/* Top row: Interact + Menu */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <button
            style={buttonStyle()}
            onPointerDown={interact}
            aria-label="Interact"
          >💬</button>
          <div style={labelStyle}>Interact</div>
          <div style={keyHintStyle}>E</div>
        </div>
        <div>
          <button
            style={buttonStyle()}
            onPointerDown={toggleMenu}
            aria-label="Menu"
          >☰</button>
          <div style={labelStyle}>Menu</div>
          <div style={keyHintStyle}>Esc</div>
        </div>
      </div>

      {/* Bottom row: Attack */}
      <div>
        <button
          style={buttonStyle(isAttacking)}
          onPointerDown={attack}
          aria-label="Attack"
        >⚔️</button>
        <div style={labelStyle}>Attack</div>
        <div style={keyHintStyle}>Space</div>
      </div>

      {/* Dodge (left side) */}
      <div style={{ position: 'absolute', bottom: 0, left: -80 }}>
        <button
          style={buttonStyle(isDodging)}
          onPointerDown={dodge}
          aria-label="Dodge"
        >🛡️</button>
        <div style={labelStyle}>Dodge</div>
        <div style={keyHintStyle}>Tab</div>
      </div>

      {/* Inventory (far left) */}
      <div style={{ position: 'absolute', bottom: 0, left: -160 }}>
        <button
          style={buttonStyle()}
          onPointerDown={toggleInventory}
          aria-label="Inventory"
        >🎒</button>
        <div style={labelStyle}>Items</div>
        <div style={keyHintStyle}>I</div>
      </div>
    </div>
  )
}

export default ActionButtons
