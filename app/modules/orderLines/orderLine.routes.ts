import express from "express";

const verifyToken = require("../../middlewares/protectApi") as typeof import("../../middlewares/protectApi");
const OrderLineController = require("./orderLine.controller") as typeof import("./orderLine.controller");
const IsNotLogistic = require("../../middlewares/isNotLogistic") as typeof import("../../middlewares/isNotLogistic");
const isAdmin = require("../../middlewares/isAdmin") as typeof import("../../middlewares/isAdmin");

const OrderLineRouter = express.Router();

/**
 * @swagger
 * /orderLines/{orderLineId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Order Lines
 *     summary: Update order line
 *     parameters:
 *       - in: path
 *         name: orderLineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order line updated successfully
 */
OrderLineRouter.put("/:orderLineId", verifyToken, IsNotLogistic, OrderLineController.updateOrderLine);
/**
 * @swagger
 * /orderLines/{orderLineId}/notes/{noteId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Order Lines
 *     summary: Update order line note
 *     responses:
 *       200:
 *         description: Note updated successfully
 */
OrderLineRouter.put("/:orderLineId/notes/:noteId", verifyToken, isAdmin, OrderLineController.updateNote);
/**
 * @swagger
 * /orderLines/{orderLineId}/notes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Order Lines
 *     summary: Add note to order line
 *     responses:
 *       200:
 *         description: Note added successfully
 */
OrderLineRouter.post("/:orderLineId/notes", verifyToken, IsNotLogistic, OrderLineController.addNote);
/**
 * @swagger
 * /orderLines/{orderLineId}/notes/{noteId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Order Lines
 *     summary: Delete order line note
 *     responses:
 *       200:
 *         description: Note deleted successfully
 */
OrderLineRouter.delete("/:orderLineId/notes/:noteId", verifyToken, isAdmin, OrderLineController.deleteNote);

export = OrderLineRouter;
