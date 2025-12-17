import { create } from 'zustand'

interface GameState {
  health: number
  rupees: number
  setHealth: (h: number) => void
}

export const useStore = create<GameState>((set) => ({
  health: 3,
  rupees: 0,
  setHealth: (h) => set({ health: h })
}))

const UIOverlay = () => {
  const { health, rupees } = useStore()

  return (
    <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 10, fontSize: '24px', textShadow: '2px 2px 0 #000' }}>
        <span>❤️ {health}</span>
        <span>💎 {rupees}</span>
      </div>
    </div>
  )
}

export default UIOverlay