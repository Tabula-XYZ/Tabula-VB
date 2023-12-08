import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { Browser, BrowserContext, BrowserContextOptions, Page } from "playwright";
import { chromium } from 'playwright-extra'
import { getChromePath, isBase64, isFilePath, removeCharactersBeforeUnderscore, testProxy  } from './utils'
import { IFingerprintData, IProxy } from '../src/types';
import { isObject } from 'lodash';
const stealth = require('puppeteer-extra-plugin-stealth')()
chromium.use(stealth)
const { FingerprintInjector }  = require('fingerprint-injector');

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


class VB {

  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private browserSettings: {
    proxy?: IProxy;
    fingerprint?: IFingerprintData;
    context_str?: string;
  } | null = null


  constructor(){}

  get = () => {
    return {
      browser: () => this.browser,
      browserPath: async () => {
        try {
          return await getChromePath()
        } catch (e){
          return `Error: ${e}`
        }
      },
      context: () => this.context,
      browserState: async () => {
        const browser = this.get().browser()
        if (!browser){
          return null
        }
        const context = this.get().context()
        if (!context){
          return null
        }
        const pages = context.pages()
        if (!pages || !pages.length){
          return null
        }
        const state = await context.storageState()
        Buffer.from(JSON.stringify(state)).toString('base64')

        return {
          context_base64: Buffer.from(JSON.stringify(state)).toString('base64'),
          current_url: pages[0].url(),
          connected: browser.isConnected(),
          has_proxy: !!this.browserSettings?.proxy,
          has_fingerprint: !!this.browserSettings?.fingerprint,
          has_context: !!this.browserSettings?.context_str,
        }
      }
    }
  }

  private _start = async (browserOptions?: {
    proxy?: IProxy;
    fingerprint?: IFingerprintData;
    context_str?: string;
  }) => {
    const { proxy, fingerprint, context_str } = browserOptions || {};

    if (this.browser) {
      return `Browser already started`;
    }

    const CHROME_BIN_PATH = await this.get().browserPath();
    if (!isFilePath(CHROME_BIN_PATH)) {
      return `Error: ${CHROME_BIN_PATH}`;
    }

    if (proxy) {
      const ok = await testProxy(proxy.ip, proxy.port, proxy.username, proxy.password);
      if (!ok)
        return `Error: Proxy ${proxy.ip}:${proxy.port} is not working`;
    }

    try {
      const browser = await chromium.launch({
        headless: false,
        executablePath: CHROME_BIN_PATH,
      });
      this.browser = browser;
    } catch (e) {
      return `Error: ${e}`;
    }
    this.browser.once('disconnected', async () => {
      this.browser?.removeAllListeners()
      this.browser = null;
      this.browserSettings = null;
      this.context = null;
    });

    const proxyOpt = proxy ? {
      server: `${proxy.ip}:${proxy.port}`,
      username: proxy.username,
      password: proxy.password
    } : undefined;

    const opt: BrowserContextOptions = {
      bypassCSP: true,
      proxy: proxyOpt
    };

    let fingerPrintValid = false
    if (fingerprint){
        opt.userAgent = fingerprint.fingerprint.navigator.userAgent,
        opt.locale = fingerprint.fingerprint.navigator.language
        opt.viewport = fingerprint.fingerprint.screen
        fingerPrintValid = true
    }

    if (context_str){
        const parsedContextB64 = removeCharactersBeforeUnderscore(context_str)
        if (!isBase64(parsedContextB64)){
          return `Error: Invalid context`
        }
        const d1 = JSON.parse(Buffer.from(parsedContextB64, 'base64').toString())
        if (isObject(d1)){
            opt.storageState = d1 as any
        } else {
          return `Error: Invalid context`
        }
    }

    try {
      const context = await this.browser.newContext(opt);
      context.setDefaultTimeout(60000);
      const fingerprintInjector = new FingerprintInjector();
      if (fingerPrintValid)
          await fingerprintInjector.attachFingerprintToPlaywright(context, fingerprint);
      this.context = context;
      const page = await context.newPage();
      await page.goto('https://google.com');
    } catch (e) {
      return `Error: ${e}`;
    }

    this.browserSettings = {
      proxy,
      fingerprint,
      context_str
    }

    return null;
  };

  public get start() {
    return this._start;
  }
  public set start(value) {
    this._start = value;
  }
}


const vb = new VB()



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

  ipcMain.on('runvb', async (event, payload) => {
    const { fingerprint, proxy, context} = payload as any

    const err = await vb.start({
      fingerprint,
      proxy,
      context_str: context
    })

    event.reply('runvbreply', { error: err || null })
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
