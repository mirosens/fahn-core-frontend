// TODO: Später durch Typo3 Headless ersetzen
// Diese Datei stellt eine temporäre Mock-Implementierung bereit,
// die später durch Typo3 Headless API-Calls ersetzt werden kann.

import type { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase Client - wird später durch Typo3 Headless ersetzt
let mockClient: SupabaseClient | null = null;

/**
 * Get browser client - wird später durch Typo3 Headless ersetzt
 * 
 * @returns Mock Supabase Client (später Typo3 Headless)
 */
export function getBrowserClient(): SupabaseClient {
  // Wenn bereits erstellt, zurückgeben
  if (mockClient) {
    return mockClient;
  }

  // Erstelle einen minimalen Mock-Client
  // Später wird dies durch Typo3 Headless API-Calls ersetzt
  mockClient = {
    auth: {
      getSession: async () => {
        // Mock: Keine Session
        return {
          data: { session: null },
          error: null,
        };
      },
      signOut: async () => {
        // Mock: Logout
        return { error: null };
      },
      refreshSession: async () => {
        // Mock: Refresh
        return {
          data: { session: null },
          error: null,
        };
      },
    },
    from: () => {
      // Mock: Database query builder
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: null,
              error: null,
            }),
            single: async () => ({
              data: null,
              error: null,
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: async () => ({
            data: null,
            error: null,
          }),
        }),
        delete: () => ({
          eq: async () => ({
            data: null,
            error: null,
          }),
        }),
        upsert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: null,
            }),
          }),
        }),
      } as any;
    },
  } as any as SupabaseClient;

  return mockClient;
}
