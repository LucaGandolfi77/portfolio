import { useGameActions } from '../hooks/useGameActions'
import { useStore } from './UIOverlay'


const SkillBar = () => {
  const { castSkill } = useGameActions()
  const skills = useStore((s) => s.skills)
  const mana = useStore((s) => s.mana)

  const skillSlotStyle = (onCooldown: boolean, notEnoughMana: boolean) => ({
    width: 50,
    height: 50,
    borderRadius: 10,
    border: `2px solid ${onCooldown ? 'rgba(255,255,255,0.1)' : notEnoughMana ? 'rgba(255,100,100,0.5)' : 'rgba(255,255,255,0.3)'}`,
    background: onCooldown ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
    color: 'white',
    fontSize: 22,
    cursor: onCooldown ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    touchAction: 'none' as const,
    transition: 'transform 0.1s',
    opacity: onCooldown ? 0.6 : 1,
  })

  const cooldownOverlayStyle = (pct: number) => ({
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: `${pct}%`,
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '0 0 8px 8px',
    pointerEvents: 'none' as const,
  })

  const keyHintStyle = {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    marginTop: 3,
    fontFamily: 'monospace',
  }

  const keys = ['1', '2', '3', '4']

  return (
    <div style={{
      position: 'absolute',
      bottom: 30,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 10,
      pointerEvents: 'auto',
      zIndex: 10,
    }}>
      {skills.map((skill, i) => {
        const onCooldown = skill.currentCooldown > 0
        const notEnoughMana = mana < skill.manaCost
        const cooldownPct = onCooldown ? (skill.currentCooldown / skill.cooldown) * 100 : 0

        return (
          <div key={skill.id}>
            <button
              style={skillSlotStyle(onCooldown, notEnoughMana)}
              onPointerDown={() => !onCooldown && !notEnoughMana && castSkill(skill.id)}
              disabled={onCooldown || notEnoughMana}
              aria-label={skill.name}
            >
              {skill.icon}
              {onCooldown && <div style={cooldownOverlayStyle(cooldownPct)} />}
              {onCooldown && (
                <span style={{ position: 'absolute', fontSize: 10, color: 'white', zIndex: 1 }}>
                  {Math.ceil(skill.currentCooldown)}
                </span>
              )}
            </button>
            <div style={keyHintStyle}>{keys[i]}</div>
          </div>
        )
      })}
    </div>
  )
}

export default SkillBar
