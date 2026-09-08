import { useCallback } from 'react'
import { useI18n } from '../i18n/context'
import { useLayerStore } from '../store/layerStore'

export function useBackgroundRemoval() {
  const { setProcessing } = useLayerStore()
  const { t, tp } = useI18n()

  const removeBackground = useCallback(
    async (sourceCanvas: HTMLCanvasElement, layerName: string) => {
      setProcessing(true, t('bgProcessingFast'))

      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          sourceCanvas.toBlob(
            b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
            'image/png'
          )
        })

        setProcessing(true, t('bgProcessingAI'))

        // Lazy-load the ~1MB+ SDK only when actually used (keeps first paint fast)
        const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal')

        const result = await imglyRemoveBackground(blob, {
          model: 'isnet',
          proxyToWorker: true,
          progress: (key: string, current: number, total: number) => {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0
            setProcessing(true, tp('bgDownloading', { key, pct }))
          },
        })

        setProcessing(true, t('bgCreating'))

        const img = await createImageBitmap(result)
        const out = document.createElement('canvas')
        out.width = img.width
        out.height = img.height
        const ctx = out.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        setProcessing(false)
        return { canvas: out, name: `${layerName} (${t('bgCutout')})` }
      } catch (err) {
        setProcessing(false)
        throw err
      }
    },
    [setProcessing, t, tp]
  )

  return { removeBackground }
}
