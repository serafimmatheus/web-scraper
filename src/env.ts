import { z } from 'zod'

const schemaEnv = z.object({
  EMAIL_HOST: z.string(),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  EMAIL_USER_NAME: z.string(),
  EMAIL_PASSWORD: z.string(),
})

export const env = schemaEnv.parse(process.env)
