import type { InvoiceListParams, InvoiceListResult, InvoiceSummary, Paging } from "./types";

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(source: Json, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function num(source: Json, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function customerName(raw: Json): string {
  const customer = isObject(raw.customer) ? raw.customer : raw;
  const full = [str(customer, "firstName"), str(customer, "lastName")].filter(Boolean).join(" ");
  return full || str(customer, "name", "customerName") || str(raw, "customerName");
}

/**
 * The invoice-service wraps its list under a few different keys depending on the
 * environment, so we probe the likely locations rather than assume one shape.
 */
function extractRecords(payload: unknown): Json[] {
  if (Array.isArray(payload)) return payload.filter(isObject);
  if (!isObject(payload)) return [];

  const data = isObject(payload.data) ? payload.data : payload;
  for (const key of ["invoices", "records", "content", "results", "items"]) {
    const candidate = data[key];
    if (Array.isArray(candidate)) return candidate.filter(isObject);
  }
  return Array.isArray(data.data) ? (data.data as unknown[]).filter(isObject) : [];
}

function toSummary(raw: Json): InvoiceSummary {
  return {
    id: str(raw, "invoiceId", "id", "uuid") || str(raw, "invoiceNumber"),
    invoiceNumber: str(raw, "invoiceNumber", "number"),
    reference: str(raw, "invoiceReference", "reference"),
    customerName: customerName(raw),
    currency: str(raw, "currency"),
    total: num(raw, "total", "totalAmount", "grandTotal", "amount", "totalGross"),
    status: str(raw, "status", "invoiceStatus", "state") || "UNKNOWN",
    invoiceDate: str(raw, "invoiceDate", "issueDate"),
    dueDate: str(raw, "dueDate"),
    createdDate: str(raw, "createdDate", "createDate", "createdAt", "dateCreated"),
  };
}

function extractPaging(payload: unknown, params: InvoiceListParams, count: number): Paging {
  const root = isObject(payload) ? (isObject(payload.data) ? payload.data : payload) : {};
  const paging = isObject(root.paging) ? root.paging : root;

  const total = num(paging, "total", "totalRecords", "totalElements", "count");
  const totalPages = num(paging, "totalPages", "pageCount");

  return {
    pageNum: num(paging, "pageNum", "page", "pageNumber") ?? params.pageNum,
    pageSize: num(paging, "pageSize", "size") ?? params.pageSize,
    total,
    totalPages:
      totalPages ??
      (total !== null ? Math.max(1, Math.ceil(total / params.pageSize)) : null) ??
      (count < params.pageSize ? params.pageNum : null),
  };
}

export function normalizeInvoiceList(payload: unknown, params: InvoiceListParams): InvoiceListResult {
  const records = extractRecords(payload);
  const invoices = records.map(toSummary);
  return { invoices, paging: extractPaging(payload, params, invoices.length) };
}
