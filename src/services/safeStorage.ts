/**
 * GIZMO PORTAL — SAFE STORAGE & CHANGE ISOLATION SERVICE
 *
 * Core architectural guarantees:
 * 1. "Create if missing" initialization policy: Never overwrites existing user data.
 * 2. Empty array preservation: An empty array ([]) is valid user state and is never replaced by demo data.
 * 3. Backward-compatible key migration: Reads across legacy version keys (v1, v2, v3) without data loss.
 * 4. Safe write handling: Protects against QuotaExceededError and browser storage failures.
 * 5. Isolation: Changes in one module cannot mutate or overwrite storage keys of other modules.
 */

export const PORTAL_STORAGE_KEYS = {
  INITIALIZED: 'gizmo_portal_initialized_v1',
  INVOICES: 'gizmo_portal_invoices_v1',
  SETTINGS: 'gizmo_portal_settings_v1',
  CLIENTS: 'gizmo_portal_clients_v1',
  PROJECTS: 'gizmo_portal_projects_v1',
  LOCAL_WORKS: 'gizmo_portal_local_works_v3',
  DEADLINES: 'gizmo_portal_deadlines_v1',
  CATEGORIES: 'gizmo_portal_categories_v1',
  DESIGN_CATEGORIES: 'gizmo_portal_design_categories_v2',
  DESIGNERS: 'gizmo_portal_designers_v1',
  WORK_TYPES: 'gizmo_portal_work_types_v1',
  SMART_DEFAULTS: 'gizmo_portal_smart_defaults_v1',
  NOTES: 'gizmo_portal_notes_v1',
  NOTE_CATEGORIES: 'gizmo_portal_note_categories_v1',
  FILE_VAULT: 'gizmo_portal_file_vault_v1',
  PROJECT_REQUESTS: 'gizmo_portal_project_requests_v1',
  CLIENT_NOTIFICATIONS: 'gizmo_portal_client_notifications_v1',
  NOTIFICATIONS: 'gizmo_portal_notifications_v1',
  NOTIFICATION_SETTINGS: 'gizmo_portal_notification_settings_v1',
  BACKUP_METADATA: 'gizmo_portal_backup_meta_v1',
  PUBLIC_SITE_CONTENT: 'gizmo_public_site_content_v1',
  PUBLIC_SITE_DRAFT: 'gizmo_public_site_draft_v1',
  PUBLIC_SITE_OFFERS: 'gizmo_public_site_offers_v1',
  PUBLIC_SITE_MEDIA: 'gizmo_public_site_media_v1',
  PUBLIC_SITE_SERVICES: 'gizmo_public_site_services_v1',
  PUBLIC_SITE_WORK: 'gizmo_public_site_work_v1',
  PUBLIC_SITE_TEAM: 'gizmo_public_site_team_v1',
  PUBLIC_SITE_META: 'gizmo_public_site_meta_v1',
} as const;

// Fallback legacy keys for seamless backward migration
const LEGACY_KEY_MAPPINGS: Record<string, string[]> = {
  [PORTAL_STORAGE_KEYS.LOCAL_WORKS]: [
    'gizmo_portal_local_works_v2',
    'gizmo_portal_local_works_v1',
    'gizmo_local_works',
  ],
  [PORTAL_STORAGE_KEYS.DESIGN_CATEGORIES]: [
    'gizmo_portal_design_categories_v1',
    'gizmo_design_categories',
  ],
  [PORTAL_STORAGE_KEYS.PROJECTS]: [
    'gizmo_projects_v1',
    'gizmo_portal_projects',
  ],
  [PORTAL_STORAGE_KEYS.INVOICES]: [
    'gizmo_invoices_v1',
    'gizmo_portal_invoices',
  ],
  [PORTAL_STORAGE_KEYS.CLIENTS]: [
    'gizmo_clients_v1',
    'gizmo_portal_clients',
  ],
};

/**
 * Checks if the Gizmo Portal has ever been initialized on this client.
 */
export function isPortalInitialized(): boolean {
  try {
    return localStorage.getItem(PORTAL_STORAGE_KEYS.INITIALIZED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks portal as initialized so demo seed logic is permanently locked out
 * from overwriting existing user data.
 */
export function markPortalInitialized(): void {
  try {
    localStorage.setItem(PORTAL_STORAGE_KEYS.INITIALIZED, 'true');
  } catch (e) {
    console.warn('[SafeStorage] Could not set initialized flag', e);
  }
}

/**
 * Loads a record collection safely with multi-version fallback and empty-array preservation.
 * 
 * CRITICAL RULE: If the item exists in localStorage (even as `[]` or `{}`),
 * it returns the user's saved data. It ONLY returns `fallbackDefault` if the
 * key has never existed and the portal has never been initialized.
 */
export function safeLoadItem<T>(
  primaryKey: string,
  fallbackDefault: T,
  validator?: (data: any) => boolean
): T {
  try {
    // 1. Try primary key
    let raw = localStorage.getItem(primaryKey);

    // 2. If not found, check legacy keys for seamless migration
    if (raw === null && LEGACY_KEY_MAPPINGS[primaryKey]) {
      for (const legacyKey of LEGACY_KEY_MAPPINGS[primaryKey]) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw !== null) {
          raw = legacyRaw;
          // Non-destructively migrate to primary key
          try {
            localStorage.setItem(primaryKey, legacyRaw);
          } catch {}
          break;
        }
      }
    }

    // 3. If data was found, parse it
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw);

      // If a validator is provided, ensure data structure is valid
      if (validator && !validator(parsed)) {
        console.warn(`[SafeStorage] Validation failed for key "${primaryKey}", using default.`);
        return fallbackDefault;
      }

      // Important: Array.isArray(parsed) where length is 0 IS VALID USER DATA!
      return parsed as T;
    }
  } catch (e) {
    console.warn(`[SafeStorage] Error reading key "${primaryKey}"`, e);
  }

  // 4. If nothing in storage and portal is already initialized,
  // return empty array if fallback is an array (prevent resurrecting demo items)
  if (isPortalInitialized() && Array.isArray(fallbackDefault)) {
    return [] as unknown as T;
  }

  return fallbackDefault;
}

/**
 * Saves a record collection safely with quota protection.
 */
export function safeSaveItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    // Ensure initialized flag is set on first save
    markPortalInitialized();
    return true;
  } catch (e: any) {
    // Handle QuotaExceededError gracefully without crashing
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      console.error(
        `[SafeStorage] QuotaExceededError writing "${key}". Payload size: ${
          JSON.stringify(value).length
        } characters.`
      );
    } else {
      console.warn(`[SafeStorage] Error saving key "${key}"`, e);
    }
    return false;
  }
}

/**
 * Safely creates or updates a single item in a collection without modifying others.
 */
export function safeUpsertCollectionItem<T extends { id: string }>(
  collectionKey: string,
  item: T,
  fallbackDefault: T[] = []
): T[] {
  const current = safeLoadItem<T[]>(collectionKey, fallbackDefault);
  const existingIdx = current.findIndex((i) => i.id === item.id);
  let updated: T[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...item };
  } else {
    updated = [item, ...current];
  }

  safeSaveItem(collectionKey, updated);
  return updated;
}

/**
 * Safely removes a single item from a collection by ID without affecting any other records.
 */
export function safeRemoveCollectionItem<T extends { id: string }>(
  collectionKey: string,
  itemId: string,
  fallbackDefault: T[] = []
): T[] {
  const current = safeLoadItem<T[]>(collectionKey, fallbackDefault);
  const updated = current.filter((i) => i.id !== itemId);
  safeSaveItem(collectionKey, updated);
  return updated;
}
