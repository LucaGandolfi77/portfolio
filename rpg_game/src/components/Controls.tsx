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

      return () => {
        manager.destroy()
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