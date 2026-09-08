import { useState } from 'react'
import { X } from 'lucide-react'
import { useLayerStore } from '../store/layerStore'
import { brightnessContrast, saturation, gaussianBlur } from '../effects/imageFilters'
import { useI18n } from '../i18n/context'

type FilterType = 'brightness' | 'saturation' | 'blur'

interface Props {
  open: boolean
  onClose: () => void
}

export function FilterDialog({ open, onClose }: Props) {
  const { t } = useI18n()
  const { activeLayerId, layers, addLayer } = useLayerStore()
  const [filterType, setFilterType] = useState<FilterType>('brightness')
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [sat, setSat] = useState(0)
  const [blurRadius, setBlurRadius] = useState(1)

  if (!open) return null

  const activeLayer = layers.find(l => l.id === activeLayerId)
  if (!activeLayer) return null

  const handleApply = () => {
    let result: HTMLCanvasElement | null = null
    switch (filterType) {
      case 'brightness':
        result = brightnessContrast(activeLayer.canvas, brightness, contrast)
        break
      case 'saturation':
        result = saturation(activeLayer.canvas, sat)
        break
      case 'blur':
        result = gaussianBlur(activeLayer.canvas, blurRadius)
        break
    }
    if (result) {
      addLayer(result, `${activeLayer.name} - ${t('filterSuffix')}`)
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('filterTitle')}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="resize-mode-toggle">
            <button
              className={`toggle-btn ${filterType === 'brightness' ? 'active' : ''}`}
              onClick={() => setFilterType('brightness')}
            >
              {t('filterBrightness')}
            </button>
            <button
              className={`toggle-btn ${filterType === 'saturation' ? 'active' : ''}`}
              onClick={() => setFilterType('saturation')}
            >
              {t('filterSaturation')}
            </button>
            <button
              className={`toggle-btn ${filterType === 'blur' ? 'active' : ''}`}
              onClick={() => setFilterType('blur')}
            >
              {t('filterBlur')}
            </button>
          </div>

          {filterType === 'brightness' && (
            <>
              <label>{t('filterBrightnessLabel')} {brightness}</label>
              <input type="range" min={-100} max={100} value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="modal-slider" />
              <label>{t('filterContrastLabel')} {contrast}</label>
              <input type="range" min={-100} max={100} value={contrast} onChange={e => setContrast(Number(e.target.value))} className="modal-slider" />
            </>
          )}

          {filterType === 'saturation' && (
            <>
              <label>{t('filterSaturationLabel')} {sat}%</label>
              <input type="range" min={-100} max={100} value={sat} onChange={e => setSat(Number(e.target.value))} className="modal-slider" />
            </>
          )}

          {filterType === 'blur' && (
            <>
              <label>{t('filterRadiusLabel')} {blurRadius}px</label>
              <input type="range" min={1} max={20} value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))} className="modal-slider" />
            </>
          )}

          <button className="btn btn-primary btn-export" onClick={handleApply}>
            {t('filterApply')}
          </button>
        </div>
      </div>
    </div>
  )
}
