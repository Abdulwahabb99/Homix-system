import express from "express";
import request from "supertest";

jest.mock("../../../app/middlewares/protectApi", () => {
  return (_request: express.Request, _response: express.Response, next: express.NextFunction) => {
    _request.user = { id: 7, userType: "1" };
    next();
  };
});

jest.mock("../../../app/modules/notification/notification.model", () => ({
  destroy: jest.fn().mockResolvedValue(1),
  findAll: jest.fn().mockResolvedValue([{ id: 1, readAt: null, text: "hello", userId: 7 }]),
  update: jest.fn().mockResolvedValue([1]),
}));

import { errorMiddleware } from "../../shared/http";
import { notificationRouter } from "./notification.routes";

describe("notificationRouter", () => {
  const app = express();
  app.use(express.json());
  app.use("/notifications", notificationRouter);
  app.use(errorMiddleware);

  it("gets notifications", async () => {
    const response = await request(app).get("/notifications");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
  });

  it("marks notifications as read", async () => {
    const response = await request(app).put("/notifications").send({});

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Notifications marked as read");
  });
});
