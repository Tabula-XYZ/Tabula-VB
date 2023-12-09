import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { chromium } from 'playwright-extra'
import { isFilePath } from './utils'
import { VB } from './vb';
const stealth = require('puppeteer-extra-plugin-stealth')()
chromium.use(stealth)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const vb = new VB()

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({

    icon: path.join(process.env.VITE_PUBLIC, 'images/logo.png'),
    title: "Tabula VB",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    },
    width: 400,
    height: 500,
    resizable: false, // Disable window resizing
  })

  ipcMain.on('runvb', async (event, payload) => {
    const { fingerprint, proxy, context, path} = payload as any

    const err = await vb.start({
      fingerprint,
      proxy,
      context_str: context,
      browser_path: path
    })

    event.reply('runvbreply', { error: err || null })
  });

  ipcMain.on('getvbstate', async (event) => {
    const state = await vb.get().browserState()
    event.reply('getvbstatereply', { state })
  })

  ipcMain.on('getpath', async (event) => {
    const r = await vb.get().browserPath()
    let path: string | null = null
    let error: string | null = null
    if (isFilePath(r)){
      path = r
    } else{
      error = r
    }

    event.reply('getpathreply', { error, path })
  })

  ipcMain.on('closevb', async (event) => {
    vb.close()
    event.reply('closevbreply', { error: null })
  })



  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
