// src/lib/typo3Client.ts
// Production-ready API client using reliable typeNum endpoints

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
import { zPageResponse, type PageResponse } from "@/types/page";
import type { ZodType } from "zod";

// Production-ready API endpoint configuration
const T3_BASE =
  process.env.NEXT_PUBLIC_TYPO3_API_URL ||
  process.env.T3_API_BASE_URL ||
  "https://fahn-core-typo3.ddev.site";

const API_ENDPOINTS = {
  fahndungen: 10000,
  navigation: 835,
  health: 8999,
  page: 9999,
  error: 838,
} as const;

// Helper function to build TYPO3 typeNum URLs
function buildApiUrl(
  typeNum: number,
  params?: Record<string, unknown>
): string {
  const url = new URL(T3_BASE);
  url.searchParams.set("type", String(typeNum));

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export const typo3Client = {
  async getPage(
    slug: string,
    options?: { cache?: RequestCache; next?: { tags?: string[] } }
  ): Promise<PageResponse> {
    // Use main headless page endpoint (typeNum 0 for strict headless mode)
    const path =
      slug === "home" || slug === "" ? "/" : `/${encodeURIComponent(slug)}`;
    const data = await t3Fetch<unknown>(path, {
      cache: options?.cache ?? "force-cache",
      next: {
        tags: options?.next?.tags ?? [`page:${slug}`, "navigation:main"],
      },
    });
    return parseWithSchema(zPageResponse, data, "PAGE");
  },

  async getNavigation(options?: {
    cache?: RequestCache;
    next?: { tags?: string[] };
  }): Promise<NavigationResponse> {
    // Production-ready navigation endpoint using typeNum
    const url = buildApiUrl(API_ENDPOINTS.navigation);
    console.log("[typo3Client] Fetching navigation from:", url);

    const data = await t3Fetch<unknown>(url, {
      cache: options?.cache ?? "force-cache",
      next: {
        tags: options?.next?.tags ?? ["navigation:main"],
      },
    });
    return parseWithSchema(zNavigationResponse, data, "NAVIGATION");
  },

  async getFahndungen(
    params?: URLSearchParams,
    options?: { cache?: RequestCache; next?: { tags?: string[] } }
  ): Promise<FahndungenResponse> {
    // Production-ready Fahndungen endpoint using reliable typeNum
    const paramObj = params ? Object.fromEntries(params.entries()) : undefined;
    const url = buildApiUrl(API_ENDPOINTS.fahndungen, paramObj);
    console.log("[typo3Client] Fetching Fahndungen from:", url);

    const data = await t3Fetch<unknown>(url, {
      cache: options?.cache ?? "no-store", // Fahndungen sind dynamisch
      next: {
        tags: options?.next?.tags ?? ["fahndungen:list"],
      },
    });
    return parseWithSchema(zFahndungenResponse, data, "FAHNDUNGEN_LIST");
  },

  async getFahndungById(
    id: string,
    options?: { cache?: RequestCache; next?: { tags?: string[] } }
  ): Promise<FahndungenResponse["items"][number]> {
    const data = await t3Fetch<unknown>(
      `/fahndungen/${encodeURIComponent(id)}`,
      {
        cache: options?.cache ?? "force-cache",
        next: {
          tags: options?.next?.tags ?? [`fahndung:${id}`, "fahndungen:list"],
        },
      }
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
        status: 404,
      });
    }

    return item;
  },

  async getFormDefinition(identifier: string) {
    const data = await t3Fetch<unknown>(
      `/forms/${encodeURIComponent(identifier)}`,
      {
        cache: "no-store", // Formulare sind dynamisch
      }
    );
    // Zod-Schema für Formulare kann in späterer Phase ergänzt werden
    return data;
  },

  // Production-ready health check endpoint
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    services: Record<string, string>;
  }> {
    const url = buildApiUrl(API_ENDPOINTS.health);
    console.log("[typo3Client] Health check from:", url);

    const data = await t3Fetch<{
      status: string;
      timestamp: string;
      version: string;
      services: Record<string, string>;
    }>(url, {
      cache: "no-store",
    });
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

// Named exports for backward compatibility and cleaner imports
export const getFahndungen = typo3Client.getFahndungen;
export const getNavigation = typo3Client.getNavigation;
export const getHealthStatus = typo3Client.getHealthStatus;
export const getPage = typo3Client.getPage;

// Export configuration for debugging/monitoring
export { API_ENDPOINTS, buildApiUrl };
