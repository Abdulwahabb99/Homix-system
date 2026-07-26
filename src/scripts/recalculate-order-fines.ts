import { QueryTypes } from "sequelize";
import moment from "moment";

import { connectToDb, sequelize } from "../infrastructure/database";

const ORDER_STATUS = {
  CANCELED: 4,
  DELIVERED: 5,
  IN_INVENTORY: 8,
} as const;

const FINAL_FINE_STATUSES = [
  ORDER_STATUS.CANCELED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.IN_INVENTORY,
] as const;

const normalizeNumber = (value: unknown): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const calculateExceededDays = ({
  orderDate,
  daysToDeliver,
  expectedDeliveryDate,
  endDate = new Date(),
}: {
  orderDate?: unknown;
  daysToDeliver?: unknown;
  expectedDeliveryDate?: unknown;
  endDate?: Date;
}): number => {
  const endMoment = moment(endDate);
  if (!endMoment.isValid()) {
    return 0;
  }

  const deliveryWindow = normalizeNumber(daysToDeliver);
  if (orderDate && deliveryWindow > 0) {
    const startMoment = moment(orderDate);
    if (startMoment.isValid()) {
      return Math.max(
        0,
        endMoment.clone().startOf("day").diff(startMoment.clone().startOf("day"), "days") - deliveryWindow,
      );
    }
  }

  if (expectedDeliveryDate) {
    const expectedMoment = moment(expectedDeliveryDate);
    if (expectedMoment.isValid()) {
      return Math.max(
        0,
        endMoment.clone().startOf("day").diff(expectedMoment.clone().startOf("day"), "days"),
      );
    }
  }

  return 0;
};

const calculateOrderFine = ({
  baseAmount,
  daysToDeliver,
  orderDate,
  expectedDeliveryDate,
  endDate = new Date(),
}: {
  baseAmount?: unknown;
  daysToDeliver?: unknown;
  orderDate?: unknown;
  expectedDeliveryDate?: unknown;
  endDate?: Date;
}): number => {
  const exceededDays = calculateExceededDays({
    daysToDeliver,
    endDate,
    expectedDeliveryDate,
    orderDate,
  });

  if (exceededDays < 1) {
    return 0;
  }

  return Math.round(normalizeNumber(baseAmount) * 0.01 * exceededDays * 100) / 100;
};

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
