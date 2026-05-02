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
  apis: [
    "./app/modules/*/*.routes.js",
    "./app/modules/*/*.routes.ts",
    "./src/modules/**/*.routes.ts",
  ],
  definition: {
    components: {
      schemas: {
        DashboardCard: {
          type: "object",
          properties: {
            changePercentage: { example: 12.4, type: "number" },
            currentValue: { example: 847320, type: "number" },
            key: {
              enum: ["activeMakers", "activeProducts", "pendingOrders", "totalOrders", "totalSales"],
              type: "string",
            },
            previousValue: { example: 754000, type: "number" },
            trend: { enum: ["up", "down", "flat"], type: "string" },
          },
          required: ["key", "currentValue", "previousValue", "changePercentage", "trend"],
        },
        DashboardCardEnvelope: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/DashboardCard" },
            status: { example: true, type: "boolean" },
          },
          required: ["status", "data"],
        },
        DashboardCardsEnvelope: {
          type: "object",
          properties: {
            data: {
              items: { $ref: "#/components/schemas/DashboardCard" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
          },
          required: ["status", "data"],
        },
        EmptyObject: {
          additionalProperties: false,
          type: "object",
        },
        GenericMessageResponse: {
          type: "object",
          properties: {
            message: { example: "Operation completed successfully", type: "string" },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
          required: ["message", "status"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { example: "Validation failed", type: "string" },
            status: { example: false, type: "boolean" },
            statusCode: { example: 400, type: "integer" },
          },
          required: ["message"],
        },
        NotificationItem: {
          type: "object",
          properties: {
            createdAt: { example: "2026-05-02T00:45:00.000Z", format: "date-time", type: "string" },
            id: { example: 17, type: "integer" },
            isRead: { example: false, type: "boolean" },
            message: { example: "طلب جديد رقم 31668", type: "string" },
            type: { example: "order", type: "string" },
          },
          required: ["id", "message"],
        },
        NotificationListResponse: {
          type: "object",
          properties: {
            data: {
              items: { $ref: "#/components/schemas/NotificationItem" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data"],
        },
        UserSummary: {
          type: "object",
          properties: {
            email: { example: "admin@homix.com", type: "string" },
            firstName: { example: "Ahmed", type: "string" },
            id: { example: 1, type: "integer" },
            isActive: { example: true, type: "boolean" },
            lastName: { example: "Hesham", type: "string" },
            userType: { example: "admin", type: "string" },
            vendorId: { example: 4, nullable: true, type: "integer" },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            data: {
              items: { $ref: "#/components/schemas/UserSummary" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/UserSummary" },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { example: "admin@homix.com", type: "string" },
            password: { example: "Secret123!", type: "string" },
          },
          required: ["email", "password"],
        },
        LoginResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                token: { example: "jwt-token", type: "string" },
                user: { $ref: "#/components/schemas/UserSummary" },
              },
            },
            message: { example: "Logged in successfully", type: "string" },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        UserUpsertRequest: {
          type: "object",
          properties: {
            email: { example: "ops@homix.com", type: "string" },
            firstName: { example: "Ibrahim", type: "string" },
            password: { example: "Secret123!", type: "string" },
            userType: { example: "admin", type: "string" },
            vendorId: { example: 4, nullable: true, type: "integer" },
          },
        },
        VendorPayload: {
          type: "object",
          properties: {
            email: { example: "vendor@homix.com", type: "string" },
            name: { example: "ركنة للأثاث", type: "string" },
            password: { example: "Secret123!", type: "string" },
          },
          required: ["name"],
        },
        VendorSummary: {
          type: "object",
          properties: {
            email: { example: "vendor@homix.com", type: "string" },
            id: { example: 4, type: "integer" },
            isActive: { example: true, type: "boolean" },
            name: { example: "ركنة للأثاث", type: "string" },
          },
        },
        VendorResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/VendorSummary" },
            message: { example: "Vendor fetched successfully", type: "string" },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        VendorListResponse: {
          type: "object",
          properties: {
            data: {
              items: { $ref: "#/components/schemas/VendorSummary" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        FactoryPayload: {
          type: "object",
          properties: {
            address: { example: "Nasr City, Cairo", type: "string" },
            name: { example: "مصنع الموردن", type: "string" },
            phoneNumber: { example: "+201000000000", type: "string" },
            status: { example: "active", type: "string" },
          },
          required: ["name"],
        },
        AttachmentSummary: {
          type: "object",
          properties: {
            attachmentName: { example: "spec-sheet.pdf", type: "string" },
            attachmentPath: { example: "https://cdn.homix.com/factories/spec-sheet.pdf", type: "string" },
            description: { example: "Factory profile", type: "string" },
            id: { example: 9, type: "integer" },
          },
        },
        FactorySummary: {
          type: "object",
          properties: {
            attachments: {
              items: { $ref: "#/components/schemas/AttachmentSummary" },
              type: "array",
            },
            id: { example: 3, type: "integer" },
            name: { example: "مصنع الموردن", type: "string" },
            status: { example: "active", type: "string" },
          },
        },
        FactoryResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/FactorySummary" },
            message: { example: "Factory fetched successfully", type: "string" },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        FactoryListResponse: {
          type: "object",
          properties: {
            data: {
              items: { $ref: "#/components/schemas/FactorySummary" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        OrderLineUpdateRequest: {
          type: "object",
          properties: {
            color: { example: "Walnut", type: "string" },
            cost: { example: 1250, type: "number" },
            itemShipping: { example: 150, type: "number" },
            itemStatus: { example: 2, type: "integer" },
            material: { example: "Wood", type: "string" },
            notes: { example: "Urgent finishing", type: "string" },
            size: { example: "200x80", type: "string" },
            status: { example: 3, type: "integer" },
            toBeCollected: { example: 0, type: "integer" },
          },
        },
        NotePayload: {
          type: "object",
          properties: {
            text: { example: "Customer requested a darker stain", type: "string" },
          },
          required: ["text"],
        },
        ProductPayload: {
          type: "object",
          properties: {
            category: { example: "غرف نوم", type: "string" },
            name: { example: "دريسينج هاوس", type: "string" },
            price: { example: "16999", type: "string" },
            productType: { example: "دريسنج", type: "string" },
            vendor: { example: "ركنة للأثاث", type: "string" },
          },
          required: ["name"],
        },
        ProductSummary: {
          type: "object",
          properties: {
            category: { example: "غرف نوم", type: "string" },
            id: { example: 31668, type: "integer" },
            image: { example: "https://cdn.homix.com/products/31668.png", type: "string" },
            name: { example: "دريسينج هاوس", type: "string" },
            price: { example: 16999, type: "number" },
            productType: { example: "دريسنج", type: "string" },
            vendor: { example: "ركنة للأثاث", type: "string" },
          },
        },
        ProductListResponse: {
          type: "object",
          properties: {
            data: {
              properties: {
                products: {
                  items: { $ref: "#/components/schemas/ProductSummary" },
                  type: "array",
                },
                totalCount: { example: 72, type: "integer" },
              },
              type: "object",
            },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        ProductResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/ProductSummary" },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        ProductTypesResponse: {
          type: "object",
          properties: {
            data: {
              items: { example: "غرف نوم", type: "string" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
        CategoriesResponse: {
          type: "object",
          properties: {
            data: {
              items: { example: "سفرة", type: "string" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
            statusCode: { example: 200, type: "integer" },
          },
        },
      },
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
