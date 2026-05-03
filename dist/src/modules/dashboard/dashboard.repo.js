"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const sequelize_1 = require("sequelize");
const constants_1 = require("../../config/constants");
const dashboard_aggregate_service_1 = require("./dashboard-aggregate.service");
const dashboard_helpers_1 = require("./dashboard.helpers");
const orderModel = require("../../../app/modules/order/order.model");
const orderLineModel = require("../../../app/modules/orderLines/orderline.model");
const productModel = require("../../../app/modules/product/product.model");
const customerModel = require("../../../app/modules/customer/customer.model");
const vendorModel = require("../../../app/modules/vendor/vendor.model");
const notificationModel = require("../../../app/modules/notification/notification.model");
const OPEN_ORDER_STATUSES = [
    constants_1.ORDER_STATUS.PENDING,
    constants_1.ORDER_STATUS.IN_PROGRESS,
    constants_1.ORDER_STATUS.CONFIRMED,
];
const DELIVERED_ORDER_STATUS = constants_1.ORDER_STATUS.DELIVERED;
const ZERO_VALUE = 0;
const DEFAULT_LIMIT = 10;
const buildDateRange = ({ endDate, startDate }) => ({
    [sequelize_1.Op.between]: [startDate, endDate],
});
const vendorProductInclude = (vendorId) => ({
    as: "product",
    attributes: ["id", "title", "vendorId"],
    include: [
        {
            as: "vendor",
            attributes: ["id", "name"],
            model: vendorModel,
            required: false,
        },
    ],
    model: productModel,
    required: true,
    where: {
        vendorId,
    },
});
const toPlain = (row) => {
    if ("toJSON" in row && typeof row.toJSON === "function") {
        return row.toJSON();
    }
    return row;
};
const parseNumber = (value) => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : ZERO_VALUE;
    }
    if (typeof value === "string") {
        const parsedValue = Number.parseFloat(value);
        return Number.isFinite(parsedValue) ? parsedValue : ZERO_VALUE;
    }
    return ZERO_VALUE;
};
const toRange = ({ endDate, startDate }) => ({
    endDate: new Date(endDate),
    startDate: new Date(startDate),
});
const getString = (value, fallback = "") => {
    return typeof value === "string" ? value : fallback;
};
const toIsoString = (value) => {
    const parsedDate = value instanceof Date ? value : new Date(String(value ?? ""));
    return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString();
};
const getCustomerName = (customer) => {
    if (!customer) {
        return "عميل";
    }
    const firstName = getString(customer.firstName);
    const lastName = getString(customer.lastName);
    return `${firstName} ${lastName}`.trim() || "عميل";
};
const getOrderLineAmount = (line) => {
    const price = parseNumber(line.price);
    const quantity = parseNumber(line.quantity);
    const discount = parseNumber(line.discount);
    return price * quantity - discount;
};
const toDistributionItems = (source, colors) => {
    const total = [...source.values()].reduce((sum, value) => sum + value, 0);
    return [...source.entries()]
        .map(([label, value], index) => ({
        color: colors[index % colors.length] ?? "#94A3B8",
        label,
        percentage: total === 0 ? 0 : Math.round((value / total) * 1000) / 10,
        value,
    }))
        .sort((left, right) => right.value - left.value);
};
class DashboardRepository {
    dashboardAggregateService = new dashboard_aggregate_service_1.DashboardAggregateService({
        getDeliveredOrdersCountFromOrders: (input) => this.getDeliveredOrdersCountFromOrders(input),
        getSnapshotFromOrders: (input) => this.getSnapshotFromOrders(input),
    });
    async getSnapshot(input) {
        const aggregateSnapshot = await this.dashboardAggregateService.getSnapshot(input);
        if (aggregateSnapshot) {
            return aggregateSnapshot;
        }
        return this.getSnapshotFromOrders(input);
    }
    async getSnapshotFromOrders(input) {
        const range = toRange(input);
        if (input.role === "vendor" && input.vendorId) {
            return this.getVendorSnapshot(input.vendorId, range);
        }
        return this.getAdminSnapshot(range);
    }
    async getPerformanceSeries(input) {
        const aggregateSeries = await this.dashboardAggregateService.getPerformanceSeries(input);
        if (aggregateSeries) {
            return aggregateSeries;
        }
        const orders = await this.getScopedOrders(input);
        const grouped = new Map();
        for (const order of orders) {
            const bucket = order.orderDate.slice(0, 10);
            const entry = grouped.get(bucket) ?? { orders: 0, sales: 0 };
            entry.orders += 1;
            entry.sales += input.role === "vendor"
                ? order.lines.reduce((sum, line) => sum + line.lineAmount, 0)
                : order.totalPrice;
            grouped.set(bucket, entry);
        }
        return [...grouped.entries()]
            .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
            .map(([date, values]) => ({
            date,
            orders: values.orders,
            sales: Math.round(values.sales * 100) / 100,
        }));
    }
    async getActivities(input, userId) {
        const notifications = await notificationModel.findAll({
            limit: DEFAULT_LIMIT,
            order: [["createdAt", "DESC"]],
            where: {
                createdAt: buildDateRange(toRange(input)),
                userId,
            },
        });
        return notifications.map((notification) => {
            const plainNotification = toPlain(notification);
            return {
                createdAt: toIsoString(plainNotification.createdAt),
                entityId: Number(plainNotification.entityId ?? 0),
                entityType: getString(plainNotification.entityType),
                id: Number(plainNotification.id ?? 0),
                text: getString(plainNotification.text),
            };
        });
    }
    async getLatestOrders(input) {
        const orders = await this.getScopedOrders(input, DEFAULT_LIMIT);
        return orders.map((order) => ({
            amount: Math.round((input.role === "vendor"
                ? order.lines.reduce((sum, line) => sum + line.lineAmount, 0)
                : order.totalPrice) * 100) / 100,
            customerName: order.customerName,
            id: order.id,
            orderDate: order.orderDate,
            orderNumber: order.orderNumber,
            productName: order.lines[0]?.productTitle ?? "منتج",
            status: order.status,
            statusLabel: (0, dashboard_helpers_1.toStatusLabel)(order.status),
        }));
    }
    async getLeaderboard(input) {
        const aggregateEntries = await this.dashboardAggregateService.getLeaderboard(input);
        if (aggregateEntries) {
            return aggregateEntries;
        }
        const lines = await this.getScopedOrderLines(input);
        const salesByEntry = new Map();
        for (const line of lines) {
            const key = input.role === "vendor"
                ? `product:${line.productId ?? 0}`
                : `vendor:${line.vendorId ?? 0}`;
            const current = salesByEntry.get(key) ?? {
                id: input.role === "vendor" ? line.productId : line.vendorId,
                name: input.role === "vendor" ? line.productTitle : line.vendorName,
                secondaryLabel: input.role === "vendor" ? "حسب المبيعات" : "صانع",
                totalSales: 0,
            };
            current.totalSales += line.lineAmount;
            salesByEntry.set(key, current);
        }
        const entries = [...salesByEntry.values()]
            .sort((left, right) => right.totalSales - left.totalSales)
            .slice(0, 10)
            .map((entry) => ({
            ...entry,
            totalSales: Math.round(entry.totalSales * 100) / 100,
        }));
        return (0, dashboard_helpers_1.withRanks)(entries);
    }
    async getSalesDistribution(input) {
        const aggregateDistribution = await this.dashboardAggregateService.getSalesDistribution(input);
        if (aggregateDistribution) {
            const groupedSales = new Map();
            for (const item of aggregateDistribution) {
                groupedSales.set(item.label, item.value);
            }
            return toDistributionItems(groupedSales, ["#6366F1", "#10B981", "#F59E0B", "#C4A15A", "#94A3B8"]);
        }
        const lines = await this.getScopedOrderLines(input);
        const groupedSales = new Map();
        for (const line of lines) {
            const label = input.role === "vendor" ? line.productTitle : line.vendorName;
            groupedSales.set(label, (groupedSales.get(label) ?? 0) + line.lineAmount);
        }
        return toDistributionItems(groupedSales, ["#6366F1", "#10B981", "#F59E0B", "#C4A15A", "#94A3B8"]);
    }
    async getDeliveredOrdersCount(input) {
        const aggregateCount = await this.dashboardAggregateService.getDeliveredOrdersCount(input);
        if (aggregateCount !== null) {
            return aggregateCount;
        }
        return this.getDeliveredOrdersCountFromOrders(input);
    }
    async getDeliveredOrdersCountFromOrders(input) {
        const range = toRange(input);
        if (input.role === "vendor" && input.vendorId) {
            return orderLineModel.count({
                col: "orderId",
                distinct: true,
                include: [
                    vendorProductInclude(input.vendorId),
                    {
                        attributes: [],
                        model: orderModel,
                        required: true,
                        where: {
                            orderDate: buildDateRange(range),
                            status: DELIVERED_ORDER_STATUS,
                        },
                    },
                ],
            });
        }
        return orderModel.count({
            where: {
                orderDate: buildDateRange(range),
                status: DELIVERED_ORDER_STATUS,
            },
        });
    }
    async getAdminSnapshot(range) {
        const [salesOrders, totalOrders, pendingOrders, activeMakers] = await Promise.all([
            orderModel.findAll({
                attributes: ["totalPrice"],
                where: {
                    orderDate: buildDateRange(range),
                },
            }),
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
            totalSales: salesOrders.reduce((sum, order) => sum + parseNumber(toPlain(order).totalPrice), 0),
        };
    }
    async getActiveMakers(range) {
        const lines = await orderLineModel.findAll({
            include: [
                {
                    as: "product",
                    attributes: ["vendorId"],
                    model: productModel,
                    required: true,
                    where: {
                        vendorId: {
                            [sequelize_1.Op.ne]: null,
                        },
                    },
                },
                {
                    attributes: ["id"],
                    model: orderModel,
                    required: true,
                    where: {
                        orderDate: buildDateRange(range),
                    },
                },
            ],
        });
        const vendorIds = new Set();
        for (const line of lines) {
            const product = toPlain(line).product;
            const vendorId = Number(product?.vendorId ?? 0);
            if (vendorId > 0) {
                vendorIds.add(vendorId);
            }
        }
        return vendorIds.size;
    }
    async getVendorSnapshot(vendorId, range) {
        const orders = await this.getScopedOrders({
            endDate: range.endDate.toISOString(),
            role: "vendor",
            startDate: range.startDate.toISOString(),
            vendorId,
        });
        const orderIds = new Set();
        const productIds = new Set();
        let pendingOrders = 0;
        let totalSales = 0;
        for (const order of orders) {
            orderIds.add(order.id);
            totalSales += order.lines.reduce((sum, line) => sum + line.lineAmount, 0);
            if (order.status !== null && OPEN_ORDER_STATUSES.includes(order.status)) {
                pendingOrders += 1;
            }
            order.lines.forEach((line) => {
                if (line.productId !== null) {
                    productIds.add(line.productId);
                }
            });
        }
        return {
            activeMakers: ZERO_VALUE,
            activeProducts: productIds.size,
            pendingOrders,
            totalOrders: orderIds.size,
            totalSales: Math.round(totalSales * 100) / 100,
        };
    }
    async getScopedOrders(input, limit) {
        const range = toRange(input);
        const include = [
            {
                as: "customer",
                attributes: ["firstName", "lastName"],
                model: customerModel,
                required: false,
            },
            {
                as: "orderLines",
                attributes: ["discount", "price", "productId", "quantity"],
                include: [
                    input.role === "vendor" && input.vendorId
                        ? vendorProductInclude(input.vendorId)
                        : {
                            as: "product",
                            attributes: ["id", "title", "vendorId"],
                            include: [
                                {
                                    as: "vendor",
                                    attributes: ["id", "name"],
                                    model: vendorModel,
                                    required: false,
                                },
                            ],
                            model: productModel,
                            required: false,
                        },
                ],
                model: orderLineModel,
                required: input.role === "vendor",
            },
        ];
        const orders = await orderModel.findAll({
            include,
            limit,
            order: [["orderDate", "DESC"]],
            where: {
                orderDate: buildDateRange(range),
            },
        });
        return orders.map((order) => {
            const plainOrder = toPlain(order);
            const orderLines = Array.isArray(plainOrder.orderLines)
                ? plainOrder.orderLines
                : [];
            return {
                customerName: getCustomerName(plainOrder.customer),
                id: Number(plainOrder.id ?? 0),
                lines: orderLines.map((line) => {
                    const product = line.product;
                    const vendor = product?.vendor;
                    return {
                        lineAmount: getOrderLineAmount(line),
                        productId: product ? Number(product.id ?? 0) : null,
                        productTitle: getString(product?.title, "منتج"),
                        vendorId: vendor ? Number(vendor.id ?? 0) : null,
                        vendorName: getString(vendor?.name, "غير محدد"),
                    };
                }),
                orderDate: toIsoString(plainOrder.orderDate),
                orderNumber: getString(plainOrder.orderNumber, getString(plainOrder.name)),
                status: plainOrder.status === null || plainOrder.status === undefined ? null : Number(plainOrder.status),
                totalPrice: parseNumber(plainOrder.totalPrice),
            };
        });
    }
    async getScopedOrderLines(input) {
        const range = toRange(input);
        const include = [
            input.role === "vendor" && input.vendorId
                ? vendorProductInclude(input.vendorId)
                : {
                    as: "product",
                    attributes: ["id", "title", "vendorId"],
                    include: [
                        {
                            as: "vendor",
                            attributes: ["id", "name"],
                            model: vendorModel,
                            required: false,
                        },
                    ],
                    model: productModel,
                    required: true,
                },
            {
                attributes: ["id"],
                model: orderModel,
                required: true,
                where: {
                    orderDate: buildDateRange(range),
                },
            },
        ];
        const lines = await orderLineModel.findAll({
            attributes: ["discount", "price", "productId", "quantity"],
            include,
        });
        return lines.map((line) => {
            const plainLine = toPlain(line);
            const product = plainLine.product;
            const vendor = product?.vendor;
            return {
                lineAmount: getOrderLineAmount(plainLine),
                productId: product ? Number(product.id ?? 0) : null,
                productTitle: getString(product?.title, "منتج"),
                vendorId: vendor ? Number(vendor.id ?? 0) : null,
                vendorName: getString(vendor?.name, "غير محدد"),
            };
        });
    }
}
exports.DashboardRepository = DashboardRepository;
//# sourceMappingURL=dashboard.repo.js.map