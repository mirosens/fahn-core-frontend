// src/lib/typo3Client.ts

import { t3Fetch } from "./t3Fetch";
import { ApiError } from "./api-error";
import {
  zNavigationResponse,
  type NavigationResponse,
} from "@/types/navigation";
import {
  zFahndungenResponse,
  type FahndungenResponse,
} from "@/types/fahndungen";
import type { ZodType } from "zod";

export const typo3Client = {
  async getNavigation(): Promise<NavigationResponse> {
    const data = await t3Fetch<unknown>("/navigation");
    return parseWithSchema(zNavigationResponse, data, "NAVIGATION");
  },

  async getFahndungen(params?: URLSearchParams): Promise<FahndungenResponse> {
    const path = params ? `/fahndungen?${params.toString()}` : "/fahndungen";
    const data = await t3Fetch<unknown>(path);
    return parseWithSchema(zFahndungenResponse, data, "FAHNDUNGEN_LIST");
  },

  async getFahndungById(
    id: string
  ): Promise<FahndungenResponse["items"][number]> {
    const data = await t3Fetch<unknown>(
      `/fahndungen/${encodeURIComponent(id)}`
    );
    const parsed = parseWithSchema(
      zFahndungenResponse,
      data,
      "FAHNDUNG_DETAIL"
    );

    const item = parsed.items?.[0];
    if (!item) {
      throw new ApiError({
        message: `Fahndung ${id} not found in response`,
        code: "FAHNDUNG_NOT_FOUND",
      });
    }

    return item;
  },

  async getFormDefinition(identifier: string) {
    const data = await t3Fetch<unknown>(
      `/forms/${encodeURIComponent(identifier)}`
    );
    // Zod-Schema für Formulare kann in späterer Phase ergänzt werden
    return data;
  },
};

function parseWithSchema<T>(
  schema: ZodType<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError({
      message: `Failed to parse TYPO3 response for ${context}`,
      code: "T3_ZOD_PARSE_ERROR",
      cause: result.error,
    });
  }

  return result.data;
}
