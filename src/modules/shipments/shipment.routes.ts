import express from "express";

import { asyncHandler, validateRequest } from "../../shared/http";
import { ShipmentController } from "./shipment.controller";
import { ShipmentRepository } from "./shipment.repo";
import {
  shipmentDeliveryAccountsQuerySchema,
  shipmentExpenseAccountsQuerySchema,
  shipmentIdParamsSchema,
  shipmentInventoryQuerySchema,
  shipmentListQuerySchema,
  shipmentMutationSchema,
  shipmentNoteParamsSchema,
  shipmentNoteSchema,
  shipmentPerformanceQuerySchema,
  shipmentReturnsQuerySchema,
  shipmentSummaryQuerySchema,
} from "./shipment.schemas";
import { ShipmentService } from "./shipment.service";

const verifyToken = require("../../../app/middlewares/protectApi");
const isNotVendor = require("../../../app/middlewares/isNotVendor");
const legacyShipmentController = require("../../../app/modules/shipments/shipment.controller");

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

shipmentRouter.post("/", validateRequest({ body: shipmentMutationSchema }), legacyShipmentController.createShipment);

shipmentRouter.get("/export", legacyShipmentController.exportShipments);

/**
 * @swagger
 * /shipments/returns/vendor:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List vendor returns
 *     responses:
 *       200:
 *         description: Vendor returns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnListResponse'
 */
shipmentRouter.get(
  "/returns/vendor",
  validateRequest({ query: shipmentReturnsQuerySchema }),
  asyncHandler(shipmentController.listVendorReturns),
);

/**
 * @swagger
 * /shipments/returns/customer:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List customer returns
 *     responses:
 *       200:
 *         description: Customer returns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentReturnListResponse'
 */
shipmentRouter.get(
  "/returns/customer",
  validateRequest({ query: shipmentReturnsQuerySchema }),
  asyncHandler(shipmentController.listCustomerReturns),
);

/**
 * @swagger
 * /shipments/inventory:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List shipping inventory items
 *     responses:
 *       200:
 *         description: Inventory list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentInventoryListResponse'
 */
shipmentRouter.get(
  "/inventory",
  validateRequest({ query: shipmentInventoryQuerySchema }),
  asyncHandler(shipmentController.listInventory),
);

/**
 * @swagger
 * /shipments/accounts/deliveries:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: List shipment delivery accounting rows
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
 *     responses:
 *       200:
 *         description: Expenses accounting rows
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShipmentExpenseAccountsListResponse'
 */
shipmentRouter.get(
  "/accounts/expenses",
  validateRequest({ query: shipmentExpenseAccountsQuerySchema }),
  asyncHandler(shipmentController.listExpenseAccounts),
);

/**
 * @swagger
 * /shipments/performance:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Shipments]
 *     summary: Get shipment performance report
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

shipmentRouter.put(
  "/:shipmentId/notes/:noteId",
  validateRequest({ body: shipmentNoteSchema, params: shipmentNoteParamsSchema }),
  asyncHandler(shipmentController.updateNote),
);

shipmentRouter.delete(
  "/:shipmentId/notes/:noteId",
  validateRequest({ params: shipmentNoteParamsSchema }),
  asyncHandler(shipmentController.deleteNote),
);
