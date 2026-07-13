import { describe, expect, it } from "vitest";

import { invoiceFormSchema, loginSchema, type InvoiceFormValues } from "../schema";

describe("loginSchema", () => {
  it("accepts a filled-in form", () => {
    const result = loginSchema.safeParse({ username: "94756921275", password: "Password@12345" });
    expect(result.success).toBe(true);
  });

  it("rejects a blank username", () => {
    const result = loginSchema.safeParse({ username: "  ", password: "x" });
    expect(result.success).toBe(false);
  });
});

const validInvoice: InvoiceFormValues = {
  customerFirstName: "Nguyen",
  customerLastName: "Dung",
  customerEmail: "dung@example.com",
  customerMobile: "+6597594971",
  addressPremise: "CT11",
  addressCity: "hanoi",
  addressCounty: "hoangmai",
  addressPostcode: "1000",
  addressCountryCode: "VN",
  bankAccountName: "John Terry",
  bankAccountNumber: "12345678",
  bankSortCode: "09-01-01",
  invoiceNumber: "INV1001",
  invoiceReference: "#1001",
  currency: "GBP",
  invoiceDate: "2026-07-01",
  dueDate: "2026-07-15",
  description: "Consulting",
  itemName: "Honda Motor",
  itemDescription: "Honda RC150",
  itemUOM: "UNIT",
  quantity: 1,
  rate: 1000,
  taxPercent: 10,
  discountValue: 5,
};

describe("invoiceFormSchema", () => {
  it("accepts a complete, valid invoice", () => {
    expect(invoiceFormSchema.safeParse(validInvoice).success).toBe(true);
  });

  it("coerces numeric strings coming from inputs", () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, quantity: "2", rate: "49.99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(2);
      expect(result.data.rate).toBeCloseTo(49.99);
    }
  });

  it("rejects a due date before the invoice date", () => {
    const result = invoiceFormSchema.safeParse({ ...validInvoice, dueDate: "2026-06-01" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("dueDate"))).toBe(true);
    }
  });

  it("rejects an invalid email", () => {
    expect(invoiceFormSchema.safeParse({ ...validInvoice, customerEmail: "nope" }).success).toBe(false);
  });

  it("rejects a negative rate", () => {
    expect(invoiceFormSchema.safeParse({ ...validInvoice, rate: -1 }).success).toBe(false);
  });
});
