/**
 * Desktop (Electron) integration.
 *
 * The Electron preload exposes `window.pixelStretchDesktop` when the app runs
 * inside the desktop shell. Everything here feature-detects so the web build
 * (GitHub Pages / iPhone) keeps using browser downloads and file inputs.
 */

export interface DesktopSaveOptions {
  defaultName: string
  data: ArrayBuffer
  filters?: { name: string; extensions: string[] }[]
}

export interface DesktopOpenResult {
  canceled: boolean
  dataUrl?: string
  name?: string
  filePath?: string
}

export interface PixelStretchDesktopAPI {
  isDesktop: boolean
  saveFile: (payload: DesktopSaveOptions) => Promise<{ canceled: boolean; filePath?: string }>
  openImage: () => Promise<DesktopOpenResult>
  openProject: () => Promise<DesktopOpenResult>
}

declare global {
  interface Window {
    pixelStretchDesktop?: PixelStretchDesktopAPI
  }
}

export function getDesktop(): PixelStretchDesktopAPI | undefined {
  return window.pixelStretchDesktop
}

export function isDesktop(): boolean {
  return !!window.pixelStretchDesktop?.isDesktop
}

export function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, b64] = dataUrl.split(',')
  const mime = /data:(.*?);/.exec(meta)?.[1] || 'application/octet-stream'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new File([bytes], name, { type: mime })
}
