import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'

const Controls = () => {
  const joystickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (joystickRef.current) {
      const manager = nipplejs.create({
        zone: joystickRef.current,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'white'
      })

      manager.on('move', (_, data) => {
        // Emit event to Phaser scene
        const event = new CustomEvent('joystick-move', { detail: data })
        window.dispatchEvent(event)
      })

      manager.on('end', () => {
        window.dispatchEvent(new CustomEvent('joystick-end'))
      })

      // Keyboard arrow key movement (desktop)
      const handleKeyDown = (e: KeyboardEvent) => {
        let vx = 0, vy = 0
        if (e.key === 'ArrowLeft') vx = -160
        if (e.key === 'ArrowRight') vx = 160
        if (e.key === 'ArrowUp') vy = -160
        if (e.key === 'ArrowDown') vy = 160
        if (vx || vy) {
          window.dispatchEvent(new CustomEvent('joystick-move', { detail: { vector: { x: vx / 160, y: vy / 160 } } }))
        }
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          window.dispatchEvent(new CustomEvent('joystick-end'))
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)

      return () => {
        manager.destroy()
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('keyup', handleKeyUp)
      }
    }
  }, [])

  return (
    <div
      ref={joystickRef}
      style={{
        position: 'absolute',
        bottom: 80,
        left: 80,
        width: 100,
        height: 100,
        touchAction: 'none' // Prevent scrolling
      }}
    />
  )
}

export default Controls
