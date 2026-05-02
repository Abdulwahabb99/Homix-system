"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const verifyToken = require("../../middlewares/protectApi");
const productsController = require("./product.controller");
const CategoriesRouter = express_1.default.Router();
/**
 * @swagger
 * /categories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories
 */
CategoriesRouter.get("/", verifyToken, productsController.getAllCategories);
module.exports = CategoriesRouter;
//# sourceMappingURL=categories.routes.js.map