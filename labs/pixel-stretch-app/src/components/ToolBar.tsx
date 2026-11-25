import {
  MousePointer2,
  StretchHorizontal,
  AlignVerticalSpaceAround,
  ChevronsLeftRight,
  Move,
  Grid3x3,
  Waypoints,
  Search,
  FlipHorizontal,
  RefreshCw,
} from 'lucide-react'
import { useLayerStore } from '../store/layerStore'
import { useI18n } from '../i18n/context'
import type { Tool } from '../types'
import type { StringKey } from '../i18n/strings'

const tools: { id: Tool; labelKey: StringKey; icon: React.ReactNode }[] = [
  { id: 'select', labelKey: 'toolSelect', icon: <MousePointer2 size={18} /> },
  { id: 'move', labelKey: 'toolMove', icon: <Move size={18} /> },
  { id: 'zoom', labelKey: 'toolZoom', icon: <Search size={18} /> },
  { id: 'stretch-radial', labelKey: 'toolStretchRadial', icon: <StretchHorizontal size={18} /> },
  { id: 'stretch-radial-full', labelKey: 'toolStretchRadialFull', icon: <RefreshCw size={18} /> },
  { id: 'stretch-row', labelKey: 'toolStretchRow', icon: <AlignVerticalSpaceAround size={18} /> },
  { id: 'stretch-column', labelKey: 'toolStretchColumn', icon: <ChevronsLeftRight size={18} /> },
  { id: 'stretch-mirror', labelKey: 'toolStretchMirror', icon: <FlipHorizontal size={18} /> },
  { id: 'twirl', labelKey: 'toolTwirl', icon: <RefreshCw size={18} /> },
  { id: 'stretch-warp', labelKey: 'toolStretchWarp', icon: <Waypoints size={18} /> },
  { id: 'warp-grid', labelKey: 'toolWarpGrid', icon: <Grid3x3 size={18} /> },
]

export function ToolBar() {
  const { tool, setTool } = useLayerStore()
  const { t } = useI18n()

  return (
    <div className="toolbar">
      <div className="tool-group">
        {tools.map(item => (
          <button
            key={item.id}
            className={`tool-btn ${tool === item.id ? 'active' : ''}`}
            onClick={() => setTool(item.id)}
            title={t(item.labelKey)}
          >
            {item.icon}
            <span className="tool-label">{t(item.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}