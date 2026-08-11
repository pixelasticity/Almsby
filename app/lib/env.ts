/**
 * Single typed entry point for environment variables.
 *
 * Only this module may read process.env directly. In particular
 * NEXT_PUBLIC_RESOLVER_URL exists nowhere else in the codebase — see
 * lib/gs1/digital-link.ts and the resolver-discipline check in
 * .github/workflows/ci.yml.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  /** Maker dashboard / marketing site domain. Never used for Digital Link URIs. */
  get appUrl(): string {
    return required("NEXT_PUBLIC_APP_URL");
  },

  /** The ONLY base URL allowed when constructing GS1 Digital Link URIs. */
  get resolverUrl(): string {
    return required("NEXT_PUBLIC_RESOLVER_URL");
  },

  get databaseUrl(): string {
    return required("DATABASE_URL");
  },

  get directUrl(): string | undefined {
    return process.env.DIRECT_URL;
  },

  get supabaseUrl(): string {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },

  get supabasePublishableKey(): string {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },

  get serviceRoleKey(): string {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
};