declare const _default: () => {
    port: number;
    environment: string;
    supabase: {
        url: string | undefined;
        key: string | undefined;
        jwtSecret: string | undefined;
    };
    openai: {
        apiKey: string | undefined;
    };
    gemini: {
        apiKey: string | undefined;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
};
export default _default;
