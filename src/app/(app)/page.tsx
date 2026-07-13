import type { Metadata } from "next";
import { FilePlus2, Inbox } from "lucide-react";

import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { Pagination } from "@/components/invoices/pagination";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { parseListParams } from "@/lib/invoices/query";
import { ApiError } from "@/lib/server/errors";
import { fetchInvoices } from "@/lib/server/invoices";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Invoices · SimpleInvoice",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const params = parseListParams(raw);

  const session = await getSession();
  if (!session) return null; // middleware guards this route; this keeps types honest

  const created = typeof raw.created === "string" ? raw.created : "";

  let invoices = [] as Awaited<ReturnType<typeof fetchInvoices>>["invoices"];
  let totalPages: number | null = null;
  let errorMessage: string | null = null;

  try {
    const result = await fetchInvoices(session, params);
    invoices = result.invoices;
    totalPages = result.paging.totalPages;
  } catch (error) {
    errorMessage = error instanceof ApiError ? error.message : "Something went wrong while loading invoices.";
  }

  const hasNext = totalPages ? params.pageNum < totalPages : invoices.length === params.pageSize;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted">Search, filter and review the invoices you have created.</p>
        </div>
        <ButtonLink href="/invoices/new">
          <FilePlus2 className="size-4" aria-hidden />
          New invoice
        </ButtonLink>
      </div>

      {created ? (
        <Alert tone="success" title="Invoice created">
          Invoice <span className="font-medium">{created}</span> was submitted successfully.
        </Alert>
      ) : null}

      <InvoiceFilters params={params} />

      {errorMessage ? (
        <Alert tone="error" title="Couldn't load invoices">
          {errorMessage}
        </Alert>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
          <Inbox className="mx-auto size-8 text-muted" aria-hidden />
          <p className="mt-3 font-medium">No invoices found</p>
          <p className="mt-1 text-sm text-muted">Adjust your search or filters, or create your first invoice.</p>
        </div>
      ) : (
        <>
          <InvoiceTable invoices={invoices} />
          <Pagination pageNum={params.pageNum} totalPages={totalPages} hasNext={hasNext} />
        </>
      )}
    </div>
  );
}
