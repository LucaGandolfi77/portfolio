import { useRef } from 'react'
import { Download, Zap, Undo2, Redo2, RotateCcw, Maximize, Save, Upload, Blend, Wrench, Layers } from 'lucide-react'
import { useI18n } from '../i18n/context'
import { useLayerStore } from '../store/layerStore'
import { getDesktop, dataUrlToFile } from '../desktop'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

interface AppHeaderProps {
  onResize?: () => void
  onFilter?: () => void
  onExport?: () => void
  leftOpen?: boolean
  rightOpen?: boolean
  onToggleLeft?: () => void
  onToggleRight?: () => void
}

export function AppHeader({ onResize, onFilter, onExport, leftOpen, rightOpen, onToggleLeft, onToggleRight }: AppHeaderProps) {
  const { layers, activeLayerId, setProcessing, historyIndex, history, undo, redo, resetAll, saveProject, loadProject } = useLayerStore()
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openProjectFile = async (file: File) => {
    setProcessing(true, t('headerLoading'))
    try {
      await loadProject(file)
    } catch (err) {
      window.alert(`${t('headerLoadError')} ${err instanceof Error ? err.message : t('headerLoadErrorFallback')}`)
    }
    setProcessing(false)
  }

  const handleLoadClick = () => {
    const desktop = getDesktop()
    if (desktop) {
      void desktop.openProject().then(res => {
        if (!res.canceled && res.dataUrl) {
          void openProjectFile(dataUrlToFile(res.dataUrl, res.name || 'progetto.json'))
        }
      })
      return
    }
    fileInputRef.current?.click()
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <Zap size={24} />
        <h1>Pixel Stretch</h1>
      </div>
      <div className="header-nav">
        <button
          className={`nav-toggle ${leftOpen ? 'active' : ''}`}
          onClick={onToggleLeft}
          title={t('headerTools')}
          aria-label={t('headerToolsAria')}
        >
          <Wrench size={18} />
        </button>
        <button
          className={`nav-toggle ${rightOpen ? 'active' : ''}`}
          onClick={onToggleRight}
          title={t('headerLayers')}
          aria-label={t('headerLayersAria')}
        >
          <Layers size={18} />
        </button>
      </div>
      <div className="header-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={async e => {
            const file = e.target.files?.[0]
            if (file) await openProjectFile(file)
            e.target.value = ''
          }}
        />
        <button
          className="btn"
          onClick={handleLoadClick}
          title={t('headerLoadProject')}
        >
          <Upload size={16} />
        </button>
        <button
          className="btn"
          onClick={saveProject}
          disabled={layers.length === 0}
          title={t('headerSaveProject')}
        >
          <Save size={16} />
        </button>
        <button
          className="btn"
          onClick={onFilter}
          disabled={!activeLayerId}
          title={t('headerFilters')}
        >
          <Blend size={16} />
        </button>
        <button
          className="btn"
          onClick={onResize}
          disabled={layers.length === 0}
          title={t('headerResize')}
        >
          <Maximize size={16} />
        </button>
        <button
          className="btn"
          onClick={() => { if (window.confirm(t('headerResetConfirm'))) resetAll() }}
          disabled={layers.length === 0}
          title={t('headerReset')}
        >
          <RotateCcw size={16} />
        </button>
        <button
          className="btn"
          onClick={undo}
          disabled={historyIndex <= 0}
          title={t('headerUndo')}
        >
          <Undo2 size={16} />
        </button>
        <button
          className="btn"
          onClick={redo}
          disabled={historyIndex < 0 || historyIndex >= history.length - 1}
          title={t('headerRedo')}
        >
          <Redo2 size={16} />
        </button>
        <button
          className="btn btn-primary"
          onClick={onExport}
          disabled={layers.length === 0}
          title={t('headerExport')}
        >
          <Download size={16} />
          <span>{t('headerExportBtn')}</span>
        </button>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
