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
 *     responses:
 *       200:
 *         description: Order filter options
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
 *     responses:
 *       200:
 *         description: Order summary cards
 */
orderRouter.get(
  "/summary",
  verifyToken,
  validateRequest({ query: orderSummaryQuerySchema }),
  asyncHandler(orderController.getSummary),
);

orderRouter.post("/", validateRequest({ body: orderMutationSchema }), asyncHandler(orderController.createOrder));
orderRouter.get("/financialReport", verifyToken, asyncHandler(orderController.financialReport));
orderRouter.get("/export", verifyToken, asyncHandler(orderController.exportOrders));
orderRouter.get("/", verifyToken, validateRequest({ query: orderListQuerySchema }), asyncHandler(orderController.listOrders));
orderRouter.put("/bulk-update", verifyToken, validateRequest({ body: orderBulkUpdateSchema }), asyncHandler(orderController.bulkUpdate));
orderRouter.post("/import", verifyToken, asyncHandler(orderController.importOrders));
orderRouter.delete("/bulk-delete", verifyToken, isNotVendor, validateRequest({ body: orderBulkDeleteSchema }), asyncHandler(orderController.bulkDelete));
orderRouter.get("/:orderId", verifyToken, validateRequest({ params: orderIdParamsSchema }), asyncHandler(orderController.getOrderById));
orderRouter.put("/:orderId", verifyToken, validateRequest({ body: orderMutationSchema, params: orderIdParamsSchema }), asyncHandler(orderController.updateOrder));
orderRouter.delete("/:orderId", verifyToken, isNotVendor, validateRequest({ params: orderIdParamsSchema }), asyncHandler(orderController.deleteOrder));
orderRouter.put("/:orderId/notes/:noteId", verifyToken, validateRequest({ body: orderNoteSchema, params: orderNoteParamsSchema }), asyncHandler(orderController.updateNote));
orderRouter.post("/:orderId/notes", verifyToken, validateRequest({ body: orderNoteSchema, params: orderIdParamsSchema }), asyncHandler(orderController.addNote));
orderRouter.delete("/:orderId/notes/:noteId", verifyToken, validateRequest({ params: orderNoteParamsSchema }), asyncHandler(orderController.deleteNote));
orderRouter.post("/:orderId/notes/:noteId/upload", validateRequest({ params: orderNoteParamsSchema }), fileUploadMiddleware("note"), asyncHandler(orderController.uploadFiles));
