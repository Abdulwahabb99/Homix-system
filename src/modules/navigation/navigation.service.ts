import type { NavigationCountsRepositoryContract, NavigationCounts } from "./navigation.types";

export class NavigationCountsService {
  private readonly cache = new Map<string, { expiresAt: number; value: NavigationCounts }>();
  private readonly pending = new Map<string, Promise<NavigationCounts>>();
  private generation = 0;

  public constructor(private readonly repository: NavigationCountsRepositoryContract) {}

  public async getCounts(vendorId?: number | null): Promise<NavigationCounts> {
    const key = vendorId ? `vendor:${vendorId}` : "global";
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const running = this.pending.get(key);
    if (running) return running;

    const generation = this.generation;
    let request: Promise<NavigationCounts>;
    request = this.repository.getCounts(vendorId).then((counts) => {
      const value = { ...counts, updatedAt: new Date().toISOString() };
      if (generation === this.generation) {
        this.cache.set(key, { expiresAt: Date.now() + 5_000, value });
      }
      return value;
    }).finally(() => {
      if (this.pending.get(key) === request) this.pending.delete(key);
    });
    this.pending.set(key, request);
    return request;
  }

  public invalidate(): void {
    this.generation += 1;
    this.cache.clear();
    this.pending.clear();
  }
}
