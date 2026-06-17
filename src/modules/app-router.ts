import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { env } from "../config/env";
import { dashboardRouter } from "./dashboard";
import { notificationRouter } from "./notification";
import { orderRouter } from "./orders";
import { ticketRouter } from "./tickets";

const userRouter = require("../../app/modules/user/user.routes");
const factoryRouter = require("../../app/modules/factory/factory.routes");
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
              properties: {
                cards: {
                  items: { $ref: "#/components/schemas/DashboardCard" },
                  type: "array",
                },
                endDate: { example: "2026-05-31", type: "string" },
                role: { enum: ["admin", "vendor"], type: "string" },
                startDate: { example: "2026-05-01", type: "string" },
              },
              type: "object",
            },
            status: { example: true, type: "boolean" },
          },
          required: ["status", "data"],
        },
        DashboardPerformancePoint: {
          type: "object",
          properties: {
            date: { example: "2026-05-01", type: "string" },
            orders: { example: 42, type: "integer" },
            sales: { example: 51200, type: "number" },
          },
          required: ["date", "orders", "sales"],
        },
        DashboardPerformanceEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                endDate: { example: "2026-05-31", type: "string" },
                role: { enum: ["admin", "vendor"], type: "string" },
                series: {
                  items: { $ref: "#/components/schemas/DashboardPerformancePoint" },
                  type: "array",
                },
                startDate: { example: "2026-05-01", type: "string" },
                summary: { $ref: "#/components/schemas/DashboardCard" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        DashboardActivityItem: {
          type: "object",
          properties: {
            createdAt: { example: "2026-05-02T00:45:00.000Z", format: "date-time", type: "string" },
            entityId: { example: 31668, type: "integer" },
            entityType: { example: "order", type: "string" },
            id: { example: 91, type: "integer" },
            text: { example: "تم اضافة طلب جديد رقم 31668", type: "string" },
          },
        },
        DashboardLatestOrderItem: {
          type: "object",
          properties: {
            amount: { example: 12999, type: "number" },
            customerName: { example: "Lamiaa Saeid", type: "string" },
            id: { example: 31668, type: "integer" },
            orderDate: { example: "2026-05-02T00:45:00.000Z", format: "date-time", type: "string" },
            orderNumber: { example: "31668", type: "string" },
            productName: { example: "غرفة نوم - دريسينج", type: "string" },
            status: { example: 1, nullable: true, type: "integer" },
            statusLabel: { example: "معلق", type: "string" },
          },
        },
        DashboardLeaderboardItem: {
          type: "object",
          properties: {
            id: { example: 4, nullable: true, type: "integer" },
            name: { example: "ركنة للأثاث", type: "string" },
            rank: { example: 1, type: "integer" },
            secondaryLabel: { example: "صانع", type: "string" },
            totalSales: { example: 284000, type: "number" },
          },
        },
        DashboardSalesDistributionItem: {
          type: "object",
          properties: {
            color: { example: "#6366F1", type: "string" },
            label: { example: "غرفة النوم", type: "string" },
            percentage: { example: 40, type: "number" },
            value: { example: 320000, type: "number" },
          },
        },
        DashboardQuickActionItem: {
          type: "object",
          properties: {
            description: { example: "رفع منتج جديد", type: "string" },
            icon: { example: "package", type: "string" },
            key: { example: "add-product", type: "string" },
            label: { example: "إضافة منتج", type: "string" },
            route: { example: "/products/new", type: "string" },
          },
        },
        DashboardGoalProgressItem: {
          type: "object",
          properties: {
            color: { example: "#6366F1", type: "string" },
            currentValue: { example: 847000, type: "number" },
            key: { example: "salesTarget", type: "string" },
            label: { example: "هدف المبيعات", type: "string" },
            progressPercentage: { example: 84.7, type: "number" },
            targetValue: { example: 1000000, type: "number" },
          },
        },
        DashboardActivitiesEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/DashboardActivityItem" },
                  type: "array",
                },
                role: { enum: ["admin", "vendor"], type: "string" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        DashboardLatestOrdersEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/DashboardLatestOrderItem" },
                  type: "array",
                },
                role: { enum: ["admin", "vendor"], type: "string" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        DashboardLeaderboardEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/DashboardLeaderboardItem" },
                  type: "array",
                },
                role: { enum: ["admin", "vendor"], type: "string" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        DashboardSalesDistributionEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/DashboardSalesDistributionItem" },
                  type: "array",
                },
                role: { enum: ["admin", "vendor"], type: "string" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        DashboardQuickActionsEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/DashboardQuickActionItem" },
                  type: "array",
                },
                role: { enum: ["admin", "vendor"], type: "string" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        DashboardGoalsProgressEnvelope: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/DashboardGoalProgressItem" },
                  type: "array",
                },
                role: { enum: ["admin", "vendor"], type: "string" },
              },
            },
            status: { example: true, type: "boolean" },
          },
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
            accountManagerUserId: { example: 12, nullable: true, type: "integer" },
            daysToDeliver: { example: 7, nullable: true, type: "integer" },
            email: { example: "vendor@homix.com", type: "string" },
            name: { example: "ركنة للأثاث", type: "string" },
            password: { example: "Secret123!", type: "string" },
          },
          required: ["name"],
        },
        VendorSummary: {
          type: "object",
          properties: {
            accountManager: { $ref: "#/components/schemas/UserSummary", nullable: true },
            accountManagerUserId: { example: 12, nullable: true, type: "integer" },
            daysToDeliver: { example: 7, nullable: true, type: "integer" },
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
        OrderMetaOption: {
          type: "object",
          properties: {
            id: { oneOf: [{ type: "integer" }, { type: "string" }] },
            label: { example: "ركنة للأثاث", type: "string" },
          },
          required: ["id", "label"],
        },
        OrderMetaUserOption: {
          type: "object",
          properties: {
            id: { example: 1, type: "integer" },
            label: { example: "Sara Mohamed", type: "string" },
          },
          required: ["id", "label"],
        },
        OrderMetaStatusOption: {
          type: "object",
          properties: {
            id: { example: 1, type: "integer" },
            label: { example: "PENDING", type: "string" },
          },
          required: ["id", "label"],
        },
        OrderMetaPriorityOption: {
          type: "object",
          properties: {
            id: { example: 3, enum: [1, 2, 3], type: "integer" },
            label: { example: "مستعجل جدا", type: "string" },
          },
          required: ["id", "label"],
        },
        OrderMetaVendorOption: {
          type: "object",
          properties: {
            id: { example: 3, type: "integer" },
            label: { example: "ركنة للأثاث", type: "string" },
          },
          required: ["id", "label"],
        },
        OrderMetaResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                assignees: { items: { $ref: "#/components/schemas/OrderMetaUserOption" }, type: "array" },
                deliveryByOptions: { items: { $ref: "#/components/schemas/OrderMetaStatusOption" }, type: "array" },
                manufactureStatuses: { items: { $ref: "#/components/schemas/OrderMetaStatusOption" }, type: "array" },
                paymentStatuses: { items: { $ref: "#/components/schemas/OrderMetaStatusOption" }, type: "array" },
                priorities: { items: { $ref: "#/components/schemas/OrderMetaPriorityOption" }, type: "array" },
                statuses: { items: { $ref: "#/components/schemas/OrderMetaStatusOption" }, type: "array" },
                vendors: { items: { $ref: "#/components/schemas/OrderMetaVendorOption" }, type: "array" },
              },
              required: ["assignees", "deliveryByOptions", "manufactureStatuses", "paymentStatuses", "priorities", "statuses", "vendors"],
              example: {
                assignees: [
                  { id: 1, label: "Sara Mohamed" },
                  { id: 5, label: "Ahmed Hesham" },
                ],
                deliveryByOptions: [
                  { id: 1, label: "هوميكس" },
                  { id: 2, label: "بائع" },
                ],
                manufactureStatuses: [
                  { id: 1, label: "مقبول" },
                  { id: 2, label: "قيد التصنيع" },
                  { id: 3, label: "جاهز للشحن" },
                ],
                paymentStatuses: [
                  { id: 1, label: "الدفع عند الاستلام" },
                  { id: 2, label: "مدفوع" },
                ],
                priorities: [
                  { id: 1, label: "بالمدة" },
                  { id: 2, label: "مستعجل" },
                  { id: 3, label: "مستعجل جدا" },
                ],
                statuses: [
                  { id: 1, label: "معلق" },
                  { id: 2, label: "قيد التصنيع" },
                  { id: 5, label: "تم التسليم" },
                ],
                vendors: [
                  { id: 3, label: "ركنة للأثاث" },
                  { id: 4, label: "دريسينج هاوس" },
                ],
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        OrderSummaryCard: {
          type: "object",
          properties: {
            key: {
              enum: ["totalOrders", "pendingOrders", "inProgressOrders", "deliveredOrders", "canceledOrRefundedOrders", "urgentOrders"],
              type: "string",
            },
            label: { example: "إجمالي الطلبات", type: "string" },
            value: { example: 720, type: "integer" },
          },
          required: ["key", "label", "value"],
        },
        OrderSummaryResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                cards: { items: { $ref: "#/components/schemas/OrderSummaryCard" }, type: "array" },
              },
              required: ["cards"],
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        OrderListItem: {
          type: "object",
          properties: {
            code: { example: "3001", type: "string" },
            customerName: { example: "Lamiaa Saeid", type: "string" },
            daysSinceOrder: { example: 3, nullable: true, type: "integer" },
            deliveryBy: {
              description: "Who handles delivery for the order. `1` = هوميكس, `2` = البائع.",
              enum: [1, 2],
              example: 1,
              nullable: true,
              type: "integer",
            },
            deliveryPriority: { enum: [1, 2, 3], nullable: true, type: "integer" },
            deliveryPriorityLabel: { example: "بالمدة", type: "string" },
            expectedDeliveryDate: { example: "2026-05-06T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            fine: {
              description: "Stored fine value updated by the daily cron job. New orders usually remain 0 until the cron runs.",
              example: 0,
              type: "number",
            },
            id: { example: 7, type: "integer" },
            manufactureStatus: { example: 2, nullable: true, type: "integer" },
            manufactureStatusLabel: { example: "في مدة التصنيع", type: "string" },
            operationNumber: { example: "3001", type: "string" },
            orderDate: { example: "2026-05-01T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            orderNumber: { example: "31668", type: "string" },
            paymentStatus: { example: 1, nullable: true, type: "integer" },
            paymentStatusLabel: { example: "دفع عند الاستلام", type: "string" },
            productCode: { example: "RKA-001", type: "string" },
            productImage: { example: "https://example.com/product.png", type: "string" },
            productName: { example: "ركنة للأثاث", type: "string" },
            status: { example: 2, nullable: true, type: "integer" },
            statusLabel: { example: "معلق", type: "string" },
            totalCost: { example: 1200, type: "number" },
            totalPrice: { example: 2299, type: "number" },
            userName: { example: "Sara Mohamed", type: "string" },
            vendorId: { example: 3, nullable: true, type: "integer" },
            vendorName: { example: "ركنة للأثاث", type: "string" },
          },
          required: ["id", "operationNumber", "orderNumber", "customerName", "productName", "statusLabel"],
        },
        OrderListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: { items: { $ref: "#/components/schemas/OrderListItem" }, type: "array" },
                page: { example: 1, type: "integer" },
                size: { example: 50, type: "integer" },
                totalCount: { example: 72, type: "integer" },
              },
              required: ["items", "page", "size", "totalCount"],
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        OrderAttachment: {
          type: "object",
          properties: {
            createdAt: { example: "2026-05-04T00:00:00.000Z", format: "date-time", type: "string" },
            description: { example: "invoice", type: "string" },
            id: { example: 9, type: "integer" },
            name: { example: "invoice.pdf", type: "string" },
            url: { example: "/uploads/invoice.pdf", type: "string" },
          },
          required: ["id", "name", "url", "createdAt"],
        },
        OrderNote: {
          type: "object",
          properties: {
            attachments: { items: { $ref: "#/components/schemas/OrderAttachment" }, type: "array" },
            createdAt: { example: "2026-05-04T00:00:00.000Z", format: "date-time", type: "string" },
            id: { example: 4, type: "integer" },
            text: { example: "ابدأ التصنيع", type: "string" },
            userName: { example: "Ahmed Hesham", type: "string" },
          },
          required: ["id", "text", "userName", "createdAt", "attachments"],
        },
        OrderTimelineItem: {
          type: "object",
          properties: {
            changedAt: { example: "2026-05-04T01:00:00.000Z", format: "date-time", type: "string" },
            description: { example: "المدة المتوقعة 14 يوم عمل", type: "string" },
            eventType: { example: "manufacturing_started", type: "string" },
            fromStatus: { example: 1, nullable: true, type: "integer" },
            fromStatusLabel: { example: "معلق", type: "string" },
            id: { example: 8, type: "integer" },
            message: { example: "بدأ التصنيع", type: "string" },
            toStatus: { example: 2, nullable: true, type: "integer" },
            toStatusLabel: { example: "قيد التصنيع", type: "string" },
            userName: { example: "Sara Mohamed", type: "string" },
          },
          required: ["id", "changedAt", "description", "eventType", "fromStatusLabel", "message", "toStatusLabel", "userName"],
        },
        OrderStatusHistoryItem: {
          type: "object",
          properties: {
            changedAt: { example: "2026-05-01T00:00:00.000Z", format: "date-time", type: "string" },
            id: { example: 8, type: "integer" },
            isActive: { example: true, type: "boolean" },
            status: { example: 2, nullable: true, type: "integer" },
            statusLabel: { example: "قيد التصنيع", type: "string" },
            userName: { example: "Sara Mohamed", type: "string" },
          },
          required: ["id", "changedAt", "isActive", "statusLabel", "userName"],
        },
        OrderDetailsView: {
          type: "object",
          properties: {
            assigneeName: { example: "Sara Mohamed", type: "string" },
            customer: {
              type: "object",
              properties: {
                address: { example: "Cairo", type: "string" },
                email: { example: "lamiaa@example.com", type: "string" },
                id: { example: 5, nullable: true, type: "integer" },
                name: { example: "Lamiaa Saeid", type: "string" },
                phoneNumber: { example: "01000000000", type: "string" },
              },
            },
            financial: {
              type: "object",
              properties: {
                amountToCollect: { example: 2099, type: "number" },
                commission: { example: 20, type: "number" },
                discount: { example: 100, type: "number" },
                downPayment: { example: 200, type: "number" },
                fine: {
                  description: "Stored fine value updated by the daily cron job. New orders usually remain 0 until the cron runs.",
                  example: 0,
                  type: "number",
                },
                shippingFees: { example: 0, type: "number" },
                totalCost: { example: 1200, type: "number" },
                totalPrice: { example: 2299, type: "number" },
              },
            },
            notes: { items: { $ref: "#/components/schemas/OrderNote" }, type: "array" },
            order: {
              allOf: [
                { $ref: "#/components/schemas/OrderListItem" },
                {
                  type: "object",
                  properties: {
                    deliveryDate: { example: "2026-05-05T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
                    itemsCount: { example: 1, type: "integer" },
                    notes: { example: "important note", type: "string" },
                    shipmentType: { example: "warehouse", type: "string" },
                  },
                },
              ],
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  color: { example: "blue", type: "string" },
                  id: { example: 18, type: "integer" },
                  image: { example: "https://example.com/product.png", type: "string" },
                  material: { example: "wood", type: "string" },
                  productId: { example: 33, nullable: true, type: "integer" },
                  productName: { example: "ركنة للأثاث", type: "string" },
                  quantity: { example: 1, type: "integer" },
                  size: { example: "100x100", type: "string" },
                  sku: { example: "RKA-001", type: "string" },
                  typeName: { example: "غرفة نوم", type: "string" },
                  unitCost: { example: 900, type: "number" },
                  vendorId: { example: 3, nullable: true, type: "integer" },
                  vendorName: { example: "ركنة للأثاث", type: "string" },
                },
                required: ["id", "productName", "quantity", "sku"],
              },
            },
            timeline: { items: { $ref: "#/components/schemas/OrderTimelineItem" }, type: "array" },
            statusHistory: { items: { $ref: "#/components/schemas/OrderStatusHistoryItem" }, type: "array" },
          },
          required: ["customer", "financial", "notes", "order", "items", "timeline", "statusHistory"],
        },
        OrderDetailsResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/OrderDetailsView" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        OrderBulkUpdateRequest: {
          type: "object",
          properties: {
            orderData: {
              additionalProperties: true,
              type: "object",
              example: { expectedDeliveryDate: "2026-05-10", status: 2 },
            },
            orderIds: { items: { example: 7, type: "integer" }, minItems: 1, type: "array" },
          },
          required: ["orderData", "orderIds"],
        },
        OrderBulkDeleteRequest: {
          type: "object",
          properties: {
            orderIds: { items: { example: 7, type: "integer" }, minItems: 1, type: "array" },
          },
          required: ["orderIds"],
        },
        OrderMutationRequest: {
          type: "object",
          required: ["customer", "line_items"],
          properties: {
            name: { example: "#H9802", type: "string" },
            number: { oneOf: [{ type: "integer" }, { type: "string" }], example: "9802" },
            order_number: { oneOf: [{ type: "integer" }, { type: "string" }], example: "31667" },
            customer: {
              type: "object",
              additionalProperties: true,
              example: {
                first_name: "عبير",
                last_name: "ابوالمجيد",
                phone: "01155559646",
              },
            },
            line_items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                properties: {
                  title: { example: "كنبة شيب", type: "string" },
                  price: { example: 16999, type: "number" },
                  quantity: { example: 1, type: "integer" },
                  variant_id: { oneOf: [{ type: "integer" }, { type: "string" }], example: 445566 },
                },
                required: ["title", "price", "quantity", "variant_id"],
                additionalProperties: true,
              },
            },
            orderDate: { example: "2026-06-18T00:00:00.000Z", format: "date-time", type: "string" },
            paymentStatus: { example: 1, type: "integer" },
            deliveryBy: { example: 1, type: "integer" },
            expectedDeliveryDate: { example: "2026-06-20T00:00:00.000Z", format: "date-time", type: "string" },
            downPayment: { example: 200, type: "number" },
            shippingFees: { example: 65, type: "number" },
            toBeCollected: { example: 29998, type: "number" },
          },
          additionalProperties: true,
          example: {
            customer: {
              first_name: "عبير",
              last_name: "ابوالمجيد",
              phone: "01155559646",
            },
            line_items: [
              {
                price: 16999,
                quantity: 1,
                title: "كنبة شيب",
                variant_id: 445566,
              },
            ],
            name: "#H9802",
            number: "9802",
            order_number: "31667",
            expectedDeliveryDate: "2026-06-20T00:00:00.000Z",
            paymentStatus: 1,
            shippingFees: 65,
            toBeCollected: 29998,
          },
        },
        OrderFinancialReportResponse: {
          type: "object",
          properties: {
            data: {
              additionalProperties: true,
              type: "object",
              example: {
                totalCollected: 125000,
                totalCommission: 17500,
                totalOrders: 72,
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentMetaOption: {
          type: "object",
          properties: {
            id: { oneOf: [{ type: "integer" }, { type: "string" }] },
            label: { example: "تم التسليم", type: "string" },
          },
          required: ["id", "label"],
        },
        ShipmentMetaResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                accountingStatuses: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                customerReturnStatuses: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                deliveryByOptions: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                expenseTypes: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                governorates: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                inventoryStatuses: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                paymentStatuses: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                shipmentStatuses: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                shipmentTypes: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
                tabs: {
                  items: {
                    type: "object",
                    properties: {
                      count: { example: 156, nullable: true, type: "integer" },
                      id: { example: "shipments", type: "string" },
                      label: { example: "الشحنات", type: "string" },
                    },
                    required: ["id", "label"],
                  },
                  type: "array",
                },
                vendorReturnStatuses: { items: { $ref: "#/components/schemas/ShipmentMetaOption" }, type: "array" },
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentSummaryCard: {
          type: "object",
          properties: {
            description: { example: "إجمالي الشحنات ضمن الفلاتر الحالية", type: "string" },
            key: { example: "totalShipments", type: "string" },
            label: { example: "الشحنات", type: "string" },
            value: { example: 156, type: "number" },
          },
          required: ["key", "label", "value", "description"],
        },
        ShipmentSummaryResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                cards: { items: { $ref: "#/components/schemas/ShipmentSummaryCard" }, type: "array" },
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentListItem: {
          type: "object",
          properties: {
            amountToCollect: { example: 12999, type: "number" },
            customerName: { example: "Lamiaa Saeid", type: "string" },
            customerPhone: { example: "01155559646", type: "string" },
            daysCounter: { example: 11, nullable: true, type: "integer" },
            deliveryBy: { example: "J&T", type: "string" },
            deliveryDate: { example: "2026-05-17T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            governorate: { example: "الجيزة", type: "string" },
            id: { example: 9802, type: "integer" },
            operationNumber: { example: "3002", type: "string" },
            orderNumber: { example: "31667", type: "string" },
            paymentStatus: { example: 1, nullable: true, type: "integer" },
            paymentStatusLabel: { example: "الدفع عند الاستلام", type: "string" },
            receivedInWarehouseDate: { example: "2026-05-12T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            scheduledDeliveryDate: { example: "2026-05-17T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            sellerName: { example: "ركنة للأثاث", type: "string" },
            shipmentNumber: { example: "SH-9802", type: "string" },
            shipmentStatus: { example: 2, nullable: true, type: "integer" },
            shipmentStatusLabel: { example: "في المخزن", type: "string" },
            shipmentType: { example: "grouped", type: "string" },
            shipmentTypeLabel: { example: "شحن مجمع", type: "string" },
            shippingCost: { example: 65, type: "number" },
          },
          required: ["id", "operationNumber", "orderNumber", "shipmentNumber", "shipmentStatusLabel"],
        },
        ShipmentListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: { items: { $ref: "#/components/schemas/ShipmentListItem" }, type: "array" },
                page: { example: 1, type: "integer" },
                size: { example: 20, type: "integer" },
                totalCount: { example: 156, type: "integer" },
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentDetailsResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                customer: {
                  type: "object",
                  properties: {
                    address: { example: "الهرم, الجيزة", type: "string" },
                    name: { example: "عبير ابوالمجيد", type: "string" },
                    phoneNumber: { example: "01155559646", type: "string" },
                  },
                },
                financial: {
                  type: "object",
                  properties: {
                    amountToCollect: { example: 29998, type: "number" },
                    shippingCost: { example: 65, type: "number" },
                    totalPrice: { example: 29998, type: "number" },
                  },
                },
                notes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      createdAt: { example: "2026-05-15T11:00:00.000Z", type: "string", format: "date-time" },
                      id: { example: 18, type: "integer" },
                      text: { example: "الشحنة متأخرة عن الموعد المحدد", type: "string" },
                      userName: { example: "Ahmed Hesham", type: "string" },
                    },
                  },
                },
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      color: { example: "رمادي", type: "string" },
                      image: { example: "https://example.com/product.png", type: "string" },
                      price: { example: 16999, type: "number" },
                      productCode: { example: "RKA-002", type: "string" },
                      productName: { example: "كنبة شيب", type: "string" },
                      quantity: { example: 1, type: "integer" },
                      size: { example: "200x300", type: "string" },
                      vendorName: { example: "ركنة للأثاث", type: "string" },
                    },
                  },
                },
                shipment: {
                  allOf: [
                    { $ref: "#/components/schemas/ShipmentListItem" },
                    {
                      type: "object",
                      properties: {
                        shippingCompany: { example: "J&T Express", type: "string" },
                      },
                    },
                  ],
                },
                timeline: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      changedAt: { example: "2026-05-12T09:05:00.000Z", type: "string", format: "date-time" },
                      id: { example: 401, type: "integer" },
                      message: { example: "تم استلام الطلب", type: "string" },
                      userName: { example: "", type: "string" },
                    },
                  },
                },
                vendor: {
                  type: "object",
                  properties: {
                    name: { example: "ركنة للأثاث", type: "string" },
                  },
                },
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentReturnItem: {
          type: "object",
          properties: {
            daysCounter: { example: 10, nullable: true, type: "integer" },
            id: { example: 12, type: "integer" },
            operationNumber: { example: "3001", type: "string" },
            orderNumber: { example: "31805", type: "string" },
            reason: { example: "منتج تالف", type: "string" },
            returnDate: { example: "2026-05-08T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            sellerName: { example: "ركنة للأثاث", type: "string" },
            returnType: { example: 1, type: "integer" },
            returnTypeLabel: { example: "مرتجعات إلى المورد", type: "string" },
            status: { example: 2, type: "integer" },
            statusLabel: { example: "تم إبلاغ المورد", type: "string" },
          },
        },
        ShipmentReturnListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: { items: { $ref: "#/components/schemas/ShipmentReturnItem" }, type: "array" },
                page: { example: 1, type: "integer" },
                size: { example: 20, type: "integer" },
                totalCount: { example: 11, type: "integer" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        ShipmentReturnMutationRequest: {
          type: "object",
          properties: {
            orderId: { example: 9802, type: "integer" },
            reason: { example: "منتج تالف", type: "string" },
            returnDate: { example: "2026-05-18T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            status: { example: 2, type: "integer" },
          },
          required: ["orderId", "reason"],
        },
        ShipmentReturnItemResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/ShipmentReturnItem" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentInventoryItem: {
          type: "object",
          properties: {
            color: { example: "أبيض", type: "string" },
            costPrice: { example: 2800, type: "number" },
            id: { example: 5, type: "integer" },
            image: { example: "https://example.com/product.png", type: "string" },
            productId: { example: 321, nullable: true, type: "integer" },
            productCode: { example: "DRS-102", type: "string" },
            productName: { example: "دريسينج مودرن", type: "string" },
            quantity: { example: 2, type: "integer" },
            size: { example: "50x120", type: "string" },
            status: { example: 1, type: "integer" },
            statusLabel: { example: "متوفر بالمخزون", type: "string" },
            vendorId: { example: 17, nullable: true, type: "integer" },
            vendorName: { example: "دريسينج هاوس", type: "string" },
          },
        },
        ShipmentInventoryMutationRequest: {
          type: "object",
          properties: {
            color: { example: "أبيض", type: "string" },
            costPrice: { example: 2800, type: "number" },
            productId: { example: 321, type: "integer" },
            productCode: { example: "DRS-102", type: "string" },
            quantity: { example: 2, type: "integer" },
            size: { example: "50x120", type: "string" },
            status: { example: 1, type: "integer" },
          },
          required: ["costPrice", "productId", "productCode", "quantity"],
        },
        ShipmentInventoryListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: { items: { $ref: "#/components/schemas/ShipmentInventoryItem" }, type: "array" },
                page: { example: 1, type: "integer" },
                size: { example: 20, type: "integer" },
                totalCount: { example: 42, type: "integer" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        ShipmentInventoryItemResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/ShipmentInventoryItem" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentDeliveryAccountItem: {
          type: "object",
          properties: {
            accountingDate: { example: "2026-05-14T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            accountingStatus: { example: 2, type: "integer" },
            accountingStatusLabel: { example: "تم التصفية", type: "string" },
            amountToCollect: { example: 12999, type: "number" },
            deliveryBy: { example: "بوسطة", type: "string" },
            deliveryDate: { example: "2026-05-13T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            operationNumber: { example: "3001", type: "string" },
            orderNumber: { example: "31668", type: "string" },
            paymentMethod: { example: "2", type: "string" },
            paymentMethodLabel: { example: "مدفوع", type: "string" },
            productCode: { example: "RKA-001", type: "string" },
            reference: { example: "TXN-88201", type: "string" },
            sellerName: { example: "ركنة للأثاث", type: "string" },
            sellingPrice: { example: 12999, type: "number" },
            shippingCost: { example: 50, type: "number" },
          },
        },
        ShipmentDeliveryAccountsListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: { items: { $ref: "#/components/schemas/ShipmentDeliveryAccountItem" }, type: "array" },
                page: { example: 1, type: "integer" },
                size: { example: 20, type: "integer" },
                totalCount: { example: 89, type: "integer" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        ShipmentExpenseAccountItem: {
          type: "object",
          properties: {
            accountingDate: { example: "2026-05-10T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            accountingStatus: { example: 1, type: "integer" },
            accountingStatusLabel: { example: "معلق", type: "string" },
            amount: { example: 330, type: "number" },
            reason: { example: "شحن شحنات خارج القاهرة", type: "string" },
            type: { example: 1, type: "integer" },
            typeLabel: { example: "شحن", type: "string" },
          },
        },
        ShipmentExpenseMutationRequest: {
          type: "object",
          properties: {
            accountingDate: { example: "2026-05-11T00:00:00.000Z", nullable: true, type: "string", format: "date-time" },
            accountingStatus: { example: 1, type: "integer" },
            amount: { example: 150, type: "number" },
            reason: { example: "مواد تغليف", type: "string" },
            type: { example: 2, type: "integer" },
          },
          required: ["amount", "reason", "type"],
        },
        ShipmentExpenseAccountsListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: { items: { $ref: "#/components/schemas/ShipmentExpenseAccountItem" }, type: "array" },
                page: { example: 1, type: "integer" },
                size: { example: 20, type: "integer" },
                totalCount: { example: 0, type: "integer" },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        ShipmentExpenseAccountItemResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/ShipmentExpenseAccountItem" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentNote: {
          type: "object",
          properties: {
            createdAt: { example: "2026-05-15T11:00:00.000Z", type: "string", format: "date-time" },
            id: { example: 18, type: "integer" },
            text: { example: "الشحنة متأخرة عن الموعد المحدد", type: "string" },
            userName: { example: "Ahmed Hesham", type: "string" },
          },
          required: ["createdAt", "id", "text", "userName"],
        },
        ShipmentNoteRequest: {
          type: "object",
          properties: {
            text: { example: "تم التواصل مع شركة الشحن", type: "string" },
          },
          required: ["text"],
        },
        ShipmentNoteResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/ShipmentNote" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        ShipmentMessageResponse: {
          type: "object",
          properties: {
            message: { example: "Shipment deleted successfully", type: "string" },
            status: { example: true, type: "boolean" },
          },
          required: ["message", "status"],
        },
        ShipmentPerformanceResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                chart: {
                  items: {
                    type: "object",
                    properties: {
                      deliveredOrdersCount: { example: 12, type: "integer" },
                      label: { example: "2026-05-12", type: "string" },
                    },
                  },
                  type: "array",
                },
                overview: {
                  type: "object",
                  properties: {
                    averageDeliveryDays: { example: 3.2, type: "number" },
                    deliveredOrdersCount: { example: 98, type: "integer" },
                    totalGmv: { example: 284500, type: "number" },
                  },
                },
                providers: {
                  items: {
                    type: "object",
                    properties: {
                      averageDeliveryDays: { example: 2.8, type: "number" },
                      deliveredOrdersCount: { example: 42, type: "integer" },
                      deliveryBy: { example: "بوسطة", type: "string" },
                      returnsCount: { example: 3, type: "integer" },
                      successRate: { example: 94, type: "number" },
                      totalGmv: { example: 181400, type: "number" },
                    },
                  },
                  type: "array",
                },
              },
            },
            status: { example: true, type: "boolean" },
          },
        },
        TicketUserSummary: {
          type: "object",
          properties: {
            firstName: { example: "Ahmed", type: "string" },
            id: { example: 5, type: "integer" },
            lastName: { example: "Hesham", type: "string" },
          },
        },
        TicketAttachmentSummary: {
          type: "object",
          properties: {
            createdAt: { example: "2026-05-03T22:33:00.000Z", type: "string" },
            description: { example: "Screenshot", type: "string" },
            id: { example: 11, type: "integer" },
            name: { example: "proof.png", type: "string" },
            url: { example: "uploads/ticket/proof.png", type: "string" },
          },
        },
        TicketNoteSummary: {
          type: "object",
          properties: {
            createdAt: { example: "2026-05-03T22:33:00.000Z", type: "string" },
            id: { example: 22, type: "integer" },
            text: { example: "تم فتح التذكرة بنجاح", type: "string" },
            updatedAt: { example: "2026-05-03T22:33:00.000Z", type: "string" },
            user: { $ref: "#/components/schemas/TicketUserSummary" },
          },
        },
        TicketOrderSummary: {
          type: "object",
          properties: {
            customerName: { example: "Lamiaa Saeid", type: "string" },
            id: { example: 12, type: "integer" },
            operationNumber: { example: "3001", type: "string" },
            orderNumber: { example: "31668", type: "string" },
            productName: { example: "غرفة نوم - دريسينج", type: "string" },
            productSku: { example: "RKA-001", type: "string" },
            sellerName: { example: "ركنة للأثاث", type: "string" },
          },
        },
        TicketSummary: {
          type: "object",
          properties: {
            assignedTo: { $ref: "#/components/schemas/TicketUserSummary" },
            assigneeReply: { example: "التوصيل خلال 72 ساعة", type: "string" },
            closedAt: { example: null, nullable: true, type: "string" },
            createdAt: { example: "2026-05-03T22:33:00.000Z", type: "string" },
            creatorReply: { example: "متى بالظبط؟", type: "string" },
            daysOpen: { example: 2, type: "integer" },
            id: { example: 4, type: "integer" },
            notes: { example: "تم التواصل مع شركة الشحن", type: "string" },
            order: { $ref: "#/components/schemas/TicketOrderSummary" },
            status: { example: 1, type: "integer" },
            statusLabel: { example: "مفتوحة", type: "string" },
            type: { example: 1, type: "integer" },
            typeLabel: { example: "تأخير في التوصيل", type: "string" },
          },
        },
        TicketDetails: {
          allOf: [
            { $ref: "#/components/schemas/TicketSummary" },
            {
              type: "object",
              properties: {
                attachments: {
                  items: { $ref: "#/components/schemas/TicketAttachmentSummary" },
                  type: "array",
                },
                createdBy: { $ref: "#/components/schemas/TicketUserSummary" },
                notesList: {
                  items: { $ref: "#/components/schemas/TicketNoteSummary" },
                  type: "array",
                },
              },
            },
          ],
        },
        TicketMetaResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                assignees: {
                  items: { $ref: "#/components/schemas/TicketUserSummary" },
                  type: "array",
                },
                statuses: {
                  items: {
                    type: "object",
                    properties: {
                      key: { example: 1, type: "integer" },
                      label: { example: "مفتوحة", type: "string" },
                    },
                  },
                  type: "array",
                },
                types: {
                  items: {
                    type: "object",
                    properties: {
                      key: { example: 1, type: "integer" },
                      label: { example: "تأخير في التوصيل", type: "string" },
                    },
                  },
                  type: "array",
                },
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketLookupResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/TicketOrderSummary" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketListResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                items: {
                  items: { $ref: "#/components/schemas/TicketSummary" },
                  type: "array",
                },
                page: { example: 1, type: "integer" },
                size: { example: 20, type: "integer" },
                summary: {
                  type: "object",
                  properties: {
                    averageResolutionDays: { example: 3, type: "number" },
                    closed: { example: 6, type: "integer" },
                    open: { example: 14, type: "integer" },
                    overdueOpen: { example: 2, type: "integer" },
                    total: { example: 20, type: "integer" },
                  },
                },
                totalCount: { example: 20, type: "integer" },
              },
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketDetailsResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/TicketDetails" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketNoteResponse: {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/TicketNoteSummary" },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketAttachmentListResponse: {
          type: "object",
          properties: {
            data: {
              items: { $ref: "#/components/schemas/TicketAttachmentSummary" },
              type: "array",
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketMessageResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                message: { example: "Note deleted successfully", type: "string" },
              },
              required: ["message"],
            },
            status: { example: true, type: "boolean" },
          },
          required: ["data", "status"],
        },
        TicketMutationRequest: {
          type: "object",
          properties: {
            assignedToUserId: { example: 5, type: "integer" },
            notes: { example: "العميل طلب تحديثًا عاجلًا عن موعد التسليم", type: "string" },
            orderId: { example: 12, type: "integer" },
            type: { example: 1, type: "integer" },
          },
          required: ["orderId", "type"],
        },
        TicketUpdateRequest: {
          type: "object",
          properties: {
            assignedToUserId: { example: 8, nullable: true, type: "integer" },
            notes: { example: "تم التواصل مع شركة الشحن وجارٍ المتابعة", type: "string" },
            status: { example: 2, type: "integer" },
            type: { example: 1, type: "integer" },
          },
        },
        TicketNoteRequest: {
          type: "object",
          properties: {
            text: { example: "تم إرسال رقم الشحنة للعميل", type: "string" },
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

  router.head("/", (_request, response) => {
    response.sendStatus(200);
  });
  router.get("/", (_request, response) => {
    response.status(200).json({
      message: "Homix API is running",
      status: true,
    });
  });
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
  router.use("/tickets", ticketRouter);

  return router;
};
