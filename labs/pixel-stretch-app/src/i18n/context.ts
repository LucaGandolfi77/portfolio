import { createContext, useContext } from 'react'
import STRINGS, { type Lang, type StringKey } from './strings'

export type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: StringKey) => string
  tp: (key: StringKey, params: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue>(null!)

export function useI18n() {
  return useContext(I18nContext)
}

export function makeT(lang: Lang) {
  const dict = STRINGS[lang]
  return (key: StringKey): string => dict[key] ?? key
}

export function makeTp(lang: Lang) {
  const dict = STRINGS[lang]
  return (key: StringKey, params: Record<string, string | number>): string => {
    let s: string = dict[key] ?? key
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
    return s
  }
}
