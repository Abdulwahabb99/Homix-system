import express from "express";

import { asyncHandler, validateRequest } from "../../shared/http";
import { TicketController } from "./ticket.controller";
import { TicketRepository } from "./ticket.repo";
import {
  ticketAttachmentParamsSchema,
  ticketCreateSchema,
  ticketIdParamsSchema,
  ticketListQuerySchema,
  ticketLookupQuerySchema,
  ticketNoteParamsSchema,
  ticketNoteSchema,
  ticketUpdateSchema,
} from "./ticket.schemas";
import { TicketService } from "./ticket.service";

const verifyToken = require("../../../app/middlewares/protectApi");
const isNotVendor = require("../../../app/middlewares/isNotVendor");
const fileUploadMiddleware = require("../../../config/fileUploadMiddleware");

const ticketRepository = new TicketRepository();
const ticketService = new TicketService(ticketRepository);
const ticketController = new TicketController(ticketService);

export const ticketRouter = express.Router();

ticketRouter.use(verifyToken, isNotVendor);

/**
 * @swagger
 * /tickets/meta:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tickets
 *     summary: Get ticket metadata
 *     responses:
 *       200:
 *         description: Ticket metadata
 */
ticketRouter.get("/meta", asyncHandler(ticketController.getMeta));

/**
 * @swagger
 * /tickets/orders/lookup:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tickets
 *     summary: Lookup order by operation number
 *     parameters:
 *       - in: query
 *         name: operationNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order lookup result
 */
ticketRouter.get(
  "/orders/lookup",
  validateRequest({ query: ticketLookupQuerySchema }),
  asyncHandler(ticketController.lookupOrder),
);

/**
 * @swagger
 * /tickets:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tickets
 *     summary: List tickets
 *     responses:
 *       200:
 *         description: Ticket list
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tickets
 *     summary: Create ticket
 *     responses:
 *       201:
 *         description: Ticket created
 */
ticketRouter.get(
  "/",
  validateRequest({ query: ticketListQuerySchema }),
  asyncHandler(ticketController.listTickets),
);

ticketRouter.post(
  "/",
  validateRequest({ body: ticketCreateSchema }),
  asyncHandler(ticketController.createTicket),
);

/**
 * @swagger
 * /tickets/{ticketId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tickets
 *     summary: Get ticket details
 *     responses:
 *       200:
 *         description: Ticket details
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tickets
 *     summary: Update ticket
 *     responses:
 *       200:
 *         description: Ticket updated
 */
ticketRouter.get(
  "/:ticketId",
  validateRequest({ params: ticketIdParamsSchema }),
  asyncHandler(ticketController.getTicketById),
);

ticketRouter.patch(
  "/:ticketId",
  validateRequest({ body: ticketUpdateSchema, params: ticketIdParamsSchema }),
  asyncHandler(ticketController.updateTicket),
);

ticketRouter.post(
  "/:ticketId/notes",
  validateRequest({ body: ticketNoteSchema, params: ticketIdParamsSchema }),
  asyncHandler(ticketController.addNote),
);

ticketRouter.put(
  "/:ticketId/notes/:noteId",
  validateRequest({ body: ticketNoteSchema, params: ticketNoteParamsSchema }),
  asyncHandler(ticketController.updateNote),
);

ticketRouter.delete(
  "/:ticketId/notes/:noteId",
  validateRequest({ params: ticketNoteParamsSchema }),
  asyncHandler(ticketController.deleteNote),
);

ticketRouter.post(
  "/:ticketId/attachments/upload",
  validateRequest({ params: ticketIdParamsSchema }),
  fileUploadMiddleware("ticket"),
  asyncHandler(ticketController.addAttachments),
);

ticketRouter.delete(
  "/:ticketId/attachments/:attachmentId",
  validateRequest({ params: ticketAttachmentParamsSchema }),
  asyncHandler(ticketController.deleteAttachment),
);
