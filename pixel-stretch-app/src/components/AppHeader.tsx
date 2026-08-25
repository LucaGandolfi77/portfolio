import { useRef } from 'react'
import { Download, Zap, Undo2, Redo2, RotateCcw, Maximize, Save, Upload, Blend, Wrench, Layers } from 'lucide-react'
import { useLayerStore } from '../store/layerStore'
import { getDesktop, dataUrlToFile } from '../desktop'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openProjectFile = async (file: File) => {
    setProcessing(true, 'Caricamento progetto...')
    try {
      await loadProject(file)
    } catch (err) {
      window.alert(`Impossibile caricare il progetto: ${err instanceof Error ? err.message : 'file non valido'}`)
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
          title="Strumenti"
          aria-label="Apri/chiudi strumenti"
        >
          <Wrench size={18} />
        </button>
        <button
          className={`nav-toggle ${rightOpen ? 'active' : ''}`}
          onClick={onToggleRight}
          title="Livelli"
          aria-label="Apri/chiudi livelli"
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
          title="Carica progetto"
        >
          <Upload size={16} />
        </button>
        <button
          className="btn"
          onClick={saveProject}
          disabled={layers.length === 0}
          title="Salva progetto"
        >
          <Save size={16} />
        </button>
        <button
          className="btn"
          onClick={onFilter}
          disabled={!activeLayerId}
          title="Filtri immagine"
        >
          <Blend size={16} />
        </button>
        <button
          className="btn"
          onClick={onResize}
          disabled={layers.length === 0}
          title="Ridimensiona canvas"
        >
          <Maximize size={16} />
        </button>
        <button
          className="btn"
          onClick={() => { if (window.confirm('Cancellare tutto e ricominciare da capo?')) resetAll() }}
          disabled={layers.length === 0}
          title="Reset tutto"
        >
          <RotateCcw size={16} />
        </button>
        <button
          className="btn"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Annulla (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="btn"
          onClick={redo}
          disabled={historyIndex < 0 || historyIndex >= history.length - 1}
          title="Ripristina (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
        <button
          className="btn btn-primary"
          onClick={onExport}
          disabled={layers.length === 0}
          title="Esporta immagine"
        >
          <Download size={16} />
          <span>Esporta</span>
        </button>
      </div>
    </header>
  )
}
