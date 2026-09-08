import { useCallback, useRef } from 'react'
import { useI18n } from '../i18n/context'
import { useLayerStore } from '../store/layerStore'

let pipelineInstance: any = null

function webgpuSupported(): boolean {
  // Safari < 18 and some webviews lack WebGPU — fall back to WASM.
  return typeof navigator !== 'undefined' && !!navigator.gpu
}

async function getPipeline() {
  if (!pipelineInstance) {
    const { pipeline, RawImage } = await import('@huggingface/transformers')
    let pipe
    if (webgpuSupported()) {
      try {
        pipe = await pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
          device: 'webgpu',
        })
      } catch {
        pipe = await pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
          device: 'wasm',
        })
      }
    } else {
      pipe = await pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
        device: 'wasm',
      })
    }
    pipelineInstance = { pipe, RawImage }
  }
  return pipelineInstance
}

export function useBackgroundRemovalTransformers() {
  const { setProcessing } = useLayerStore()
  const { t } = useI18n()
  const abortRef = useRef(false)

  const removeBackground = useCallback(
    async (sourceCanvas: HTMLCanvasElement, layerName: string) => {
      abortRef.current = false
      setProcessing(true, t('bgPreciseLoading'))

      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          sourceCanvas.toBlob(
            b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
            'image/png'
          )
        })

        setProcessing(true, t('bgPreciseAnalysis'))

        const { pipe, RawImage } = await getPipeline()
        if (abortRef.current) throw new Error(t('bgPreciseCancelled'))

        const image = await RawImage.fromBlob(blob)
        const result = await pipe(image)

        if (abortRef.current) throw new Error(t('bgPreciseCancelled'))

        setProcessing(true, t('bgCreating'))

        const outCanvas = document.createElement('canvas')
        outCanvas.width = result.width
        outCanvas.height = result.height
        const ctx = outCanvas.getContext('2d')!

        const imageData = result.toCanvas()
        ctx.drawImage(imageData, 0, 0)

        setProcessing(false)
        return { canvas: outCanvas, name: `${layerName} (${t('bgPreciseCutout')})` }
      } catch (err: any) {
        setProcessing(false)
        if (err?.message === t('bgPreciseCancelled')) return null
        throw err
      }
    },
    [setProcessing, t]
  )

  return { removeBackground }
}
