declare const _default: () => {
    port: number;
    environment: string;
    supabase: {
        url: string;
        key: string;
    };
    openai: {
        apiKey: string;
    };
    gemini: {
        apiKey: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
};
export default _default;
