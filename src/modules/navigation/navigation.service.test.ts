import { NavigationCountsService } from "./navigation.service";

describe("NavigationCountsService", () => {
  it("returns live repository counts with a refresh timestamp", async () => {
    const repository = {
      getCounts: jest.fn().mockResolvedValue({ factories: 3, orders: 72, products: 1_204 }),
    };
    const service = new NavigationCountsService(repository);

    const result = await service.getCounts(9);

    expect(repository.getCounts).toHaveBeenCalledWith(9);
    expect(result).toEqual(expect.objectContaining({ factories: 3, orders: 72, products: 1_204 }));
    expect(Number.isNaN(Date.parse(result.updatedAt))).toBe(false);
  });

  it("shares a short-lived result and can invalidate it after a mutation", async () => {
    const repository = {
      getCounts: jest.fn()
        .mockResolvedValueOnce({ factories: 3, orders: 72, products: 1_204 })
        .mockResolvedValueOnce({ factories: 4, orders: 73, products: 1_205 }),
    };
    const service = new NavigationCountsService(repository);

    expect((await service.getCounts()).orders).toBe(72);
    expect((await service.getCounts()).orders).toBe(72);
    expect(repository.getCounts).toHaveBeenCalledTimes(1);

    service.invalidate();
    expect((await service.getCounts()).orders).toBe(73);
    expect(repository.getCounts).toHaveBeenCalledTimes(2);
  });
});
