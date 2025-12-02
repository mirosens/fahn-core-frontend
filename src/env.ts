import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    T3_API_BASE_URL: z.string().url(),
    TYPO3_BASE_URL: z.string().url().optional(),
    TYPO3_API_SECRET: z.string().min(1).optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_T3_API_BASE_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_T3_API_BASE_URL: process.env.NEXT_PUBLIC_T3_API_BASE_URL,
  },
});
