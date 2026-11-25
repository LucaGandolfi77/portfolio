import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { useI18n } from '../i18n/context'
import { useLayerStore } from '../store/layerStore'

export function ZoomControls() {
  const { zoom, zoomIn, zoomOut, resetView } = useLayerStore()
  const { t } = useI18n()

  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={zoomOut} title="Zoom out (-)">
        <ZoomOut size={16} />
      </button>
      <span className="zoom-level">{Math.round(zoom * 100)}%</span>
      <button className="zoom-btn" onClick={zoomIn} title="Zoom in (+)">
        <ZoomIn size={16} />
      </button>
      <div className="zoom-separator" />
      <button className="zoom-btn" onClick={resetView} title={t('zoomFit')}>
        <Maximize size={16} />
      </button>
    </div>
  )
}