import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/invoices/format";
import type { InvoiceSummary } from "@/lib/invoices/types";

export function InvoiceTable({ invoices }: { invoices: InvoiceSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Invoice date</th>
            <th className="px-4 py-3 font-medium">Due date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr
              key={invoice.id || `${invoice.invoiceNumber}-${index}`}
              className="border-b border-border last:border-0 hover:bg-surface-muted"
            >
              <td className="px-4 py-3">
                <div className="font-medium">{invoice.invoiceNumber || "—"}</div>
                {invoice.reference ? <div className="text-xs text-muted">{invoice.reference}</div> : null}
              </td>
              <td className="px-4 py-3">{invoice.customerName || "—"}</td>
              <td className="px-4 py-3 text-muted">{formatDate(invoice.invoiceDate)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(invoice.dueDate)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={invoice.status} />
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatCurrency(invoice.total, invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
