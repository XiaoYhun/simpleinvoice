"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  pageNum: number;
  totalPages: number | null;
  hasNext: boolean;
}

export function Pagination({ pageNum, totalPages, hasNext }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 1) next.delete("pageNum");
    else next.set("pageNum", String(page));
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Page {pageNum}
        {totalPages ? ` of ${totalPages}` : ""}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => goTo(pageNum - 1)} disabled={pageNum <= 1}>
          Previous
        </Button>
        <Button variant="secondary" onClick={() => goTo(pageNum + 1)} disabled={!hasNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
