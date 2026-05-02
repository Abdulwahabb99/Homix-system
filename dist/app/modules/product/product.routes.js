"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const productsController = require("./product.controller");
const verifyToken = require("../../middlewares/protectApi");
const ProductsRouter = express_1.default.Router();
/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     responses:
 *       200:
 *         description: Product created successfully
 */
ProductsRouter.post("/", productsController.createProduct);
/**
 * @swagger
 * /products/types:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Get all product types
 *     responses:
 *       200:
 *         description: Product types list
 */
ProductsRouter.get("/types", verifyToken, productsController.getProductsTypes);
/**
 * @swagger
 * /products:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products
 */
ProductsRouter.get("/", verifyToken, productsController.getProducts);
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     responses:
 *       200:
 *         description: Product details
 */
ProductsRouter.get("/:id", verifyToken, productsController.getProduct);
/**
 * @swagger
 * /products/import:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     summary: Import products from Shopify
 *     responses:
 *       200:
 *         description: Products imported successfully
 */
ProductsRouter.post("/import", verifyToken, productsController.importProducts);
module.exports = ProductsRouter;
//# sourceMappingURL=product.routes.js.map