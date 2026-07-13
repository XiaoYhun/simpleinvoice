import { describe, expect, it } from "vitest";

import { normalizeInvoiceList } from "../normalize";
import { parseListParams } from "../query";

const params = parseListParams({});

describe("normalizeInvoiceList", () => {
  it("reads invoices nested under data.invoices with paging", () => {
    const payload = {
      data: {
        invoices: [
          {
            invoiceId: "abc-1",
            invoiceNumber: "IV1001",
            invoiceReference: "#1001",
            currency: "GBP",
            total: 1200,
            status: "PAID",
            customer: { firstName: "Nguyen", lastName: "Dung" },
            invoiceDate: "2026-07-01",
            dueDate: "2026-07-15",
            createdDate: "2026-07-01",
          },
        ],
        paging: { pageNum: 1, pageSize: 10, total: 42 },
      },
    };
    const result = normalizeInvoiceList(payload, params);
    expect(result.invoices).toHaveLength(1);
    expect(result.invoices[0]).toMatchObject({
      id: "abc-1",
      invoiceNumber: "IV1001",
      customerName: "Nguyen Dung",
      total: 1200,
      status: "PAID",
    });
    expect(result.paging.total).toBe(42);
    expect(result.paging.totalPages).toBe(5);
  });

  it("accepts a bare top-level array", () => {
    const result = normalizeInvoiceList([{ invoiceNumber: "IV1" }, { invoiceNumber: "IV2" }], params);
    expect(result.invoices.map((i) => i.invoiceNumber)).toEqual(["IV1", "IV2"]);
  });

  it("reads records under an alternative key", () => {
    const result = normalizeInvoiceList({ data: { records: [{ invoiceNumber: "IV9" }] } }, params);
    expect(result.invoices[0].invoiceNumber).toBe("IV9");
  });

  it("falls back gracefully on missing fields", () => {
    const result = normalizeInvoiceList({ data: { invoices: [{}] } }, params);
    expect(result.invoices[0].total).toBeNull();
    expect(result.invoices[0].status).toBe("UNKNOWN");
    expect(result.invoices[0].customerName).toBe("");
  });

  it("returns an empty list for an unexpected payload", () => {
    expect(normalizeInvoiceList(null, params).invoices).toEqual([]);
    expect(normalizeInvoiceList({ errors: [{ code: "401" }] }, params).invoices).toEqual([]);
  });
});
