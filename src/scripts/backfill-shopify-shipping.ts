/**
 * Backfills shipping on imported Shopify orders.
 *
 * The importer used to read `order.shippingFees`, a field that only exists on the
 * manual-order payload, so every imported order stored 0 shipping. This re-reads
 * the shipping from Shopify and writes the proportional share onto each Homix row.
 *
 * One Shopify order becomes one Homix row per unit, but shipping is charged once,
 * so it is split by line value and the rounding remainder goes to the largest row —
 * the shares always add back up to what the customer actually paid.
 *
 * Scoped by default to orders still in flight — قيد التصنيع (2) and في المخزن (8) —
 * the same set the deploy script recomputes collection amounts for. A delivered or
 * cancelled order's figures are historical and are left alone.
 *
 * Read-only by default. Pass --apply to write.
 *
 *   npm run db:backfill-shopify-shipping                       # preview (status 2,8)
 *   npm run db:backfill-shopify-shipping -- --apply            # write
 *   npm run db:backfill-shopify-shipping -- --from=2026-08-13  # narrow by date
 *   npm run db:backfill-shopify-shipping -- --statuses=2,8,5   # override statuses
 *   npm run db:backfill-shopify-shipping -- --all-statuses     # every status
 */
import { QueryTypes } from "sequelize";

import { connectToDb, sequelize } from "../infrastructure/database";

const shopifyClient = require("../../config/shopify");

/** Shopify REST allows ~2 calls/second on standard plans. */
const SHOPIFY_REQUEST_DELAY_MS = 600;

/** قيد التصنيع + في المخزن — orders whose money is still to be collected. */
const DEFAULT_STATUSES = [2, 8];

type OrderRow = {
  id: number;
  shopifyId: string;
  subTotalPrice: string | number | null;
  shippingFees: string | number | null;
  totalDiscounts: string | number | null;
  downPayment: string | number | null;
};

const hasFlag = (flag: string): boolean => process.argv.includes(flag);

const getFlagValue = (name: string): string | null => {
  const flag = process.argv.find((argument) => argument.startsWith(`--${name}=`));
  return flag ? flag.split("=")[1] ?? null : null;
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCents = (value: number): number => Math.round(value * 100);

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Shipping lives in shipping_lines, with total_shipping_price_set as the fallback. */
const readShopifyShipping = (order: Record<string, any>): number => {
  if (Array.isArray(order.shipping_lines) && order.shipping_lines.length > 0) {
    return order.shipping_lines.reduce(
      (total: number, line: Record<string, unknown>) => total + toNumber(line?.price),
      0,
    );
  }

  return toNumber(order.total_shipping_price_set?.shop_money?.amount);
};

/**
 * Splits `totalCents` across rows in proportion to their value. The remainder from
 * rounding is given to the largest row so the parts always sum to the whole.
 */
const splitProportionally = (totalCents: number, weights: number[]): number[] => {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal <= 0 || totalCents === 0) {
    return weights.map(() => 0);
  }

  const shares = weights.map((weight) => Math.floor((totalCents * weight) / weightTotal));
  const distributed = shares.reduce((sum, share) => sum + share, 0);
  let remainder = totalCents - distributed;

  // Hand the leftover cents to the largest rows first.
  const orderByWeight = weights
    .map((weight, index) => ({ index, weight }))
    .sort((left, right) => right.weight - left.weight);

  for (const { index } of orderByWeight) {
    if (remainder <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    remainder -= 1;
  }

  return shares;
};

const main = async (): Promise<void> => {
  const apply = hasFlag("--apply");
  const from = getFlagValue("from");
  const to = getFlagValue("to");
  const statuses = hasFlag("--all-statuses")
    ? null
    : (getFlagValue("statuses")?.split(",").map((value) => Number(value.trim())).filter(Number.isFinite)
        ?? DEFAULT_STATUSES);

  console.log(
    `\n==> Backfilling Shopify shipping` +
      `${statuses ? ` for orders with status ${statuses.join(", ")}` : " for every status"}` +
      `${from ? ` from ${from}` : ""}${to ? ` to ${to}` : ""}` +
      `${apply ? "" : "  [DRY RUN — pass --apply to write]"}`,
  );

  await connectToDb();

  const rows = await sequelize.query<OrderRow>(
    `
      select id, "shopifyId", "subTotalPrice", "shippingFees", "totalDiscounts", "downPayment"
      from orders
      where "deletedAt" is null
        and "shopifyId" is not null
        and trim("shopifyId") not in ('', 'custom', 'undefined')
        ${statuses ? `and status in (${statuses.join(", ")})` : ""}
        ${from ? `and "orderDate" >= :from::date` : ""}
        ${to ? `and "orderDate" < (:to::date + interval '1 day')` : ""}
      order by "shopifyId", id
    `,
    { replacements: { ...(from ? { from } : {}), ...(to ? { to } : {}) }, type: QueryTypes.SELECT },
  );

  if (rows.length === 0) {
    console.log("  no imported orders match that scope");
    return;
  }

  const byShopifyId = new Map<string, OrderRow[]>();
  for (const row of rows) {
    const group = byShopifyId.get(row.shopifyId) ?? [];
    group.push(row);
    byShopifyId.set(row.shopifyId, group);
  }

  console.log(`  ${rows.length} Homix rows across ${byShopifyId.size} Shopify orders\n`);

  let updatedRows = 0;
  let skippedOrders = 0;

  for (const [shopifyId, group] of byShopifyId) {
    let shopifyOrder: Record<string, any>;
    try {
      const response: any = await shopifyClient.get({
        path: `orders/${shopifyId}`,
        query: { fields: "id,name,shipping_lines,total_shipping_price_set" },
      });
      shopifyOrder = response.body.order;
    } catch (error) {
      console.warn(`  ! ${shopifyId}: could not fetch from Shopify — ${error instanceof Error ? error.message : error}`);
      skippedOrders += 1;
      continue;
    } finally {
      await sleep(SHOPIFY_REQUEST_DELAY_MS);
    }

    if (!shopifyOrder) {
      console.warn(`  ! ${shopifyId}: not found in Shopify`);
      skippedOrders += 1;
      continue;
    }

    const shippingCents = toCents(readShopifyShipping(shopifyOrder));
    const weights = group.map((row) => toCents(toNumber(row.subTotalPrice)));
    const shares = splitProportionally(shippingCents, weights);

    const pending = group
      .map((row, index) => ({ nextShippingCents: shares[index]!, row }))
      .filter(({ nextShippingCents, row }) => toCents(toNumber(row.shippingFees)) !== nextShippingCents);

    if (pending.length === 0) {
      continue;
    }

    console.log(
      `  ${shopifyOrder.name ?? shopifyId}: shipping ${shippingCents / 100} across ${group.length} row(s)`,
    );

    for (const { nextShippingCents, row } of pending) {
      const shippingFees = nextShippingCents / 100;
      /* toBeCollected depends on shipping, so it is recomputed with the same
         formula the API uses (normalizeOrderMutationPayload). */
      const toBeCollected =
        toNumber(row.subTotalPrice) + shippingFees - toNumber(row.totalDiscounts) - toNumber(row.downPayment);

      console.log(
        `    order ${row.id}: shipping ${toNumber(row.shippingFees)} -> ${shippingFees}, toBeCollected -> ${toBeCollected}`,
      );

      if (apply) {
        await sequelize.query(
          `update orders set "shippingFees" = :shippingFees, "toBeCollected" = :toBeCollected, "updatedAt" = now() where id = :id`,
          { replacements: { id: row.id, shippingFees, toBeCollected } },
        );
      }
      updatedRows += 1;
    }
  }

  console.log(
    `\n${apply ? "Updated" : "Would update"} ${updatedRows} row(s)` +
      `${skippedOrders > 0 ? `, skipped ${skippedOrders} Shopify order(s)` : ""}`,
  );
  if (!apply && updatedRows > 0) {
    console.log("Re-run with --apply to write these changes.");
  }
};

void main()
  .catch((error: unknown) => {
    console.error("Shopify shipping backfill failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close().catch(() => undefined);
  });
