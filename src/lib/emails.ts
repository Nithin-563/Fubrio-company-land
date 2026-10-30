
export const DEFAULT_EMAILS = {
  hello: "hello@fubrio.in",
  community: "community@fubrio.in",
  support: "support@fubrio.in",
};

export type EmailKey = keyof typeof DEFAULT_EMAILS;

/**
 * Returns the configured (or default) email for a given key.
 * Falls back to DEFAULT_EMAILS if not set in settings.
 */
export function getEmail(key: EmailKey, settings?: Record<string, string> | null): string {
  if (!settings) return DEFAULT_EMAILS[key];
  const v = settings[`email.${key}`];
  if (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return v.trim();
  return DEFAULT_EMAILS[key];
}

/**
 * Returns all three emails (hello, community, support) resolved from settings.
 */
export function getEmails(settings?: Record<string, string> | null) {
  return {
    hello: getEmail("hello", settings),
    community: getEmail("community", settings),
    support: getEmail("support", settings),
  };
}
