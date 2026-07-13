import { describe, expect, it } from "vitest";

import { buildCreateInvoicePayload } from "../payload";
import type { InvoiceFormValues } from "../schema";

const base: InvoiceFormValues = {
  customerFirstName: "Nguyen",
  customerLastName: "Dung",
  customerEmail: "dung@example.com",
  customerMobile: "+6597594971",
  addressPremise: "CT11",
  addressCity: "hanoi",
  addressCounty: "hoangmai",
  addressPostcode: "1000",
  addressCountryCode: "vn",
  bankAccountName: "John Terry",
  bankAccountNumber: "12345678",
  bankSortCode: "09-01-01",
  invoiceNumber: "INV1001",
  invoiceReference: "",
  currency: "GBP",
  invoiceDate: "2026-07-01",
  dueDate: "2026-07-15",
  description: "Consulting",
  itemName: "Honda Motor",
  itemDescription: "Honda RC150",
  itemUOM: "UNIT",
  quantity: 2,
  rate: 1000,
};

describe("buildCreateInvoicePayload", () => {
  it("wraps a single invoice with a single line item", () => {
    const payload = buildCreateInvoicePayload(base);
    expect(payload.invoices).toHaveLength(1);
    expect(payload.invoices[0].items).toHaveLength(1);
  });

  it("uppercases the country code and derives the item reference", () => {
    const invoice = buildCreateInvoicePayload(base).invoices[0];
    expect(invoice.customer.addresses[0].countryCode).toBe("VN");
    expect(invoice.items[0].itemReference).toBe("INV1001-1");
  });

  it("falls back to the invoice number when no reference is given", () => {
    const invoice = buildCreateInvoicePayload(base).invoices[0];
    expect(invoice.invoiceReference).toBe("INV1001");
  });

  it("omits tax and discount extensions when not provided", () => {
    const invoice = buildCreateInvoicePayload(base).invoices[0];
    expect(invoice.extensions).toEqual([]);
  });

  it("adds tax and discount extensions when provided", () => {
    const invoice = buildCreateInvoicePayload({ ...base, taxPercent: 10, discountValue: 5 }).invoices[0];
    expect(invoice.extensions).toEqual([
      { addDeduct: "ADD", type: "PERCENTAGE", value: 10, name: "tax" },
      { addDeduct: "DEDUCT", type: "FIXED_VALUE", value: 5, name: "discount" },
    ]);
  });

  it("copies the item name into the description when the item description is blank", () => {
    const invoice = buildCreateInvoicePayload({ ...base, itemDescription: "" }).invoices[0];
    expect(invoice.items[0].description).toBe("Honda Motor");
  });
});
