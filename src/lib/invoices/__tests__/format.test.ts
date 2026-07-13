import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, suggestInvoiceNumber } from "../format";

describe("formatCurrency", () => {
  it("formats a known currency", () => {
    expect(formatCurrency(1200, "GBP")).toBe("£1,200.00");
  });

  it("renders an em dash for a null amount", () => {
    expect(formatCurrency(null, "GBP")).toBe("—");
  });

  it("falls back to a plain number for an unknown currency code", () => {
    expect(formatCurrency(50, "XYZ")).toContain("50");
  });
});

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-07-01")).toBe("01 Jul 2026");
  });

  it("returns an em dash for an empty value", () => {
    expect(formatDate("")).toBe("—");
  });

  it("returns the raw value when it cannot be parsed", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("suggestInvoiceNumber", () => {
  it("prefixes a timestamp", () => {
    expect(suggestInvoiceNumber(1_700_000_000_000)).toBe("INV1700000000000");
  });
});
