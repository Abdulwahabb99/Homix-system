"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const sequelize_1 = require("sequelize");
const constants_1 = require("../../config/constants");
const orderModel = require("../../../app/modules/order/order.model");
const orderLineModel = require("../../../app/modules/orderLines/orderline.model");
const productModel = require("../../../app/modules/product/product.model");
const { Sequelize } = require("sequelize");
const OPEN_ORDER_STATUSES = [
    constants_1.ORDER_STATUS.PENDING,
    constants_1.ORDER_STATUS.IN_PROGRESS,
    constants_1.ORDER_STATUS.CONFIRMED,
];
const ZERO_VALUE = 0;
const buildDateRange = ({ endDate, startDate }) => ({
    [sequelize_1.Op.between]: [startDate, endDate],
});
const buildVendorOrderInclude = (vendorId, range) => [
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
const parseMetricValue = (value) => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : ZERO_VALUE;
    }
    if (typeof value === "string") {
        const parsedValue = Number.parseFloat(value);
        return Number.isFinite(parsedValue) ? parsedValue : ZERO_VALUE;
    }
    return ZERO_VALUE;
};
const getSumValue = (row, key) => {
    if (!row) {
        return ZERO_VALUE;
    }
    return parseMetricValue(row[key]);
};
class DashboardRepository {
    async getSnapshot(input) {
        const range = {
            endDate: new Date(input.endDate),
            startDate: new Date(input.startDate),
        };
        if (input.role === "vendor" && input.vendorId) {
            return this.getVendorSnapshot(input.vendorId, range);
        }
        return this.getAdminSnapshot(range);
    }
    async getAdminSnapshot(range) {
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
                        [sequelize_1.Op.in]: OPEN_ORDER_STATUSES,
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
    async getAdminSales(range) {
        const row = await orderModel.findOne({
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
    async getActiveMakers(range) {
        const row = await orderLineModel.findOne({
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
                            [sequelize_1.Op.ne]: null,
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
    async getVendorSnapshot(vendorId, range) {
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
                                [sequelize_1.Op.in]: OPEN_ORDER_STATUSES,
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
    async getVendorSales(include) {
        const row = await orderLineModel.findOne({
            attributes: [
                [
                    Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.literal('CAST("OrderLine"."price" AS DECIMAL) * CAST("OrderLine"."quantity" AS DECIMAL) - CAST(COALESCE("OrderLine"."discount", 0) AS DECIMAL)')), ZERO_VALUE),
                    "totalSales",
                ],
            ],
            include,
            raw: true,
        });
        return getSumValue(row, "totalSales");
    }
}
exports.DashboardRepository = DashboardRepository;
//# sourceMappingURL=dashboard.repo.js.map