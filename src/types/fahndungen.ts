// src/types/fahndungen.ts

import { z } from "zod";

export const zFahndungItem = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(["active", "archived", "solved"]).optional(),
  publishedAt: z.string().datetime().optional(),
  description: z.string().optional(),
  // TODO: weitere Felder gemäß A.8-Schema ergänzen (Bilder, Orte, Personenbeschreibung, etc.)
});

export const zFahndungenResponse = z.object({
  items: z.array(zFahndungItem),
  total: z.number().nonnegative().optional(),
  page: z.number().int().nonnegative().optional(),
  pageSize: z.number().int().positive().optional(),
  // meta, languages etc. können hier flacher normalisiert werden
});

export type FahndungenResponse = z.infer<typeof zFahndungenResponse>;
export type FahndungItem = z.infer<typeof zFahndungItem>;
