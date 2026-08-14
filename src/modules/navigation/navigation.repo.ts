import { QueryTypes } from "sequelize";

import { sequelize } from "../../infrastructure/database";
import type { NavigationCountsRepositoryContract } from "./navigation.types";

type CountRow = {
  factories: string | number;
  orders: string | number;
  products: string | number;
};

const toCount = (value: string | number): number => {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
};

/**
 * Loads every sidebar counter in one database round trip. Vendor users only
 * see orders containing one of their products and their own product count.
 */
export class NavigationCountsRepository implements NavigationCountsRepositoryContract {
  public async getCounts(vendorId?: number | null): Promise<{
    factories: number;
    orders: number;
    products: number;
  }> {
    const rows = await sequelize.query<CountRow>(
      `select
        (select count(*) from "factories" f where f."deletedAt" is null) as "factories",
        (select count(*)
           from "orders" o
          where o."deletedAt" is null
            and (
              cast(:vendorId as integer) is null
              or exists (
                select 1
                  from "orderLines" ol
                  join "products" p on p.id = ol."productId" and p."deletedAt" is null
                 where ol."orderId" = o.id
                   and ol."deletedAt" is null
                   and p."vendorId" = cast(:vendorId as integer)
              )
            )) as "orders",
        (select count(*)
           from "products" p
          where p."deletedAt" is null
            and (cast(:vendorId as integer) is null or p."vendorId" = cast(:vendorId as integer))) as "products"`,
      {
        replacements: { vendorId: vendorId ?? null },
        type: QueryTypes.SELECT,
      },
    );

    const row = rows[0] ?? { factories: 0, orders: 0, products: 0 };
    return {
      factories: toCount(row.factories),
      orders: toCount(row.orders),
      products: toCount(row.products),
    };
  }
}
