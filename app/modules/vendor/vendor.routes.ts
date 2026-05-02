import express from "express";

const VendorsController = require("./vendor.controller") as typeof import("./vendor.controller");

const VendorRouter = express.Router();

VendorRouter.get("/", VendorsController.getVendors);
VendorRouter.get("/:id", VendorsController.getOneVendor);
VendorRouter.post("/", VendorsController.createVendor);
VendorRouter.put("/:id", VendorsController.updateVendor);
VendorRouter.delete("/:id", VendorsController.deleteVendor);
VendorRouter.put("/:id/activeStatus", VendorsController.changeActiveStatus);

export = VendorRouter;
