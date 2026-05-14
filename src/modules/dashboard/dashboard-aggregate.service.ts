import { Op, QueryTypes } from "sequelize";

import { logger } from "../../shared/logger";
import { sequelize } from "../../infrastructure/database";
import type {
  DashboardLeaderboardEntry,
  DashboardMetricSnapshot,
  DashboardMetricsInput,
  DashboardPerformancePoint,
  DashboardSalesDistributionItem,
} from "./dashboard.types";

type AggregateRecord = {
  activeMakers: number;
  activeProducts: number;
  canceledOrRefundedOrders: number;
  deliveredOrders: number;
  inProgressOrders: number;
  metricDate: string;
  pendingOrders: number;
  role: "admin" | "vendor";
  scopeId: number;
  totalOrders: number;
  totalSales: number;
  vendorId?: number | null;
};

type DashboardAggregateSource = {
  getDeliveredOrdersCountFromOrders: (input: DashboardMetricsInput) => Promise<number>;
  getSnapshotFromOrders: (input: DashboardMetricsInput) => Promise<DashboardMetricSnapshot>;
};

type DashboardDailyMetricModel = {
  bulkCreate: (payloads: AggregateRecord[], options?: Record<string, unknown>) => Promise<unknown>;
  destroy: (options?: Record<string, unknown>) => Promise<number>;
  findAll: <TRow = AggregateRecord>(options?: Record<string, unknown>) => Promise<TRow[]>;
  sync: (options?: Record<string, unknown>) => Promise<unknown>;
  upsert: (payload: AggregateRecord) => Promise<unknown>;
};

type DashboardDailyProductSaleModel = {
  bulkCreate: (payloads: ProductAggregateRecord[], options?: Record<string, unknown>) => Promise<unknown>;
  destroy: (options?: Record<string, unknown>) => Promise<number>;
  sync: (options?: Record<string, unknown>) => Promise<unknown>;
};

type DashboardDailyCategorySaleModel = {
  bulkCreate: (payloads: CategoryAggregateRecord[], options?: Record<string, unknown>) => Promise<unknown>;
  destroy: (options?: Record<string, unknown>) => Promise<number>;
  sync: (options?: Record<string, unknown>) => Promise<unknown>;
};

type OrderRecord = {
  orderDate?: string | Date | null;
  toJSON?: () => { orderDate?: string | Date | null };
};

type OrderModel = {
  findAll: <TRow = OrderRecord>(options?: Record<string, unknown>) => Promise<TRow[]>;
};

type DailyAdminRow = {
  activeMakers: number | string | null;
  deliveredOrders: number | string | null;
  metricDate: string;
  pendingOrders: number | string | null;
  totalOrders: number | string | null;
  totalSales: number | string | null;
};

type DailyVendorRow = {
  activeProducts: number | string | null;
  deliveredOrders: number | string | null;
  metricDate: string;
  pendingOrders: number | string | null;
  totalOrders: number | string | null;
  totalSales: number | string | null;
  vendorId: number | string;
};

type ProductAggregateRecord = {
  metricDate: string;
  productId: number;
  productTitle: string;
  totalOrders: number;
  totalQuantity: number;
  totalSales: number;
  vendorId: number;
};

type CategoryAggregateRecord = {
  categoryId: number;
  categoryTitle: string;
  metricDate: string;
  role: "admin" | "vendor";
  scopeId: number;
  totalOrders: number;
  totalQuantity: number;
  totalSales: number;
  vendorId?: number | null;
};

type LeaderboardAggregateRow = {
  id: number | string | null;
  name: string;
  secondaryLabel: string;
  totalSales: number | string | null;
};

type DistributionAggregateRow = {
  label: string;
  totalSales: number | string | null;
};

const dashboardDailyMetricModel = require("./dashboard-daily-metric.model") as DashboardDailyMetricModel;
const dashboardDailyProductSaleModel = require("./dashboard-daily-product-sale.model") as DashboardDailyProductSaleModel;
const dashboardDailyCategorySaleModel = require("./dashboard-daily-category-sale.model") as DashboardDailyCategorySaleModel;
const orderModel = require("../../../app/modules/order/order.model") as OrderModel;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const AGGREGATE_LOG_OPERATION = "dashboard-aggregate";
const BULK_UPDATE_FIELDS = [
  "activeMakers",
  "activeProducts",
  "canceledOrRefundedOrders",
  "deliveredOrders",
  "inProgressOrders",
  "pendingOrders",
  "totalOrders",
  "totalSales",
  "vendorId",
] as const;
const BULK_PRODUCT_UPDATE_FIELDS = [
  "productTitle",
  "totalOrders",
  "totalQuantity",
  "totalSales",
] as const;
const BULK_CATEGORY_UPDATE_FIELDS = [
  "categoryTitle",
  "totalOrders",
  "totalQuantity",
  "totalSales",
  "vendorId",
] as const;
const OPEN_STATUS_SQL = "1,2,3";
const PENDING_STATUS_SQL = "1";
const IN_PROGRESS_STATUS_SQL = "2";
const DELIVERED_STATUS_SQL = "5";
const CANCELED_OR_REFUNDED_STATUS_SQL = "4,6,7";
const UNCATEGORIZED_CATEGORY_ID = 0;
const UNCATEGORIZED_CATEGORY_TITLE = "أخرى";
const MAX_LEADERBOARD_ITEMS = 10;

const toPlain = <TRow extends { toJSON?: () => TRow }>(row: TRow): TRow => {
  return typeof row.toJSON === "function" ? row.toJSON() : row;
};

const toDateOnly = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const normalizeBoundary = (value: string | Date): Date => {
  return value instanceof Date ? new Date(value) : new Date(value);
};

const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  for (let cursor = new Date(startDate); cursor <= endDate; cursor = new Date(cursor.getTime() + DAY_IN_MILLISECONDS)) {
    dates.push(new Date(cursor));
  }

  return dates;
};

const getExpectedRowCount = (input: DashboardMetricsInput): number => {
  return getDateRange(normalizeBoundary(input.startDate), normalizeBoundary(input.endDate)).length;
};

const getScopeId = (input: DashboardMetricsInput): number => {
  return input.role === "vendor" ? input.vendorId ?? 0 : 0;
};

const toAggregateRecord = (
  metricDate: string,
  input: DashboardMetricsInput,
  snapshot: DashboardMetricSnapshot,
  deliveredOrders: number,
): AggregateRecord => ({
  activeMakers: snapshot.activeMakers,
  activeProducts: snapshot.activeProducts,
  deliveredOrders,
  canceledOrRefundedOrders: 0,
  inProgressOrders: 0,
  metricDate,
  pendingOrders: snapshot.pendingOrders,
  role: input.role,
  scopeId: getScopeId(input),
  totalOrders: snapshot.totalOrders,
  totalSales: snapshot.totalSales,
  vendorId: input.vendorId ?? null,
});

export type OrderSummaryAggregate = {
  canceledOrRefundedOrders: number;
  deliveredOrders: number;
  inProgressOrders: number;
  pendingOrders: number;
  totalOrders: number;
};

export class DashboardAggregateService {
  public constructor(private readonly dashboardSource: DashboardAggregateSource) {}

  public async ensureTable(): Promise<void> {
    await Promise.all([
      dashboardDailyMetricModel.sync(),
      dashboardDailyProductSaleModel.sync(),
      dashboardDailyCategorySaleModel.sync(),
    ]);
  }

  public async getSnapshot(
    input: DashboardMetricsInput,
  ): Promise<DashboardMetricSnapshot | null> {
    const rows = await dashboardDailyMetricModel.findAll<AggregateRecord>({
      where: {
        metricDate: {
          between: [input.startDate.slice(0, 10), input.endDate.slice(0, 10)],
        },
        role: input.role,
        scopeId: getScopeId(input),
      },
    });

    if (rows.length !== getExpectedRowCount(input)) {
      return null;
    }

    return rows.reduce<DashboardMetricSnapshot>(
      (summary, row) => ({
        activeMakers: summary.activeMakers + Number(row.activeMakers ?? 0),
        activeProducts: summary.activeProducts + Number(row.activeProducts ?? 0),
        pendingOrders: summary.pendingOrders + Number(row.pendingOrders ?? 0),
        totalOrders: summary.totalOrders + Number(row.totalOrders ?? 0),
        totalSales: summary.totalSales + Number(row.totalSales ?? 0),
      }),
      {
        activeMakers: 0,
        activeProducts: 0,
        pendingOrders: 0,
        totalOrders: 0,
        totalSales: 0,
      },
    );
  }

  public async getPerformanceSeries(
    input: DashboardMetricsInput,
  ): Promise<DashboardPerformancePoint[] | null> {
    const rows = await dashboardDailyMetricModel.findAll<AggregateRecord>({
      order: [["metricDate", "ASC"]],
      where: {
        metricDate: {
          between: [input.startDate.slice(0, 10), input.endDate.slice(0, 10)],
        },
        role: input.role,
        scopeId: getScopeId(input),
      },
    });

    if (rows.length !== getExpectedRowCount(input)) {
      return null;
    }

    return rows.map((row) => ({
      date: row.metricDate,
      orders: Number(row.totalOrders ?? 0),
      sales: Number(row.totalSales ?? 0),
    }));
  }

  public async getDeliveredOrdersCount(input: DashboardMetricsInput): Promise<number | null> {
    const rows = await dashboardDailyMetricModel.findAll<AggregateRecord>({
      where: {
        metricDate: {
          between: [input.startDate.slice(0, 10), input.endDate.slice(0, 10)],
        },
        role: input.role,
        scopeId: getScopeId(input),
      },
    });

    if (rows.length !== getExpectedRowCount(input)) {
      return null;
    }

    return rows.reduce((sum, row) => sum + Number(row.deliveredOrders ?? 0), 0);
  }

  public async getLeaderboard(
    input: DashboardMetricsInput,
  ): Promise<DashboardLeaderboardEntry[] | null> {
    if (!(await this.hasCoverage(input))) {
      return null;
    }

    const rows = input.role === "vendor" && input.vendorId
      ? await this.getVendorLeaderboardRows(input)
      : await this.getAdminLeaderboardRows(input);

    return rows.map((row, index) => ({
      id: row.id === null ? null : Number(row.id),
      name: row.name,
      rank: index + 1,
      secondaryLabel: row.secondaryLabel,
      totalSales: Number(row.totalSales ?? 0),
    }));
  }

  public async getSalesDistribution(
    input: DashboardMetricsInput,
  ): Promise<Array<{ label: string; value: number }> | null> {
    if (!(await this.hasCoverage(input))) {
      return null;
    }

    const rows = await sequelize.query<DistributionAggregateRow>(
      `
        SELECT
          "categoryTitle" AS "label",
          SUM("totalSales")::numeric AS "totalSales"
        FROM "dashboardDailyCategorySales"
        WHERE "metricDate" BETWEEN :startDate AND :endDate
          AND "role" = :role
          AND "scopeId" = :scopeId
        GROUP BY "categoryTitle"
        ORDER BY SUM("totalSales") DESC, "categoryTitle" ASC
      `,
      {
        replacements: {
          endDate: input.endDate.slice(0, 10),
          role: input.role,
          scopeId: getScopeId(input),
          startDate: input.startDate.slice(0, 10),
        },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => ({
      label: row.label,
      value: Number(row.totalSales ?? 0),
    }));
  }

  public async backfill(startDate?: string, endDate?: string): Promise<void> {
    await this.ensureTable();
    const bounds = await this.getBackfillBounds(startDate, endDate);
    if (!bounds) {
      logger.info({ operationName: AGGREGATE_LOG_OPERATION }, "No order history found for aggregate backfill");
      return;
    }

    const [adminRows, vendorRows, productRows, categoryRows] = await Promise.all([
      this.getAdminAggregateRows(bounds.startDate, bounds.endDate),
      this.getVendorAggregateRows(bounds.startDate, bounds.endDate),
      this.getProductAggregateRows(bounds.startDate, bounds.endDate),
      this.getCategoryAggregateRows(bounds.startDate, bounds.endDate),
    ]);

    const destroyRange = {
      where: {
        metricDate: {
          between: [toDateOnly(bounds.startDate), toDateOnly(bounds.endDate)],
        },
      },
    };

    await Promise.all([
      dashboardDailyMetricModel.destroy(destroyRange),
      dashboardDailyProductSaleModel.destroy(destroyRange),
      dashboardDailyCategorySaleModel.destroy(destroyRange),
    ]);

    const aggregateRows = [...adminRows, ...vendorRows];
    if (aggregateRows.length === 0 && productRows.length === 0 && categoryRows.length === 0) {
      logger.info(
        { operationName: AGGREGATE_LOG_OPERATION, startDate: bounds.startDate, endDate: bounds.endDate },
        "No aggregate rows generated for requested range",
      );
      return;
    }

    await Promise.all([
      aggregateRows.length > 0
        ? dashboardDailyMetricModel.bulkCreate(aggregateRows, {
            updateOnDuplicate: [...BULK_UPDATE_FIELDS],
          })
        : Promise.resolve(),
      productRows.length > 0
        ? dashboardDailyProductSaleModel.bulkCreate(productRows, {
            updateOnDuplicate: [...BULK_PRODUCT_UPDATE_FIELDS],
          })
        : Promise.resolve(),
      categoryRows.length > 0
        ? dashboardDailyCategorySaleModel.bulkCreate(categoryRows, {
            updateOnDuplicate: [...BULK_CATEGORY_UPDATE_FIELDS],
          })
        : Promise.resolve(),
    ]);
  }

  public async refreshRange(startDate: string, endDate: string): Promise<void> {
    await this.backfill(startDate, endDate);
  }

  private async getBackfillBounds(
    startDate?: string,
    endDate?: string,
  ): Promise<{ endDate: Date; startDate: Date } | null> {
    const [firstOrder] = await orderModel.findAll<OrderRecord>({
      attributes: ["orderDate"],
      limit: 1,
      order: [["orderDate", "ASC"]],
      where: {
        orderDate: { [Op.ne]: null },
      },
    });
    const [lastOrder] = await orderModel.findAll<OrderRecord>({
      attributes: ["orderDate"],
      limit: 1,
      order: [["orderDate", "DESC"]],
      where: {
        orderDate: { [Op.ne]: null },
      },
    });

    const firstDate = firstOrder ? toPlain(firstOrder).orderDate : null;
    const lastDate = lastOrder ? toPlain(lastOrder).orderDate : null;

    if (!firstDate || !lastDate) {
      return null;
    }

    const firstOrderDate = normalizeBoundary(firstDate);
    const lastOrderDate = normalizeBoundary(lastDate);

    if (startDate && endDate) {
      const normalizedStartDate = normalizeBoundary(startDate);
      const normalizedEndDate = normalizeBoundary(endDate);
      const clampedStartDate = normalizedStartDate < firstOrderDate ? firstOrderDate : normalizedStartDate;
      const clampedEndDate = normalizedEndDate > lastOrderDate ? lastOrderDate : normalizedEndDate;

      if (clampedStartDate > clampedEndDate) {
        return null;
      }

      return {
        endDate: clampedEndDate,
        startDate: clampedStartDate,
      };
    }

    return {
      endDate: lastOrderDate,
      startDate: firstOrderDate,
    };
  }

  private async getAdminAggregateRows(startDate: Date, endDate: Date): Promise<AggregateRecord[]> {
    const rows = await sequelize.query<DailyAdminRow>(
      `
        WITH daily_orders AS (
          SELECT
            DATE("orderDate")::text AS "metricDate",
            COUNT(*)::int AS "totalOrders",
            COUNT(*) FILTER (WHERE "status" IN (${PENDING_STATUS_SQL}))::int AS "pendingOrders",
            COUNT(*) FILTER (WHERE "status" IN (${IN_PROGRESS_STATUS_SQL}))::int AS "inProgressOrders",
            COUNT(*) FILTER (WHERE "status" IN (${DELIVERED_STATUS_SQL}))::int AS "deliveredOrders",
            COUNT(*) FILTER (WHERE "status" IN (${CANCELED_OR_REFUNDED_STATUS_SQL}))::int AS "canceledOrRefundedOrders",
            COALESCE(SUM("totalPrice"), 0)::numeric AS "totalSales"
          FROM "orders"
          WHERE "deletedAt" IS NULL
            AND "orderDate" >= :startDate
            AND "orderDate" < :exclusiveEndDate
          GROUP BY DATE("orderDate")
        ),
        daily_makers AS (
          SELECT
            DATE(o."orderDate")::text AS "metricDate",
            COUNT(DISTINCT p."vendorId")::int AS "activeMakers"
          FROM "orderLines" ol
          INNER JOIN "orders" o ON o."id" = ol."orderId" AND o."deletedAt" IS NULL
          INNER JOIN "products" p ON p."id" = ol."productId" AND p."deletedAt" IS NULL
          WHERE ol."deletedAt" IS NULL
            AND p."vendorId" IS NOT NULL
            AND o."orderDate" >= :startDate
            AND o."orderDate" < :exclusiveEndDate
          GROUP BY DATE(o."orderDate")
        )
        SELECT
          d."metricDate",
          d."totalOrders",
          d."pendingOrders",
          d."inProgressOrders",
          d."deliveredOrders",
          d."canceledOrRefundedOrders",
          d."totalSales",
          COALESCE(m."activeMakers", 0)::int AS "activeMakers"
        FROM daily_orders d
        LEFT JOIN daily_makers m ON m."metricDate" = d."metricDate"
        ORDER BY d."metricDate" ASC
      `,
      {
        replacements: {
          exclusiveEndDate: this.getExclusiveEndDate(endDate),
          startDate,
        },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row: DailyAdminRow) => ({
      activeMakers: Number(row.activeMakers ?? 0),
      activeProducts: 0,
      canceledOrRefundedOrders: Number((row as DailyAdminRow & { canceledOrRefundedOrders?: number | string | null }).canceledOrRefundedOrders ?? 0),
      deliveredOrders: Number(row.deliveredOrders ?? 0),
      inProgressOrders: Number((row as DailyAdminRow & { inProgressOrders?: number | string | null }).inProgressOrders ?? 0),
      metricDate: row.metricDate,
      pendingOrders: Number(row.pendingOrders ?? 0),
      role: "admin",
      scopeId: 0,
      totalOrders: Number(row.totalOrders ?? 0),
      totalSales: Number(row.totalSales ?? 0),
      vendorId: null,
    }));
  }

  private async getVendorAggregateRows(startDate: Date, endDate: Date): Promise<AggregateRecord[]> {
    const rows = await sequelize.query<DailyVendorRow>(
      `
        SELECT
          DATE(o."orderDate")::text AS "metricDate",
          p."vendorId" AS "vendorId",
          COUNT(DISTINCT o."id")::int AS "totalOrders",
          COUNT(DISTINCT CASE WHEN o."status" IN (${PENDING_STATUS_SQL}) THEN o."id" END)::int AS "pendingOrders",
          COUNT(DISTINCT CASE WHEN o."status" IN (${IN_PROGRESS_STATUS_SQL}) THEN o."id" END)::int AS "inProgressOrders",
          COUNT(DISTINCT CASE WHEN o."status" IN (${DELIVERED_STATUS_SQL}) THEN o."id" END)::int AS "deliveredOrders",
          COUNT(DISTINCT CASE WHEN o."status" IN (${CANCELED_OR_REFUNDED_STATUS_SQL}) THEN o."id" END)::int AS "canceledOrRefundedOrders",
          COUNT(DISTINCT ol."productId")::int AS "activeProducts",
          COALESCE(SUM((COALESCE(ol."price", 0)::numeric * COALESCE(ol."quantity", 0)::numeric) - COALESCE(ol."discount", 0)::numeric), 0)::numeric AS "totalSales"
        FROM "orderLines" ol
        INNER JOIN "orders" o ON o."id" = ol."orderId" AND o."deletedAt" IS NULL
        INNER JOIN "products" p ON p."id" = ol."productId" AND p."deletedAt" IS NULL
        WHERE ol."deletedAt" IS NULL
          AND p."vendorId" IS NOT NULL
          AND o."orderDate" >= :startDate
          AND o."orderDate" < :exclusiveEndDate
        GROUP BY DATE(o."orderDate"), p."vendorId"
        ORDER BY DATE(o."orderDate") ASC, p."vendorId" ASC
      `,
      {
        replacements: {
          exclusiveEndDate: this.getExclusiveEndDate(endDate),
          startDate,
        },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row: DailyVendorRow) => {
      const vendorId = Number(row.vendorId);
      return {
        activeMakers: 0,
        activeProducts: Number(row.activeProducts ?? 0),
        canceledOrRefundedOrders: Number((row as DailyVendorRow & { canceledOrRefundedOrders?: number | string | null }).canceledOrRefundedOrders ?? 0),
        deliveredOrders: Number(row.deliveredOrders ?? 0),
        inProgressOrders: Number((row as DailyVendorRow & { inProgressOrders?: number | string | null }).inProgressOrders ?? 0),
        metricDate: row.metricDate,
        pendingOrders: Number(row.pendingOrders ?? 0),
        role: "vendor" as const,
        scopeId: vendorId,
        totalOrders: Number(row.totalOrders ?? 0),
        totalSales: Number(row.totalSales ?? 0),
        vendorId,
      };
    });
  }

  private getExclusiveEndDate(endDate: Date): Date {
    return new Date(endDate.getTime() + DAY_IN_MILLISECONDS);
  }

  private async hasCoverage(input: DashboardMetricsInput): Promise<boolean> {
    const rows = await dashboardDailyMetricModel.findAll<AggregateRecord>({
      attributes: ["metricDate"],
      where: {
        metricDate: {
          between: [input.startDate.slice(0, 10), input.endDate.slice(0, 10)],
        },
        role: input.role,
        scopeId: getScopeId(input),
      },
    });

    return rows.length > 0;
  }

  private async getAdminLeaderboardRows(
    input: DashboardMetricsInput,
  ): Promise<LeaderboardAggregateRow[]> {
    return sequelize.query<LeaderboardAggregateRow>(
      `
        WITH vendor_product_totals AS (
          SELECT
            dps."vendorId" AS "id",
            v."name" AS "name",
            dps."productTitle" AS "productTitle",
            SUM(dps."totalSales")::numeric AS "productSales"
          FROM "dashboardDailyProductSales" dps
          INNER JOIN "vendors" v ON v."id" = dps."vendorId"
          WHERE dps."metricDate" BETWEEN :startDate AND :endDate
          GROUP BY dps."vendorId", v."name", dps."productTitle"
        ),
        ranked_products AS (
          SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY "id" ORDER BY "productSales" DESC, "productTitle" ASC) AS "rowNumber"
          FROM vendor_product_totals
        ),
        vendor_totals AS (
          SELECT
            "id",
            "name",
            SUM("productSales")::numeric AS "totalSales"
          FROM vendor_product_totals
          GROUP BY "id", "name"
        )
        SELECT
          vt."id",
          vt."name",
          COALESCE(rp."productTitle", 'صانع') AS "secondaryLabel",
          vt."totalSales"
        FROM vendor_totals vt
        LEFT JOIN ranked_products rp ON rp."id" = vt."id" AND rp."rowNumber" = 1
        ORDER BY vt."totalSales" DESC, vt."name" ASC
        LIMIT ${MAX_LEADERBOARD_ITEMS}
      `,
      {
        replacements: {
          endDate: input.endDate.slice(0, 10),
          startDate: input.startDate.slice(0, 10),
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  private async getVendorLeaderboardRows(
    input: DashboardMetricsInput,
  ): Promise<LeaderboardAggregateRow[]> {
    return sequelize.query<LeaderboardAggregateRow>(
      `
        SELECT
          dps."productId" AS "id",
          dps."productTitle" AS "name",
          CONCAT(SUM(dps."totalOrders")::int, ' طلب') AS "secondaryLabel",
          SUM(dps."totalSales")::numeric AS "totalSales"
        FROM "dashboardDailyProductSales" dps
        WHERE dps."metricDate" BETWEEN :startDate AND :endDate
          AND dps."vendorId" = :vendorId
        GROUP BY dps."productId", dps."productTitle"
        ORDER BY SUM(dps."totalSales") DESC, dps."productTitle" ASC
        LIMIT ${MAX_LEADERBOARD_ITEMS}
      `,
      {
        replacements: {
          endDate: input.endDate.slice(0, 10),
          startDate: input.startDate.slice(0, 10),
          vendorId: input.vendorId ?? 0,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  private async getProductAggregateRows(startDate: Date, endDate: Date): Promise<ProductAggregateRecord[]> {
    const rows = await sequelize.query<ProductAggregateRecord>(
      `
        SELECT
          DATE(o."orderDate")::text AS "metricDate",
          p."vendorId" AS "vendorId",
          p."id" AS "productId",
          p."title" AS "productTitle",
          COUNT(DISTINCT o."id")::int AS "totalOrders",
          COALESCE(SUM(ol."quantity"), 0)::int AS "totalQuantity",
          COALESCE(SUM((COALESCE(ol."price", 0)::numeric * COALESCE(ol."quantity", 0)::numeric) - COALESCE(ol."discount", 0)::numeric), 0)::numeric AS "totalSales"
        FROM "orderLines" ol
        INNER JOIN "orders" o ON o."id" = ol."orderId" AND o."deletedAt" IS NULL
        INNER JOIN "products" p ON p."id" = ol."productId" AND p."deletedAt" IS NULL
        WHERE ol."deletedAt" IS NULL
          AND p."vendorId" IS NOT NULL
          AND o."orderDate" >= :startDate
          AND o."orderDate" < :exclusiveEndDate
        GROUP BY DATE(o."orderDate"), p."vendorId", p."id", p."title"
        ORDER BY DATE(o."orderDate") ASC, p."vendorId" ASC, p."id" ASC
      `,
      {
        replacements: {
          exclusiveEndDate: this.getExclusiveEndDate(endDate),
          startDate,
        },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => ({
      metricDate: row.metricDate,
      productId: Number(row.productId),
      productTitle: row.productTitle,
      totalOrders: Number(row.totalOrders ?? 0),
      totalQuantity: Number(row.totalQuantity ?? 0),
      totalSales: Number(row.totalSales ?? 0),
      vendorId: Number(row.vendorId),
    }));
  }

  private async getCategoryAggregateRows(startDate: Date, endDate: Date): Promise<CategoryAggregateRecord[]> {
    const rows = await sequelize.query<{
      categoryId: number | string;
      categoryTitle: string;
      metricDate: string;
      totalOrders: number | string | null;
      totalQuantity: number | string | null;
      totalSales: number | string | null;
      vendorId: number | string | null;
    }>(
      `
        SELECT
          DATE(o."orderDate")::text AS "metricDate",
          COALESCE(c."id", ${UNCATEGORIZED_CATEGORY_ID}) AS "categoryId",
          COALESCE(c."title", '${UNCATEGORIZED_CATEGORY_TITLE}') AS "categoryTitle",
          p."vendorId" AS "vendorId",
          COUNT(DISTINCT o."id")::int AS "totalOrders",
          COALESCE(SUM(ol."quantity"), 0)::int AS "totalQuantity",
          COALESCE(SUM((COALESCE(ol."price", 0)::numeric * COALESCE(ol."quantity", 0)::numeric) - COALESCE(ol."discount", 0)::numeric), 0)::numeric AS "totalSales"
        FROM "orderLines" ol
        INNER JOIN "orders" o ON o."id" = ol."orderId" AND o."deletedAt" IS NULL
        INNER JOIN "products" p ON p."id" = ol."productId" AND p."deletedAt" IS NULL
        LEFT JOIN "productsCategories" pc ON pc."productId" = p."id"
        LEFT JOIN "categories" c ON c."id" = pc."categoryId" AND c."deletedAt" IS NULL
        WHERE ol."deletedAt" IS NULL
          AND p."vendorId" IS NOT NULL
          AND o."orderDate" >= :startDate
          AND o."orderDate" < :exclusiveEndDate
        GROUP BY DATE(o."orderDate"), COALESCE(c."id", ${UNCATEGORIZED_CATEGORY_ID}), COALESCE(c."title", '${UNCATEGORIZED_CATEGORY_TITLE}'), p."vendorId"
        ORDER BY DATE(o."orderDate") ASC, p."vendorId" ASC
      `,
      {
        replacements: {
          exclusiveEndDate: this.getExclusiveEndDate(endDate),
          startDate,
        },
        type: QueryTypes.SELECT,
      },
    );

    const adminMap = new Map<string, CategoryAggregateRecord>();
    const vendorRows: CategoryAggregateRecord[] = [];

    for (const row of rows) {
      const metricDate = row.metricDate;
      const categoryId = Number(row.categoryId);
      const vendorId = row.vendorId === null ? null : Number(row.vendorId);
      const totalOrders = Number(row.totalOrders ?? 0);
      const totalQuantity = Number(row.totalQuantity ?? 0);
      const totalSales = Number(row.totalSales ?? 0);

      if (vendorId !== null) {
        vendorRows.push({
          categoryId,
          categoryTitle: row.categoryTitle,
          metricDate,
          role: "vendor",
          scopeId: vendorId,
          totalOrders,
          totalQuantity,
          totalSales,
          vendorId,
        });
      }

      const adminKey = `${metricDate}:${categoryId}`;
      const currentAdminRow = adminMap.get(adminKey) ?? {
        categoryId,
        categoryTitle: row.categoryTitle,
        metricDate,
        role: "admin" as const,
        scopeId: 0,
        totalOrders: 0,
        totalQuantity: 0,
        totalSales: 0,
        vendorId: null,
      };
      currentAdminRow.totalOrders += totalOrders;
      currentAdminRow.totalQuantity += totalQuantity;
      currentAdminRow.totalSales += totalSales;
      adminMap.set(adminKey, currentAdminRow);
    }

    return [...adminMap.values(), ...vendorRows];
  }
}
