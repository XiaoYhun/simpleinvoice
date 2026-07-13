import "server-only";

import { normalizeInvoiceList } from "@/lib/invoices/normalize";
import type { CreateInvoicePayload } from "@/lib/invoices/payload";
import { buildUpstreamInvoiceQuery } from "@/lib/invoices/query";
import type { InvoiceListParams, InvoiceListResult } from "@/lib/invoices/types";

import { getServerConfig } from "./env";
import { ApiError, readJson, toApiError } from "./errors";
import type { Session } from "./session";

function authHeaders(session: Session): HeadersInit {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "org-token": session.orgToken,
  };
}

export async function fetchInvoices(
  session: Session,
  params: InvoiceListParams,
): Promise<InvoiceListResult> {
  if (!session.orgToken) {
    throw new ApiError(428, "Organisation context is unavailable — the membership service could not be reached.");
  }

  const { apiBaseUrl } = getServerConfig();
  const url = `${apiBaseUrl}/invoice-service/1.0.0/invoices?${buildUpstreamInvoiceQuery(params)}`;

  const response = await fetch(url, { headers: authHeaders(session), cache: "no-store" });
  const body = await readJson(response);

  if (!response.ok) {
    throw toApiError(response.status, body, "Could not load invoices");
  }

  return normalizeInvoiceList(body, params);
}

export interface CreateInvoiceResult {
  invoiceNumber: string;
  raw: unknown;
}

export async function createInvoice(
  session: Session,
  payload: CreateInvoicePayload,
): Promise<CreateInvoiceResult> {
  if (!session.orgToken) {
    throw new ApiError(428, "Organisation context is unavailable — the membership service could not be reached.");
  }

  const { apiBaseUrl } = getServerConfig();

  const response = await fetch(`${apiBaseUrl}/invoice-service/1.0.0/invoices`, {
    method: "POST",
    headers: {
      ...authHeaders(session),
      "Operation-Mode": "SYNC",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await readJson(response);

  if (!response.ok) {
    throw toApiError(response.status, body, "Could not create the invoice");
  }

  return { invoiceNumber: payload.invoices[0].invoiceNumber, raw: body };
}
