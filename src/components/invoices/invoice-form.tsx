"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCheck2 } from "lucide-react";
import type { z } from "zod";

import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";
import { CURRENCY_OPTIONS, UOM_OPTIONS } from "@/lib/invoices/constants";
import { formatCurrency, suggestInvoiceNumber } from "@/lib/invoices/format";
import { invoiceFormSchema, type InvoiceFormValues } from "@/lib/invoices/schema";

// The form fields are raw strings; zod coerces them to the validated output on
// submit. Typing useForm with both shapes keeps the inputs and the parsed
// result honest without any casts.
type InvoiceFormInput = z.input<typeof invoiceFormSchema>;

function toIsoDate(millis: number): string {
  return new Date(millis).toISOString().slice(0, 10);
}

// Strips non-digits, caps at 6 digits, and groups them as 00-00-00 so the field
// reformats live while the user types (e.g. "245125" -> "24-51-25").
function formatSortCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  return digits.replace(/(\d{2})(?=\d)/g, "$1-");
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function InvoiceForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerFirstName: "",
      customerLastName: "",
      customerEmail: "",
      customerMobile: "",
      addressPremise: "",
      addressCity: "",
      addressCounty: "",
      addressPostcode: "",
      addressCountryCode: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankSortCode: "",
      invoiceNumber: "",
      invoiceReference: "",
      currency: "GBP",
      invoiceDate: "",
      dueDate: "",
      description: "",
      itemName: "",
      itemDescription: "",
      itemUOM: "UNIT",
      quantity: 1,
      rate: 0,
    },
  });

  // Seed the invoice number and dates on the client so each new invoice gets a
  // fresh, collision-resistant number without risking a hydration mismatch.
  useEffect(() => {
    const now = Date.now();
    setValue("invoiceNumber", suggestInvoiceNumber(now));
    setValue("invoiceDate", toIsoDate(now));
    setValue("dueDate", toIsoDate(now + 14 * 24 * 60 * 60 * 1000));
  }, [setValue]);

  const quantity = Number(useWatch({ control, name: "quantity" })) || 0;
  const rate = Number(useWatch({ control, name: "rate" })) || 0;
  const currency = useWatch({ control, name: "currency" }) ?? "GBP";
  const lineTotal = quantity * rate;

  async function onSubmit(values: InvoiceFormValues) {
    setServerError(null);
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setServerError(data.message ?? "Could not create the invoice. Please try again.");
      return;
    }

    const data = (await response.json()) as { invoiceNumber: string };
    router.push(`/?created=${encodeURIComponent(data.invoiceNumber)}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError ? <Alert tone="error">{serverError}</Alert> : null}

      <Section title="Customer">
        <Field label="First name" htmlFor="customerFirstName" required error={errors.customerFirstName?.message}>
          <input id="customerFirstName" className={controlClass} {...register("customerFirstName")} />
        </Field>
        <Field label="Last name" htmlFor="customerLastName" required error={errors.customerLastName?.message}>
          <input id="customerLastName" className={controlClass} {...register("customerLastName")} />
        </Field>
        <Field label="Email" htmlFor="customerEmail" required error={errors.customerEmail?.message}>
          <input id="customerEmail" type="email" className={controlClass} {...register("customerEmail")} />
        </Field>
        <Field label="Mobile number" htmlFor="customerMobile" required error={errors.customerMobile?.message}>
          <input id="customerMobile" className={controlClass} placeholder="+6597594971" {...register("customerMobile")} />
        </Field>
      </Section>

      <Section title="Billing address">
        <Field label="Address line" htmlFor="addressPremise" required error={errors.addressPremise?.message}>
          <input id="addressPremise" className={controlClass} {...register("addressPremise")} />
        </Field>
        <Field label="City" htmlFor="addressCity" required error={errors.addressCity?.message}>
          <input id="addressCity" className={controlClass} {...register("addressCity")} />
        </Field>
        <Field label="County" htmlFor="addressCounty" required error={errors.addressCounty?.message}>
          <input id="addressCounty" className={controlClass} {...register("addressCounty")} />
        </Field>
        <Field label="Postcode" htmlFor="addressPostcode" required error={errors.addressPostcode?.message}>
          <input id="addressPostcode" className={controlClass} {...register("addressPostcode")} />
        </Field>
        <Field
          label="Country code"
          htmlFor="addressCountryCode"
          required
          hint="Two letters, e.g. VN or GB"
          error={errors.addressCountryCode?.message}
        >
          <input id="addressCountryCode" maxLength={2} className={controlClass} {...register("addressCountryCode")} />
        </Field>
      </Section>

      <Section title="Payable to" description="Bank account the customer should pay into.">
        <Field label="Account name" htmlFor="bankAccountName" required error={errors.bankAccountName?.message}>
          <input id="bankAccountName" className={controlClass} {...register("bankAccountName")} />
        </Field>
        <Field label="Account number" htmlFor="bankAccountNumber" required error={errors.bankAccountNumber?.message}>
          <input id="bankAccountNumber" className={controlClass} {...register("bankAccountNumber")} />
        </Field>
        <Field label="Sort code" htmlFor="bankSortCode" required hint="Format 00-00-00" error={errors.bankSortCode?.message}>
          {(() => {
            const field = register("bankSortCode");
            return (
              <input
                id="bankSortCode"
                className={controlClass}
                placeholder="09-01-01"
                inputMode="numeric"
                maxLength={8}
                {...field}
                onChange={(event) => {
                  event.target.value = formatSortCode(event.target.value);
                  field.onChange(event);
                }}
              />
            );
          })()}
        </Field>
      </Section>

      <Section title="Invoice details">
        <Field label="Invoice number" htmlFor="invoiceNumber" required error={errors.invoiceNumber?.message}>
          <input id="invoiceNumber" className={controlClass} {...register("invoiceNumber")} />
        </Field>
        <Field label="Reference" htmlFor="invoiceReference" hint="Optional" error={errors.invoiceReference?.message}>
          <input id="invoiceReference" className={controlClass} {...register("invoiceReference")} />
        </Field>
        <Field label="Currency" htmlFor="currency" required error={errors.currency?.message}>
          <select id="currency" className={controlClass} {...register("currency")}>
            {CURRENCY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <div className="hidden sm:block" />
        <Field label="Invoice date" htmlFor="invoiceDate" required error={errors.invoiceDate?.message}>
          <input id="invoiceDate" type="date" className={controlClass} {...register("invoiceDate")} />
        </Field>
        <Field label="Due date" htmlFor="dueDate" required error={errors.dueDate?.message}>
          <input id="dueDate" type="date" className={controlClass} {...register("dueDate")} />
        </Field>
        <Field label="Description" htmlFor="description" className="sm:col-span-2" error={errors.description?.message}>
          <textarea id="description" rows={2} className={controlClass} {...register("description")} />
        </Field>
      </Section>

      <Section title="Line item" description="This invoice carries a single line item.">
        <Field label="Item name" htmlFor="itemName" required error={errors.itemName?.message}>
          <input id="itemName" className={controlClass} {...register("itemName")} />
        </Field>
        <Field label="Item description" htmlFor="itemDescription" error={errors.itemDescription?.message}>
          <input id="itemDescription" className={controlClass} {...register("itemDescription")} />
        </Field>
        <Field label="Unit" htmlFor="itemUOM" required error={errors.itemUOM?.message}>
          <select id="itemUOM" className={controlClass} {...register("itemUOM")}>
            {UOM_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </Field>
        <div className="hidden sm:block" />
        <Field label="Quantity" htmlFor="quantity" required error={errors.quantity?.message}>
          <input id="quantity" type="number" min={1} step={1} className={controlClass} {...register("quantity")} />
        </Field>
        <Field label="Rate" htmlFor="rate" required error={errors.rate?.message}>
          <input id="rate" type="number" min={0} step="0.01" className={controlClass} {...register("rate")} />
        </Field>
      </Section>

      <Section title="Adjustments" description="Optional tax and discount applied to the invoice.">
        <Field label="Tax (%)" htmlFor="taxPercent" hint="0–100" error={errors.taxPercent?.message}>
          <input id="taxPercent" type="number" min={0} max={100} step="0.01" className={controlClass} {...register("taxPercent")} />
        </Field>
        <Field label="Discount (fixed)" htmlFor="discountValue" error={errors.discountValue?.message}>
          <input id="discountValue" type="number" min={0} step="0.01" className={controlClass} {...register("discountValue")} />
        </Field>
      </Section>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ButtonLink href="/" variant="secondary">
          Cancel
        </ButtonLink>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            Line total <span className="font-medium text-foreground">{formatCurrency(lineTotal, currency)}</span>
          </span>
          <Button type="submit" disabled={isSubmitting}>
            <FileCheck2 className="size-4" aria-hidden />
            {isSubmitting ? "Creating…" : "Create invoice"}
          </Button>
        </div>
      </div>
    </form>
  );
}
