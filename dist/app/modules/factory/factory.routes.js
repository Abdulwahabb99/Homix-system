"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const fileUploadMiddleware = require("../../../config/fileUploadMiddleware");
const FactoryController = require("./factory.controller");
const FactoryRouter = express_1.default.Router();
/**
 * @swagger
 * /factories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Get all factories
 *     responses:
 *       200:
 *         description: List of factories
 */
FactoryRouter.get("/", FactoryController.getAll);
/**
 * @swagger
 * /factories/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Get factory by ID
 *     responses:
 *       200:
 *         description: Factory details
 */
FactoryRouter.get("/:id", FactoryController.getOne);
/**
 * @swagger
 * /factories:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Create factory
 *     responses:
 *       201:
 *         description: Factory created successfully
 */
FactoryRouter.post("/", FactoryController.create);
/**
 * @swagger
 * /factories/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Update factory
 *     responses:
 *       200:
 *         description: Factory updated successfully
 */
FactoryRouter.put("/:id", FactoryController.update);
/**
 * @swagger
 * /factories/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Delete factory
 *     responses:
 *       200:
 *         description: Factory deleted successfully
 */
FactoryRouter.delete("/:id", FactoryController.delete);
/**
 * @swagger
 * /factories/{id}/upload:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Upload factory attachments
 *     responses:
 *       200:
 *         description: Files uploaded
 */
FactoryRouter.post("/:id/upload", fileUploadMiddleware("factory"), FactoryController.uploadFiles);
/**
 * @swagger
 * /factories/{factoryId}/attachments/{attachmentId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Delete factory attachment
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 */
FactoryRouter.delete("/:factoryId/attachments/:attachmentId", FactoryController.deleteAttachment);
module.exports = FactoryRouter;
//# sourceMappingURL=factory.routes.js.map