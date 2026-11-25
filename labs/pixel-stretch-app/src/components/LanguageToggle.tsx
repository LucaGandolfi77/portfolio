import { useI18n } from '../i18n/context'

export function LanguageToggle() {
  const { lang, setLang } = useI18n()

  return (
    <button
      className="icon-btn"
      onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
      title={lang === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
      aria-label={lang === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
      style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}
    >
      {lang === 'it' ? 'EN' : 'IT'}
    </button>
  )
}
