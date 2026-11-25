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
import { OnboardingTutorial } from './components/OnboardingTutorial'
import { InstallBanner } from './components/InstallBanner'
import { useLayerStore } from './store/layerStore'
import { useI18n } from './i18n/context'
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
function useToolHints(): Partial<Record<Tool, string>> {
  const { t } = useI18n()
  return {
    select: t('mobileHintSelect'),
    move: t('mobileHintMove'),
    zoom: t('mobileHintZoom'),
    'stretch-radial': t('mobileHintRadial'),
    'stretch-radial-full': t('mobileHintRadialFull'),
    'stretch-row': t('mobileHintRow'),
    'stretch-column': t('mobileHintColumn'),
    'stretch-mirror': t('mobileHintMirror'),
    twirl: t('mobileHintTwirl'),
    'stretch-warp': t('mobileHintWarp'),
    'warp-grid': t('mobileHintGrid'),
  }
}

function MobileToolHint() {
  const tool = useLayerStore(s => s.tool)
  const sourceLine = useLayerStore(s => s.sourceLine)
  const layers = useLayerStore(s => s.layers)
  const { t } = useI18n()
  const TOOL_HINTS = useToolHints()
  if (layers.length === 0) return null

  let text = TOOL_HINTS[tool] ?? ''
  if (sourceLine && (tool === 'stretch-row' || tool === 'stretch-column')) {
    const lineType = sourceLine.type === 'row' ? t('stretchRow') : t('stretchColumn')
    text = `${lineType} ${sourceLine.position} ${t('mobileSourceActive')}`
  }
  if (!text) return null

  return (
    <div className="mobile-tool-hint">
      <strong>{tool === 'stretch-row' || tool === 'stretch-column' ? t('mobileSourceLabel') : ''}</strong>
      {text}
    </div>
  )
}

export default function App() {
  useViewportHeight()
  usePasteHandler()
  const { layers } = useLayerStore()
  const [exportOpen, setExportOpen] = useState(false)
  const [resizeOpen, setResizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')

  // Close drawers when a modal opens
  useEffect(() => {
    if (exportOpen || resizeOpen || filterOpen) setMobilePanel('none')
  }, [exportOpen, resizeOpen, filterOpen])

  function usePasteHandler() {
  const { addLayer, setCanvasSize } = useLayerStore()
  const { t } = useI18n()

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (!file) return
          const img = new Image()
          const url = URL.createObjectURL(file)
          img.onload = () => {
            let w = img.width
            let h = img.height
            if (w > 2000 || h > 2000) {
              const scale = 2000 / Math.max(w, h)
              w = Math.round(w * scale)
              h = Math.round(h * scale)
            }
            const state = useLayerStore.getState()
            if (state.layers.length === 0) setCanvasSize({ width: w, height: h })
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0, w, h)
            addLayer(canvas, file.name.replace(/\.[^.]+$/, '') || t('uploaderPasted'))
            URL.revokeObjectURL(url)
          }
          img.src = url
          return
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addLayer, setCanvasSize, t])
}

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
      <OnboardingTutorial />
      <InstallBanner />
    </div>
  )
}
