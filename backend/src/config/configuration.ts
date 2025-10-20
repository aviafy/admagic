export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  environment: process.env.NODE_ENV || "development",
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
});
