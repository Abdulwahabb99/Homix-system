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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderLineUpdateRequest'
 *           examples:
 *             updateStatus:
 *               value:
 *                 status: 3
 *                 itemStatus: 2
 *                 cost: 1250
 *                 notes: Urgent finishing
 *     responses:
 *       200:
 *         description: Order line updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Order line not found
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
 *     parameters:
 *       - in: path
 *         name: orderLineId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotePayload'
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Order line or note not found
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
 *     parameters:
 *       - in: path
 *         name: orderLineId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotePayload'
 *     responses:
 *       200:
 *         description: Note added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Order line not found
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
 *     parameters:
 *       - in: path
 *         name: orderLineId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Order line or note not found
 */
OrderLineRouter.delete("/:orderLineId/notes/:noteId", verifyToken, isAdmin, OrderLineController.deleteNote);

export = OrderLineRouter;
