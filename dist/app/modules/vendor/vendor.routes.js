"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const VendorsController = require("./vendor.controller");
const VendorRouter = express_1.default.Router();
/**
 * @swagger
 * /vendors:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Get all vendors
 *     responses:
 *       200:
 *         description: Vendor list
 */
VendorRouter.get("/", VendorsController.getVendors);
/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Get vendor by ID
 *     responses:
 *       200:
 *         description: Vendor details
 */
VendorRouter.get("/:id", VendorsController.getOneVendor);
/**
 * @swagger
 * /vendors:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Create vendor
 *     responses:
 *       200:
 *         description: Vendor created successfully
 */
VendorRouter.post("/", VendorsController.createVendor);
/**
 * @swagger
 * /vendors/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Update vendor
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 */
VendorRouter.put("/:id", VendorsController.updateVendor);
/**
 * @swagger
 * /vendors/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Delete vendor
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 */
VendorRouter.delete("/:id", VendorsController.deleteVendor);
/**
 * @swagger
 * /vendors/{id}/activeStatus:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Vendors
 *     summary: Toggle vendor active status
 *     responses:
 *       200:
 *         description: Vendor status changed successfully
 */
VendorRouter.put("/:id/activeStatus", VendorsController.changeActiveStatus);
module.exports = VendorRouter;
//# sourceMappingURL=vendor.routes.js.map