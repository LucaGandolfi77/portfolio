import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { useI18n } from '../i18n/context'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const STORAGE_KEY = 'pixel-stretch-install-dismissed'

export function InstallBanner() {
  const { canInstall, install } = useInstallPrompt()
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setDismissed(true)
    } catch {}
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  if (!canInstall || dismissed) return null

  return (
    <div className="install-banner">
      <div className="install-banner-text">
        <Download size={16} />
        <span><strong>{t('installTitle')}</strong> — {t('installDesc')}</span>
      </div>
      <div className="install-banner-actions">
        <button className="install-btn" onClick={install}>{t('installBtn')}</button>
        <button className="install-dismiss" onClick={dismiss} aria-label={t('installDismiss')}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
