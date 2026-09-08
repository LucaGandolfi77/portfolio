import { useState, useEffect, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'
const STORAGE_KEY = 'pixel-stretch-theme'

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
  } catch {}
  return 'system'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.setAttribute('data-theme', resolved)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const cycle = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : t === 'light' ? 'system' : 'dark')
  }, [])

  const label = theme === 'dark' ? 'Tema scuro' : theme === 'light' ? 'Tema chiaro' : 'Tema di sistema'

  return (
    <button
      className="icon-btn"
      onClick={cycle}
      title={label}
      aria-label={label}
      style={{ fontSize: 12 }}
    >
      {theme === 'dark' ? <Moon size={16} /> : theme === 'light' ? <Sun size={16} /> : '💻'}
    </button>
  )
}
