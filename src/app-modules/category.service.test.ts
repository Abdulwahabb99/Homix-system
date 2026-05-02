import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const CATEGORY_SERVICE_PATH = path.join(ROOT, "app/modules/category/categoty.service.ts");

describe("CategoryService", () => {
  it("deduplicates categories by shopifyId before bulkCreate", async () => {
    const bulkCreate = jest.fn().mockResolvedValue([{ id: 1 }]);
    const service = loadModuleWithMocks<typeof import("../../app/modules/category/categoty.service")>(
      CATEGORY_SERVICE_PATH,
      {
        "../helpers/shopifyHelper": {},
        "./category.model": { bulkCreate },
        "./productCategory.model": {},
      },
    );

    await service.saveCategoriesToDB([
      { id: 11, title: "A" },
      { id: 11, title: "A duplicate" },
    ]);

    expect(bulkCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          shopifyId: "11",
        }),
      ],
      expect.any(Object),
    );
  });
});
