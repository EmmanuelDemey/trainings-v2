/**
 * Application configuration, read once at startup.
 *
 * Provided as-is. Chapter 9 covered what belongs in `import.meta.env` and what
 * does not — this file is a fine place to apply that.
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  billingApiKey: import.meta.env.VITE_BILLING_API_KEY,
} as const;

/** Header the fake billing API "expects" on every call. */
export function authHeaders(): Record<string, string> {
  return { 'X-Billing-Key': config.billingApiKey };
}
