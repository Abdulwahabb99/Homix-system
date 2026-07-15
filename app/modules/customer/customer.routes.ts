import express from "express";

import { asyncHandler, validateRequest } from "../../../src/shared/http";

import { customerIdParamsSchema, customerUpdateSchema } from "./customer.schemas";

const CustomerController = require("./customer.controller") as typeof import("./customer.controller");
const requirePermission = require("../../middlewares/requirePermission") as (permissionKey: string) => express.RequestHandler;

const CustomerRouter = express.Router();

/**
 * @swagger
 * /customers/{customerId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Customers]
 *     summary: Update customer details
 *     description: Updates a customer record used by orders and shipments screens.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerUpdateRequest'
 *           examples:
 *             updateCustomer:
 *               value:
 *                 firstName: عبير
 *                 lastName: ابوالمجيد
 *                 phoneNumber: "01155559646"
 *                 address: الهرم - الجيزة
 *                 email: abeer@example.com
 *     responses:
 *       200:
 *         description: Updated customer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 *       400:
 *         description: Invalid request body or path parameter
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Customer not found
 */
CustomerRouter.put(
  "/:customerId",
  requirePermission("customers_edit"),
  validateRequest({ body: customerUpdateSchema, params: customerIdParamsSchema }),
  asyncHandler(CustomerController.updateCustomer),
);

export = CustomerRouter;
