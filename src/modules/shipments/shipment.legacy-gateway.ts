import type { Response } from "express";

import type { LegacyShipmentResponse, ShipmentMutationPayload, ShipmentRequestUser } from "./shipment.internal-types";

type LegacyShipmentService = {
  exportShipments: (response: Response, payload: Record<string, unknown>) => Promise<void>;
};

type LegacyOrderService = {
  saveImportedOrders: (payload: ShipmentMutationPayload[], isShipment?: boolean) => Promise<unknown>;
};

const getLegacyShipmentService = (): LegacyShipmentService => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  return require("../../../app/modules/shipments/shipment.service");
};

const getLegacyOrderService = (): LegacyOrderService => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  return require("../../../app/modules/order/order.service");
};

export const shipmentLegacyGateway = {
  createShipment: (payload: ShipmentMutationPayload) => getLegacyOrderService().saveImportedOrders([payload], true),
  exportShipments: (response: Response, payload: Record<string, unknown>) =>
    getLegacyShipmentService().exportShipments(response, payload),
};
