"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
jest.mock("../../../app/middlewares/protectApi", () => {
    return (_request, _response, next) => {
        _request.user = { id: 7 };
        next();
    };
});
jest.mock("../../../app/modules/notification/notification.model", () => ({
    destroy: jest.fn().mockResolvedValue(1),
    findAll: jest.fn().mockResolvedValue([{ id: 1, readAt: null, text: "hello", userId: 7 }]),
    update: jest.fn().mockResolvedValue([1]),
}));
const http_1 = require("../../shared/http");
const notification_routes_1 = require("./notification.routes");
describe("notificationRouter", () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use("/notifications", notification_routes_1.notificationRouter);
    app.use(http_1.errorMiddleware);
    it("gets notifications", async () => {
        const response = await (0, supertest_1.default)(app).get("/notifications");
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
    });
    it("marks notifications as read", async () => {
        const response = await (0, supertest_1.default)(app).put("/notifications").send({});
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Notifications marked as read");
    });
});
//# sourceMappingURL=notification.routes.test.js.map