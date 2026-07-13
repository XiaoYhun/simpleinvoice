import { describe, expect, it } from "vitest";

import { buildUpstreamInvoiceQuery, parseListParams, toBrowserQuery } from "../query";

describe("parseListParams", () => {
  it("applies sensible defaults for an empty query", () => {
    expect(parseListParams({})).toEqual({
      keyword: "",
      status: "",
      fromDate: "",
      toDate: "",
      sortBy: "CREATED_DATE",
      ordering: "DESCENDING",
      pageNum: 1,
      pageSize: 10,
    });
  });

  it("clamps a page number below one", () => {
    expect(parseListParams({ pageNum: "0" }).pageNum).toBe(1);
    expect(parseListParams({ pageNum: "-3" }).pageNum).toBe(1);
  });

  it("ignores an unsupported page size", () => {
    expect(parseListParams({ pageSize: "999" }).pageSize).toBe(10);
    expect(parseListParams({ pageSize: "20" }).pageSize).toBe(20);
  });

  it("drops an unknown sort or status value", () => {
    const params = parseListParams({ sortBy: "HACK", status: "MADE_UP" });
    expect(params.sortBy).toBe("CREATED_DATE");
    expect(params.status).toBe("");
  });

  it("reads the first value when a param repeats", () => {
    expect(parseListParams({ keyword: ["IV123", "IV456"] }).keyword).toBe("IV123");
  });
});

describe("buildUpstreamInvoiceQuery", () => {
  it("always includes sort, order and paging", () => {
    const qs = buildUpstreamInvoiceQuery(parseListParams({}));
    expect(qs).toContain("sortBy=CREATED_DATE");
    expect(qs).toContain("ordering=DESCENDING");
    expect(qs).toContain("pageNum=1");
    expect(qs).toContain("pageSize=10");
  });

  it("omits blank filters but includes populated ones", () => {
    const qs = buildUpstreamInvoiceQuery(parseListParams({ keyword: "IV900", status: "PAID" }));
    expect(qs).toContain("keyword=IV900");
    expect(qs).toContain("status=PAID");
    expect(qs).not.toContain("fromDate");
  });
});

describe("toBrowserQuery", () => {
  it("omits values that equal the defaults", () => {
    expect(toBrowserQuery({ sortBy: "CREATED_DATE", ordering: "DESCENDING", pageNum: 1, pageSize: 10 })).toBe("");
  });

  it("keeps non-default values", () => {
    const qs = toBrowserQuery({ pageNum: 3, ordering: "ASCENDING" });
    expect(qs).toContain("pageNum=3");
    expect(qs).toContain("ordering=ASCENDING");
  });
});
