import { IFingerprintData, IProxy } from "./types";

export interface IBrowserState { 
    context_base64: string;
    current_url: string;
    connected: boolean;
    chrome_path: string;
    window: {
        width: number;
        height: number;
    };
    has_context: boolean;
    fingerprint?: IFingerprintData
    proxy?: IProxy 
}