export const sendIpcMessage = (channel:string, data: any) => {
    const { electron } = window as any;
    if (electron){
        electron.send(channel, data)
    } else {
        console.log('electron not available');
    }
};

export const trackIpcMessage = (channel: string, listener: (...args: any[]) => void) => {
    const { electron } = window as any;
    if (electron){
        electron.on(channel, listener)
    } else {
        console.log('electron not available');
    }
}

export function copyToClipboard(text: string) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
        return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    }
    catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        return false;
    }
    finally {
        document.body.removeChild(textarea);
    }
}