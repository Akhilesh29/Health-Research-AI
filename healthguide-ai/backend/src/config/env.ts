import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

// Prefer `backend/.env.local` if present (common for fixing local secrets),
// otherwise fall back to `backend/.env`.
const envLocalPath = path.resolve(__dirname, '../../.env.local');
const envPath = path.resolve(__dirname, '../../.env');
const selectedEnvPath = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

dotenv.config({
  path: selectedEnvPath,
  override: true,
});

const envSchema = z
  .object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AI_MOCK: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  // AI providers (optional if AI_MOCK=true)
  GROQ_API_KEY: z.string().startsWith('gsk_').optional(),
  GROQ_MODEL: z.string().optional().default('llama-3.3-70b-versatile'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-').optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
})
  .superRefine((val, ctx) => {
    if (!val.AI_MOCK && !val.GROQ_API_KEY && !val.ANTHROPIC_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GROQ_API_KEY'],
        message: 'Provide GROQ_API_KEY or ANTHROPIC_API_KEY unless AI_MOCK=true',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
