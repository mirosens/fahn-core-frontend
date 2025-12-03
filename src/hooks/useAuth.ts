"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/supabase-browser";
import type { Session, UserProfile } from "@/lib/auth";

/**
 * Custom hook that manages the current authentication session.  This hook
 * exposes the session, a loading state, any error encountered during
 * authentication checks, and helpers to log out or re-check the session.
 *
 * Key improvements:
 *  - Uses a ref (`inFlightRef`) to prevent concurrent session checks.  This
 *    avoids race conditions when multiple components call `checkSession`
 *    simultaneously.
 *  - Adds a timeout to session retrieval via `Promise.race` so that the UI
 *    doesn't hang indefinitely if Supabase is unreachable.
 *  - Limits verbose logging to development environments.
 */
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Ref to store an active session check promise.  When set, subsequent
  // invocations of `checkSession` will return the existing promise instead
  // of starting a new request.
  const inFlightRef = useRef<Promise<void> | null>(null);

  const checkSession = useCallback(async () => {
    // If a check is already in progress, return the existing promise.
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const promise = (async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getBrowserClient();

        // Race the session request against a timeout.  If the timeout fires,
        // we treat it as if no session was found.
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{
          data: { session: Session | null };
          error: null;
        }>((resolve) => setTimeout(() => resolve({ data: { session: null }, error: null }), 5000));

        const { data: sessionData, error } = await Promise.race([sessionPromise, timeoutPromise]);

        if (error || !sessionData?.session) {
          setSession(null);
          return;
        }

        const user = sessionData.session.user;

        try {
          // Fetch the user's profile.  We don't race this call because a missing
          // profile is non-fatal.
          // Use maybeSingle() instead of single() to avoid errors when profile doesn't exist
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          // Only set profile if data exists and no error occurred
          // Ignore 406 errors (Not Acceptable) - they might occur due to RLS policies
          if (profileError && profileError.code !== "PGRST116" && (profileError as { status?: number }).status !== 406) {
            // Log non-404/406 errors in development only
            if (process.env.NODE_ENV === "development") {
              console.warn("Profile fetch warning:", profileError);
            }
          }

          setSession({
            user: user,
            profile: profileData as unknown as UserProfile | undefined,
            access_token: sessionData.session.access_token,
            expires_at: sessionData.session.expires_at,
            refresh_token: sessionData.session.refresh_token,
            expires_in: sessionData.session.expires_in,
            token_type: sessionData.session.token_type,
          });
        } catch {
          // Silent error handling
          setSession({
            user: user,
            profile: undefined,
            access_token: sessionData.session.access_token,
            expires_at: sessionData.session.expires_at,
            refresh_token: sessionData.session.refresh_token,
            expires_in: sessionData.session.expires_in,
            token_type: sessionData.session.token_type,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
        setSession(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    })();

    inFlightRef.current = promise;
    await promise;
    inFlightRef.current = null;
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
      setInitialized(true);
      setError(null);
      router.push("/login");
    } catch {
      setError("Fehler beim Abmelden");
      router.push("/login");
    }
  }, [router]);

  // Kick off the initial session check once on mount.
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return {
    session,
    loading: loading ?? !initialized,
    error,
    logout,
    checkSession,
    isAuthenticated: !!session,
    initialized,
    user: session?.user ?? null,
  };
};
