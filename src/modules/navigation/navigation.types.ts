export type NavigationCounts = {
  factories: number;
  orders: number;
  products: number;
  updatedAt: string;
};

export interface NavigationCountsRepositoryContract {
  getCounts(vendorId?: number | null): Promise<Omit<NavigationCounts, "updatedAt">>;
}
