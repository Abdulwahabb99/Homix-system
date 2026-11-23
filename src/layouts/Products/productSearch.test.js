import { buildProductSearchUpdate } from "./productSearch";

describe("buildProductSearchUpdate", () => {
  it("trims the draft and resets to page 1", () => {
    expect(buildProductSearchUpdate("  قميص ")).toEqual({ searchQuery: "قميص", page: "1" });
  });

  it("returns an empty query for clear / blank drafts so the param is removed", () => {
    expect(buildProductSearchUpdate("")).toEqual({ searchQuery: "", page: "1" });
    expect(buildProductSearchUpdate("   ")).toEqual({ searchQuery: "", page: "1" });
    expect(buildProductSearchUpdate(undefined)).toEqual({ searchQuery: "", page: "1" });
  });
});
