import { useGameActions } from '../hooks/useGameActions'
import { useStore } from './UIOverlay'
import { getItemById } from '../data/items'

const Inventory = () => {
  const { useItem, equipItem, dropItem, toggleInventory } = useGameActions()
  const inventory = useStore((s) => s.inventory)
  const equipment = useStore((s) => s.equipment)
  const isInventoryOpen = useStore((s) => s.isInventoryOpen)
  
  if (!isInventoryOpen) return null
  
  const gridSlots = Array.from({ length: 24 }, (_, i) => inventory[i] || null)
  
  const slotStyle = (hasItem: boolean) => ({
    width: 50,
    height: 50,
    borderRadius: 6,
    border: `2px solid ${hasItem ? 'rgba(244,184,96,0.5)' : 'rgba(255,255,255,0.1)'}`,
    background: hasItem ? 'rgba(244,184,96,0.1)' : 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    cursor: hasItem ? 'pointer' : 'default',
    position: 'relative' as const,
    transition: 'border-color 0.2s',
  })
  
  const equipSlotStyle = (hasItem: boolean) => ({
    width: 55,
    height: 55,
    borderRadius: 8,
    border: `2px dashed ${hasItem ? 'rgba(104,194,177,0.6)' : 'rgba(255,255,255,0.15)'}`,
    background: hasItem ? 'rgba(104,194,177,0.1)' : 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  })
  
  const equipLabelStyle = {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    marginTop: 2,
  }
  
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
        minWidth: 400,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#f4b860', fontFamily: 'Georgia, serif', fontSize: 20 }}>Inventory</h2>
          <button
            onClick={toggleInventory}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}
          >✕</button>
        </div>
        
        {/* Equipment slots */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
          {(['weapon', 'shield', 'armor', 'accessory'] as const).map((slot) => (
            <div key={slot} style={{ textAlign: 'center' }}>
              <div style={equipSlotStyle(!!equipment[slot])}>
                {equipment[slot]?.icon || ''}
              </div>
              <div style={equipLabelStyle}>{slot}</div>
            </div>
          ))}
        </div>
        
        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
        
        {/* Inventory grid 6×4 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 50px)',
          gap: 6,
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          {gridSlots.map((item, i) => (
            <div
              key={i}
              style={slotStyle(!!item)}
              onClick={() => {
                if (!item) return
                const itemDef = getItemById(item.itemId)
                if (itemDef?.equipmentSlot) equipItem(i)
                else if (itemDef?.type === 'consumable') useItem(i)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                if (item) dropItem(i)
              }}
              title={item ? getItemById(item.itemId)?.name : 'Empty slot'}
            >
              {item && getItemById(item.itemId)?.icon}
              {item && item.quantity > 1 && (
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 4,
                  fontSize: 10,
                  color: 'white',
                  textShadow: '0 1px 2px black',
                }}>
                  {item.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Instructions */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
          Click to use/equip • Right-click to drop
        </div>
      </div>
    </div>
  )
}

export default Inventory
