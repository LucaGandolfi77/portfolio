import { type ReactNode } from 'react'
import { I18nProvider } from './i18n/I18nProvider'

export function renderWithI18n(ui: ReactNode) {
  return <I18nProvider>{ui}</I18nProvider>
}
