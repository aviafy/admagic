"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || "3001", 10),
    environment: process.env.NODE_ENV || "development",
    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
        jwtSecret: process.env.SUPABASE_JWT_SECRET,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
    },
    jwt: {
        secret: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    },
});
//# sourceMappingURL=configuration.js.map