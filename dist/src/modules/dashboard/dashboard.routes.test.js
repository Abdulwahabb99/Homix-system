"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
jest.mock("../../../app/middlewares/protectApi", () => {
    return (req, _res, next) => {
        req.user = { id: 1, userType: "1" };
        next();
    };
});
jest.mock("../../../app/modules/order/order.model", () => ({
    count: jest
        .fn()
        .mockResolvedValueOnce(12)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3),
    findOne: jest
        .fn()
        .mockResolvedValueOnce({ totalSales: "1200" })
        .mockResolvedValueOnce({ totalSales: "1000" }),
}));
jest.mock("../../../app/modules/orderLines/orderline.model", () => ({
    count: jest.fn(),
    findOne: jest.fn(),
}));
jest.mock("../../../app/modules/product/product.model", () => ({}));
jest.mock("../../../app/modules/user/user.model", () => ({
    count: jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1),
}));
const http_1 = require("../../shared/http");
const dashboard_routes_1 = require("./dashboard.routes");
describe("dashboardRouter", () => {
    const app = (0, express_1.default)();
    app.use("/dashboard", dashboard_routes_1.dashboardRouter);
    app.use(http_1.errorMiddleware);
    it("returns dashboard cards", async () => {
        const response = await (0, supertest_1.default)(app).get("/dashboard/cards").query({
            endDate: "2026-05-02",
            startDate: "2026-05-01",
        });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.data.cards).toHaveLength(4);
    });
});
//# sourceMappingURL=dashboard.routes.test.js.map