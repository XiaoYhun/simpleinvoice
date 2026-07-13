import "server-only";

import { cookies } from "next/headers";

const ACCESS_TOKEN = "si_access_token";
const ORG_TOKEN = "si_org_token";
const USERNAME = "si_username";

export interface Session {
  accessToken: string;
  orgToken: string;
  username: string;
}

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function createSession(
  session: Session & { maxAgeSeconds: number },
): Promise<void> {
  const store = await cookies();
  const options = { ...baseOptions, maxAge: session.maxAgeSeconds };
  store.set(ACCESS_TOKEN, session.accessToken, options);
  store.set(ORG_TOKEN, session.orgToken, options);
  // Username is only for greeting the user; kept httpOnly for consistency.
  store.set(USERNAME, session.username, options);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN)?.value;
  if (!accessToken) return null;
  return {
    accessToken,
    orgToken: store.get(ORG_TOKEN)?.value ?? "",
    username: store.get(USERNAME)?.value ?? "",
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  for (const name of [ACCESS_TOKEN, ORG_TOKEN, USERNAME]) {
    store.delete(name);
  }
}
