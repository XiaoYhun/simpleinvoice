export type Ordering = "ASCENDING" | "DESCENDING";

export type SortBy = "CREATED_DATE" | "INVOICE_DATE" | "DUE_DATE";

export interface InvoiceListParams {
  keyword: string;
  status: string;
  fromDate: string;
  toDate: string;
  sortBy: SortBy;
  ordering: Ordering;
  pageNum: number;
  pageSize: number;
}

/**
 * The subset of an invoice we render in the list. The invoice-service returns a
 * large nested object; the table only needs these, and `normalizeInvoiceList`
 * is deliberately lenient about where each value lives in the payload.
 */
export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  reference: string;
  customerName: string;
  currency: string;
  total: number | null;
  status: string;
  invoiceDate: string;
  dueDate: string;
  createdDate: string;
}

export interface Paging {
  pageNum: number;
  pageSize: number;
  total: number | null;
  totalPages: number | null;
}

export interface InvoiceListResult {
  invoices: InvoiceSummary[];
  paging: Paging;
}
