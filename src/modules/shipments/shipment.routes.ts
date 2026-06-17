import express from "express";

import { asyncHandler, validateRequest } from "../../shared/http";
import { ShipmentController } from "./shipment.controller";
import { ShipmentRepository } from "./shipment.repo";
import {
  shipmentCreateSchema,
  shipmentDeliveryAccountsQuerySchema,
  shipmentExpenseMutationSchema,
  shipmentExpenseParamsSchema,
  shipmentExpenseAccountsQuerySchema,
  shipmentIdParamsSchema,
  shipmentInventoryItemParamsSchema,
  shipmentInventoryMutationSchema,
  shipmentInventoryQuerySchema,
  shipmentListQuerySchema,
  shipmentMutationSchema,
  shipmentNoteParamsSchema,
  shipmentNoteSchema,
  shipmentPerformanceQuerySchema,
  shipmentReturnMutationSchema,
  shipmentReturnParamsSchema,
  shipmentReturnsQuerySchema,
  shipmentSummaryQuerySchema,
} from "./shipment.schemas";
import { ShipmentService } from "./shipment.service";

const verifyToken = require("../../../app/middlewares/protectApi");
const isNotVendor = require("../../../app/middlewares/isNotVendor");

const shipmentRepository = new ShipmentRepository();
const shipmentService = new ShipmentService(shipmentRepository);
const shipmentController = new ShipmentController(shipmentService);

export const shipmentRouter = express.Router();

shipmentRouter.use(verifyToken, isNotVendor);

/**
 * @swagger
 * /shipments/meta:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Get shipments page metadata
 *     description: Returns the tabs and filter options for the new shipping and delivery workspace.
 *     responses:
 *       200:
 *         description: Shipments metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentMetaResponse'
 */
shipmentRouter.get("/meta", asyncHandler(shipmentController.getMeta));

/**
 * @swagger
 * /shipments/summary:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Get shipments summary cards
 *     parameters:
 *       - in: query
 *         name: operationCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerName
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerPhone
 *         schema:
 *           type: string
 *       - in: query
 *         name: vendorName
 *         schema:
 *           type: string
 *       - in: query
 *         name: shipmentStatus
 *         description: CSV of numeric shipment statuses.
 *         schema:
 *           type: string
 *           example: 2,3,4
 *       - in: query
 *         name: paymentStatus
 *         description: CSV of numeric payment statuses.
 *         schema:
 *           type: string
 *           example: 1,2
 *       - in: query
 *         name: shipmentType
 *         schema:
 *           type: string
 *       - in: query
 *         name: deliveryBy
 *         description: CSV of delivery provider ids or a shipping company text match.
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: deliveryDateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: deliveryDateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Shipment summary cards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentSummaryResponse'
 */
shipmentRouter.get(
  "/summary",
  validateRequest({ query: shipmentSummaryQuerySchema }),
  asyncHandler(shipmentController.getSummary),
);

/**
 * @swagger
 * /shipments:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Create a shipment through the current shipment creation bridge
 *     description: Accepts the legacy shipment payload and runs it through the new TypeScript service boundary.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer, line_items]
 *             properties:
 *               customer:
 *                 type: object
 *                 description: Legacy customer payload used by the order importer.
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
 *             example:
 *               customer:
 *                 first_name: عبير
 *                 last_name: ابوالمجيد
 *                 phone: "01155559646"
 *               line_items:
 *                 - title: كنبة شيب
 *                   price: 16999
 *                   quantity: 1
 *                   variant_id: 445566
 *     responses:
 *       200:
 *         description: Shipment imported through the legacy bridge
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentMessageResponse'
 */
shipmentRouter.post("/", validateRequest({ body: shipmentCreateSchema }), asyncHandler(shipmentController.createShipment));

/**
 * @swagger
 * /shipments/export:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Export shipments
 *     description: Uses the legacy export flow and returns a file stream rather than a JSON body.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: shipmentNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export stream
 */
shipmentRouter.get("/export", asyncHandler(shipmentController.exportShipments));

/**
 * @swagger
 * /shipments/returns/vendor:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List vendor returns
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: operationCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: sellerName
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vendor returns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnListResponse'
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Create a vendor return workflow record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, reason]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 9802
 *               reason:
 *                 type: string
 *                 example: منتج تالف
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-18T00:00:00.000Z
 *               status:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Vendor return created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnItemResponse'
 */
shipmentRouter.get(
  "/returns/vendor",
  validateRequest({ query: shipmentReturnsQuerySchema }),
  asyncHandler(shipmentController.listVendorReturns),
);

shipmentRouter.post(
  "/returns/vendor",
  validateRequest({ body: shipmentReturnMutationSchema }),
  asyncHandler(shipmentController.createVendorReturn),
);

shipmentRouter.put(
  "/returns/vendor/:returnId",
  validateRequest({ body: shipmentReturnMutationSchema.partial(), params: shipmentReturnParamsSchema }),
  asyncHandler(shipmentController.updateVendorReturn),
);

/**
 * @swagger
 * /shipments/returns/vendor/{returnId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Update a vendor return workflow record
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentReturnMutationRequest'
 *     responses:
 *       200:
 *         description: Vendor return updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnItemResponse'
 */

/**
 * @swagger
 * /shipments/returns/customer:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List customer returns
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: operationCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: sellerName
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer returns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnListResponse'
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Create a customer withdrawal workflow record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, reason]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 9802
 *               reason:
 *                 type: string
 *                 example: العميل رفض الاستلام
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-18T00:00:00.000Z
 *               status:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Customer withdrawal created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnItemResponse'
 */
shipmentRouter.get(
  "/returns/customer",
  validateRequest({ query: shipmentReturnsQuerySchema }),
  asyncHandler(shipmentController.listCustomerReturns),
);

shipmentRouter.post(
  "/returns/customer",
  validateRequest({ body: shipmentReturnMutationSchema }),
  asyncHandler(shipmentController.createCustomerReturn),
);

shipmentRouter.put(
  "/returns/customer/:returnId",
  validateRequest({ body: shipmentReturnMutationSchema.partial(), params: shipmentReturnParamsSchema }),
  asyncHandler(shipmentController.updateCustomerReturn),
);

/**
 * @swagger
 * /shipments/returns/customer/{returnId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Update a customer withdrawal workflow record
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentReturnMutationRequest'
 *     responses:
 *       200:
 *         description: Customer withdrawal updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnItemResponse'
 */

/**
 * @swagger
 * /shipments/inventory:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List shipping inventory items
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: productCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: vendorName
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentInventoryListResponse'
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Create a manual inventory row linked to an existing product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, productCode, quantity, costPrice]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 321
 *               productCode:
 *                 type: string
 *                 example: DRS-102
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               costPrice:
 *                 type: number
 *                 example: 2800
 *               size:
 *                 type: string
 *                 example: 50x120
 *               color:
 *                 type: string
 *                 example: أبيض
 *               status:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Inventory row created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentInventoryItemResponse'
 */
shipmentRouter.get(
  "/inventory",
  validateRequest({ query: shipmentInventoryQuerySchema }),
  asyncHandler(shipmentController.listInventory),
);

shipmentRouter.post(
  "/inventory",
  validateRequest({ body: shipmentInventoryMutationSchema }),
  asyncHandler(shipmentController.createInventoryItem),
);

/**
 * @swagger
 * /shipments/inventory/{inventoryItemId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Update a manual inventory row
 *     parameters:
 *       - in: path
 *         name: inventoryItemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentInventoryMutationRequest'
 *     responses:
 *       200:
 *         description: Inventory row updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentInventoryItemResponse'
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Delete a manual inventory row
 *     parameters:
 *       - in: path
 *         name: inventoryItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory row deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentMessageResponse'
 */
shipmentRouter.put(
  "/inventory/:inventoryItemId",
  validateRequest({ body: shipmentInventoryMutationSchema.partial(), params: shipmentInventoryItemParamsSchema }),
  asyncHandler(shipmentController.updateInventoryItem),
);

shipmentRouter.delete(
  "/inventory/:inventoryItemId",
  validateRequest({ params: shipmentInventoryItemParamsSchema }),
  asyncHandler(shipmentController.deleteInventoryItem),
);

/**
 * @swagger
 * /shipments/accounts/deliveries:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List shipment delivery accounting rows
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: accountingStatus
 *         schema:
 *           type: integer
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *       - in: query
 *         name: settledDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Delivery accounting rows
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentDeliveryAccountsListResponse'
 */
shipmentRouter.get(
  "/accounts/deliveries",
  validateRequest({ query: shipmentDeliveryAccountsQuerySchema }),
  asyncHandler(shipmentController.listDeliveryAccounts),
);

/**
 * @swagger
 * /shipments/accounts/expenses:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List shipment expenses rows
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: accountingStatus
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         description: Numeric expense type id.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expenses accounting rows
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentExpenseAccountsListResponse'
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Create a shipment expense row
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentExpenseMutationRequest'
 *     responses:
 *       201:
 *         description: Expense row created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentExpenseAccountItemResponse'
 */
shipmentRouter.get(
  "/accounts/expenses",
  validateRequest({ query: shipmentExpenseAccountsQuerySchema }),
  asyncHandler(shipmentController.listExpenseAccounts),
);

shipmentRouter.post(
  "/accounts/expenses",
  validateRequest({ body: shipmentExpenseMutationSchema }),
  asyncHandler(shipmentController.createExpenseAccount),
);

shipmentRouter.put(
  "/accounts/expenses/:expenseId",
  validateRequest({ body: shipmentExpenseMutationSchema.partial(), params: shipmentExpenseParamsSchema }),
  asyncHandler(shipmentController.updateExpenseAccount),
);

/**
 * @swagger
 * /shipments/accounts/expenses/{expenseId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Update a shipment expense row
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentExpenseMutationRequest'
 *     responses:
 *       200:
 *         description: Expense row updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentExpenseAccountItemResponse'
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Delete a shipment expense row
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expense row deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentMessageResponse'
 */

shipmentRouter.delete(
  "/accounts/expenses/:expenseId",
  validateRequest({ params: shipmentExpenseParamsSchema }),
  asyncHandler(shipmentController.deleteExpenseAccount),
);

/**
 * @swagger
 * /shipments/performance:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Get shipment performance report
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *           default: daily
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Shipment performance report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentPerformanceResponse'
 */
shipmentRouter.get(
  "/performance",
  validateRequest({ query: shipmentPerformanceQuerySchema }),
  asyncHandler(shipmentController.getPerformance),
);

/**
 * @swagger
 * /shipments:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List shipments
 *     responses:
 *       200:
 *         description: Shipment list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentListResponse'
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: operationCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerName
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerPhone
 *         schema:
 *           type: string
 *       - in: query
 *         name: shipmentStatus
 *         description: CSV of numeric shipment statuses
 *         schema:
 *           type: string
 *           example: 2,3,4
 *       - in: query
 *         name: paymentStatus
 *         description: CSV of numeric payment statuses
 *         schema:
 *           type: string
 *           example: 1,2
 *       - in: query
 *         name: shipmentType
 *         schema:
 *           type: string
 *       - in: query
 *         name: deliveryBy
 *         description: CSV of delivery provider ids or a shipping company text match
 *         schema:
 *           type: string
 *       - in: query
 *         name: vendorName
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: deliveryDateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: deliveryDateTo
 *         schema:
 *           type: string
 *           format: date
 */
shipmentRouter.get(
  "/",
  validateRequest({ query: shipmentListQuerySchema }),
  asyncHandler(shipmentController.listShipments),
);

/**
 * @swagger
 * /shipments/{shipmentId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Get shipment details
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shipment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentDetailsResponse'
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Update a shipment
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Shipment updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                 status:
 *                   type: boolean
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Delete a shipment
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shipment deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentMessageResponse'
 */
shipmentRouter.get(
  "/:shipmentId",
  validateRequest({ params: shipmentIdParamsSchema }),
  asyncHandler(shipmentController.getShipmentById),
);

shipmentRouter.put(
  "/:shipmentId",
  validateRequest({ body: shipmentMutationSchema, params: shipmentIdParamsSchema }),
  asyncHandler(shipmentController.updateShipment),
);

shipmentRouter.delete(
  "/:shipmentId",
  validateRequest({ params: shipmentIdParamsSchema }),
  asyncHandler(shipmentController.deleteShipment),
);

shipmentRouter.post(
  "/:shipmentId/notes",
  validateRequest({ body: shipmentNoteSchema, params: shipmentIdParamsSchema }),
  asyncHandler(shipmentController.addNote),
);

/**
 * @swagger
 * /shipments/{shipmentId}/notes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Add a shipment note
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentNoteRequest'
 *     responses:
 *       200:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentNoteResponse'
 */

shipmentRouter.put(
  "/:shipmentId/notes/:noteId",
  validateRequest({ body: shipmentNoteSchema, params: shipmentNoteParamsSchema }),
  asyncHandler(shipmentController.updateNote),
);

/**
 * @swagger
 * /shipments/{shipmentId}/notes/{noteId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Update a shipment note
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShipmentNoteRequest'
 *     responses:
 *       200:
 *         description: Note updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentNoteResponse'
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Delete a shipment note
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentMessageResponse'
 */

shipmentRouter.delete(
  "/:shipmentId/notes/:noteId",
  validateRequest({ params: shipmentNoteParamsSchema }),
  asyncHandler(shipmentController.deleteNote),
);
