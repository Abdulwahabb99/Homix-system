import express from "express";

const productsController = require("./product.controller") as typeof import("./product.controller");
const verifyToken = require("../../middlewares/protectApi") as typeof import("../../middlewares/protectApi");

const ProductsRouter = express.Router();

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     description: Product webhook-style endpoint used to persist a single imported product payload.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductPayload'
 *           examples:
 *             createProduct:
 *               value:
 *                 name: دريسينج هاوس
 *                 vendor: ركنة للأثاث
 *                 category: غرف نوم
 *                 productType: دريسنج
 *                 price: "16999"
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
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
 *     description: Returns the available product type names used for filtering and product creation.
 *     responses:
 *       200:
 *         description: Product types list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductTypesResponse'
 *       401:
 *         description: Missing or invalid bearer token
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         example: "1"
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         example: "20"
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         example: دريسينج
 *       - in: query
 *         name: vendorsIds
 *         schema:
 *           type: string
 *         description: Comma-separated vendor IDs
 *         example: "4,6"
 *       - in: query
 *         name: categoriesIds
 *         schema:
 *           type: string
 *         description: Comma-separated category IDs
 *         example: "1,2"
 *       - in: query
 *         name: typesIds
 *         schema:
 *           type: string
 *         description: Comma-separated product type IDs
 *         example: "3,8"
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 *       401:
 *         description: Missing or invalid bearer token
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Product not found
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
 *     description: Imports products from the configured Shopify store into the local catalog.
 *     responses:
 *       200:
 *         description: Products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *             examples:
 *               imported:
 *                 value:
 *                   message: Products imported successfully
 *                   status: true
 *                   statusCode: 200
 *       401:
 *         description: Missing or invalid bearer token
 */
ProductsRouter.post("/import", verifyToken, productsController.importProducts);

export = ProductsRouter;
