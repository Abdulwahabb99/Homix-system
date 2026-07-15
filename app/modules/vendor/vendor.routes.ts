import express from "express";

const VendorsController = require("./vendor.controller") as typeof import("./vendor.controller");
const requirePermission = require("../../middlewares/requirePermission") as (permissionKey: string) => express.RequestHandler;

const VendorRouter = express.Router();

/**
 * @swagger
 * /vendors:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Get all vendors
 *     description: Returns all marketplace vendors with their activation status.
 *     responses:
 *       200:
 *         description: Vendor list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorListResponse'
 *       401:
 *         description: Missing or invalid bearer token
 */
VendorRouter.get("/", requirePermission("vendors_view"), VendorsController.getVendors);
/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Get vendor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Vendor not found
 */
VendorRouter.get("/:id", requirePermission("vendors_view"), VendorsController.getOneVendor);
/**
 * @swagger
 * /vendors:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Create vendor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorPayload'
 *           examples:
 *             createVendor:
 *               value:
 *                 name: ركنة للأثاث
 *                 email: vendor@homix.com
 *                 password: Secret123!
 *     responses:
 *       200:
 *         description: Vendor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       409:
 *         description: Vendor already exists
 */
VendorRouter.post("/", requirePermission("vendors_create"), VendorsController.createVendor);
/**
 * @swagger
 * /vendors/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Update vendor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorPayload'
 *           examples:
 *             renameVendor:
 *               value:
 *                 name: مصنع الموردن
 *                 email: supplier@homix.com
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Vendor not found
 */
VendorRouter.put("/:id", requirePermission("vendors_edit"), VendorsController.updateVendor);
/**
 * @swagger
 * /vendors/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Delete vendor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Vendor not found
 */
VendorRouter.delete("/:id", requirePermission("vendors_delete"), VendorsController.deleteVendor);
/**
 * @swagger
 * /vendors/{id}/activeStatus:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Toggle vendor active status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *             examples:
 *               activated:
 *                 value:
 *                   message: Vendor status changed successfully
 *                   status: true
 *                   statusCode: 200
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Vendor not found
 */
VendorRouter.put("/:id/activeStatus", requirePermission("vendors_edit"), VendorsController.changeActiveStatus);

export = VendorRouter;
