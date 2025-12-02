// src/lib/typo3Client.ts
// Production-ready API client using reliable typeNum endpoints

import { t3Fetch } from "./t3Fetch";
import { t3ApiBaseUrl } from "./config";
import { ApiError } from "./api-error";
import { mockFahndungen } from "./mockFahndungen";
import {
  zNavigationResponse,
  type NavigationResponse,
} from "@/types/navigation";
import { zPageResponse, type PageResponse } from "@/types/page";
import type { ZodType } from "zod";
import { notFound } from "next/navigation";

// Production-ready types for B.5 implementation
export interface FahndungItem {
  id: number;
  title: string;
  description?: string;
  summary: string;
  status: "active" | "completed" | "archived";
  type: "missing_person" | "witness_appeal" | "wanted";
  location?: string;
  delikt?: string;
  publishedAt: string;
  slug: string;
  image?: {
    url: string;
    alternative: string;
  };
  isNew?: boolean;
  date?: string | number;
  kategorie?: string;
  tatzeit?: string;
  dienststelle?: string;
}

interface FahndungenApiResponse {
  meta: {
    total: string | number;
    page: string | number;
    pageSize: string | number;
    lastUpdated?: string;
  };
  items: FahndungItem[];
}

interface ContentElement {
  type: string;
  content?: string | Record<string, unknown>;
}

interface Typo3PageResponse {
  id: number;
  title: string;
  content: {
    [colPos: string]: ContentElement[];
  };
  breadcrumb?: Array<{
    title: string;
    link: string;
    active: boolean;
  }>;
}

// Production-ready API endpoint configuration
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
  const url = new URL(t3ApiBaseUrl);
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
    params?:
      | URLSearchParams
      | {
          status?: string;
          region?: string;
          delikt?: string;
          page?: number;
        },
    options?: { cache?: RequestCache; next?: { tags?: string[] } }
  ): Promise<FahndungenApiResponse> {
    // Production-ready Fahndungen endpoint with type safety and error handling
    let paramObj: Record<string, unknown> | undefined;

    if (params instanceof URLSearchParams) {
      paramObj = Object.fromEntries(params.entries());
    } else if (params) {
      paramObj = {
        status: params.status,
        region: params.region,
        delikt: params.delikt,
        page: params.page?.toString(),
      };
      // Remove undefined values
      paramObj = Object.fromEntries(
        Object.entries(paramObj).filter(([, value]) => value !== undefined)
      );
    }

    // Prüfe ob Mock-Daten erzwungen werden sollen
    // Wenn NEXT_PUBLIC_USE_MOCK_DATA=true gesetzt ist, verwende immer Mock-Daten
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMockData) {
      console.log(
        "[typo3Client] Using mock data (NEXT_PUBLIC_USE_MOCK_DATA=true)"
      );
      return {
        meta: {
          total: mockFahndungen.length,
          page: 1,
          pageSize: 10,
          lastUpdated: new Date().toISOString(),
        },
        items: mockFahndungen,
      };
    }

    const url = buildApiUrl(API_ENDPOINTS.fahndungen, paramObj);
    console.log("[typo3Client] Fetching Fahndungen from:", url);

    try {
      const data = await t3Fetch<FahndungenApiResponse>(url, {
        cache: options?.cache ?? "no-store", // Fahndungen sind dynamisch
        next: {
          tags: options?.next?.tags ?? ["fahndungen", "list"],
          revalidate: 120, // ISR: 2 minutes
        },
      });

      // Validate and normalize response
      if (!data || typeof data !== "object") {
        throw new Error("Invalid API response structure");
      }

      // Ensure items is an array
      if (!Array.isArray(data.items)) {
        console.warn(
          "[typo3Client] items is not an array, converting:",
          data.items
        );
        data.items = [];
      }

      // Normalize meta data
      const normalizedData: FahndungenApiResponse = {
        meta: {
          total: Number(data.meta?.total) || 0,
          page: Number(data.meta?.page) || 1,
          pageSize: Number(data.meta?.pageSize) || 10,
          lastUpdated: data.meta?.lastUpdated,
        },
        items: data.items.map((item) => ({
          id: Number(item.id),
          title: item.title || "Untitled",
          description: item.description || item.summary,
          summary: item.summary || "",
          status: this.normalizeStatus(item.status),
          type: this.normalizeType(item.type),
          location: item.location,
          delikt: item.delikt,
          publishedAt: item.publishedAt || new Date().toISOString(),
          slug: item.slug || `fahndung-${item.id}`,
          image: item.image,
        })),
      };

      // Wenn keine Daten von der API kommen, Mock-Daten verwenden
      if (normalizedData.items.length === 0) {
        console.log(
          "[typo3Client] No data from API, using mock data as fallback"
        );
        return {
          meta: {
            total: mockFahndungen.length,
            page: 1,
            pageSize: 10,
            lastUpdated: new Date().toISOString(),
          },
          items: mockFahndungen,
        };
      }

      return normalizedData;
    } catch (error) {
      console.error("[typo3Client] Error fetching Fahndungen:", error);

      // Bei Fehler immer Mock-Daten zurückgeben
      console.log("[typo3Client] Using mock data due to error");
      return {
        meta: {
          total: mockFahndungen.length,
          page: 1,
          pageSize: 10,
          lastUpdated: new Date().toISOString(),
        },
        items: mockFahndungen,
      };
    }
  },

  // Helper methods for data normalization
  normalizeStatus(status: unknown): "active" | "completed" | "archived" {
    if (typeof status === "string") {
      switch (status.toLowerCase()) {
        case "active":
        case "aktiv":
          return "active";
        case "completed":
        case "erledigt":
          return "completed";
        case "archived":
        case "archiviert":
          return "archived";
        default:
          return "active";
      }
    }
    return "active";
  },

  normalizeType(type: unknown): "missing_person" | "witness_appeal" | "wanted" {
    if (typeof type === "string") {
      switch (type.toLowerCase()) {
        case "missing_person":
        case "vermisst":
          return "missing_person";
        case "witness_appeal":
        case "zeugenaufruf":
          return "witness_appeal";
        case "wanted":
        case "fahndung":
          return "wanted";
        default:
          return "wanted";
      }
    }
    return "wanted";
  },

  async getFahndungById(
    idOrSlug: string | number,
    options?: { cache?: RequestCache; next?: { tags?: string[] } }
  ): Promise<Typo3PageResponse> {
    // Use headless page API by constructing path directly
    const path = `/fahndungen/${encodeURIComponent(idOrSlug)}`;
    console.log("[typo3Client] Fetching Fahndung detail from path:", path);

    try {
      const data = await t3Fetch<{
        page?: {
          id?: number | string;
          title?: string;
          content?: Record<string, ContentElement[]>;
          breadcrumb?: Array<{
            title: string;
            link: string;
            active: boolean;
          }>;
        };
        id?: number | string;
        title?: string;
        content?: Record<string, ContentElement[]>;
        breadcrumb?: Array<{
          title: string;
          link: string;
          active: boolean;
        }>;
      }>(path, {
        cache: options?.cache ?? "force-cache",
        next: {
          tags: options?.next?.tags ?? [`fahndung:${idOrSlug}`, "fahndungen"],
        },
      });

      if (!data) {
        notFound();
      }

      // Normalize response structure
      const normalizedData: Typo3PageResponse = {
        id: Number(data.page?.id) || Number(idOrSlug),
        title: data.page?.title || data.title || "Untitled",
        content: data.content || data.page?.content || {},
        breadcrumb: data.breadcrumb || data.page?.breadcrumb,
      };

      return normalizedData;
    } catch (error) {
      console.error("[typo3Client] Error fetching Fahndung detail:", error);
      notFound();
    }
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
