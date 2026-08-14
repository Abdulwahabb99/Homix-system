import { Op } from "sequelize";

import { env } from "../../../src/config/env";

const { sequelize } = require("../../../src/infrastructure/database") as typeof import("../../../src/infrastructure/database");
const VendorsService = require("../vendor/vendor.service") as typeof import("../vendor/vendor.service");
const Product = require("./product.model") as typeof import("./product.model");
const ShopifyHelper = require("../helpers/shopifyHelper");
const Vendor = require("../vendor/vendor.model") as typeof import("../vendor/vendor.model");
const ProductCategory = require("../category/productCategory.model") as typeof import("../category/productCategory.model");
const Category = require("../category/category.model") as typeof import("../category/category.model");
const ProductType = require("./productType.model") as typeof import("./productType.model");

type ProductTypeRecord = {
  id: number;
  name: string;
};

type VendorRecord = {
  id: number;
  name?: string;
};

type CategoryRecord = {
  id: number;
  title: string;
};

type ProductRecord = {
  id: number;
  productId?: number;
  shopifyId: string;
  toJSON?: () => ProductRecord;
  update: (payload: Record<string, unknown>) => Promise<ProductRecord>;
  vendor?: VendorRecord;
  vendorId: number;
  variants: unknown[];
};

type ProductVariantInput = {
  id: number | string;
  inventory_item_id?: number | string;
  option1?: string;
  option2?: string;
  option3?: string;
  price?: string | number;
  sku?: string;
  title?: string;
};

type ShopifyProductInput = {
  id: number | string;
  image?: { src?: string } | null;
  product_type?: string;
  title: string;
  variants: ProductVariantInput[];
  vendor: string;
};

type ProductsResponse = {
  data: unknown;
  message?: string;
  status: boolean;
  statusCode: number;
  vendorsMap?: Record<string, VendorRecord>;
};

type ImportProductsResponse = ProductsResponse & {
  data: ProductRecord[];
  vendorsMap: Record<string, VendorRecord>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 50;
const DEFAULT_PRODUCT_IMAGE = `${env.APP_URL}/uploads/default-product.png`;

const toNumberArray = (values: string[]): number[] => {
  return values.map((value) => Number(value)).filter(Boolean);
};

class ProductsService {
  public static async getExistingTypesMap(typesNames: string[]): Promise<Record<string, number>> {
    const typesMap: Record<string, number> = {};
    const existingTypes = (await ProductType.findAll({
      where: {
        name: {
          [Op.in]: typesNames,
        },
      },
    })) as ProductTypeRecord[];

    existingTypes.forEach((type) => {
      typesMap[type.name] = type.id;
    });

    const newTypes = [...new Set(typesNames.filter((type) => !typesMap[type]))];
    const createdTypes = (await ProductType.bulkCreate(newTypes.map((name) => ({ name })))) as ProductTypeRecord[];
    createdTypes.forEach((type) => {
      typesMap[type.name] = type.id;
    });

    return typesMap;
  }

  public static async getProductsTypes(): Promise<ProductsResponse> {
    const types = await ProductType.findAll({
      attributes: ["name", "id"],
    });

    return {
      data: types,
      status: true,
      statusCode: 200,
    };
  }

  public static async getProducts(
    page: string | number = DEFAULT_PAGE,
    size: string | number = DEFAULT_SIZE,
    searchQuery = "",
    vendorsId: string[] = [],
    categories: string[] = [],
    typesIds: string[] = [],
  ): Promise<ProductsResponse> {
    const whereClause: Record<string, unknown> = {};

    // Products copied internally while assigning an order to another vendor
    // deliberately have no Shopify id. They belong to that order relationship,
    // not to the product catalogue, and must not appear as duplicate products
    // (most visibly as many "Custom Product" cards).
    whereClause.shopifyId = { [Op.not]: null };

    if (categories.length) {
      const validCategories = toNumberArray(categories);
      const productIds = (await ProductCategory.findAll({
        attributes: ["productId"],
        group: ["productId"],
        where: {
          categoryId: {
            [Op.in]: validCategories,
          },
        },
      })) as Array<{ productId: number }>;

      whereClause.id = {
        [Op.in]: productIds.map((product) => product.productId),
      };
    }

    if (typesIds.length) {
      whereClause.typeId = {
        [Op.in]: toNumberArray(typesIds),
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
          where:
            vendorsId.length > 0
              ? { id: { [Op.in]: vendorsId.map((id) => Number(id)) } }
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
              [Op.or]: [
                sequelize.where(sequelize.fn("lower", sequelize.col("Product.title")), {
                  [Op.like]: `%${searchQuery.toLowerCase()}%`,
                }),
                sequelize.where(sequelize.fn("lower", sequelize.col("vendor.name")), {
                  [Op.like]: `%${searchQuery.toLowerCase()}%`,
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

  public static async getOneProduct(id: string): Promise<ProductsResponse> {
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

  public static async getProductsMappedByShopifyIds(productsIds: string[]) {
    const allVendorsMap: Record<string, VendorRecord> = {};
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
    })) as ProductRecord[];

    const productsMap: Record<string, ProductRecord> = {};
    const existingShopifyIds = new Set<string>();

    for (const product of products) {
      productsMap[product.shopifyId] = product;
      existingShopifyIds.add(String(product.shopifyId));
      allVendorsMap[String(product.vendorId)] = product.vendor as VendorRecord;
    }

    const nonExistingProductsIds = productsIds.filter(
      (id) => !existingShopifyIds.has(String(id)),
    );

    if (nonExistingProductsIds.length > 0) {
      const result = (await ProductsService.importProducts({
        ids: nonExistingProductsIds.join(","),
      })) as ImportProductsResponse;
      for (const product of result.data as ProductRecord[]) {
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

  public static async importProducts(
    parameters: Record<string, unknown>,
    fromImport = false,
  ): Promise<ProductsResponse | void> {
    const fields = ["id", "title", "vendor", "variants", "image", "collection_id", "product_type"];
    const args: unknown[] = ["products", fields, parameters];

    if (fromImport) {
      args.push(async (products: ShopifyProductInput[]) => {
        await ProductsService.saveImportedProducts(products);
      });
      await ShopifyHelper.importData(...args);
      return;
    }

    const products = (await ShopifyHelper.importData(...args)) as ShopifyProductInput[];
    return ProductsService.saveImportedProducts(products);
  }

  public static async getInventoryMap(itemsIds: Array<number | string>): Promise<Record<string, unknown>> {
    const inventoryMap: Record<string, unknown> = {};
    const itemsIdsChunks = ShopifyHelper.splitArrayToChunks(itemsIds, 250);

    for (const itemsIdsChunk of itemsIdsChunks) {
      const inventory = await ShopifyHelper.importData("inventory_items", ["id", "cost"], {
        ids: itemsIdsChunk.join(","),
      });
      for (const item of inventory as Array<{ id: number | string; cost: unknown }>) {
        inventoryMap[String(item.id)] = item.cost;
      }
    }

    return inventoryMap;
  }

  public static async saveImportedProducts(products: ShopifyProductInput[]): Promise<ProductsResponse> {
    const vendorsNames = products.map((product) => product.vendor);
    const typesNames = products.map((product) => product.product_type).filter(Boolean) as string[];
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

  public static async createProduct(productData: ShopifyProductInput): Promise<ProductsResponse> {
    const vendor = await VendorsService.getVendorByNameAndSaveIfNotExist(productData.vendor);
    const result = await ProductsService.saveProductToDB(
      [productData],
      { [productData.vendor]: vendor },
      {},
    );

    return {
      data: result[0],
      message: "Product created successfully",
      status: true,
      statusCode: 200,
    };
  }

  public static async saveProductToDB(
    productsData: ShopifyProductInput[],
    vendorsMap: Record<string, VendorRecord>,
    typesMap: Record<string, number>,
  ) {
    const itemsIds = productsData
      .map((product) =>
        product.variants
          .filter((variant) => variant.inventory_item_id)
          .map((variant) => variant.inventory_item_id as number | string),
      )
      .flat();

    let inventoryMap: Record<string, unknown> = {};
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
        cost:
          variant.inventory_item_id && inventoryMap[String(variant.inventory_item_id)]
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

    const savedProducts = await Promise.all(
      normalizedProducts.map(async (product) => {
        try {
          const existingProduct = (await Product.findOne({
            where: { shopifyId: product.shopifyId },
          })) as ProductRecord | null;

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
        } catch (_error) {
          return null;
        }
      }),
    );

    return savedProducts.filter(Boolean);
  }

  public static async getAllCategories(): Promise<ProductsResponse> {
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

export = ProductsService;
