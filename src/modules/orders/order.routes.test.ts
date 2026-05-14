import express from "express";
import { Op } from "sequelize";
import request from "supertest";

const orderModel = {
  count: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  findOne: jest.fn(),
};

const dashboardDailyMetricModel = {
  findAll: jest.fn(),
};

const vendorModel = {
  findAll: jest.fn(),
};

const userModel = {
  findAll: jest.fn(),
};

const legacyOrderService = {
  BulkUpdate: jest.fn(),
  addNote: jest.fn(),
  bulkDelete: jest.fn(),
  deleteNote: jest.fn(),
  deleteOrder: jest.fn(),
  exportOrders: jest.fn(),
  financialReport: jest.fn(),
  importOrders: jest.fn(),
  saveImportedOrders: jest.fn(),
  updateNote: jest.fn(),
  updateOrder: jest.fn(),
  uploadFiles: jest.fn(),
};

jest.mock("../../../app/middlewares/protectApi", () => {
  return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { id: 1, userType: "1" };
    req.vendorId = null;
    next();
  };
});

jest.mock("../../../app/middlewares/isNotVendor", () => {
  return (_req: express.Request, _res: express.Response, next: express.NextFunction) => next();
});

jest.mock("../../../config/fileUploadMiddleware", () => () => {
  return (_req: express.Request, _res: express.Response, next: express.NextFunction) => next();
});

jest.mock("../../infrastructure/database", () => ({
  sequelize: {
    col: jest.fn((value: string) => value),
    fn: jest.fn((...args: string[]) => args.join(".")),
    where: jest.fn((_left: unknown, right: unknown) => right),
  },
}));

jest.mock("../../../app/modules/order/order.model", () => orderModel);
jest.mock("../dashboard/dashboard-aggregate.service", () => ({
  DashboardAggregateService: jest.fn().mockImplementation(() => ({
    refreshRange: jest.fn(),
  })),
}));
jest.mock("../dashboard/dashboard-daily-metric.model", () => dashboardDailyMetricModel);
jest.mock("../../../app/modules/vendor/vendor.model", () => vendorModel);
jest.mock("../../../app/modules/user/user.model", () => userModel);
jest.mock("../../../app/modules/order/order.service", () => legacyOrderService);
jest.mock("../../../app/modules/orderLines/orderline.model", () => ({}));
jest.mock("../../../app/modules/product/product.model", () => ({}));
jest.mock("../../../app/modules/customer/customer.model", () => ({}));
jest.mock("../../../app/modules/notes/notes.model", () => ({}));
jest.mock("../../../app/modules/attachments/attachment.model", () => ({}));
jest.mock("../../../app/modules/product/productType.model", () => ({}));
jest.mock("../../../app/modules/logs/log.model", () => ({
  findAll: jest.fn().mockResolvedValue([
    {
      action: "update",
      createdAt: "2026-05-04T01:00:00.000Z",
      field: "status",
      from: "1",
      id: 8,
      to: "2",
      userId: 1,
    },
  ]),
}));

import { errorMiddleware } from "../../shared/http";
import { orderRouter } from "./order.routes";

const app = express();
app.use(express.json());
app.use("/orders", orderRouter);
app.use(errorMiddleware);

const makeOrder = () => ({
  code: "3001",
  commission: "20",
  customer: {
    address: "Cairo",
    email: "lamiaa@example.com",
    firstName: "Lamiaa",
    id: 5,
    lastName: "Saeid",
    phoneNumber: "01000000000",
  },
  customerId: 5,
  deliveryBy: 1,
  deliveryDate: "2026-05-05T00:00:00.000Z",
  deliveryStatus: 3,
  downPayment: "200",
  expectedDeliveryDate: "2026-05-06T00:00:00.000Z",
  id: 7,
  manufactureStatus: 2,
  notes: "important note",
  notesList: [
    {
      attachments: [
        {
          createdAt: "2026-05-04T00:00:00.000Z",
          description: "invoice",
          id: 9,
          name: "invoice.pdf",
          url: "/uploads/invoice.pdf",
        },
      ],
      createdAt: "2026-05-04T00:00:00.000Z",
      id: 4,
      text: "ابدأ التصنيع",
      user: { firstName: "Ahmed", lastName: "Hesham" },
    },
  ],
  orderDate: "2026-05-01T00:00:00.000Z",
  orderLines: [
    {
      color: "blue",
      material: "wood",
      product: {
        image: "https://example.com/product.png",
        title: "ركنة للأثاث",
        type: { name: "غرفة نوم" },
        vendor: { daysToDeliver: 5, id: 3, name: "ركنة للأثاث" },
      },
      quantity: 1,
      size: "100x100",
      sku: "RKA-001",
      title: "ركنة للأثاث",
      unitCost: "900",
    },
  ],
  orderNumber: "31668",
  paymentStatus: 1,
  shipmentType: "warehouse",
  status: 2,
  toBeCollected: "2099",
  totalCost: "1200",
  totalDiscounts: "100",
  totalPrice: "2299",
  user: { firstName: "Sara", lastName: "Mohamed" },
});

describe("orderRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dashboardDailyMetricModel.findAll.mockResolvedValue([]);
    orderModel.count.mockResolvedValue(0);
    orderModel.findAll.mockResolvedValue([makeOrder()]);
    orderModel.findAndCountAll.mockResolvedValue({ count: 1, rows: [makeOrder()] });
    orderModel.findOne.mockResolvedValue(makeOrder());
    vendorModel.findAll.mockResolvedValue([{ id: 3, name: "ركنة للأثاث" }]);
    userModel.findAll.mockResolvedValue([{ firstName: "Sara", id: 1, lastName: "Mohamed" }]);
  });

  it("returns orders meta options", async () => {
    const response = await request(app).get("/orders/meta");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.deliveryByOptions).toEqual([
      { id: 1, label: "هوميكس" },
      { id: 2, label: "بائع" },
    ]);
    expect(response.body.data.vendors[0]).toEqual({ id: 3, label: "ركنة للأثاث" });
  });

  it("returns orders summary cards", async () => {
    const response = await request(app).get("/orders/summary").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.cards).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: "totalOrders", value: 1 })]),
    );
  });

  it("uses aggregate rows for stable summary cards and live count for urgent orders", async () => {
    dashboardDailyMetricModel.findAll.mockResolvedValue([
      {
        canceledOrRefundedOrders: 3,
        deliveredOrders: 9,
        inProgressOrders: 4,
        metricDate: "2026-05-01",
        pendingOrders: 2,
        totalOrders: 18,
      },
    ]);
    orderModel.count.mockResolvedValue(5);

    const response = await request(app).get("/orders/summary").query({ startDate: "2026-05-01", endDate: "2026-05-01" });

    expect(response.status).toBe(200);
    expect(response.body.data.cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "urgentOrders", value: 5 }),
        expect.objectContaining({ key: "canceledOrRefundedOrders", value: 3 }),
        expect.objectContaining({ key: "deliveredOrders", value: 9 }),
        expect.objectContaining({ key: "inProgressOrders", value: 4 }),
        expect.objectContaining({ key: "pendingOrders", value: 2 }),
        expect.objectContaining({ key: "totalOrders", value: 18 }),
      ]),
    );
  });

  it("returns orders list with legacy-compatible and view-friendly fields", async () => {
    const response = await request(app).get("/orders").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.items[0].deliveryBy).toBe(1);
    expect(response.body.data.items[0].operationNumber).toBe("3001");
    expect(response.body.data.items[0].fine).toBe(0);
    expect(response.body.data.totalCount).toBe(1);
  });

  it("applies deliveryBy filter to the orders query", async () => {
    const response = await request(app).get("/orders").query({ deliveryBy: "1", page: 1, size: 20 });

    expect(response.status).toBe(200);
    const whereClause = orderModel.findAndCountAll.mock.calls[0][0].where as Record<PropertyKey, unknown>;
    const andKey = Object.getOwnPropertySymbols(whereClause)[0];
    const conditions = andKey && Array.isArray(whereClause[andKey])
      ? whereClause[andKey] as Array<Record<PropertyKey, unknown>>
      : [];

    expect(conditions).toContainEqual(
      expect.objectContaining({
        [Op.in]: [1],
      }),
    );
  });

  it("supports multiple priority filters", async () => {
    orderModel.findAndCountAll.mockResolvedValue({
      count: 2,
      rows: [
        makeOrder(),
        {
          ...makeOrder(),
          deliveryStatus: 1,
          expectedDeliveryDate: "2026-05-20T00:00:00.000Z",
          id: 8,
          orderNumber: "31669",
        },
      ],
    });

    const response = await request(app).get("/orders").query({ page: 1, priority: "3,2", size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].orderNumber).toBe("31668");
  });

  it("returns order details in a focused DTO shape", async () => {
    const response = await request(app).get("/orders/7");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.order.deliveryBy).toBe(1);
    expect(response.body.data.order.orderNumber).toBe("31668");
    expect(response.body.data.order.fine).toBe(0);
    expect(response.body.data.order.productName).toBe("ركنة للأثاث");
    expect(response.body.data.order.itemsCount).toBe(1);
    expect(response.body.data.financial.fine).toBe(0);
    expect(response.body.data.statusHistory[0].fromStatus).toBe(1);
    expect(response.body.data.statusHistory[0].fromStatusLabel).toBe("معلق");
    expect(response.body.data.statusHistory[0].toStatus).toBe(2);
    expect(response.body.data.statusHistory[0].toStatusLabel).toBe("قيد التصنيع");
    expect(response.body.data.statusHistory[0].userName).toBe("Sara Mohamed");
    expect(response.body.data.items[0].productName).toBe("ركنة للأثاث");
    expect(response.body.data.items[0].vendorName).toBe("ركنة للأثاث");
    expect(response.body.data.customer.id).toBe(5);
  });
});
