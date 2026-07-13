import type { Ordering, SortBy } from "./types";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const DEFAULT_PAGE_SIZE = 10;

export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "CREATED_DATE", label: "Created date" },
  { value: "INVOICE_DATE", label: "Invoice date" },
  { value: "DUE_DATE", label: "Due date" },
];

export const ORDERING_OPTIONS: { value: Ordering; label: string }[] = [
  { value: "DESCENDING", label: "Newest first" },
  { value: "ASCENDING", label: "Oldest first" },
];

// The sandbox does not publish an enum for status, so we offer the values that
// appear across the 101 Digital invoice docs plus an "all" escape hatch.
export const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "PAID", "OVERDUE", "VOID"] as const;

export const CURRENCY_OPTIONS = ["GBP", "USD", "EUR", "SGD", "VND"] as const;

export const UOM_OPTIONS = ["UNIT", "HOUR", "DAY", "KG", "PACK"] as const;
