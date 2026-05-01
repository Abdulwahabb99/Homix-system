import { z } from "zod";

export const emptyNotificationPayloadSchema = z.object({}).passthrough();
