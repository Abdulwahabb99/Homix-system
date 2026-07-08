import { ConflictError, NotFoundError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import { success } from "../../shared/result";
import { TICKET_STATUS } from "./ticket.constants";
import { TicketRepository } from "./ticket.repo";
import type {
  TicketAttachment,
  TicketCreateInput,
  TicketDetails,
  TicketListFilters,
  TicketListResponse,
  TicketLookupResponse,
  TicketMetaResponse,
  TicketNote,
  TicketNoteInput,
  TicketRequestUser,
  TicketUpdateInput,
} from "./ticket.types";

const toLogValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
};

const normalizeUpdatePayload = (payload: TicketUpdateInput): TicketUpdateInput => {
  const nextPayload = { ...payload };

  if (nextPayload.status === TICKET_STATUS.CLOSED && !nextPayload.closedAt) {
    nextPayload.closedAt = new Date().toISOString();
  }

  if (nextPayload.status === TICKET_STATUS.OPEN) {
    nextPayload.closedAt = null;
  }

  return nextPayload;
};

export class TicketService {
  public constructor(private readonly ticketRepository: TicketRepository) {}

  public async getMeta(): Promise<Result<TicketMetaResponse>> {
    return success(await this.ticketRepository.getMeta());
  }

  public async lookupOrderByOperationNumber(
    operationNumber: string,
    vendorId?: number | null,
  ): Promise<Result<TicketLookupResponse>> {
    const order = await this.ticketRepository.lookupOrderByOperationNumber(operationNumber, vendorId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return success(order);
  }

  public async lookupOrderByOrderNumber(
    orderNumber: string,
    vendorId?: number | null,
  ): Promise<Result<TicketLookupResponse>> {
    const order = await this.ticketRepository.lookupOrderByOrderNumber(orderNumber, vendorId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return success(order);
  }

  public async createTicket(
    payload: TicketCreateInput,
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<TicketDetails>> {
    const hasOrder = await this.ticketRepository.hasOrder(payload.orderId, vendorId);
    if (!hasOrder) {
      throw new NotFoundError("Order not found");
    }

    if (payload.assignedToUserId) {
      const hasAssignee = await this.ticketRepository.hasAssignee(payload.assignedToUserId);
      if (!hasAssignee) {
        throw new NotFoundError("Assignee not found");
      }
    }

    const createdTicket = await this.ticketRepository.createTicket({
      ...payload,
      createdByUserId: user.id,
    });
    await this.ticketRepository.createLogs([{
      action: "create",
      entityId: createdTicket.id,
      entityType: "ticket",
      field: "ticket_created",
      from: "",
      to: String(payload.type),
      userId: user.id,
    }]);

    const ticket = await this.ticketRepository.getTicketById(createdTicket.id, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    return success(ticket);
  }

  public async listTickets(
    filters: TicketListFilters,
    vendorId?: number | null,
  ): Promise<Result<TicketListResponse>> {
    return success(await this.ticketRepository.listTickets(filters, vendorId));
  }

  public async getTicketById(
    ticketId: number,
    vendorId?: number | null,
  ): Promise<Result<TicketDetails>> {
    const ticket = await this.ticketRepository.getTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    return success(ticket);
  }

  public async updateTicket(
    ticketId: number,
    payload: TicketUpdateInput,
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<TicketDetails>> {
    const existingTicket = await this.ticketRepository.getRawTicketById(ticketId, vendorId);
    if (!existingTicket) {
      throw new NotFoundError("Ticket not found");
    }
    const plainTicket = "toJSON" in existingTicket && typeof existingTicket.toJSON === "function"
      ? existingTicket.toJSON()
      : existingTicket;

    if (payload.assignedToUserId) {
      const hasAssignee = await this.ticketRepository.hasAssignee(payload.assignedToUserId);
      if (!hasAssignee) {
        throw new NotFoundError("Assignee not found");
      }
    }

    const normalizedPayload = normalizeUpdatePayload(payload);
    await this.ticketRepository.updateTicket(ticketId, normalizedPayload);
    await this.ticketRepository.createLogs(
      Object.entries(normalizedPayload).map(([field, nextValue]) => ({
        action: "update",
        entityId: ticketId,
        entityType: "ticket",
        field,
        from: toLogValue(plainTicket[field as keyof typeof plainTicket]),
        to: toLogValue(nextValue),
        userId: user.id,
      })),
    );
    const ticket = await this.ticketRepository.getTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    return success(ticket);
  }

  public async addNote(
    ticketId: number,
    payload: TicketNoteInput,
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<TicketNote>> {
    const ticket = await this.ticketRepository.getRawTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    const createdNote = await this.ticketRepository.createNote(ticketId, payload.text, user.id);
    await this.ticketRepository.createLogs([{
      action: "create",
      entityId: ticketId,
      entityType: "ticket",
      field: "ticket_note",
      from: "",
      to: payload.text,
      userId: user.id,
    }]);
    return success(createdNote);
  }

  public async updateNote(
    ticketId: number,
    noteId: number,
    payload: TicketNoteInput,
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<TicketNote>> {
    const ticket = await this.ticketRepository.getRawTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    const note = await this.ticketRepository.getNoteById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const plainNote = "toJSON" in note && typeof note.toJSON === "function" ? note.toJSON() : note;
    if (Number(plainNote.entityId ?? 0) !== ticketId || plainNote.entityType !== "ticket") {
      throw new NotFoundError("Note not found");
    }

    const previousText = toLogValue(plainNote.text);
    const updatedNote = await this.ticketRepository.updateNote(note, payload.text);
    await this.ticketRepository.createLogs([{
      action: "update",
      entityId: ticketId,
      entityType: "ticket",
      field: "ticket_note",
      from: previousText,
      to: payload.text,
      userId: user.id,
    }]);
    return success(updatedNote);
  }

  public async deleteNote(
    ticketId: number,
    noteId: number,
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<{ message: string }>> {
    const ticket = await this.ticketRepository.getRawTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    const note = await this.ticketRepository.getNoteById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const plainNote = "toJSON" in note && typeof note.toJSON === "function" ? note.toJSON() : note;
    if (Number(plainNote.entityId ?? 0) !== ticketId || plainNote.entityType !== "ticket") {
      throw new NotFoundError("Note not found");
    }

    await this.ticketRepository.deleteNote(note);
    await this.ticketRepository.createLogs([{
      action: "delete",
      entityId: ticketId,
      entityType: "ticket",
      field: "ticket_note",
      from: toLogValue(plainNote.text),
      to: "",
      userId: user.id,
    }]);

    return success({ message: "Note deleted successfully" });
  }

  public async addAttachments(
    ticketId: number,
    filePaths: string[],
    fileNames: string[],
    descriptions: string[],
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<TicketAttachment[]>> {
    const ticket = await this.ticketRepository.getRawTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (filePaths.length === 0) {
      throw new ConflictError("No files uploaded");
    }

    const attachments = await this.ticketRepository.addAttachments(ticketId, filePaths, fileNames, descriptions);
    await this.ticketRepository.createLogs(
      attachments.map((attachment, index) => ({
        action: "create",
        entityId: ticketId,
        entityType: "ticket",
        field: "ticket_attachment",
        from: "",
        to: attachment.name || fileNames[index] || "",
        userId: user.id,
      })),
    );
    return success(attachments);
  }

  public async deleteAttachment(
    ticketId: number,
    attachmentId: number,
    user: TicketRequestUser,
    vendorId?: number | null,
  ): Promise<Result<{ message: string }>> {
    const ticket = await this.ticketRepository.getRawTicketById(ticketId, vendorId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    const attachment = await this.ticketRepository.getAttachmentById(attachmentId);
    if (!attachment) {
      throw new NotFoundError("Attachment not found");
    }

    const plainAttachment = "toJSON" in attachment && typeof attachment.toJSON === "function"
      ? attachment.toJSON()
      : attachment;
    if (Number(plainAttachment.modelId ?? 0) !== ticketId || plainAttachment.modelType !== "Ticket") {
      throw new NotFoundError("Attachment not found");
    }

    await this.ticketRepository.deleteAttachment(attachment);
    await this.ticketRepository.createLogs([{
      action: "delete",
      entityId: ticketId,
      entityType: "ticket",
      field: "ticket_attachment",
      from: toLogValue(plainAttachment.name),
      to: "",
      userId: user.id,
    }]);

    return success({ message: "Attachment deleted successfully" });
  }
}
