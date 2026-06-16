import express from "express";
import request from "supertest";

const orderModel = {
  count: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
};

const productModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

const shipmentInventoryModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

const shipmentExpenseModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

const shipmentReturnModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
};

const legacyShipmentService = {
  exportShipments: jest.fn(async (_res: express.Response, _payload: Record<string, unknown>) => undefined),
};

const legacyOrderService = {
  saveImportedOrders: jest.fn().mockResolvedValue(undefined),
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

jest.mock("../../infrastructure/database", () => ({
  sequelize: {
    col: jest.fn((value: string) => value),
    fn: jest.fn((...args: string[]) => args.join(".")),
    where: jest.fn((_left: unknown, right: unknown) => right),
  },
}));

jest.mock("../../../app/modules/order/order.model", () => orderModel);
jest.mock("../../../app/modules/orderLines/orderline.model", () => ({}));
jest.mock("../../../app/modules/product/product.model", () => productModel);
jest.mock("../../../app/modules/shipments/shipmentInventory.model", () => shipmentInventoryModel);
jest.mock("../../../app/modules/shipments/shipmentExpense.model", () => shipmentExpenseModel);
jest.mock("../../../app/modules/shipments/shipmentReturn.model", () => shipmentReturnModel);
jest.mock("../../../app/modules/vendor/vendor.model", () => ({}));
jest.mock("../../../app/modules/customer/customer.model", () => ({}));
jest.mock("../../../app/modules/notes/notes.model", () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
}));
jest.mock("../../../app/modules/user/user.model", () => ({
  findAll: jest.fn(),
}));
jest.mock("../../../app/modules/logs/log.model", () => ({
  findAll: jest.fn().mockResolvedValue([
    {
      action: "create",
      createdAt: "2026-05-12T09:05:00.000Z",
      field: "order_received",
      id: 401,
    },
  ]),
}));
jest.mock("../../../app/modules/product/productType.model", () => ({}));
jest.mock("../../../app/modules/shipments/shipment.service", () => legacyShipmentService);
jest.mock("../../../app/modules/order/order.service", () => legacyOrderService);

import { errorMiddleware } from "../../shared/http";
import { shipmentRouter } from "./shipment.routes";

const app = express();
app.use(express.json());
app.use("/shipments", shipmentRouter);
app.use(errorMiddleware);

const makeShipment = () => ({
  code: "3002",
  customer: {
    address: "الهرم, الجيزة",
    firstName: "عبير",
    lastName: "ابوالمجيد",
    phoneNumber: "01155559646",
  },
  deliveryBy: 1,
  deliveryDate: "2026-05-17T00:00:00.000Z",
  expectedDeliveryDate: "2026-05-17T00:00:00.000Z",
  governorate: "الجيزة",
  id: 9802,
  notes: "shipment note",
  notesList: [
    {
      createdAt: "2026-05-15T11:00:00.000Z",
      id: 18,
      text: "الشحنة متأخرة عن الموعد المحدد",
      user: { firstName: "Ahmed", lastName: "Hesham" },
    },
  ],
  orderLines: [
    {
      color: "رمادي",
      price: "16999",
      product: {
        image: "https://example.com/product.png",
        title: "كنبة شيب",
        type: { name: "غرفة نوم" },
        variants: [{ inventory_quantity: 3, option1: "200x300", option2: "رمادي", sku: "RKA-002" }],
        vendor: { name: "ركنة للأثاث" },
      },
      quantity: 1,
      size: "200x300",
      sku: "RKA-002",
      title: "كنبة شيب",
    },
  ],
  orderNumber: "31667",
  paymentStatus: 1,
  shipmentStatus: 2,
  shipmentType: "grouped",
  shippingCompany: "J&T",
  shippingFees: "65",
  shippingReceiveDate: "2026-05-12T00:00:00.000Z",
  toBeCollected: "29998",
  totalPrice: "29998",
  updatedAt: "2026-05-15T12:00:00.000Z",
});

const makeShipmentRecord = (overrides: Record<string, unknown> = {}) => {
  const state = { ...makeShipment(), ...overrides };

  return {
    toJSON: () => ({ ...state }),
    update: jest.fn(async (payload: Record<string, unknown>) => {
      Object.assign(state, payload);
    }),
  };
};

describe("shipmentRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderModel.count
      .mockResolvedValueOnce(156)
      .mockResolvedValueOnce(11)
      .mockResolvedValueOnce(7);
    orderModel.findAll.mockResolvedValue([makeShipment()]);
    orderModel.findAndCountAll.mockResolvedValue({ count: 1, rows: [makeShipment()] });
    orderModel.findOne.mockResolvedValue(makeShipment());
    orderModel.findByPk.mockImplementation(async (id: number) => makeShipmentRecord({ id }));
    shipmentReturnModel.findAll.mockResolvedValue([]);
    shipmentReturnModel.findOne.mockResolvedValue(null);
    shipmentReturnModel.create.mockResolvedValue({
      toJSON: () => ({
        completedAt: null,
        id: 41,
        orderId: 9802,
        reason: "منتج تالف",
        returnDate: "2026-05-18T00:00:00.000Z",
        returnType: 1,
        startedAt: "2026-05-18T00:00:00.000Z",
        status: 2,
      }),
    });
    shipmentReturnModel.findByPk.mockImplementation(async () => {
      const state = {
        completedAt: null as string | null,
        id: 41,
        orderId: 9802,
        reason: "منتج تالف",
        returnDate: "2026-05-18T00:00:00.000Z",
        returnType: 1,
        startedAt: "2026-05-18T00:00:00.000Z",
        status: 2,
      };

      return {
        toJSON: () => ({ ...state }),
        update: jest.fn(async (payload: Record<string, unknown>) => {
          Object.assign(state, payload);
        }),
      };
    });
    shipmentInventoryModel.findAll.mockResolvedValue([
      {
        color: "أبيض",
        costPrice: "2800",
        id: 5,
        product: {
          image: "https://example.com/product.png",
          title: "دريسينج مودرن",
          variants: [{ option1: "50x120", option2: "أبيض", sku: "DRS-102" }],
          vendor: { name: "دريسينج هاوس" },
          vendorId: 22,
        },
        productId: 321,
        productCode: "DRS-102",
        quantity: 2,
        status: 1,
      },
    ]);
    shipmentInventoryModel.create.mockResolvedValue({
      setDataValue: jest.fn(),
      toJSON: () => ({
        color: "أبيض",
        costPrice: "2800",
        id: 6,
        product: {
          image: "https://example.com/new-product.png",
          title: "منتج جديد",
          variants: [{ option1: "100x100", option2: "أبيض", sku: "NEW-1" }],
          vendor: { name: "بائع جديد" },
          vendorId: 12,
        },
        productCode: "NEW-1",
        productId: 555,
        quantity: 1,
        status: 1,
      }),
    });
    productModel.findByPk.mockResolvedValue({
      toJSON: () => ({
        id: 555,
        image: "https://example.com/new-product.png",
        title: "منتج جديد",
        variants: [{ option1: "100x100", option2: "أبيض", sku: "NEW-1" }],
        vendor: { name: "بائع جديد" },
        vendorId: 12,
      }),
    });
    shipmentExpenseModel.findAll.mockResolvedValue([
      {
        accountingDate: "2026-05-10T00:00:00.000Z",
        accountingStatus: 1,
        amount: "330",
        id: 8,
        reason: "شحن شحنات خارج القاهرة",
        type: "shipping",
      },
    ]);
    shipmentExpenseModel.create.mockResolvedValue({
      accountingDate: "2026-05-11T00:00:00.000Z",
      accountingStatus: 1,
      amount: "150",
      id: 9,
      reason: "مواد تغليف",
      type: "packaging",
    });
  });

  it("returns shipments metadata", async () => {
    const response = await request(app).get("/shipments/meta");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.tabs).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "shipments", label: "الشحنات" })]),
    );
    expect(response.body.data.shipmentTypes).toEqual([
      { id: "grouped", label: "شحن مجمع" },
      { id: "separate", label: "شحن منفصل" },
    ]);
  });

  it("creates shipments through the TS service boundary", async () => {
    const response = await request(app).post("/shipments").send({ shipmentNumber: "SH-9802" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Shipment created successfully", status: true });
    expect(legacyOrderService.saveImportedOrders).toHaveBeenCalledWith([{ shipmentNumber: "SH-9802" }], true);
  });

  it("returns the shipments list", async () => {
    const response = await request(app).get("/shipments").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        customerName: "عبير ابوالمجيد",
        operationNumber: "3002",
        shipmentNumber: "SH-9802",
        shipmentStatusLabel: "في المخزن",
        shipmentTypeLabel: "شحن مجمع",
      }),
    );
  });

  it("returns shipment details in the new frontend shape", async () => {
    const response = await request(app).get("/shipments/9802");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.customer.name).toBe("عبير ابوالمجيد");
    expect(response.body.data.products[0].productCode).toBe("RKA-002");
    expect(response.body.data.shipment.shippingCompany).toBe("J&T");
    expect(response.body.data.timeline[0].message).toBe("تم استلام الطلب");
  });

  it("returns vendor returns list", async () => {
    const response = await request(app).get("/shipments/returns/vendor").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        operationNumber: "3002",
        status: 2,
        statusLabel: "تم إبلاغ المورد",
      }),
    );
  });

  it("creates vendor returns through persisted workflow storage", async () => {
    const response = await request(app).post("/shipments/returns/vendor").send({
      orderId: 9802,
      reason: "منتج تالف",
      status: 2,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: 41,
        returnType: 1,
        status: 2,
        statusLabel: "تم إبلاغ المورد",
      }),
    );
    expect(orderModel.findByPk).toHaveBeenCalledWith(9802, expect.any(Object));
    const firstFindByPkCall = orderModel.findByPk.mock.results[0];
    expect(firstFindByPkCall).toBeDefined();
    const shipmentRecord = await firstFindByPkCall!.value;
    expect(shipmentRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ shipmentStatus: 8 }),
    );
  });

  it("updates vendor returns through persisted workflow storage", async () => {
    const shipmentRecord = makeShipmentRecord({ id: 9802, shipmentStatus: 2 });
    orderModel.findByPk.mockImplementation(async () => shipmentRecord);
    const response = await request(app).put("/shipments/returns/vendor/41").send({
      status: 3,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: 41,
        returnType: 1,
        status: 3,
        statusLabel: "تم التسليم للمورد",
      }),
    );
    expect(shipmentRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ shipmentStatus: 8 }),
    );
  });

  it("auto-forfeits overdue vendor returns after 12 days", async () => {
    const persistedState = {
      completedAt: null as string | null,
      id: 77,
      orderId: 9802,
      reason: "تأخر المورد في الاستلام",
      returnDate: "2026-05-01T00:00:00.000Z",
      returnType: 1,
      startedAt: "2026-05-01T00:00:00.000Z",
      status: 2,
      updatedAt: "2026-05-01T00:00:00.000Z",
    };
    const updateMock = jest.fn(async (payload: Record<string, unknown>) => {
      Object.assign(persistedState, payload);
    });
    shipmentReturnModel.findAll.mockResolvedValue([
      {
        toJSON: () => ({ ...persistedState }),
        update: updateMock,
      },
    ]);

    const response = await request(app).get("/shipments/returns/vendor").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 4 }),
    );
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        id: 77,
        status: 4,
        statusLabel: "فورفيت",
      }),
    );
  });

  it("returns inventory cards derived from product variants", async () => {
    const response = await request(app).get("/shipments/inventory").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        productId: 321,
        productCode: "DRS-102",
        productName: "دريسينج مودرن",
        quantity: 2,
        status: 1,
        statusLabel: "متوفر بالمخزون",
        vendorName: "دريسينج هاوس",
      }),
    );
  });

  it("creates manual inventory items", async () => {
    const response = await request(app).post("/shipments/inventory").send({
      costPrice: 2800,
      productId: 555,
      productCode: "NEW-1",
      quantity: 1,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: 6,
        productId: 555,
        productCode: "NEW-1",
        quantity: 1,
      }),
    );
  });

  it("returns performance overview", async () => {
    const response = await request(app).get("/shipments/performance").query({ period: "daily" });

    expect(response.status).toBe(200);
    expect(response.body.data.overview).toEqual(
      expect.objectContaining({
        deliveredOrdersCount: 1,
        totalGmv: 29998,
      }),
    );
    expect(response.body.data.providers[0].deliveryBy).toBe("J&T");
  });

  it("returns shipment expenses", async () => {
    const response = await request(app).get("/shipments/accounts/expenses").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        accountingStatus: 1,
        amount: 330,
        type: "shipping",
      }),
    );
  });

  it("creates shipment expenses", async () => {
    const response = await request(app).post("/shipments/accounts/expenses").send({
      amount: 150,
      reason: "مواد تغليف",
      type: "packaging",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        amount: 150,
        id: 9,
        reason: "مواد تغليف",
      }),
    );
  });
});
