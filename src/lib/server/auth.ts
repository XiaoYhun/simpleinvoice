import "server-only";

import { getServerConfig } from "./env";
import { ApiError, readJson, toApiError } from "./errors";

export interface AuthResult {
  accessToken: string;
  orgToken: string;
  expiresIn: number;
  /** False when the token was issued but the membership lookup was unavailable. */
  hasOrgContext: boolean;
}

/**
 * Exchanges the user's credentials for an access token, then resolves the
 * organisation token from the membership service. Both calls happen here on the
 * server: the browser posts to our own /api/auth/login and never sees the
 * client_secret or the raw tokens.
 */
export async function authenticate(username: string, password: string): Promise<AuthResult> {
  const config = getServerConfig();

  const tokenResponse = await fetch(`${config.authBaseUrl}/t/101digital.core/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "password",
      scope: config.scope,
      username,
      password,
    }),
    cache: "no-store",
  });

  const tokenBody = (await readJson(tokenResponse)) as Record<string, unknown> | null;
  const accessToken = typeof tokenBody?.access_token === "string" ? tokenBody.access_token : "";

  if (!tokenResponse.ok || !accessToken) {
    // The identity server answers 400 with error_description on bad credentials.
    throw toApiError(tokenResponse.status || 401, tokenBody, "Invalid username or password");
  }

  const expiresIn = Number(tokenBody?.expires_in) || 3600;
  const orgToken = await resolveOrgToken(accessToken, config.apiBaseUrl);

  return { accessToken, orgToken, expiresIn, hasOrgContext: orgToken.length > 0 };
}

async function resolveOrgToken(accessToken: string, apiBaseUrl: string): Promise<string> {
  const url = `${apiBaseUrl}/membership-service/1.0.0/users/me`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.warn(`[orgToken] membership lookup failed ${response.status} at ${url} :: ${text.slice(0, 300)}`);
    // Degrade instead of failing the whole login: the app stays reachable and
    // surfaces the upstream issue on the invoices screen. See README.
    return "";
  }

  const body = (await readJson(response)) as Record<string, unknown> | null;
  const data = (body?.data ?? body) as Record<string, unknown> | null;
  const memberships = Array.isArray(data?.memberships) ? data.memberships : [];
  const first = memberships[0] as Record<string, unknown> | undefined;
  const token = typeof first?.token === "string" ? first.token : "";
  if (!token) {
    console.warn(`[orgToken] membership lookup ok but no token; ${memberships.length} membership(s); keys=${JSON.stringify(Object.keys(first ?? {}))}`);
  }
  return token;
}

export { ApiError };
