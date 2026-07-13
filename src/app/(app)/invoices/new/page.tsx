import type { Metadata } from "next";

import { InvoiceForm } from "@/components/invoices/invoice-form";

export const metadata: Metadata = {
  title: "New invoice · SimpleInvoice",
};

export default function NewInvoicePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New invoice</h1>
        <p className="text-sm text-muted">Fill in the customer, invoice and line-item details.</p>
      </div>

      <InvoiceForm />
    </div>
  );
}
