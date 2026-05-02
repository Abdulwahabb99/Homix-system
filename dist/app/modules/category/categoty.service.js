"use strict";
const env_1 = require("../../../src/config/env");
const ShopifyHelper = require("../helpers/shopifyHelper");
const Category = require("./category.model");
const ProductCategory = require("./productCategory.model");
const shopifyClient = require("../../../config/shopify");
const DEFAULT_CATEGORY_IMAGE = `${env_1.env.APP_URL}/uploads/default-category.png`;
class CategoryService {
    static async importCategories(ids) {
        const categories = [];
        for (const id of ids) {
            const categoryResponse = await shopifyClient.get({
                path: `collections/${id}`,
            });
            categories.push(categoryResponse.body.collection);
        }
        return CategoryService.saveImportedCategories(categories);
    }
    static async saveImportedCategories(categories) {
        const result = await CategoryService.saveCategoriesToDB(categories);
        return {
            data: result,
            message: "Categories imported successfully",
            status: true,
            statusCode: 200,
        };
    }
    static async saveCategoriesToDB(categoriesData) {
        const normalizedCategories = categoriesData.map((category) => ({
            image: category.image?.src ?? DEFAULT_CATEGORY_IMAGE,
            shopifyId: String(category.id),
            title: category.title,
        }));
        const uniqueCategories = normalizedCategories.filter((category, index, self) => index === self.findIndex((item) => item.shopifyId === category.shopifyId));
        return Category.bulkCreate(uniqueCategories, {
            updateOnDuplicate: ["shopifyId", "title", "image"],
        });
    }
    static async saveProductsCategories(productsMap) {
        const productIds = Object.keys(productsMap);
        const categoryIds = [];
        const productCategoriesSet = new Set();
        for (const productId of productIds) {
            await CategoryService.getCollects(productId, categoryIds, productCategoriesSet);
        }
        const categories = (await Category.findAll({
            attributes: ["shopifyId", "id"],
            where: {
                shopifyId: [...categoryIds, "custom"],
            },
        }));
        const categoryMap = {};
        const existingShopifyIds = new Set();
        for (const category of categories) {
            categoryMap[category.shopifyId] = category;
            existingShopifyIds.add(String(category.shopifyId));
        }
        const nonExistingCategoryIds = categoryIds.filter((id) => !existingShopifyIds.has(String(id)));
        if (nonExistingCategoryIds.length > 0) {
            const idChunks = ShopifyHelper.splitArrayToChunks(nonExistingCategoryIds, 250);
            for (const idChunk of idChunks) {
                const importedCategories = await CategoryService.importCategories(idChunk);
                for (const category of importedCategories.data) {
                    categoryMap[category.shopifyId] = category;
                }
            }
        }
        const productCategories = Array.from(productCategoriesSet)
            .map((key) => {
            const [id = "", productShopifyId = "", categoryShopifyId = ""] = key.split("-");
            const product = productsMap[productShopifyId];
            const category = categoryMap[categoryShopifyId];
            if (!product || !category) {
                return null;
            }
            return {
                categoryId: category.id,
                categoryShopifyId,
                productId: product.id,
                productShopifyId,
                shopifyId: id,
            };
        })
            .filter((item) => item !== null);
        await ProductCategory.bulkCreate(productCategories, {
            updateOnDuplicate: ["productId", "categoryId"],
        });
        return categoryMap;
    }
    static async getCollects(productId, categoryIds, productCategoriesSet) {
        const collects = (await ShopifyHelper.importData("collects", ["collection_id", "product_id", "id"], { product_id: productId }));
        collects.forEach((collect) => {
            categoryIds.push(String(collect.collection_id));
            productCategoriesSet.add(`${String(collect.id)}-${String(collect.product_id)}-${String(collect.collection_id)}`);
        });
    }
}
module.exports = CategoryService;
//# sourceMappingURL=categoty.service.js.map