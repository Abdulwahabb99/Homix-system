"use strict";
const sequelize_1 = require("sequelize");
const env_1 = require("../../../src/config/env");
const { sequelize } = require("../../../src/infrastructure/database");
const VendorsService = require("../vendor/vendor.service");
const Product = require("./product.model");
const ShopifyHelper = require("../helpers/shopifyHelper");
const Vendor = require("../vendor/vendor.model");
const ProductCategory = require("../category/productCategory.model");
const Category = require("../category/category.model");
const ProductType = require("./productType.model");
const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 50;
const DEFAULT_PRODUCT_IMAGE = `${env_1.env.APP_URL}/uploads/default-product.png`;
const toNumberArray = (values) => {
    return values.map((value) => Number(value)).filter(Boolean);
};
class ProductsService {
    static async getExistingTypesMap(typesNames) {
        const typesMap = {};
        const existingTypes = (await ProductType.findAll({
            where: {
                name: {
                    [sequelize_1.Op.in]: typesNames,
                },
            },
        }));
        existingTypes.forEach((type) => {
            typesMap[type.name] = type.id;
        });
        const newTypes = [...new Set(typesNames.filter((type) => !typesMap[type]))];
        const createdTypes = (await ProductType.bulkCreate(newTypes.map((name) => ({ name }))));
        createdTypes.forEach((type) => {
            typesMap[type.name] = type.id;
        });
        return typesMap;
    }
    static async getProductsTypes() {
        const types = await ProductType.findAll({
            attributes: ["name", "id"],
        });
        return {
            data: types,
            status: true,
            statusCode: 200,
        };
    }
    static async getProducts(page = DEFAULT_PAGE, size = DEFAULT_SIZE, searchQuery = "", vendorsId = [], categories = [], typesIds = []) {
        const whereClause = {};
        if (categories.length) {
            const validCategories = toNumberArray(categories);
            const productIds = (await ProductCategory.findAll({
                attributes: ["productId"],
                group: ["productId"],
                where: {
                    categoryId: {
                        [sequelize_1.Op.in]: validCategories,
                    },
                },
            }));
            whereClause.id = {
                [sequelize_1.Op.in]: productIds.map((product) => product.productId),
            };
        }
        if (typesIds.length) {
            whereClause.typeId = {
                [sequelize_1.Op.in]: toNumberArray(typesIds),
            };
        }
        const products = await Product.findAndCountAll({
            distinct: true,
            include: [
                {
                    as: "vendor",
                    attributes: ["name"],
                    model: Vendor,
                    required: true,
                    where: vendorsId.length > 0
                        ? { id: { [sequelize_1.Op.in]: vendorsId.map((id) => Number(id)) } }
                        : {},
                },
                {
                    as: "categories",
                    attributes: ["categoryId"],
                    include: [
                        {
                            as: "category",
                            attributes: ["title"],
                            model: Category,
                        },
                    ],
                    model: ProductCategory,
                    required: false,
                },
                {
                    as: "type",
                    model: ProductType,
                    required: false,
                },
            ],
            limit: Number(size),
            offset: (Number(page) - 1) * Number(size),
            where: {
                ...whereClause,
                ...(searchQuery
                    ? {
                        [sequelize_1.Op.or]: [
                            sequelize.where(sequelize.fn("lower", sequelize.col("Product.title")), {
                                [sequelize_1.Op.like]: `%${searchQuery.toLowerCase()}%`,
                            }),
                            sequelize.where(sequelize.fn("lower", sequelize.col("vendor.name")), {
                                [sequelize_1.Op.like]: `%${searchQuery.toLowerCase()}%`,
                            }),
                        ],
                    }
                    : {}),
            },
        });
        return {
            data: {
                products: products.rows,
                totalPages: Math.ceil(products.count / Number(size)),
            },
            status: true,
            statusCode: 200,
        };
    }
    static async getOneProduct(id) {
        const product = await Product.findByPk(id, {
            include: [
                {
                    as: "vendor",
                    attributes: ["name"],
                    model: Vendor,
                },
                {
                    as: "categories",
                    include: [
                        {
                            as: "category",
                            attributes: ["title"],
                            model: Category,
                        },
                    ],
                    model: ProductCategory,
                },
            ],
        });
        return {
            data: product,
            status: true,
            statusCode: 200,
        };
    }
    static async getProductsMappedByShopifyIds(productsIds) {
        const allVendorsMap = {};
        const products = (await Product.findAll({
            attributes: ["shopifyId", "id", "variants", "vendorId"],
            include: [
                {
                    as: "vendor",
                    model: Vendor,
                },
            ],
            where: {
                shopifyId: [...productsIds, "custom"],
            },
        }));
        const productsMap = {};
        const existingShopifyIds = new Set();
        for (const product of products) {
            productsMap[product.shopifyId] = product;
            existingShopifyIds.add(String(product.shopifyId));
            allVendorsMap[String(product.vendorId)] = product.vendor;
        }
        const nonExistingProductsIds = productsIds.filter((id) => !existingShopifyIds.has(String(id)));
        if (nonExistingProductsIds.length > 0) {
            const result = (await ProductsService.importProducts({
                ids: nonExistingProductsIds.join(","),
            }));
            for (const product of result.data) {
                productsMap[product.shopifyId] = product;
            }
            for (const [vendorId, vendor] of Object.entries(result.vendorsMap)) {
                allVendorsMap[vendorId] = vendor;
            }
        }
        return {
            productsMap,
            vendorsMap: allVendorsMap,
        };
    }
    static async importProducts(parameters, fromImport = false) {
        const fields = ["id", "title", "vendor", "variants", "image", "collection_id", "product_type"];
        const args = ["products", fields, parameters];
        if (fromImport) {
            args.push(async (products) => {
                await ProductsService.saveImportedProducts(products);
            });
            await ShopifyHelper.importData(...args);
            return;
        }
        const products = (await ShopifyHelper.importData(...args));
        return ProductsService.saveImportedProducts(products);
    }
    static async getInventoryMap(itemsIds) {
        const inventoryMap = {};
        const itemsIdsChunks = ShopifyHelper.splitArrayToChunks(itemsIds, 250);
        for (const itemsIdsChunk of itemsIdsChunks) {
            const inventory = await ShopifyHelper.importData("inventory_items", ["id", "cost"], {
                ids: itemsIdsChunk.join(","),
            });
            for (const item of inventory) {
                inventoryMap[String(item.id)] = item.cost;
            }
        }
        return inventoryMap;
    }
    static async saveImportedProducts(products) {
        const vendorsNames = products.map((product) => product.vendor);
        const typesNames = products.map((product) => product.product_type).filter(Boolean);
        const vendorsMap = await VendorsService.getExistingVendorsMap(vendorsNames);
        const typesMap = await ProductsService.getExistingTypesMap(typesNames);
        const result = await ProductsService.saveProductToDB(products, vendorsMap, typesMap);
        return {
            data: result,
            message: "Products imported successfully",
            status: true,
            statusCode: 200,
            vendorsMap,
        };
    }
    static async createProduct(productData) {
        const vendor = await VendorsService.getVendorByNameAndSaveIfNotExist(productData.vendor);
        const result = await ProductsService.saveProductToDB([productData], { [productData.vendor]: vendor }, {});
        return {
            data: result[0],
            message: "Product created successfully",
            status: true,
            statusCode: 200,
        };
    }
    static async saveProductToDB(productsData, vendorsMap, typesMap) {
        const itemsIds = productsData
            .map((product) => product.variants
            .filter((variant) => variant.inventory_item_id)
            .map((variant) => variant.inventory_item_id))
            .flat();
        let inventoryMap = {};
        if (itemsIds.length > 0) {
            inventoryMap = await ProductsService.getInventoryMap(itemsIds);
        }
        const normalizedProducts = productsData.map((product) => ({
            image: product.image?.src ?? DEFAULT_PRODUCT_IMAGE,
            shopifyId: String(product.id),
            title: product.title,
            typeId: product.product_type ? typesMap[product.product_type] || null : null,
            variants: product.variants.map((variant) => ({
                color: variant.option1,
                cost: variant.inventory_item_id && inventoryMap[String(variant.inventory_item_id)]
                    ? Number(inventoryMap[String(variant.inventory_item_id)])
                    : 0,
                material: variant.option3,
                price: variant.price,
                shopifyId: String(variant.id),
                size: variant.option2,
                sku: variant.sku,
                title: variant.title,
            })),
            vendorId: vendorsMap[product.vendor]?.id ?? 0,
        }));
        const savedProducts = await Promise.all(normalizedProducts.map(async (product) => {
            try {
                const existingProduct = (await Product.findOne({
                    where: { shopifyId: product.shopifyId },
                }));
                if (existingProduct) {
                    await existingProduct.update({
                        image: product.image,
                        title: product.title,
                        typeId: product.typeId,
                        variants: product.variants,
                        vendorId: product.vendorId,
                    });
                    return existingProduct;
                }
                return Product.create({
                    image: product.image,
                    shopifyId: product.shopifyId,
                    title: product.title,
                    typeId: product.typeId,
                    variants: product.variants,
                    vendorId: product.vendorId,
                });
            }
            catch (_error) {
                return null;
            }
        }));
        return savedProducts.filter(Boolean);
    }
    static async getAllCategories() {
        const categories = await Category.findAll({
            attributes: ["title", "id"],
        });
        return {
            data: categories,
            status: true,
            statusCode: 200,
        };
    }
}
module.exports = ProductsService;
//# sourceMappingURL=product.service.js.map