"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const fileUploadMiddleware = require("../../../config/fileUploadMiddleware");
const FactoryController = require("./factory.controller");
const FactoryRouter = express_1.default.Router();
FactoryRouter.get("/", FactoryController.getAll);
FactoryRouter.get("/:id", FactoryController.getOne);
FactoryRouter.post("/", FactoryController.create);
FactoryRouter.put("/:id", FactoryController.update);
FactoryRouter.delete("/:id", FactoryController.delete);
FactoryRouter.post("/:id/upload", fileUploadMiddleware("factory"), FactoryController.uploadFiles);
FactoryRouter.delete("/:factoryId/attachments/:attachmentId", FactoryController.deleteAttachment);
module.exports = FactoryRouter;
//# sourceMappingURL=factory.routes.js.map