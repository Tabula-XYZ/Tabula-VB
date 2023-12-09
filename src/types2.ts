interface IBrowserState { 
    context_base64: string;
    current_url: string;
    connected: boolean;
    window: {
        width: number;
        height: number;
    };
    has_proxy: boolean;
    has_fingerprint: boolean;
    has_context: boolean;
}