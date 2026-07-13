import { NextResponse } from "next/server";

import { buildCreateInvoicePayload } from "@/lib/invoices/payload";
import { parseListParams } from "@/lib/invoices/query";
import { invoiceFormSchema } from "@/lib/invoices/schema";
import { ApiError } from "@/lib/server/errors";
import { createInvoice, fetchInvoices } from "@/lib/server/invoices";
import { getSession } from "@/lib/server/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseListParams(Object.fromEntries(searchParams.entries()));

  try {
    const result = await fetchInvoices(session, params);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error, "Unable to reach the invoice service");
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = invoiceFormSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Invalid invoice",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      },
      { status: 422 },
    );
  }

  try {
    const result = await createInvoice(session, buildCreateInvoicePayload(parsed.data));
    return NextResponse.json({ ok: true, invoiceNumber: result.invoiceNumber });
  } catch (error) {
    return errorResponse(error, "Unable to reach the invoice service");
  }
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  }
  return NextResponse.json({ message: fallback }, { status: 502 });
}
