import { useLayerStore } from '../store/layerStore'
import { useI18n } from '../i18n/context'
import type { EasingCurve, BlendMode } from '../types'

export function StretchControls() {
  const { tool, blendMode, setBlendMode, easing, setEasing, symmetricStretch, setSymmetricStretch, sourceLine, clearSourceLine } = useLayerStore()
  const { t } = useI18n()

  const isStretchTool = tool === 'stretch-radial' || tool === 'stretch-radial-full' || tool === 'stretch-row' || tool === 'stretch-column' || tool === 'stretch-warp' || tool === 'stretch-mirror' || tool === 'twirl' || tool === 'warp-grid'
  const isZoom = tool === 'zoom'
  const isMove = tool === 'move'

  if (!isStretchTool && !isZoom && !isMove) return null

  return (
    <div className="stretch-controls">
      {isStretchTool && (
        <>
          <div className="blend-mode-toggle">
            <span className="blend-label">Blend Mode</span>
            <select
              value={blendMode}
              onChange={e => setBlendMode(e.target.value as BlendMode)}
              className="easing-select"
            >
              <option value="normal">{t('blendNormal')}</option>
              <option value="dissolve">{t('blendDissolve')}</option>
              <option value="screen">{t('blendScreen')}</option>
              <option value="multiply">{t('blendMultiply')}</option>
              <option value="overlay">{t('blendOverlay')}</option>
              <option value="difference">{t('blendDifference')}</option>
              <option value="lighten">{t('blendLighten')}</option>
              <option value="darken">{t('blendDarken')}</option>
            </select>
          </div>
          <div className="blend-mode-toggle">
            <span className="blend-label">Easing</span>
            <select
              value={easing}
              onChange={e => setEasing(e.target.value as EasingCurve)}
              className="easing-select"
            >
              <option value="linear">{t('easingLinear')}</option>
              <option value="exponential">{t('easingExponential')}</option>
              <option value="sine">{t('easingSine')}</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
        </>
      )}

      {(tool === 'stretch-row' || tool === 'stretch-column') && (
        <div className="blend-mode-toggle">
          <span className="blend-label">{t('stretchSymmetric')}</span>
          <button
            className={`toggle-btn ${symmetricStretch ? 'active' : ''}`}
            onClick={() => setSymmetricStretch(!symmetricStretch)}
          >
            {symmetricStretch ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {sourceLine && (tool === 'stretch-row' || tool === 'stretch-column') && (
        <div className="source-line-info">
          <span className="source-line-label">
            {t('stretchLineActive')} {sourceLine.type === 'row' ? t('stretchRow') : t('stretchColumn')} {sourceLine.position}
          </span>
          <button className="toggle-btn" onClick={clearSourceLine}>X</button>
        </div>
      )}

      {tool === 'stretch-radial' && (
        <div className="stretch-hint">
          <p><strong>{t('hintRadialTitle')}</strong></p>
          <p>{t('hintRadialDesc')}</p>
          <p className="hint-small">{t('hintRadialDetails')}</p>
        </div>
      )}

      {tool === 'stretch-radial-full' && (
        <div className="stretch-hint">
          <p><strong>{t('hintRadialFullTitle')}</strong></p>
          <p>{t('hintRadialFullDesc')}</p>
          <p className="hint-small">{t('hintRadialFullDetails')}</p>
        </div>
      )}

      {tool === 'stretch-row' && (
        <div className="stretch-hint">
          <p><strong>{t('hintRowTitle')}</strong></p>
          <p>{t('hintRowDesc')}</p>
          <p className="hint-small">{t('hintRowDetails')}</p>
        </div>
      )}

      {tool === 'stretch-column' && (
        <div className="stretch-hint">
          <p><strong>{t('hintColumnTitle')}</strong></p>
          <p>{t('hintColumnDesc')}</p>
          <p className="hint-small">{t('hintColumnDetails')}</p>
        </div>
      )}

      {tool === 'twirl' && (
        <div className="stretch-hint">
          <p><strong>{t('hintTwirlTitle')}</strong></p>
          <p>{t('hintTwirlDesc')}</p>
          <p className="hint-small">{t('hintTwirlDetails')}</p>
        </div>
      )}

      {tool === 'stretch-mirror' && (
        <div className="stretch-hint">
          <p><strong>{t('hintMirrorTitle')}</strong></p>
          <p>{t('hintMirrorDesc')}</p>
          <p className="hint-small">{t('hintMirrorDetails')}</p>
        </div>
      )}

      {tool === 'stretch-warp' && (
        <div className="stretch-hint">
          <p><strong>{t('hintWarpTitle')}</strong></p>
          <p>{t('hintWarpDesc')}</p>
          <p className="hint-small">{t('hintWarpDetails')}</p>
        </div>
      )}

      {tool === 'warp-grid' && (
        <div className="stretch-hint">
          <p><strong>{t('hintGridTitle')}</strong></p>
          <p>{t('hintGridDesc')}</p>
          <p className="hint-small">{t('hintGridDetails')}</p>
        </div>
      )}

      {isZoom && (
        <div className="stretch-hint">
          <p><strong>{t('hintZoomTitle')}</strong></p>
          <p>{t('hintZoomDesc')}</p>
          <p className="hint-small">Ctrl+Scroll = zoom graduale<br/>Ctrl+0 = reset vista</p>
        </div>
      )}

      {isMove && (
        <div className="stretch-hint">
          <p><strong>{t('hintMoveTitle')}</strong></p>
          <p>{t('hintMoveDesc')}</p>
          <p className="hint-small">{t('hintMoveDetails')}</p>
        </div>
      )}
    </div>
  )
}