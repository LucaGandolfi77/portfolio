import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { PhaserGame } from './game/PhaserGame'
import UIOverlay from './components/UIOverlay'
import Controls from './components/Controls'

function App() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = PhaserGame('game-container')
    }
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div className="ui-layer" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <UIOverlay />
      <Controls />
    </div>
  )
}

export default App
