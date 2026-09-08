import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/context'

const STORAGE_KEY = 'pixel-stretch-onboarded'
const STEPS = [
  { icon: '📷', keyStep: 'onboardStep1Title', keyDesc: 'onboardStep1Desc' },
  { icon: '🎨', keyStep: 'onboardStep2Title', keyDesc: 'onboardStep2Desc' },
  { icon: '✨', keyStep: 'onboardStep3Title', keyDesc: 'onboardStep3Desc' },
  { icon: '💾', keyStep: 'onboardStep4Title', keyDesc: 'onboardStep4Desc' },
] as const

export function OnboardingTutorial() {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  if (!show) return null

  return (
    <div className="onboarding-overlay" onClick={dismiss}>
      <div className="onboarding-card" onClick={e => e.stopPropagation()}>
        <div className="onboarding-icon">{STEPS[step].icon}</div>
        <h2>{t(STEPS[step].keyStep)}</h2>
        <p>{t(STEPS[step].keyDesc)}</p>
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="onboarding-actions">
          {step > 0 && (
            <button className="onboarding-btn secondary" onClick={() => setStep(s => s - 1)}>
              {t('onboardBack')}
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="onboarding-btn primary" onClick={() => setStep(s => s + 1)}>
              {t('onboardNext')}
            </button>
          ) : (
            <button className="onboarding-btn primary" onClick={dismiss}>
              {t('onboardStart')}
            </button>
          )}
        </div>
        <button className="onboarding-skip" onClick={dismiss}>
          {t('onboardSkip')}
        </button>
      </div>
    </div>
  )
}
