import express from "express";

const fileUploadMiddleware = require("../../../config/fileUploadMiddleware") as typeof import("../../../config/fileUploadMiddleware");
const FactoryController = require("./factory.controller") as typeof import("./factory.controller");

const FactoryRouter = express.Router();

FactoryRouter.get("/", FactoryController.getAll);
FactoryRouter.get("/:id", FactoryController.getOne);
FactoryRouter.post("/", FactoryController.create);
FactoryRouter.put("/:id", FactoryController.update);
FactoryRouter.delete("/:id", FactoryController.delete);
FactoryRouter.post("/:id/upload", fileUploadMiddleware("factory"), FactoryController.uploadFiles);
FactoryRouter.delete("/:factoryId/attachments/:attachmentId", FactoryController.deleteAttachment);

export = FactoryRouter;
