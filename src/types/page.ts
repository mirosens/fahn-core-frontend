// src/types/page.ts

import { z } from "zod";

export const zPageResponse = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
  slug: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      robots: z.string().optional(),
    })
    .optional(),
  languages: z.array(z.string()).optional(),
});

export type PageResponse = z.infer<typeof zPageResponse>;
