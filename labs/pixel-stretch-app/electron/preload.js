// Pixel Stretch — Electron preload
// Exposes a minimal, safe API to the renderer for native file dialogs.
'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pixelStretchDesktop', {
  isDesktop: true,
  /** Save bytes via the native save dialog. */
  saveFile: (payload) => ipcRenderer.invoke('dialog:saveFile', payload),
  /** Pick an image with the native open dialog → { canceled, dataUrl, name }. */
  openImage: () => ipcRenderer.invoke('dialog:openImage'),
  /** Pick a .json project → { canceled, dataUrl, name }. */
  openProject: () => ipcRenderer.invoke('dialog:openProject'),
})
