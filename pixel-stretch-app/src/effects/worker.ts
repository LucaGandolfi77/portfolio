import { applyGridWarpPixels } from './gridWarp'
import {
  twirlEffectPixels,
  radialStretchPixels,
  radialStretchFullPixels,
  rowStretchPixels,
  columnStretchPixels,
  mirrorStretchPixels,
  selectionWarpPixels,
} from './pixelStretch'
import { gaussianBlurPixels } from './imageFilters'

type FnMap = Record<string, (...args: any[]) => Uint8ClampedArray>

const fns: FnMap = {
  applyGridWarp: (srcPixels, w, h, gridPoints, blendMode) =>
    applyGridWarpPixels(srcPixels, w, h, gridPoints, blendMode),
  twirlEffect: (srcPixels, w, h, cx, cy, intensity, blendMode, radius) =>
    twirlEffectPixels(srcPixels, w, h, cx, cy, intensity, blendMode, radius),
  gaussianBlur: (srcPixels, w, h, radius) =>
    gaussianBlurPixels(srcPixels, w, h, radius),
  radialStretch: (srcPixels, w, h, cx, cy, stretchH, stretchV, blendMode, easing) =>
    radialStretchPixels(srcPixels, w, h, cx, cy, stretchH, stretchV, blendMode, easing),
  radialStretchFull: (srcPixels, w, h, cx, cy, maxRadius, blendMode, easing) =>
    radialStretchFullPixels(srcPixels, w, h, cx, cy, maxRadius, blendMode, easing),
  rowStretch: (srcPixels, w, h, row, stretchUp, stretchDown, blendMode, easing) =>
    rowStretchPixels(srcPixels, w, h, row, stretchUp, stretchDown, blendMode, easing),
  columnStretch: (srcPixels, w, h, col, stretchLeft, stretchRight, blendMode, easing) =>
    columnStretchPixels(srcPixels, w, h, col, stretchLeft, stretchRight, blendMode, easing),
  mirrorStretch: (srcPixels, w, h, lineType, linePos, mirrorDist, blendMode) =>
    mirrorStretchPixels(srcPixels, w, h, lineType, linePos, mirrorDist, blendMode),
  selectionWarp: (srcPixels, w, h, selX, selY, selW, selH, dragX, dragY, blendMode) =>
    selectionWarpPixels(srcPixels, w, h, selX, selY, selW, selH, dragX, dragY, blendMode),
}

self.onmessage = (e: MessageEvent) => {
  const { id, fn, sourceData, width, height, args } = e.data as {
    id: number
    fn: string
    sourceData: ImageData
    width: number
    height: number
    args: any[]
  }

  try {
    const effectFn = fns[fn]
    if (!effectFn) {
      self.postMessage({ id, error: `Unknown function: ${fn}` })
      return
    }

    const resultPixels = effectFn(sourceData.data, width, height, ...args)
    const imageData = new ImageData(resultPixels.slice(), width, height)
    ;(self as any).postMessage({ id, imageData, width, height }, [imageData.data.buffer])
  } catch (err) {
    self.postMessage({ id, error: String(err) })
  }
}
