import { useStore } from './UIOverlay'

const ComboIndicator = () => {
  const comboCount = useStore((s) => s.comboCount)

  if (comboCount <= 0) return null

  const comboColors = ['', '#f4b860', '#ee786d', '#c084fc'] // 1=gold, 2=red, 3=purple
  const comboLabels = ['', 'SLASH!', 'HEAVY!', 'FINISHER!']

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 20,
      textAlign: 'center',
      animation: 'comboPulse 0.3s ease-out',
    }}>
      <div style={{
        fontSize: 48,
        fontWeight: 900,
        color: comboColors[comboCount] || '#f4b860',
        textShadow: '0 0 20px rgba(244,184,96,0.8), 0 2px 4px rgba(0,0,0,0.5)',
        fontFamily: 'Georgia, serif',
        lineHeight: 1,
      }}>
        {comboCount}x
      </div>
      <div style={{
        fontSize: 16,
        fontWeight: 800,
        color: comboColors[comboCount] || '#f4b860',
        textShadow: '0 0 10px rgba(244,184,96,0.6)',
        letterSpacing: '0.1em',
        marginTop: 4,
      }}>
        {comboLabels[comboCount]}
      </div>
    </div>
  )
}

export default ComboIndicator
