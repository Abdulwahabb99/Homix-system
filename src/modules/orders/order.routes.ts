import express from "express";

import { asyncHandler, validateRequest } from "../../shared/http";
import { OrderController } from "./order.controller";
import { OrderRepository } from "./order.repo";
import {
  orderBulkDeleteSchema,
  orderBulkUpdateSchema,
  orderIdParamsSchema,
  orderListQuerySchema,
  orderMutationSchema,
  orderNoteParamsSchema,
  orderNoteSchema,
  orderSummaryQuerySchema,
} from "./order.schemas";
import { OrderService } from "./order.service";

const verifyToken = require("../../../app/middlewares/protectApi");
const isNotVendor = require("../../../app/middlewares/isNotVendor");
const fileUploadMiddleware = require("../../../config/fileUploadMiddleware");

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

export const orderRouter = express.Router();

/**
 * @swagger
 * /orders/meta:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Get order filter metadata
 *     description: Returns the dropdown/filter options used by the orders page. This endpoint has no query parameters. Labels are returned in Arabic for statuses, manufacture statuses, payment statuses, priorities, and delivery-by options.
 *     responses:
 *       200:
 *         description: Order filter options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderMetaResponse'
 *             examples:
 *               default:
 *                 summary: Orders filter metadata
 *                 value:
 *                   status: true
 *                   data:
 *                     assignees:
 *                       - id: 1
 *                         label: Sara Mohamed
 *                     manufactureStatuses:
 *                       - id: 1
 *                         label: مقبول
 *                       - id: 2
 *                         label: قيد التصنيع
 *                     paymentStatuses:
 *                       - id: 1
 *                         label: الدفع عند الاستلام
 *                       - id: 2
 *                         label: مدفوع
 *                     priorities:
 *                       - id: onSchedule
 *                         label: بالمدة
 *                       - id: almostDue
 *                         label: مستعجل
 *                       - id: urgent
 *                         label: مستعجل جدا
 *                     statuses:
 *                       - id: 1
 *                         label: معلق
 *                       - id: 2
 *                         label: قيد التصنيع
 *                     vendors:
 *                       - id: 3
 *                         label: ركنة للأثاث
 */
orderRouter.get("/meta", verifyToken, asyncHandler(orderController.getMeta));

/**
 * @swagger
 * /orders/summary:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Get order summary cards for the orders page
 *     parameters:
 *       - in: query
 *         name: orderNumber
 *         schema: { type: string }
 *       - in: query
 *         name: operationCode
 *         schema: { type: string }
 *       - in: query
 *         name: customerName
 *         schema: { type: string }
 *       - in: query
 *         name: productCode
 *         schema: { type: string }
 *       - in: query
 *         name: vendorName
 *         schema: { type: string }
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, example: "3,4" }
 *       - in: query
 *         name: status
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: manufactureStatus
 *         schema: { type: string, example: "2,3" }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: deliveryBy
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           example: "3,2"
 *       - in: query
 *         name: deliveryStatus
 *         schema: { type: string, example: "1,2" }
 *     responses:
 *       200:
 *         description: Order summary cards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderSummaryResponse'
 */
orderRouter.get(
  "/summary",
  verifyToken,
  validateRequest({ query: orderSummaryQuerySchema }),
  asyncHandler(orderController.getSummary),
);

/**
 * @swagger
 * /orders:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Create an order
 *     description: Creates an order through the current legacy-compatible order creation pipeline.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer, line_items]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "#H9802"
 *               number:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *                 example: "9802"
 *               order_number:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *                 example: "31667"
 *               customer:
 *                 type: object
 *                 description: Legacy customer payload used by the manual order creation/import pipeline.
 *               line_items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [title, price, quantity, variant_id]
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: كنبة شيب
 *                     price:
 *                       type: number
 *                       example: 16999
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     variant_id:
 *                       oneOf:
 *                         - type: integer
 *                         - type: string
 *                       example: 445566
 *               orderDate:
 *                 type: string
 *                 format: date-time
 *               paymentStatus:
 *                 type: integer
 *                 example: 1
 *               deliveryBy:
 *                 type: integer
 *                 example: 1
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date-time
 *               downPayment:
 *                 type: number
 *                 example: 200
 *               shippingFees:
 *                 type: number
 *                 example: 65
 *               toBeCollected:
 *                 type: number
 *                 example: 29998
 *             example:
 *               name: "#H9802"
 *               number: "9802"
 *               order_number: "31667"
 *               customer:
 *                 first_name: عبير
 *                 last_name: ابوالمجيد
 *                 phone: "01155559646"
 *               line_items:
 *                 - title: كنبة شيب
 *                   price: 16999
 *                   quantity: 1
 *                   variant_id: 445566
 *               orderDate: 2026-06-18T00:00:00.000Z
 *               paymentStatus: 1
 *               deliveryBy: 1
 *               expectedDeliveryDate: 2026-06-20T00:00:00.000Z
 *               downPayment: 200
 *               shippingFees: 65
 *               toBeCollected: 29998
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       400:
 *         description: Invalid order payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
orderRouter.post("/", validateRequest({ body: orderMutationSchema }), asyncHandler(orderController.createOrder));

/**
 * @swagger
 * /orders/financialReport:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Get the orders financial report
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema:
 *           oneOf:
 *             - type: integer
 *             - type: string
 *         description: Optional vendor override for admin requests.
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Financial report data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderFinancialReportResponse'
 */
orderRouter.get("/financialReport", verifyToken, asyncHandler(orderController.financialReport));

/**
 * @swagger
 * /orders/export:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Export orders to Excel
 *     description: Downloads an Excel export using the provided order filters.
 *     parameters:
 *       - in: query
 *         name: orderNumber
 *         schema: { type: string }
 *       - in: query
 *         name: operationCode
 *         schema: { type: string }
 *       - in: query
 *         name: customerName
 *         schema: { type: string }
 *       - in: query
 *         name: productCode
 *         schema: { type: string }
 *       - in: query
 *         name: vendorName
 *         schema: { type: string }
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, example: "3,4" }
 *       - in: query
 *         name: status
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: manufactureStatus
 *         schema: { type: string, example: "2,3" }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: deliveryBy
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
orderRouter.get("/export", verifyToken, asyncHandler(orderController.exportOrders));

/**
 * @swagger
 * /orders:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: List orders
 *     description: Returns paginated orders for the new orders page, with both legacy `orders` rows and view-friendly `items`.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 200 }
 *       - in: query
 *         name: orderNumber
 *         schema: { type: string }
 *       - in: query
 *         name: operationCode
 *         schema: { type: string }
 *       - in: query
 *         name: customerName
 *         schema: { type: string }
 *       - in: query
 *         name: productCode
 *         schema: { type: string }
 *       - in: query
 *         name: vendorName
 *         schema: { type: string }
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, example: "3,4" }
 *       - in: query
 *         name: status
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: manufactureStatus
 *         schema: { type: string, example: "2,3" }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: deliveryBy
 *         schema: { type: string, example: "1,2" }
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           example: "3,2"
 *       - in: query
 *         name: deliveryStatus
 *         schema: { type: string, example: "1,2" }
 *     responses:
 *       200:
 *         description: Paginated orders response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 */
orderRouter.get("/", verifyToken, validateRequest({ query: orderListQuerySchema }), asyncHandler(orderController.listOrders));

/**
 * @swagger
 * /orders/bulk-update:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Bulk update orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderBulkUpdateRequest'
 *     responses:
 *       200:
 *         description: Orders updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 */
orderRouter.put("/bulk-update", verifyToken, validateRequest({ body: orderBulkUpdateSchema }), asyncHandler(orderController.bulkUpdate));

/**
 * @swagger
 * /orders/import:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Import orders from Shopify
 *     responses:
 *       200:
 *         description: Orders imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 */
orderRouter.post("/import", verifyToken, asyncHandler(orderController.importOrders));

/**
 * @swagger
 * /orders/bulk-delete:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Bulk delete orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderBulkDeleteRequest'
 *     responses:
 *       200:
 *         description: Orders deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 */
orderRouter.delete("/bulk-delete", verifyToken, isNotVendor, validateRequest({ body: orderBulkDeleteSchema }), asyncHandler(orderController.bulkDelete));

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Get order details
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order details with additive `view` structure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetailsResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
orderRouter.get("/:orderId", verifyToken, validateRequest({ params: orderIdParamsSchema }), asyncHandler(orderController.getOrderById));

/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Update an order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderMutationRequest'
 *     responses:
 *       200:
 *         description: Updated order payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   additionalProperties: true
 *                   type: object
 *                 status:
 *                   type: boolean
 */
orderRouter.put("/:orderId", verifyToken, validateRequest({ body: orderMutationSchema, params: orderIdParamsSchema }), asyncHandler(orderController.updateOrder));

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Delete an order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 */
orderRouter.delete("/:orderId", verifyToken, isNotVendor, validateRequest({ params: orderIdParamsSchema }), asyncHandler(orderController.deleteOrder));

/**
 * @swagger
 * /orders/{orderId}/notes/{noteId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Update an order note
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotePayload'
 *     responses:
 *       200:
 *         description: Updated note payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   additionalProperties: true
 *                   type: object
 *                 status:
 *                   type: boolean
 */
orderRouter.put("/:orderId/notes/:noteId", verifyToken, validateRequest({ body: orderNoteSchema, params: orderNoteParamsSchema }), asyncHandler(orderController.updateNote));

/**
 * @swagger
 * /orders/{orderId}/notes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Add an order note
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotePayload'
 *     responses:
 *       200:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   additionalProperties: true
 *                   type: object
 *                 status:
 *                   type: boolean
 */
orderRouter.post("/:orderId/notes", verifyToken, validateRequest({ body: orderNoteSchema, params: orderIdParamsSchema }), asyncHandler(orderController.addNote));

/**
 * @swagger
 * /orders/{orderId}/notes/{noteId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Delete an order note
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 */
orderRouter.delete("/:orderId/notes/:noteId", verifyToken, validateRequest({ params: orderNoteParamsSchema }), asyncHandler(orderController.deleteNote));

/**
 * @swagger
 * /orders/{orderId}/notes/{noteId}/upload:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     summary: Upload files for an order note
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               descriptions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 */
orderRouter.post("/:orderId/notes/:noteId/upload", validateRequest({ params: orderNoteParamsSchema }), fileUploadMiddleware("note"), asyncHandler(orderController.uploadFiles));
