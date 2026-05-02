import { logger } from "../../shared/logger";
import type { DashboardMetricSnapshot, DashboardMetricsInput, DashboardPerformancePoint } from "./dashboard.types";

type AggregateRecord = {
  activeMakers: number;
  activeProducts: number;
  deliveredOrders: number;
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
  findAll: <TRow = AggregateRecord>(options?: Record<string, unknown>) => Promise<TRow[]>;
  sync: (options?: Record<string, unknown>) => Promise<unknown>;
  upsert: (payload: AggregateRecord) => Promise<unknown>;
};

type VendorRecord = {
  id: number;
  toJSON?: () => { id: number };
};

type VendorModel = {
  findAll: <TRow = VendorRecord>(options?: Record<string, unknown>) => Promise<TRow[]>;
};

type OrderRecord = {
  orderDate?: string | Date | null;
  toJSON?: () => { orderDate?: string | Date | null };
};

type OrderModel = {
  findAll: <TRow = OrderRecord>(options?: Record<string, unknown>) => Promise<TRow[]>;
};

const dashboardDailyMetricModel = require("./dashboard-daily-metric.model") as DashboardDailyMetricModel;
const vendorModel = require("../../../app/modules/vendor/vendor.model") as VendorModel;
const orderModel = require("../../../app/modules/order/order.model") as OrderModel;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const AGGREGATE_LOG_OPERATION = "dashboard-aggregate";

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
  metricDate,
  pendingOrders: snapshot.pendingOrders,
  role: input.role,
  scopeId: getScopeId(input),
  totalOrders: snapshot.totalOrders,
  totalSales: snapshot.totalSales,
  vendorId: input.vendorId ?? null,
});

export class DashboardAggregateService {
  public constructor(private readonly dashboardSource: DashboardAggregateSource) {}

  public async ensureTable(): Promise<void> {
    await dashboardDailyMetricModel.sync();
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

  public async backfill(startDate?: string, endDate?: string): Promise<void> {
    await this.ensureTable();
    const bounds = await this.getBackfillBounds(startDate, endDate);
    if (!bounds) {
      logger.info({ operationName: AGGREGATE_LOG_OPERATION }, "No order history found for aggregate backfill");
      return;
    }

    const vendors = await vendorModel.findAll<VendorRecord>({ attributes: ["id"] });
    const vendorIds = vendors.map((vendor) => Number(toPlain(vendor).id)).filter((id) => id > 0);

    for (const date of getDateRange(bounds.startDate, bounds.endDate)) {
      const dateKey = toDateOnly(date);
      const rangeInput = {
        endDate: `${dateKey}T23:59:59.999Z`,
        startDate: `${dateKey}T00:00:00.000Z`,
      };

      await this.persistAggregateForInput({
        ...rangeInput,
        role: "admin",
      });

      for (const vendorId of vendorIds) {
        await this.persistAggregateForInput({
          ...rangeInput,
          role: "vendor",
          vendorId,
        });
      }
    }
  }

  private async persistAggregateForInput(input: DashboardMetricsInput): Promise<void> {
    const [snapshot, deliveredOrders] = await Promise.all([
      this.dashboardSource.getSnapshotFromOrders(input),
      this.dashboardSource.getDeliveredOrdersCountFromOrders(input),
    ]);

    const aggregateRecord = toAggregateRecord(
      input.startDate.slice(0, 10),
      input,
      snapshot,
      deliveredOrders,
    );

    await dashboardDailyMetricModel.upsert(aggregateRecord);
  }

  private async getBackfillBounds(
    startDate?: string,
    endDate?: string,
  ): Promise<{ endDate: Date; startDate: Date } | null> {
    if (startDate && endDate) {
      return {
        endDate: normalizeBoundary(endDate),
        startDate: normalizeBoundary(startDate),
      };
    }

    const [firstOrder] = await orderModel.findAll<OrderRecord>({
      attributes: ["orderDate"],
      limit: 1,
      order: [["orderDate", "ASC"]],
      where: {
        orderDate: { ne: null },
      },
    });
    const [lastOrder] = await orderModel.findAll<OrderRecord>({
      attributes: ["orderDate"],
      limit: 1,
      order: [["orderDate", "DESC"]],
      where: {
        orderDate: { ne: null },
      },
    });

    const firstDate = firstOrder ? toPlain(firstOrder).orderDate : null;
    const lastDate = lastOrder ? toPlain(lastOrder).orderDate : null;

    if (!firstDate || !lastDate) {
      return null;
    }

    return {
      endDate: normalizeBoundary(lastDate),
      startDate: normalizeBoundary(firstDate),
    };
  }
}
