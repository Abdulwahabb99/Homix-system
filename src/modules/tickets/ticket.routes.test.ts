import express from "express";
import request from "supertest";

const ticketModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
};

const orderModel = {
  findOne: jest.fn(),
};

const userModel = {
  findAll: jest.fn(),
};

const noteModel = {
  create: jest.fn(),
  findByPk: jest.fn(),
};

const attachmentModel = {
  create: jest.fn(),
  findByPk: jest.fn(),
};

const logModel = {
  bulkCreate: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
};

jest.mock("../../../app/middlewares/protectApi", () => {
  return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { id: 1, userType: "1" };
    req.vendorId = null;
    next();
  };
});

jest.mock("../../../config/fileUploadMiddleware", () => () => {
  return (_req: express.Request, _res: express.Response, next: express.NextFunction) => next();
});

jest.mock("../../../app/modules/tickets/ticket.model", () => ticketModel);
jest.mock("../../../app/modules/order/order.model", () => orderModel);
jest.mock("../../../app/modules/user/user.model", () => userModel);
jest.mock("../../../app/modules/notes/notes.model", () => noteModel);
jest.mock("../../../app/modules/attachments/attachment.model", () => attachmentModel);
jest.mock("../../../app/modules/logs/log.model", () => logModel);
jest.mock("../../../app/modules/customer/customer.model", () => ({}));
jest.mock("../../../app/modules/orderLines/orderline.model", () => ({}));
jest.mock("../../../app/modules/product/product.model", () => ({}));
jest.mock("../../../app/modules/vendor/vendor.model", () => ({}));

import { errorMiddleware } from "../../shared/http";
import { ticketRouter } from "./ticket.routes";

const makeOrder = () => ({
  code: "3001",
  customer: { firstName: "Lamiaa", lastName: "Saeid" },
  id: 7,
  orderLines: [
    {
      product: {
        title: "غرفة نوم - دريسينج",
        vendor: {
          id: 5,
          name: "ركنة للأثاث",
        },
      },
      sku: "RKA-001",
      title: "غرفة نوم - دريسينج",
    },
  ],
  orderNumber: "31668",
});

const makeTicket = () => ({
  assignee: { firstName: "Ahmed", id: 1, lastName: "Hesham" },
  attachments: [],
  assignedToUserId: 1,
  closedAt: null,
  createdAt: "2026-05-03T20:33:00.000Z",
  createdByUserId: 1,
  creator: { firstName: "Ahmed", id: 1, lastName: "Hesham" },
  id: 4,
  notes: "تم فتح التذكرة",
  notesList: [
    {
      createdAt: "2026-05-03T20:34:00.000Z",
      id: 10,
      text: "آخر رد من المسؤول",
      userId: 1,
    },
  ],
  linkedOrder: makeOrder(),
  orderId: 7,
  status: 1,
  type: 1,
  typeLabel: "تأخير في التوصيل",
});

describe("ticketRouter", () => {
  const app = express();
  app.use(express.json());
  app.use("/tickets", ticketRouter);
  app.use(errorMiddleware);

  beforeEach(() => {
    jest.clearAllMocks();

    userModel.findAll.mockResolvedValue([
      { firstName: "Ahmed", id: 1, lastName: "Hesham" },
      { firstName: "Sara", id: 2, lastName: "Mahmoud" },
    ]);

    ticketModel.findAll.mockResolvedValue([makeTicket()]);
    ticketModel.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [makeTicket()],
    });
    ticketModel.findByPk.mockResolvedValue({
      update: jest.fn().mockResolvedValue(undefined),
    });
    ticketModel.findOne.mockResolvedValue(makeTicket());

    orderModel.findOne.mockResolvedValue(makeOrder());
    noteModel.create.mockResolvedValue({
      createdAt: "2026-05-03T20:34:00.000Z",
      id: 9,
      text: "تم فتح التذكرة بنجاح",
      updatedAt: "2026-05-03T20:34:00.000Z",
      user: { firstName: "Ahmed", id: 1, lastName: "Hesham" },
    });
    ticketModel.create.mockResolvedValue({ id: 4 });
    logModel.findAll.mockResolvedValue([
      {
        action: "create",
        createdAt: "2026-05-03T20:33:00.000Z",
        entityId: 4,
        entityType: "ticket",
        field: "ticket_created",
        id: 88,
        to: "1",
        userId: 1,
      },
      {
        action: "update",
        createdAt: "2026-05-04T20:33:00.000Z",
        entityId: 4,
        entityType: "ticket",
        field: "status",
        from: "1",
        id: 89,
        to: "2",
        userId: 1,
      },
    ]);
  });

  it("returns ticket metadata", async () => {
    const response = await request(app).get("/tickets/meta");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.assignees).toHaveLength(2);
    expect(response.body.data.types).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 1, label: "تأخير في التوصيل" }),
      ]),
    );
  });

  it("looks up an order by operation number", async () => {
    const response = await request(app)
      .get("/tickets/orders/lookup")
      .query({ operationNumber: "OP-3001" });

    expect(response.status).toBe(200);
    expect(response.body.data.operationNumber).toBe("3001");
    expect(response.body.data.orderNumber).toBe("31668");
  });

  it("creates a ticket linked to an order", async () => {
    const response = await request(app)
      .post("/tickets")
      .send({
        assignedToUserId: 1,
        notes: "تم فتح التذكرة",
        orderId: 7,
        type: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe(true);
    expect(response.body.data.order.operationNumber).toBe("3001");
    expect(response.body.data.type).toBe(1);
  });

  it("lists tickets", async () => {
    const response = await request(app)
      .get("/tickets")
      .query({ page: 1, size: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].creatorReply).toBe("آخر رد من المسؤول");
    expect(response.body.data.summary.total).toBe(1);
  });

  it("adds a note to a ticket", async () => {
    const response = await request(app)
      .post("/tickets/4/notes")
      .send({ text: "تم فتح التذكرة بنجاح" });

    expect(response.status).toBe(201);
    expect(response.body.data.text).toBe("تم فتح التذكرة بنجاح");
  });

  it("returns ticket details with history", async () => {
    const response = await request(app).get("/tickets/4");

    expect(response.status).toBe(200);
    expect(response.body.data.history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "ticket_created",
          message: "تم إنشاء التذكرة",
        }),
        expect.objectContaining({
          eventType: "status_updated",
          field: "status",
        }),
      ]),
    );
  });
});
