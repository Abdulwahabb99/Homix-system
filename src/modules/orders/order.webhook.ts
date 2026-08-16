/**
 * Shopify orders webhook.
 *
 * Shopify cannot send a JWT, so this route is deliberately outside `verifyToken`
 * and is authenticated by Shopify's own HMAC signature over the raw request body
 * instead. Pointing the webhook at the token-protected `POST /orders` silently
 * dropped every order: that route answers `200 {status:false}` without a token,
 * so Shopify recorded a successful delivery and never retried.
 *
 * Status codes matter here — Shopify retries on 4xx/5xx and gives up on 2xx:
 *   200  stored, or a duplicate we already have
 *   401  signature missing or wrong
 *   422  payload is not an order we can store (no retry would help)
 *   500  our failure — Shopify should retry
 */
import type { Request, Response } from "express";

import { logger } from "../../shared/logger/logger";
import { isValidShopifyRequest } from "../../shared/shopify/webhook-signature";

const legacyOrderService = require("../../../app/modules/order/order.service");

const WEBHOOK_LOG_OPERATION = "shopifyOrderWebhook";

/**
 * A cart/checkout payload carries no customer and no order name, and the importer
 * would drop it silently. Only real orders are accepted.
 */
const isStorableOrder = (payload: Record<string, unknown>): boolean => {
  return Boolean(payload?.customer) && Boolean(payload?.name ?? payload?.order_number);
};

export const handleShopifyOrderWebhook = async (request: Request, response: Response): Promise<void> => {
  const topic = request.headers["x-shopify-topic"];
  const shopDomain = request.headers["x-shopify-shop-domain"];

  if (!isValidShopifyRequest(request)) {
    logger.warn({ operationName: WEBHOOK_LOG_OPERATION, shopDomain, topic }, "Rejected webhook with invalid signature");
    response.status(401).json({ message: "Invalid webhook signature", status: false });
    return;
  }

  const payload = (request.body ?? {}) as Record<string, unknown>;

  if (!isStorableOrder(payload)) {
    logger.warn(
      { operationName: WEBHOOK_LOG_OPERATION, orderId: payload.id, topic },
      "Ignored webhook payload that is not a storable order",
    );
    response.status(422).json({ message: "Payload is not a storable order", status: false });
    return;
  }

  try {
    const result = await legacyOrderService.saveImportedOrders([payload]);
    logger.info(
      { operationName: WEBHOOK_LOG_OPERATION, orderName: payload.name, topic },
      result?.message ?? "Order webhook processed",
    );
    response.status(200).json({ message: result?.message ?? "Order stored", status: true });
  } catch (error) {
    // 500 so Shopify retries rather than treating a failure as delivered.
    logger.error(
      { err: error, operationName: WEBHOOK_LOG_OPERATION, orderName: payload.name, topic },
      "Order webhook failed",
    );
    response.status(500).json({ message: "Failed to store order", status: false });
  }
};
