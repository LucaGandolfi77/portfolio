import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { I18nContext, makeT, makeTp } from './context'
import type { Lang } from './strings'

const STORAGE_KEY = 'pixel-stretch-lang'

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'it' || saved === 'en') return saved
  } catch {}
  return navigator.language.startsWith('it') ? 'it' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangRaw] = useState<Lang>(getInitialLang)

  const setLang = useCallback((l: Lang) => {
    setLangRaw(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
    document.documentElement.lang = l
  }, [])

  const t = useMemo(() => makeT(lang), [lang])
  const tp = useMemo(() => makeTp(lang), [lang])

  const value = useMemo(() => ({ lang, setLang, t, tp }), [lang, setLang, t, tp])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
