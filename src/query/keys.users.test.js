import { userKeys } from "./keys";

describe("userKeys", () => {
  it("keeps the Users screen cache (team + vendor accounts) apart from the picker lists (team only)", () => {
    expect(userKeys.listWithVendors()).not.toEqual(userKeys.list());
    expect(userKeys.listWithVendors().slice(0, 1)).toEqual(userKeys.all());
  });
});
