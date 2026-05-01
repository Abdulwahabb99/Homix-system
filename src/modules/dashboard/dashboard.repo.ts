import { Op } from "sequelize";

import { ORDER_STATUS } from "../../config/constants";
import type { DashboardMetricSnapshot, DashboardMetricsInput } from "./dashboard.types";

type CountModel = {
  count: (options?: Record<string, unknown>) => Promise<number>;
  findOne: <TRow>(options: Record<string, unknown>) => Promise<TRow | null>;
};

const orderModel = require("../../../app/modules/order/order.model") as CountModel;
const orderLineModel = require("../../../app/modules/orderLines/orderline.model") as CountModel;
const productModel = require("../../../app/modules/product/product.model");
const { Sequelize } = require("sequelize") as { Sequelize: typeof import("sequelize").Sequelize };

const OPEN_ORDER_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.CONFIRMED,
] as const;

const ZERO_VALUE = 0;

interface RangeBounds {
  endDate: Date;
  startDate: Date;
}

const buildDateRange = ({ endDate, startDate }: RangeBounds) => ({
  [Op.between]: [startDate, endDate],
});

const buildVendorOrderInclude = (
  vendorId: number,
  range: RangeBounds,
): Record<string, unknown>[] => [
  {
    as: "product",
    attributes: [],
    model: productModel,
    required: true,
    where: {
      vendorId,
    },
  },
  {
    attributes: [],
    model: orderModel,
    required: true,
    where: {
      orderDate: buildDateRange(range),
    },
  },
];

const parseMetricValue = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : ZERO_VALUE;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : ZERO_VALUE;
  }

  return ZERO_VALUE;
};

const getSumValue = (row: Record<string, unknown> | null, key: string): number => {
  if (!row) {
    return ZERO_VALUE;
  }

  return parseMetricValue(row[key]);
};

export class DashboardRepository {
  public async getSnapshot(input: DashboardMetricsInput): Promise<DashboardMetricSnapshot> {
    const range = {
      endDate: new Date(input.endDate),
      startDate: new Date(input.startDate),
    };

    if (input.role === "vendor" && input.vendorId) {
      return this.getVendorSnapshot(input.vendorId, range);
    }

    return this.getAdminSnapshot(range);
  }

  private async getAdminSnapshot(range: RangeBounds): Promise<DashboardMetricSnapshot> {
    const [salesRow, totalOrders, pendingOrders, activeMakers] = await Promise.all([
      this.getAdminSales(range),
      orderModel.count({
        where: {
          orderDate: buildDateRange(range),
        },
      }),
      orderModel.count({
        where: {
          orderDate: buildDateRange(range),
          status: {
            [Op.in]: OPEN_ORDER_STATUSES,
          },
        },
      }),
      this.getActiveMakers(range),
    ]);

    return {
      activeMakers,
      activeProducts: ZERO_VALUE,
      pendingOrders,
      totalOrders,
      totalSales: salesRow,
    };
  }

  private async getAdminSales(range: RangeBounds): Promise<number> {
    const row = await orderModel.findOne<Record<string, unknown>>({
      attributes: [
        [
          Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("totalPrice")), ZERO_VALUE),
          "totalSales",
        ],
      ],
      raw: true,
      where: {
        orderDate: buildDateRange(range),
      },
    });

    return getSumValue(row, "totalSales");
  }

  private async getActiveMakers(range: RangeBounds): Promise<number> {
    const row = await orderLineModel.findOne<Record<string, unknown>>({
      attributes: [
        [
          Sequelize.fn("COUNT", Sequelize.literal('DISTINCT "product"."vendorId"')),
          "activeMakers",
        ],
      ],
      include: [
        {
          as: "product",
          attributes: [],
          model: productModel,
          required: true,
          where: {
            vendorId: {
              [Op.ne]: null,
            },
          },
        },
        {
          attributes: [],
          model: orderModel,
          required: true,
          where: {
            orderDate: buildDateRange(range),
          },
        },
      ],
      raw: true,
    });

    return getSumValue(row, "activeMakers");
  }

  private async getVendorSnapshot(
    vendorId: number,
    range: RangeBounds,
  ): Promise<DashboardMetricSnapshot> {
    const vendorInclude = buildVendorOrderInclude(vendorId, range);
    const [salesRow, totalOrders, pendingOrders, activeProducts] = await Promise.all([
      this.getVendorSales(vendorInclude),
      orderLineModel.count({
        col: "orderId",
        distinct: true,
        include: vendorInclude,
      }),
      orderLineModel.count({
        col: "orderId",
        distinct: true,
        include: [
          vendorInclude[0],
          {
            attributes: [],
            model: orderModel,
            required: true,
            where: {
              orderDate: buildDateRange(range),
              status: {
                [Op.in]: OPEN_ORDER_STATUSES,
              },
            },
          },
        ],
      }),
      orderLineModel.count({
        col: "productId",
        distinct: true,
        include: vendorInclude,
      }),
    ]);

    return {
      activeMakers: ZERO_VALUE,
      activeProducts,
      pendingOrders,
      totalOrders,
      totalSales: salesRow,
    };
  }

  private async getVendorSales(include: Record<string, unknown>[]): Promise<number> {
    const row = await orderLineModel.findOne<Record<string, unknown>>({
      attributes: [
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("OrderLine"."price" AS DECIMAL) * CAST("OrderLine"."quantity" AS DECIMAL) - CAST(COALESCE("OrderLine"."discount", 0) AS DECIMAL)',
              ),
            ),
            ZERO_VALUE,
          ),
          "totalSales",
        ],
      ],
      include,
      raw: true,
    });

    return getSumValue(row, "totalSales");
  }
}
