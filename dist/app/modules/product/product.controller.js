"use strict";
const { AppError } = require("../../middlewares/errors");
const productsService = require("./product.service");
const getId = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};
class ProductsController {
    static async importProducts(_req, res, next) {
        try {
            await productsService.importProducts({}, true);
            return res.status(200).json({
                message: "Products imported successfully",
                status: true,
                statusCode: 200,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to import products";
            return next(new AppError(message, 500));
        }
    }
    static async getProducts(req, res, next) {
        try {
            const { page, size, searchQuery } = req.query;
            const vendorFromToken = req.vendorId;
            const vendors = vendorFromToken
                ? [String(vendorFromToken)]
                : req.query.vendorsIds?.split(",") ?? [];
            const categories = req.query.categoriesIds?.split(",") ?? [];
            const types = req.query.typesIds?.split(",") ?? [];
            const result = await productsService.getProducts(page, size, searchQuery ?? "", vendors, categories, types);
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch products";
            return next(new AppError(message, 500));
        }
    }
    static async getProductsTypes(_req, res, next) {
        try {
            const result = await productsService.getProductsTypes();
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch product types";
            return next(new AppError(message, 500));
        }
    }
    static async getAllCategories(_req, res, next) {
        try {
            const result = await productsService.getAllCategories();
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch categories";
            return next(new AppError(message, 500));
        }
    }
    static async getProduct(req, res, next) {
        try {
            const result = await productsService.getOneProduct(getId(req));
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch product";
            return next(new AppError(message, 500));
        }
    }
    static async createProduct(req, res) {
        try {
            await productsService.saveImportedProducts([req.body]);
            return res.status(200).json({
                message: "Product created successfully",
                status: true,
                statusCode: 200,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create product";
            return res.status(200).json({
                message: `prod Webhook received With Error",${message}`,
                status: false,
            });
        }
    }
}
module.exports = ProductsController;
//# sourceMappingURL=product.controller.js.map