import Link from "next/link";
import { FilePlus2, ReceiptText, ScrollText } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";

export function AppHeader({ username }: { username: string }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-brand text-brand-foreground">
            <ReceiptText className="size-4" aria-hidden />
          </span>
          SimpleInvoice
        </Link>

        <nav className="ml-2 hidden gap-1 sm:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <ScrollText className="size-4" aria-hidden />
            Invoices
          </Link>
          <Link
            href="/invoices/new"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <FilePlus2 className="size-4" aria-hidden />
            New invoice
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {username ? <span className="hidden text-sm text-muted sm:inline">{username}</span> : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
