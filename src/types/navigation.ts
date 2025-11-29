// src/types/navigation.ts

import { z } from "zod";

export const zNavigationItem: z.ZodType<{
  id: string | number;
  label: string;
  url: string;
  active?: boolean;
  children?: Array<{
    id: string | number;
    label: string;
    url: string;
    active?: boolean;
    children?: Array<unknown>;
  }>;
}> = z.object({
  id: z.string().or(z.number()),
  label: z.string(),
  url: z.string(),
  active: z.boolean().optional(),
  children: z.lazy(() => z.array(zNavigationItem)).optional(),
});

export const zNavigationResponse = z.object({
  items: z.array(zNavigationItem),
});

export type NavigationResponse = z.infer<typeof zNavigationResponse>;
export type NavigationItem = z.infer<typeof zNavigationItem>;
