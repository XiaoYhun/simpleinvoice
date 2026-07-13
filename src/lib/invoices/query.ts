import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "./constants";
import type { InvoiceListParams, Ordering, SortBy } from "./types";

type RawParams = Record<string, string | string[] | undefined>;

const SORT_VALUES: SortBy[] = ["CREATED_DATE", "INVOICE_DATE", "DUE_DATE"];
const ORDER_VALUES: Ordering[] = ["ASCENDING", "DESCENDING"];

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Reads loosely-typed URL params into a safe, fully-defaulted param object. */
export function parseListParams(raw: RawParams): InvoiceListParams {
  const pageNum = Math.max(1, Number.parseInt(first(raw.pageNum), 10) || 1);
  const parsedSize = Number.parseInt(first(raw.pageSize), 10);
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(parsedSize)
    ? parsedSize
    : DEFAULT_PAGE_SIZE;

  const status = first(raw.status);

  return {
    keyword: first(raw.keyword),
    status: (STATUS_OPTIONS as readonly string[]).includes(status) ? status : "",
    fromDate: first(raw.fromDate),
    toDate: first(raw.toDate),
    sortBy: oneOf(first(raw.sortBy), SORT_VALUES, "CREATED_DATE"),
    ordering: oneOf(first(raw.ordering), ORDER_VALUES, "DESCENDING"),
    pageNum,
    pageSize,
  };
}

/** Builds the query string sent upstream, omitting the optional filters when blank. */
export function buildUpstreamInvoiceQuery(params: InvoiceListParams): string {
  const query = new URLSearchParams({
    sortBy: params.sortBy,
    ordering: params.ordering,
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.fromDate) query.set("fromDate", params.fromDate);
  if (params.toDate) query.set("toDate", params.toDate);
  return query.toString();
}

/** Serialises params for our own URLs, dropping defaults so links stay tidy. */
export function toBrowserQuery(params: Partial<InvoiceListParams>): string {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.fromDate) query.set("fromDate", params.fromDate);
  if (params.toDate) query.set("toDate", params.toDate);
  if (params.sortBy && params.sortBy !== "CREATED_DATE") query.set("sortBy", params.sortBy);
  if (params.ordering && params.ordering !== "DESCENDING") query.set("ordering", params.ordering);
  if (params.pageNum && params.pageNum > 1) query.set("pageNum", String(params.pageNum));
  if (params.pageSize && params.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(params.pageSize));
  }
  return query.toString();
}
