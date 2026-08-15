import { QueryTypes, Transaction } from "sequelize";

import { connectToDb, sequelize } from "../infrastructure/database";

type CountRow = { count: string | number };

export type ManualOrderBackfillResult = {
  customerAddressesUpdated: number;
  orderLineSkusUpdated: number;
};

/**
 * Repairs historical manual-order data using deterministic sources only:
 * - blank order-line SKUs come from the exact selected product variant;
 * - blank customer addresses come from one unambiguous address on the same phone number.
 */
export const backfillManualOrderData = async (): Promise<ManualOrderBackfillResult> =>
  sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (transaction) => {
    const skuRows = await sequelize.query<{ id: number }>(
      `
        with variant_matches as (
          select
            line.id as "orderLineId",
            nullif(btrim(variant.value->>'sku'), '') as sku
          from "orderLines" as line
          join products as product
            on product.id = line."productId"
           and product."deletedAt" is null
          cross join lateral jsonb_array_elements(coalesce(product.variants::jsonb, '[]'::jsonb)) as variant(value)
          where line."deletedAt" is null
            and nullif(btrim(coalesce(line.sku, '')), '') is null
            and nullif(btrim(variant.value->>'sku'), '') is not null
            and (
              variant.value->>'shopifyId' = line.variant_id
              or variant.value->>'id' = line.variant_id
            )
        ), unique_matches as (
          select "orderLineId", min(sku) as sku
          from variant_matches
          group by "orderLineId"
          having count(distinct sku) = 1
        )
        update "orderLines" as line
        set sku = matched.sku,
            "updatedAt" = now()
        from unique_matches as matched
        where line.id = matched."orderLineId"
        returning line.id
      `,
      { transaction, type: QueryTypes.SELECT },
    );

    const addressRows = await sequelize.query<{ id: number }>(
      `
        with address_sources as (
          select
            btrim("phoneNumber") as phone,
            min(btrim(address)) as address
          from customers
          where "deletedAt" is null
            and nullif(btrim(coalesce("phoneNumber", '')), '') is not null
            and regexp_replace(coalesce(address, ''), '[-,[:space:]]', '', 'g') <> ''
          group by btrim("phoneNumber")
          having count(distinct btrim(address)) = 1
        )
        update customers as customer
        set address = source.address,
            "updatedAt" = now()
        from address_sources as source
        where customer."deletedAt" is null
          and btrim(customer."phoneNumber") = source.phone
          and regexp_replace(coalesce(customer.address, ''), '[-,[:space:]]', '', 'g') = ''
        returning customer.id
      `,
      { transaction, type: QueryTypes.SELECT },
    );

    return {
      customerAddressesUpdated: addressRows.length,
      orderLineSkusUpdated: skuRows.length,
    };
  });

const main = async (): Promise<void> => {
  await connectToDb();
  const before = await sequelize.query<CountRow>(
    `
      select count(*)::int as count
      from "orderLines"
      where "deletedAt" is null
        and nullif(btrim(coalesce(sku, '')), '') is null
    `,
    { type: QueryTypes.SELECT },
  );
  const result = await backfillManualOrderData();
  const after = await sequelize.query<CountRow>(
    `
      select count(*)::int as count
      from "orderLines"
      where "deletedAt" is null
        and nullif(btrim(coalesce(sku, '')), '') is null
    `,
    { type: QueryTypes.SELECT },
  );

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    blankOrderLineSkusBefore: Number(before[0]?.count ?? 0),
    blankOrderLineSkusAfter: Number(after[0]?.count ?? 0),
    ...result,
  }, null, 2));
};

if (require.main === module) {
  void main()
    .catch((error: unknown) => {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await sequelize.close().catch(() => undefined);
    });
}
