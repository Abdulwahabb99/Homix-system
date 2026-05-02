"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMainRouter = void 0;
const express_1 = __importDefault(require("express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("../config/env");
const dashboard_1 = require("./dashboard");
const notification_1 = require("./notification");
const userRouter = require("../../app/modules/user/user.routes");
const factoryRouter = require("../../app/modules/factory/factory.routes");
const orderRouter = require("../../app/modules/order/order.routes");
const productRouter = require("../../app/modules/product/product.routes");
const vendorRouter = require("../../app/modules/vendor/vendor.routes");
const employeeRouter = require("../../app/modules/employee/employee.routes");
const customerRouter = require("../../app/modules/customer/customer.routes");
const verifyToken = require("../../app/middlewares/protectApi");
const orderLineRouter = require("../../app/modules/orderLines/orderLine.routes");
const isNotVendor = require("../../app/middlewares/isNotVendor");
const categoriesRouter = require("../../app/modules/product/categories.routes");
const shipmentRouter = require("../../app/modules/shipments/shipment.routes");
const isNotLogistic = require("../../app/middlewares/isNotLogistic");
const swaggerOptions = {
    apis: [
        "./app/modules/*/*.routes.js",
        "./app/modules/*/*.routes.ts",
        "./src/modules/**/*.routes.ts",
    ],
    definition: {
        components: {
            securitySchemes: {
                bearerAuth: {
                    bearerFormat: "JWT",
                    scheme: "bearer",
                    type: "http",
                },
            },
        },
        info: {
            description: "API documentation for Homix application",
            title: "Homix API",
            version: "1.0.0",
        },
        openapi: "3.0.0",
        servers: [{ url: env_1.env.APP_URL }],
    },
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
const createMainRouter = () => {
    const router = express_1.default.Router({ mergeParams: true });
    router.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
    router.use("/orders", orderRouter);
    router.use("/orderLines", orderLineRouter);
    router.use("/users", userRouter);
    router.use("/factories", verifyToken, isNotLogistic, factoryRouter);
    router.use("/products", productRouter);
    router.use("/categories", categoriesRouter);
    router.use("/vendors", verifyToken, vendorRouter);
    router.use("/employees", verifyToken, isNotVendor, employeeRouter);
    router.use("/customers", verifyToken, isNotVendor, customerRouter);
    router.use("/shipments", verifyToken, isNotVendor, shipmentRouter);
    router.use("/notifications", verifyToken, notification_1.notificationRouter);
    router.use("/dashboard", dashboard_1.dashboardRouter);
    return router;
};
exports.createMainRouter = createMainRouter;
//# sourceMappingURL=app-router.js.map