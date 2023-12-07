import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { Browser, BrowserContextOptions, Page } from "playwright";
import { chromium } from 'playwright-extra'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


const myBrowser = async () => {
  const CHROME_BIN_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  const browser = await chromium.launch({ headless: false,
      executablePath: CHROME_BIN_PATH,
  });
  const opt: BrowserContextOptions = {
    bypassCSP: true
    // proxy: proxyOpt
  }
  const context = await browser.newContext(opt)
  context.setDefaultTimeout(60_000);
  const page = await context.newPage()
  await page.goto('https://google.com')
}

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    },
    width: 800,
    height: 600,
    resizable: false, // Disable window resizing
  })

  ipcMain.on('googl', async (event, payload) => {
    // const { fingerprint, proxy} = payload as any
    // await myBrowser()
    event.reply('googlreply', { message: 'pong' })


});

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
