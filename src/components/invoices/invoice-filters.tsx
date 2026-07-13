"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { controlClass } from "@/components/ui/field";
import { ORDERING_OPTIONS, PAGE_SIZE_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from "@/lib/invoices/constants";
import type { InvoiceListParams } from "@/lib/invoices/types";

export function InvoiceFilters({ params }: { params: InvoiceListParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(params.keyword);

  function apply(updates: Record<string, string>, { resetPage = true } = {}) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("pageNum");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasFilters =
    params.keyword || params.status || params.sortBy !== "CREATED_DATE" || params.ordering !== "DESCENDING";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm sm:flex-nowrap">
      <form
        className="relative flex-[2] basis-full min-w-0 sm:basis-auto sm:min-w-64"
        onSubmit={(event) => {
          event.preventDefault();
          apply({ keyword });
        }}
      >
        <button
          type="submit"
          aria-label="Search invoices"
          className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted hover:text-foreground"
        >
          <Search className="size-4" aria-hidden />
        </button>
        <input
          className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted/60 focus:border-brand focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          placeholder="Search invoice number…"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          aria-label="Search invoices"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2 basis-full sm:contents">
      <select
        className={`${controlClass} w-auto`}
        value={params.status}
        onChange={(event) => apply({ status: event.target.value })}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <select
        className={`${controlClass} w-auto`}
        value={params.sortBy}
        onChange={(event) => apply({ sortBy: event.target.value })}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className={`${controlClass} w-auto`}
        value={params.ordering}
        onChange={(event) => apply({ ordering: event.target.value })}
        aria-label="Order"
      >
        {ORDERING_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className={`${controlClass} w-auto`}
        value={String(params.pageSize)}
        onChange={(event) => apply({ pageSize: event.target.value })}
        aria-label="Rows per page"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            router.push(pathname);
          }}
          className="whitespace-nowrap text-brand hover:underline"
        >
          Reset
        </button>
      ) : null}
      </div>
    </div>
  );
}
