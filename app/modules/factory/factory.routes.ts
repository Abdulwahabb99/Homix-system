import express from "express";

import { validateRequest } from "../../../src/shared/http/validation";

const fileUploadMiddleware = require("../../../config/fileUploadMiddleware") as typeof import("../../../config/fileUploadMiddleware");
const FactoryController = require("./factory.controller") as typeof import("./factory.controller");
const {
  factoryAttachmentParamsSchema,
  factoryIdParamsSchema,
  factoryListQuerySchema,
  factoryMutationSchema,
  factoryUpdateSchema,
} = require("./factory.schemas") as typeof import("./factory.schemas");
const requirePermission = require("../../middlewares/requirePermission") as (permissionKey: string) => express.RequestHandler;

const FactoryRouter = express.Router();

/**
 * @swagger
 * /factories/meta:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Get factory meta options
 *     description: Returns factory dropdown options used by the new factories screens.
 *     responses:
 *       200:
 *         description: Factory meta options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryMetaResponse'
 */
FactoryRouter.get("/meta", requirePermission("factory_view"), FactoryController.getMeta);

/**
 * @swagger
 * /factories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: List factories
 *     description: Returns the new factories listing payload with pagination, filters, and summary cards. Sales and linked orders are intentionally excluded.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by factory name, address, responsible name, or responsible phone.
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *       - in: query
 *         name: factoryCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort[name]
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *       - in: query
 *         name: sort[createdAt]
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *       - in: query
 *         name: sort[joinDate]
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *       - in: query
 *         name: sort[status]
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *     responses:
 *       200:
 *         description: Factory list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryListResponse'
 */
FactoryRouter.get("/", requirePermission("factory_view"), validateRequest({ query: factoryListQuerySchema }), FactoryController.getAll);

/**
 * @swagger
 * /factories/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Get factory details
 *     description: Returns the factory detail payload used by the new factory detail screen. Linked orders and sales blocks are intentionally excluded.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factory details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryDetailsResponse'
 *       404:
 *         description: Factory not found
 */
FactoryRouter.get("/:id", requirePermission("factory_view"), validateRequest({ params: factoryIdParamsSchema }), FactoryController.getOne);

/**
 * @swagger
 * /factories:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Create factory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FactoryMutationPayload'
 *     responses:
 *       201:
 *         description: Factory created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryMutationResponse'
 */
FactoryRouter.post("/", requirePermission("factory_edit"), validateRequest({ body: factoryMutationSchema }), FactoryController.create);

/**
 * @swagger
 * /factories/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Update factory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FactoryMutationPayload'
 *     responses:
 *       200:
 *         description: Factory updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryMutationResponse'
 *       404:
 *         description: Factory not found
 */
FactoryRouter.put("/:id", requirePermission("factory_edit"), validateRequest({ body: factoryUpdateSchema, params: factoryIdParamsSchema }), FactoryController.update);

/**
 * @swagger
 * /factories/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Delete factory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factory deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       404:
 *         description: Factory not found
 */
FactoryRouter.delete("/:id", requirePermission("factory_delete"), validateRequest({ params: factoryIdParamsSchema }), FactoryController.delete);

/**
 * @swagger
 * /factories/{id}/upload:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Upload factory documents
 *     description: Uploads factory documents with optional metadata such as type, verification status, and issue or expiry dates.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               attachmentTypes:
 *                 type: array
 *                 items:
 *                   type: integer
 *               verificationStatuses:
 *                 type: array
 *                 items:
 *                   type: integer
 *               issuedAt:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *               expiresAt:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *     responses:
 *       200:
 *         description: Factory documents uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactoryMutationResponse'
 */
FactoryRouter.post(
  "/:id/upload",
  requirePermission("factory_edit"),
  validateRequest({ params: factoryIdParamsSchema }),
  fileUploadMiddleware("factory"),
  FactoryController.uploadFiles,
);

/**
 * @swagger
 * /factories/{factoryId}/attachments/{attachmentId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Factories]
 *     summary: Delete factory document
 *     parameters:
 *       - in: path
 *         name: factoryId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factory document deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       404:
 *         description: Factory or attachment not found
 */
FactoryRouter.delete(
  "/:factoryId/attachments/:attachmentId",
  requirePermission("factory_edit"),
  validateRequest({ params: factoryAttachmentParamsSchema }),
  FactoryController.deleteAttachment,
);

export = FactoryRouter;
