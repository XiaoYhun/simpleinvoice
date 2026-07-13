import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/invoices/schema";
import { authenticate } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { createSession } from "@/lib/server/session";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid credentials" },
      { status: 422 },
    );
  }

  try {
    const result = await authenticate(parsed.data.username, parsed.data.password);
    await createSession({
      accessToken: result.accessToken,
      orgToken: result.orgToken,
      username: parsed.data.username,
      maxAgeSeconds: result.expiresIn,
    });
    return NextResponse.json({ ok: true, hasOrgContext: result.hasOrgContext });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[login] non-ApiError thrown:", error);
    return NextResponse.json(
      { message: "Unable to reach the authentication service. Check your connection and try again." },
      { status: 502 },
    );
  }
}
