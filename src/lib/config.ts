// src/lib/config.ts

import { env } from "@/env";

export const t3ApiBaseUrl = env.T3_API_BASE_URL ?? env.TYPO3_BASE_URL;

if (!t3ApiBaseUrl) {
  throw new Error(
    "T3_API_BASE_URL is not set – check environment configuration."
  );
}
