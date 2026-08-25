// Pixel Stretch — Electron main process
// Serves the built app over a custom `app://` protocol that injects the
// COOP/COEP headers required for SharedArrayBuffer (ONNX/WASM background
// removal), which static hosting and file:// cannot provide.
'use strict'

const { app, BrowserWindow, protocol, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')

const SCHEME = 'app'

// Privileges must be registered before app is ready.
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
])

const DIST_DIR = path.join(__dirname, '..', 'dist')

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
}

function contentTypeFor(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function registerAppProtocol() {
  protocol.handle(SCHEME, async (request) => {
    const url = new URL(request.url)
    let pathname = decodeURIComponent(url.pathname)

    // Resolve to a file under dist; "/" and empty → index.html
    if (pathname === '/' || pathname === '') pathname = '/index.html'
    if (pathname.endsWith('/')) pathname += 'index.html'

    const filePath = path.normalize(path.join(DIST_DIR, pathname))
    // Prevent path traversal outside dist
    if (!filePath.startsWith(DIST_DIR + path.sep) && filePath !== DIST_DIR) {
      return new Response('Not found', { status: 404 })
    }

    try {
      const data = await fs.promises.readFile(filePath)
      return new Response(data, {
        headers: {
          'Content-Type': contentTypeFor(filePath),
          'Cache-Control': 'no-cache',
          // Enable cross-origin isolation so SharedArrayBuffer works
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'credentialless',
        },
      })
    } catch {
      // SPA fallback (e.g. deep links)
      try {
        const data = await fs.promises.readFile(path.join(DIST_DIR, 'index.html'))
        return new Response(data, {
          headers: {
            'Content-Type': 'text/html',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'credentialless',
          },
        })
      } catch {
        return new Response('Not found', { status: 404 })
      }
    }
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 420,
    minHeight: 560,
    backgroundColor: '#0d0d0d',
    title: 'Pixel Stretch',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in the system browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  const devUrl = process.env.PIXEL_STRETCH_DEV_URL
  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    win.loadURL(`${SCHEME}://index.html`)
  }
  return win
}

// ---- Native file dialogs (rendered side calls these via the preload API) ----

function mimeFromExt(name) {
  const ext = path.extname(name || '').toLowerCase()
  return MIME[ext] || 'application/octet-stream'
}

ipcMain.handle('dialog:openImage', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Apri immagine',
    properties: ['openFile'],
    filters: [
      { name: 'Immagini', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'avif'] },
      { name: 'Tutti i file', extensions: ['*'] },
    ],
  })
  if (canceled || filePaths.length === 0) return { canceled: true }
  const filePath = filePaths[0]
  const buf = await fs.promises.readFile(filePath)
  const dataUrl = `data:${mimeFromExt(filePath)};base64,${buf.toString('base64')}`
  return { canceled: false, dataUrl, name: path.basename(filePath), filePath }
})

ipcMain.handle('dialog:openProject', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Apri progetto Pixel Stretch',
    properties: ['openFile'],
    filters: [
      { name: 'Progetti Pixel Stretch', extensions: ['json'] },
      { name: 'Tutti i file', extensions: ['*'] },
    ],
  })
  if (canceled || filePaths.length === 0) return { canceled: true }
  const filePath = filePaths[0]
  const buf = await fs.promises.readFile(filePath)
  const dataUrl = `data:application/json;base64,${buf.toString('base64')}`
  return { canceled: false, dataUrl, name: path.basename(filePath), filePath }
})

ipcMain.handle('dialog:saveFile', async (_event, payload) => {
  const { defaultName = 'pixel-stretch.png', data, filters } = payload || {}
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Salva',
    defaultPath: defaultName,
    filters: filters && filters.length
      ? filters
      : [{ name: 'File', extensions: ['*'] }],
  })
  if (canceled || !filePath) return { canceled: true }
  await fs.promises.writeFile(filePath, Buffer.from(data))
  return { canceled: false, filePath }
})

app.whenReady().then(() => {
  registerAppProtocol()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
