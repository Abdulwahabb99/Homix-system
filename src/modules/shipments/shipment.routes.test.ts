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
};

const legacyShipmentController = {
  createShipment: jest.fn((_req: express.Request, res: express.Response) => res.status(200).json({ status: true })),
  exportShipments: jest.fn((_req: express.Request, res: express.Response) => res.status(200).end()),
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
jest.mock("../../../app/modules/shipments/shipment.controller", () => legacyShipmentController);

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
    productModel.findAll.mockResolvedValue([
      {
        image: "https://example.com/product.png",
        title: "دريسينج مودرن",
        variants: [{ cost: "2800", inventory_quantity: 2, option1: "50x120", option2: "أبيض", sku: "DRS-102" }],
        vendor: { name: "دريسينج هاوس" },
      },
    ]);
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
        status: "vendorNotified",
        statusLabel: "تم إبلاغ المورد",
      }),
    );
  });

  it("returns inventory cards derived from product variants", async () => {
    const response = await request(app).get("/shipments/inventory").query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        productCode: "DRS-102",
        quantity: 2,
        status: "inStock",
        statusLabel: "متوفر بالمخزون",
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
});
