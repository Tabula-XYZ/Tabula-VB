const fs = require('fs');
const path = require('path');
const util = require('util');
import axios from 'axios';
import { app } from 'electron'
const exec = util.promisify(require('child_process').exec);

function getChromePathWindows() {
    const chromePaths = [
        path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env.ProgramW6432, 'Google/Chrome/Application/chrome.exe')
    ];

    for (const chromePath of chromePaths) {
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }

    throw new Error('Chrome path not found');
}

function getChromePathLinux() {
    return new Promise((resolve, reject) => {
        exec("which google-chrome", (error: any, stdout: any) => {
            if (error) {
                reject(error);
                return;
            }
            const output = stdout.toString().trim();
            if (output) {
                resolve(output);
            } else {
                reject(new Error('Chrome path not found'));
            }
        });
    });
}

export function getChromePathMac() {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    if (fs.existsSync(chromePath)) {
        return chromePath;
    } else {
        throw new Error('Chrome path not found');
    }
}


export const getChromePath = () => {
    const os = require('os');

    let fntoCall;
    switch (os.platform()) {
        case 'win32':
            fntoCall = getChromePathWindows;
            break;
        case 'darwin':
            fntoCall = getChromePathMac;
            break;
        case 'linux':
            fntoCall = getChromePathLinux;
            break;
        default:
            throw new Error('Unsupported platform');
    }

    return fntoCall()
}

export function isFilePath(str: string) {
    // Define a regular expression pattern for file paths (adjust as needed)
    const filePathPattern = /^(\/|\.\.?\/|([A-Za-z]:)?[\\/])[^/]+(\/[^/]+)*$/;
  
    // Test the input string against the pattern
    return filePathPattern.test(str);
}


// execute a command and return the output ignoring errors
export async function execCommand(cmd: string) {
    const { stdout } = await exec(cmd);
    return stdout.trim();
  }


  export async function testProxy(ip: string, port:number, username: string, password: string, timeout = 5000) {
    // Configuration du proxy pour axios
    const proxyConfig = {
        host: ip,
        port: port,
        auth: username && password ? { username, password } : null
    };

    // Configuration de la requête axios
    const config: any = {
        proxy: proxyConfig,
        timeout: timeout,
        method: 'get',
        url: 'http://google.com'
    };

    try {
        const response = await axios(config);
        // Vérifier le code de réponse HTTP
        return response.status && response.status < 400;
    } catch (error) {
        logToFile(`Error: ${error}`);
        return false;
    }
}
  
export  function removeCharactersBeforeUnderscore(inputString: string): string {
    const parts = inputString.split('_');
    if (parts.length > 1) {
      // If there is an underscore, remove characters before it (including the underscore)
      return parts.slice(1).join('_');
    }
    // If there is no underscore, return the original string
    return inputString;
  }
  
  export function isBase64(str: string) {
    try {
        // Check if there's any character that doesn't belong to Base64
        return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && (str.length % 4 === 0);
    } catch (error) {
        return false;
    }
  }

export function logToFile(message: string) {
  const logPath = path.join(app.getPath('userData'), 'app.log');
  fs.appendFileSync(logPath, message + '\n');
}