import type { Response } from "express";

import type { LegacyShipmentResponse, ShipmentMutationPayload, ShipmentRequestUser } from "./shipment.internal-types";

type LegacyShipmentService = {
  addNote: (user: ShipmentRequestUser, shipmentId: number, text: string) => Promise<LegacyShipmentResponse>;
  deleteNote: (user: ShipmentRequestUser, shipmentId: number, noteId: number) => Promise<LegacyShipmentResponse>;
  deleteShipment: (shipmentId: number) => Promise<LegacyShipmentResponse>;
  exportShipments: (response: Response, payload: Record<string, unknown>) => Promise<void>;
  getShipments: (payload: Record<string, unknown>) => Promise<LegacyShipmentResponse>;
  getOneShipment: (shipmentId: number, vendorId?: number | null) => Promise<LegacyShipmentResponse>;
  updateNote: (user: ShipmentRequestUser, shipmentId: number, noteId: number, text: string) => Promise<LegacyShipmentResponse>;
  updateShipment: (shipmentId: number, payload: ShipmentMutationPayload) => Promise<LegacyShipmentResponse>;
};

const getLegacyShipmentService = (): LegacyShipmentService => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  return require("../../../app/modules/shipments/shipment.service");
};

export const shipmentLegacyGateway = {
  addNote: (user: ShipmentRequestUser, shipmentId: number, text: string) =>
    getLegacyShipmentService().addNote(user, shipmentId, text),
  deleteNote: (user: ShipmentRequestUser, shipmentId: number, noteId: number) =>
    getLegacyShipmentService().deleteNote(user, shipmentId, noteId),
  deleteShipment: (shipmentId: number) => getLegacyShipmentService().deleteShipment(shipmentId),
  exportShipments: (response: Response, payload: Record<string, unknown>) =>
    getLegacyShipmentService().exportShipments(response, payload),
  getOneShipment: (shipmentId: number, vendorId?: number | null) =>
    getLegacyShipmentService().getOneShipment(shipmentId, vendorId),
  getShipments: (payload: Record<string, unknown>) => getLegacyShipmentService().getShipments(payload),
  updateNote: (user: ShipmentRequestUser, shipmentId: number, noteId: number, text: string) =>
    getLegacyShipmentService().updateNote(user, shipmentId, noteId, text),
  updateShipment: (shipmentId: number, payload: ShipmentMutationPayload) =>
    getLegacyShipmentService().updateShipment(shipmentId, payload),
};
