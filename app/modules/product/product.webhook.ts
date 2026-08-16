/**
 * Shopify products webhook (product creation / product update).
 *
 * Same story as the orders webhook: Shopify cannot send a bearer token, so this
 * route is authenticated by Shopify's HMAC signature instead of `verifyToken`.
 * The store webhooks were pointing at the token-protected `POST /products`, which
 * answers `200 {status:false}` without a token — so Shopify treated every delivery
 * as successful and no product ever arrived.
 *
 * Status codes drive Shopify's retries: 2xx stops them, 4xx/5xx retries.
 */
import type { Request, Response } from "express";

import { logger } from "../../../src/shared/logger/logger";
import { isValidShopifyRequest } from "../../../src/shared/shopify/webhook-signature";

const ProductsService = require("./product.service") as typeof import("./product.service");

const WEBHOOK_LOG_OPERATION = "shopifyProductWebhook";

export const handleShopifyProductWebhook = async (request: Request, response: Response): Promise<void> => {
  const topic = request.headers["x-shopify-topic"];
  const shopDomain = request.headers["x-shopify-shop-domain"];

  if (!isValidShopifyRequest(request)) {
    logger.warn(
      { operationName: WEBHOOK_LOG_OPERATION, shopDomain, topic },
      "Rejected product webhook with invalid signature",
    );
    response.status(401).json({ message: "Invalid webhook signature", status: false });
    return;
  }

  const payload = (request.body ?? {}) as Record<string, unknown>;

  // A product we cannot key on is not storable, and retrying will not help.
  if (!payload.id) {
    logger.warn({ operationName: WEBHOOK_LOG_OPERATION, topic }, "Ignored product webhook without an id");
    response.status(422).json({ message: "Payload is not a storable product", status: false });
    return;
  }

  try {
    const result = await ProductsService.saveImportedProducts([payload as never]);
    logger.info(
      { operationName: WEBHOOK_LOG_OPERATION, productId: payload.id, topic },
      result?.message ?? "Product webhook processed",
    );
    response.status(200).json({ message: result?.message ?? "Product stored", status: true });
  } catch (error) {
    // 500 so Shopify retries instead of recording a delivery that stored nothing.
    logger.error(
      { err: error, operationName: WEBHOOK_LOG_OPERATION, productId: payload.id, topic },
      "Product webhook failed",
    );
    response.status(500).json({ message: "Failed to store product", status: false });
  }
};
