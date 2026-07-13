import "server-only";

export interface ServerConfig {
  authBaseUrl: string;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

/**
 * Reads the server-only configuration. These names are intentionally NOT
 * prefixed with NEXT_PUBLIC_, so the client_secret never reaches the browser
 * bundle. Called lazily (per request) so a missing value fails loudly at
 * runtime rather than silently at build time.
 */
export function getServerConfig(): ServerConfig {
  const config: ServerConfig = {
    authBaseUrl: process.env.AUTH_BASE_URL ?? "",
    apiBaseUrl: process.env.API_BASE_URL ?? "",
    clientId: process.env.OAUTH_CLIENT_ID ?? "",
    clientSecret: process.env.OAUTH_CLIENT_SECRET ?? "",
    scope: process.env.OAUTH_SCOPE || "openid",
  };

  const missing = (Object.keys(config) as (keyof ServerConfig)[]).filter(
    (key) => key !== "scope" && !config[key],
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing server environment variables: ${missing.join(", ")}. Copy .env.example to .env.local and fill them in.`,
    );
  }

  return config;
}
