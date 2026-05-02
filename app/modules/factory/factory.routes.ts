import express from "express";

const fileUploadMiddleware = require("../../../config/fileUploadMiddleware") as typeof import("../../../config/fileUploadMiddleware");
const FactoryController = require("./factory.controller") as typeof import("./factory.controller");

const FactoryRouter = express.Router();

/**
 * @swagger
 * /factories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Factories
 *     summary: Get all factories
 *     description: Returns all factories, optionally filtered by query parameters such as status.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Optional factory status filter
 *     responses:
 *       200:
 *         description: List of factories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryListResponse'
 *       401:
 *         description: Missing or invalid bearer token
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Factory details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Factory not found
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FactoryPayload'
 *           examples:
 *             createFactory:
 *               value:
 *                 name: مصنع الموردن
 *                 phoneNumber: "+201000000000"
 *                 address: Nasr City, Cairo
 *                 status: active
 *     responses:
 *       201:
 *         description: Factory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryResponse'
 *       401:
 *         description: Missing or invalid bearer token
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FactoryPayload'
 *           examples:
 *             updateFactory:
 *               value:
 *                 name: مصنع الموردن
 *                 status: inactive
 *     responses:
 *       200:
 *         description: Factory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Factory not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Factory deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Factory not found
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               descriptions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Files uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Factory not found
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
 *     parameters:
 *       - in: path
 *         name: factoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: Factory or attachment not found
 */
FactoryRouter.delete("/:factoryId/attachments/:attachmentId", FactoryController.deleteAttachment);

export = FactoryRouter;
