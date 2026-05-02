"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const VendorsController = require("./vendor.controller");
const VendorRouter = express_1.default.Router();
VendorRouter.get("/", VendorsController.getVendors);
VendorRouter.get("/:id", VendorsController.getOneVendor);
VendorRouter.post("/", VendorsController.createVendor);
VendorRouter.put("/:id", VendorsController.updateVendor);
VendorRouter.delete("/:id", VendorsController.deleteVendor);
VendorRouter.put("/:id/activeStatus", VendorsController.changeActiveStatus);
module.exports = VendorRouter;
//# sourceMappingURL=vendor.routes.js.map