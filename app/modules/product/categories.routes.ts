import express from "express";

const verifyToken = require("../../middlewares/protectApi") as typeof import("../../middlewares/protectApi");
const productsController = require("./product.controller") as typeof import("./product.controller");

const CategoriesRouter = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Returns the category names available for product filtering and import mapping.
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 *             examples:
 *               default:
 *                 value:
 *                   status: true
 *                   statusCode: 200
 *                   data:
 *                     - غرف نوم
 *                     - سفرة
 *       401:
 *         description: Missing or invalid bearer token
 */
CategoriesRouter.get("/", verifyToken, productsController.getAllCategories);

export = CategoriesRouter;
