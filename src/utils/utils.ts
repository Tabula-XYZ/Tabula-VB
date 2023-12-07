
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