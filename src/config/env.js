const dotenv = require('dotenv');
const { z } = require('zod');
const logger = require('../utils/logger');

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.string().optional().default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required.'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required.'),
    JWT_EXPIRES_IN: z.string().optional().default('7d'),
    AI_PROVIDER: z.enum(['mock', 'openai']).optional().default('mock'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (value.AI_PROVIDER === 'openai' && !value.OPENAI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['OPENAI_API_KEY'],
        message: 'OPENAI_API_KEY is required when AI_PROVIDER is set to openai.'
      });
    }
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message
  }));
  logger.error({
    message: 'Environment validation failed.',
    errors
  });
  process.exit(1);
}

const env = {
  nodeEnv: result.data.NODE_ENV,
  port: result.data.PORT,
  mongoUri: result.data.MONGO_URI,
  jwtSecret: result.data.JWT_SECRET,
  jwtExpiresIn: result.data.JWT_EXPIRES_IN,
  aiProvider: result.data.AI_PROVIDER,
  openaiApiKey: result.data.OPENAI_API_KEY,
  openaiModel: result.data.OPENAI_MODEL
};

module.exports = env;
