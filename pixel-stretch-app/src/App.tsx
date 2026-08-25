import { useState, useEffect } from 'react'
import { AppHeader } from './components/AppHeader'
import { Canvas } from './components/Canvas'
import { LayerPanel } from './components/LayerPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { ToolBar } from './components/ToolBar'
import { StretchControls } from './components/StretchControls'
import { ZoomControls } from './components/ZoomControls'
import { ImageUploader } from './components/ImageUploader'
import { ExportDialog } from './components/ExportDialog'
import { CanvasResizeDialog } from './components/CanvasResizeDialog'
import { FilterDialog } from './components/FilterDialog'
import { BackgroundRemovalSection } from './components/BackgroundRemovalSection'
import { useLayerStore } from './store/layerStore'
import type { Tool } from './types'

function useViewportHeight() {
  useEffect(() => {
    const sync = () => {
      const h = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${h}px`)
    }
    sync()
    window.visualViewport?.addEventListener('resize', sync)
    window.visualViewport?.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    return () => {
      window.visualViewport?.removeEventListener('resize', sync)
      window.visualViewport?.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])
}

type MobilePanel = 'none' | 'left' | 'right'

/** Compact on-canvas instructions for mobile (the side panels are drawers). */
const TOOL_HINTS: Partial<Record<Tool, string>> = {
  select: 'Tocca un livello per selezionarlo, trascina per spostarlo',
  move: 'Trascina per spostare la vista — pizzica per lo zoom',
  zoom: 'Tocca per ingrandire — pizzica per lo zoom',
  'stretch-radial': 'Trascina dal punto da stirare (orizzontale e verticale)',
  'stretch-radial-full': 'Tocca il centro, poi trascina per impostare il raggio',
  'stretch-row': '1) Tocca per scegliere la riga  2) Trascina per stirare',
  'stretch-column': '1) Tocca per scegliere la colonna  2) Trascina per stirare',
  'stretch-mirror': 'Tocca il punto sorgente, poi trascina per specchiare',
  twirl: 'Tocca il centro, trascina per impostare l\u2019intensit\u00e0',
  'stretch-warp': 'Trascina per selezionare l\u2019area da distorcere',
  'warp-grid': 'Trascina i punti di controllo, poi Applica Warp',
}

function MobileToolHint() {
  const tool = useLayerStore(s => s.tool)
  const sourceLine = useLayerStore(s => s.sourceLine)
  const layers = useLayerStore(s => s.layers)
  if (layers.length === 0) return null

  let text = TOOL_HINTS[tool] ?? ''
  if (sourceLine && (tool === 'stretch-row' || tool === 'stretch-column')) {
    text = `${sourceLine.type === 'row' ? 'Riga' : 'Colonna'} ${sourceLine.position} attiva — trascina per stirare (tocca altrove per cambiarla)`
  }
  if (!text) return null

  return (
    <div className="mobile-tool-hint">
      <strong>{tool === 'stretch-row' || tool === 'stretch-column' ? 'Sorgente: ' : ''}</strong>
      {text}
    </div>
  )
}

export default function App() {
  useViewportHeight()
  const { layers } = useLayerStore()
  const [exportOpen, setExportOpen] = useState(false)
  const [resizeOpen, setResizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')

  // Close drawers when a modal opens
  useEffect(() => {
    if (exportOpen || resizeOpen || filterOpen) setMobilePanel('none')
  }, [exportOpen, resizeOpen, filterOpen])

  const togglePanel = (panel: 'left' | 'right') =>
    setMobilePanel(p => (p === panel ? 'none' : panel))

  return (
    <div className="app">
      <AppHeader
        onResize={() => setResizeOpen(true)}
        onFilter={() => setFilterOpen(true)}
        onExport={() => setExportOpen(true)}
        leftOpen={mobilePanel === 'left'}
        rightOpen={mobilePanel === 'right'}
        onToggleLeft={() => togglePanel('left')}
        onToggleRight={() => togglePanel('right')}
      />
      <div className="app-body">
        <div className={`sidebar sidebar-left ${mobilePanel === 'left' ? 'open' : ''}`}>
          <ToolBar />
          <StretchControls />
          <BackgroundRemovalSection />
        </div>

        <div className="main-area">
          {layers.length === 0 ? <ImageUploader /> : <Canvas />}
          {layers.length > 0 && <ZoomControls />}
          <MobileToolHint />
        </div>

        <div className={`sidebar sidebar-right ${mobilePanel === 'right' ? 'open' : ''}`}>
          <LayerPanel />
          <HistoryPanel />
        </div>
      </div>
      <div
        className={`sidebar-backdrop ${mobilePanel !== 'none' ? 'open' : ''}`}
        onClick={() => setMobilePanel('none')}
      />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <CanvasResizeDialog open={resizeOpen} onClose={() => setResizeOpen(false)} />
      <FilterDialog open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}
