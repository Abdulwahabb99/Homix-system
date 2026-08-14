import { QueryTypes } from "sequelize";
import { connectToDb, sequelize } from "../infrastructure/database";
import { calculateOrderFine } from "../modules/orders/order-fines";

const ORDER_STATUS = {
  CANCELED: 4,
  DELIVERED: 5,
  REFUNDED: 6,
  REPLACED: 7,
  IN_INVENTORY: 8,
} as const;

const FINAL_FINE_STATUSES = [
  ORDER_STATUS.CANCELED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REFUNDED,
  ORDER_STATUS.REPLACED,
  ORDER_STATUS.IN_INVENTORY,
] as const;

const normalizeNumber = (value: unknown): number => Number.isFinite(Number(value)) ? Number(value) : 0;

const main = async (): Promise<void> => {
  await connectToDb();

  const rows = await sequelize.query<{
    id: number;
    fine: string | number | null;
    orderDate: string | null;
    expectedDeliveryDate: string | null;
    subTotalPrice: string | number | null;
    daysToDeliver: number | null;
  }>(`
    select
      o.id,
      o.fine,
      o."orderDate",
      o."expectedDeliveryDate",
      o."subTotalPrice",
      v."daysToDeliver"
    from orders o
    left join "orderLines" ol on ol."orderId" = o.id
    left join products p on p.id = ol."productId"
    left join vendors v on v.id = p."vendorId"
    where o.status not in (:finalStatuses)
    order by o.id asc, ol.id asc
  `, {
    replacements: {
      finalStatuses: FINAL_FINE_STATUSES,
    },
    type: QueryTypes.SELECT,
  });

  const seen = new Set<number>();
  let updatedCount = 0;

  for (const row of rows) {
    if (seen.has(row.id)) {
      continue;
    }
    seen.add(row.id);

    const nextFine = calculateOrderFine({
      baseAmount: row.subTotalPrice,
      daysToDeliver: row.daysToDeliver,
      expectedDeliveryDate: row.expectedDeliveryDate,
      orderDate: row.orderDate,
    });

    if (normalizeNumber(row.fine) === nextFine) {
      continue;
    }

    await sequelize.query(
      `update orders set fine = :fine, "updatedAt" = now() where id = :id`,
      {
        replacements: {
          fine: nextFine,
          id: row.id,
        },
      },
    );
    updatedCount += 1;
  }

  console.log(JSON.stringify({
    status: true,
    updatedCount,
    scannedCount: seen.size,
  }, null, 2));
  await sequelize.close();
};

main().catch(async (error) => {
  console.error(error);
  await sequelize.close();
  process.exit(1);
});
