import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { env } from "../config/env";
import { dashboardRouter } from "./dashboard";
import { notificationRouter } from "./notification";

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
  apis: ["./app/modules/*/*.routes.js"],
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
    servers: [{ url: env.APP_URL }],
  },
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const createMainRouter = (): express.Router => {
  const router = express.Router({ mergeParams: true });

  router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
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
  router.use("/notifications", verifyToken, notificationRouter);
  router.use("/dashboard", dashboardRouter);

  return router;
};
