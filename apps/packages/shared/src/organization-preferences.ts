/**
 * Organization Preferences Registry
 *
 * This is the single source of truth for all organization preferences.
 * Add new preferences here with their default values and metadata.
 *
 * The database stores values per-organization, but these definitions
 * provide type safety and defaults.
 */

/**
 * Organization preference definitions with defaults and metadata.
 * Add new preferences by extending this object.
 */
export const organizationPreferencesRegistry = {
  enableClickToLoad: {
    key: "enable_click_to_load",
    default: true,
    description:
      "Allow clicking orders to mark as loaded instead of requiring QR scan",
    category: "workflow",
  },
  showManualCompleteButton: {
    key: "show_manual_complete_button",
    default: true,
    description: "Show complete button even if not all orders are processed",
    category: "workflow",
  },
  autoCompleteOnAllLoaded: {
    key: "auto_complete_on_all_loaded",
    default: true,
    description: "Automatically complete when all orders are scanned",
    category: "workflow",
  },
} as const;

/**
 * Type-safe preference names (camelCase property names)
 */
export type OrganizationPreferenceName =
  keyof typeof organizationPreferencesRegistry;

/**
 * Database key strings (snake_case)
 */
export type OrganizationPreferenceKey =
  (typeof organizationPreferencesRegistry)[OrganizationPreferenceName]["key"];

/**
 * Typed organization preferences object - what consumers receive
 */
export type OrganizationPreferences = {
  [K in OrganizationPreferenceName]: boolean;
};

/**
 * Get all preference entries as an array for seeding/defaults
 */
export const getOrganizationPreferenceEntries = () =>
  Object.entries(organizationPreferencesRegistry).map(([name, config]) => ({
    name: name as OrganizationPreferenceName,
    ...config,
  }));

/**
 * Get default values as a typed object
 */
export const getOrganizationPreferenceDefaults =
  (): OrganizationPreferences => {
    const defaults = {} as OrganizationPreferences;
    for (const [name, config] of Object.entries(
      organizationPreferencesRegistry
    )) {
      defaults[name as OrganizationPreferenceName] = config.default;
    }
    return defaults;
  };

/**
 * Map database records to typed preferences object
 */
export const mapDatabasePreferencesToTyped = (
  dbPreferences: Array<{ key: string; value: boolean }>
): OrganizationPreferences => {
  // Start with defaults
  const result = getOrganizationPreferenceDefaults();

  // Create a reverse lookup: key -> name
  const keyToName: Record<string, OrganizationPreferenceName> = {};
  for (const [name, config] of Object.entries(
    organizationPreferencesRegistry
  )) {
    keyToName[config.key] = name as OrganizationPreferenceName;
  }

  // Override with database values
  for (const pref of dbPreferences) {
    const name = keyToName[pref.key];
    if (name) {
      result[name] = pref.value;
    }
  }

  return result;
};
