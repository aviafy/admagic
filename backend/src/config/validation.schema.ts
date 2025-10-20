import * as Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3001),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_KEY: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().optional(),
  CORS_ORIGIN: Joi.string().default("*"),
});
