import { env } from "../../../src/config/env";

const ShopifyHelper = require("../helpers/shopifyHelper") as typeof import("../helpers/shopifyHelper");
const Category = require("./category.model") as typeof import("./category.model");
const ProductCategory = require("./productCategory.model") as typeof import("./productCategory.model");
const shopifyClient = require("../../../config/shopify");

type ShopifyCategoryImage = {
  src?: string;
};

type ShopifyCategory = {
  id: number | string;
  image?: ShopifyCategoryImage | null;
  title: string;
};

type PersistedCategory = {
  id: number;
  shopifyId: string;
};

type ProductMapEntry = {
  id: number;
};

type ProductsMap = Record<string, ProductMapEntry>;

const DEFAULT_CATEGORY_IMAGE = `${env.APP_URL}/uploads/default-category.png`;

class CategoryService {
  public static async importCategories(ids: Array<number | string>) {
    const categories: ShopifyCategory[] = [];

    for (const id of ids) {
      const categoryResponse = await shopifyClient.get({
        path: `collections/${id}`,
      });
      categories.push(categoryResponse.body.collection);
    }

    return CategoryService.saveImportedCategories(categories);
  }

  public static async saveImportedCategories(categories: ShopifyCategory[]) {
    const result = await CategoryService.saveCategoriesToDB(categories);
    return {
      data: result,
      message: "Categories imported successfully",
      status: true,
      statusCode: 200,
    };
  }

  public static async saveCategoriesToDB(categoriesData: ShopifyCategory[]) {
    const normalizedCategories = categoriesData.map((category) => ({
      image: category.image?.src ?? DEFAULT_CATEGORY_IMAGE,
      shopifyId: String(category.id),
      title: category.title,
    }));

    const uniqueCategories = normalizedCategories.filter(
      (category, index, self) =>
        index === self.findIndex((item) => item.shopifyId === category.shopifyId),
    );

    return Category.bulkCreate(uniqueCategories, {
      updateOnDuplicate: ["shopifyId", "title", "image"],
    });
  }

  public static async saveProductsCategories(productsMap: ProductsMap) {
    const productIds = Object.keys(productsMap);
    const categoryIds: string[] = [];
    const productCategoriesSet = new Set<string>();

    for (const productId of productIds) {
      await CategoryService.getCollects(productId, categoryIds, productCategoriesSet);
    }

    const categories = (await Category.findAll({
      attributes: ["shopifyId", "id"],
      where: {
        shopifyId: [...categoryIds, "custom"],
      },
    })) as PersistedCategory[];

    const categoryMap: Record<string, PersistedCategory> = {};
    const existingShopifyIds = new Set<string>();

    for (const category of categories) {
      categoryMap[category.shopifyId] = category;
      existingShopifyIds.add(String(category.shopifyId));
    }

    const nonExistingCategoryIds = categoryIds.filter(
      (id) => !existingShopifyIds.has(String(id)),
    );

    if (nonExistingCategoryIds.length > 0) {
      const idChunks = ShopifyHelper.splitArrayToChunks(nonExistingCategoryIds, 250);
      for (const idChunk of idChunks) {
        const importedCategories = await CategoryService.importCategories(idChunk);
        for (const category of importedCategories.data as PersistedCategory[]) {
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
      .filter((item): item is {
        categoryId: number;
        categoryShopifyId: string;
        productId: number;
        productShopifyId: string;
        shopifyId: string;
      } => item !== null);

    await ProductCategory.bulkCreate(productCategories, {
      updateOnDuplicate: ["productId", "categoryId"],
    });

    return categoryMap;
  }

  public static async getCollects(
    productId: string,
    categoryIds: string[],
    productCategoriesSet: Set<string>,
  ): Promise<void> {
    const collects = (await ShopifyHelper.importData(
      "collects",
      ["collection_id", "product_id", "id"],
      { product_id: productId },
    )) as Array<{ collection_id: number | string; id: number | string; product_id: number | string }>;

    collects.forEach((collect) => {
      categoryIds.push(String(collect.collection_id));
      productCategoriesSet.add(
        `${String(collect.id)}-${String(collect.product_id)}-${String(collect.collection_id)}`,
      );
    });
  }
}

export = CategoryService;
