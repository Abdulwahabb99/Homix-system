import type { Request } from "express";

export type ShipmentRequestUser = NonNullable<Request["user"]>;
export type ShipmentMutationPayload = Record<string, unknown>;
export type LegacyShipmentResponse<TData = unknown> = {
  data?: TData;
  message?: string;
  status?: boolean;
  statusCode?: number;
};
