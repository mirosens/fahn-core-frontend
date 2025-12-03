import type { User, SupabaseClient } from "@supabase/supabase-js";

/**
 * Representation of an extended user profile stored in your application's
 * database.  Extend this interface to include additional fields as needed.
 */
export interface UserProfile {
  id: string;
  // Additional arbitrary fields can be added here
  [key: string]: unknown;
}

/**
 * User activity log interface
 */
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Admin action log interface
 */
export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  description: string;
  target_user_id?: string;
  target_resource?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extended Session interface that extends Supabase's Session type
 * to include additional properties used by this project.
 */
export interface Session {
  user: User;
  access_token?: string;
  expires_at?: number | null;
  profile?: UserProfile;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  [key: string]: unknown;
}

/**
 * AuthPermissions interface for role-based access control
 */
export interface AuthPermissions {
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canManageUsers: boolean;
  canManageRoles?: boolean;
  canViewAnalytics?: boolean;
  canExportData?: boolean;
  canImportData?: boolean;
  canManageSettings?: boolean;
  canAccessApi?: boolean;
  canManageSecurity?: boolean;
  canViewAuditLogs?: boolean;
  canManageBackups?: boolean;
  canManageIntegrations?: boolean;
}

/**
 * Get role permissions based on user role
 */
export function getRolePermissions(role: string): AuthPermissions {
  switch (role) {
    case "super_admin":
      return {
        canRead: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canPublish: true,
        canManageUsers: true,
        canManageRoles: true,
        canViewAnalytics: true,
        canExportData: true,
        canImportData: true,
        canManageSettings: true,
        canAccessApi: true,
        canManageSecurity: true,
        canViewAuditLogs: true,
        canManageBackups: true,
        canManageIntegrations: true,
      };
    case "admin":
      return {
        canRead: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canPublish: true,
        canManageUsers: true,
        canManageRoles: true,
        canViewAnalytics: true,
        canExportData: true,
        canImportData: true,
        canManageSettings: true,
        canAccessApi: true,
        canManageSecurity: false,
        canViewAuditLogs: true,
        canManageBackups: false,
        canManageIntegrations: false,
      };
    case "editor":
      return {
        canRead: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canPublish: true,
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: true,
        canExportData: true,
        canImportData: false,
        canManageSettings: false,
        canAccessApi: false,
        canManageSecurity: false,
        canViewAuditLogs: false,
        canManageBackups: false,
        canManageIntegrations: false,
      };
    case "user":
    default:
      return {
        canRead: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: false,
        canExportData: false,
        canImportData: false,
        canManageSettings: false,
        canAccessApi: false,
        canManageSecurity: false,
        canViewAuditLogs: false,
        canManageBackups: false,
        canManageIntegrations: false,
      };
  }
}

/**
 * Get current session from Supabase
 */
export async function getCurrentSession(supabase: SupabaseClient): Promise<Session | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Fehler beim Abrufen der Session:", error);
      return null;
    }
    // Konvertiere Supabase Session zu unserer Session
    if (session) {
      return {
        ...session,
        profile: undefined, // Wird später geladen
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        token_type: session.token_type,
      } as Session;
    }
    return null;
  } catch (error) {
    console.error("Fehler beim Abrufen der Session:", error);
    return null;
  }
}

/**
 * Create or update user profile
 */
export async function createOrUpdateProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    const result = await supabase
      .from("user_profiles")
      .upsert({
        id: userId,
        email,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Fehler beim Erstellen/Aktualisieren des Profils: ${result.error.message}`);
    }

    return result.data as UserProfile;
  } catch (error) {
    console.error("Fehler beim Erstellen/Aktualisieren des Profils:", error);
    throw error;
  }
}

/**
 * Check if user can edit content
 */
export function canEdit(profile: UserProfile | null): boolean {
  if (!profile) return false;

  const role = profile["role"] as string;
  const permissions = getRolePermissions(role);
  return permissions.canEdit;
}

/**
 * Check if user can publish content
 */
export function canPublish(profile: UserProfile | null): boolean {
  if (!profile) return false;

  const role = profile["role"] as string;
  const permissions = getRolePermissions(role);
  return permissions.canPublish;
}

/**
 * Block a user
 */
export async function blockUser(
  supabase: SupabaseClient,
  userId: string,
  reason?: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        status: "blocked",
        blocked_at: new Date().toISOString(),
        block_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Fehler beim Blockieren des Benutzers: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Blockieren des Benutzers:", error);
    throw error;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        status: "active",
        blocked_at: null,
        block_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Fehler beim Entsperren des Benutzers: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Entsperren des Benutzers:", error);
    throw error;
  }
}

/**
 * Change user role
 */
export async function changeUserRole(
  supabase: SupabaseClient,
  userId: string,
  newRole: "admin" | "editor" | "user" | "super_admin",
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Fehler beim Ändern der Benutzerrolle: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Ändern der Benutzerrolle:", error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    // First delete user activities
    const { error: activityError } = await supabase
      .from("user_activities")
      .delete()
      .eq("user_id", userId);

    if (activityError) {
      console.warn("Fehler beim Löschen der Benutzeraktivitäten:", activityError);
    }

    // Then delete admin actions targeting this user
    const { error: actionError } = await supabase
      .from("admin_actions")
      .delete()
      .eq("target_user_id", userId);

    if (actionError) {
      console.warn("Fehler beim Löschen der Admin-Aktionen:", actionError);
    }

    // Finally delete the user profile
    const { error } = await supabase.from("user_profiles").delete().eq("id", userId);

    if (error) {
      throw new Error(`Fehler beim Löschen des Benutzers: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Löschen des Benutzers:", error);
    throw error;
  }
}

/**
 * Log user activity
 */
export async function logUserActivity(
  supabase: SupabaseClient,
  userId: string,
  activityType: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const { error } = await supabase.from("user_activities").insert({
      user_id: userId,
      activity_type: activityType,
      description,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Fehler beim Loggen der Benutzeraktivität:", error);
    }
  } catch (error) {
    console.error("Fehler beim Loggen der Benutzeraktivität:", error);
  }
}
