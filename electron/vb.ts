import { Browser, BrowserContext, BrowserContextOptions } from "playwright";
import { CONTEXT_PREFIX, IFingerprintData, IProxy, SOCIAL_DOMAIN } from "../src/types";
import { getChromePath, isBase64, isFilePath, logToFile, removeCharactersBeforeUnderscore, testProxy } from "./utils";
import { chromium } from "playwright-extra";
import { isObject } from "lodash";
import { IBrowserState } from "../src/types2";

const { FingerprintInjector } = require('fingerprint-injector');

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = require('puppeteer-extra-plugin-stealth')()
chromium.use(stealth)

export class VB {

    private browser: Browser | null = null
    private context: BrowserContext | null = null
    private browserSettings: {
      proxy?: IProxy;
      fingerprint?: IFingerprintData;
      context_str?: string;
      chrome_path?: string;
    } | null = null
  
    constructor(){}
  
    get = () => {
      return {
        browser: () => this.browser,
        browserPath: async () => {
          try {
            return await getChromePath()
          } catch (e){
            logToFile(`Error: ${e}`)
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
          const url  = pages[0].url()
        

          let contextPrefix = ''
          for (const domain in CONTEXT_PREFIX){
            if (url.includes(domain)){
              contextPrefix = CONTEXT_PREFIX[domain as SOCIAL_DOMAIN]
              break
            }
          }

          const s: IBrowserState = {
            context_base64: contextPrefix+ Buffer.from(JSON.stringify(state)).toString('base64'),
            current_url: pages[0].url(),
            chrome_path: this.browserSettings?.chrome_path || '',
            connected: browser.isConnected(),
            window: {
              width: pages[0]?.viewportSize()?.width || 0,
              height: pages[0]?.viewportSize()?.height || 0,
            },
            fingerprint: this.browserSettings?.fingerprint,
            proxy: this.browserSettings?.proxy,
            has_context: !!this.browserSettings?.context_str,
          } 
          return s
        }
      }
    }
  
    public close = async () => {
      const browser = this.get().browser()
      if (browser){
        browser.removeAllListeners()
        browser.close()
        this.browser = null;
        this.browserSettings = null;
        this.context = null;
      }
    }
  
    public start = async (browserOptions?: {
      proxy?: IProxy;
      fingerprint?: IFingerprintData;
      context_str?: string;
      browser_path?: string;
    }) => {
      const { proxy, fingerprint, context_str, browser_path } = browserOptions || {};
  
      if (this.browser) {
        return `Browser already started`;
      }
  
      const CHROME_BIN_PATH = browser_path || await this.get().browserPath()
      if (!isFilePath(CHROME_BIN_PATH)) {
        return `Error: ${CHROME_BIN_PATH}`;
      }
  
      if (proxy) {
        const ok = await testProxy(proxy.ip, proxy.port, proxy.username, proxy.password);
        if (ok === false)
          return `Error: Proxy ${proxy.ip}:${proxy.port} is not working`;
        if (ok !== true) 
          return ok;
      }
  
      try {
        let proxyOpt: any = undefined
        if (proxy){
          proxyOpt = proxy ? {
            server: `http://${proxy.ip}:${proxy.port}`,
            username: proxy.username,
            password: proxy.password
          } : undefined;
        }
        const browser = await chromium.launch({
          headless: false,
          executablePath: CHROME_BIN_PATH,
          proxy: proxyOpt
        });
        this.browser = browser;
      } catch (e) {
        logToFile(`Error: ${e}`)
        return `Error: ${e}`;
      }
      this.browser.once('disconnected', async () => {
        this.browser?.removeAllListeners()
        this.browser = null;
        this.browserSettings = null;
        this.context = null;
      });
  
      const opt: BrowserContextOptions = {
        bypassCSP: true
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
        if (fingerPrintValid){
          await fingerprintInjector.attachFingerprintToPlaywright(context, fingerprint as any);
        }
        this.context = context;
        const page = await context.newPage();
        await page.goto('https://google.com');
      } catch (e) {
        logToFile(`Error: ${e}`)
        return `Error: ${e}`;
      }
  
      this.browserSettings = {
        proxy,
        fingerprint,
        context_str,
        chrome_path: CHROME_BIN_PATH
      }
  
      return null;
    };
  }