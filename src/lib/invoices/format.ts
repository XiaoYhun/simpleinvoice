export function formatCurrency(amount: number | null, currency: string): string {
  if (amount === null) return "—";
  const code = currency && /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : undefined;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: code ? "currency" : "decimal",
      currency: code,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`.trim();
  }
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** A collision-resistant invoice number, used to prefill the create form. */
export function suggestInvoiceNumber(now: number): string {
  return `INV${now}`;
}
