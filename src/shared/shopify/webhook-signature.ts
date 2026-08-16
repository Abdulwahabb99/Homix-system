/**
 * Shopify webhook authentication.
 *
 * Shopify cannot send a bearer token, so webhook routes sit outside `verifyToken`
 * and are authenticated by the HMAC signature Shopify puts on every delivery.
 */
import crypto from "node:crypto";

import type { Request } from "express";

import { env } from "../../config/env";

export type RawBodyRequest = Request & { rawBody?: Buffer };

/**
 * Timing-safe compare of Shopify's HMAC header against the raw body.
 *
 * Store-level webhooks (Settings > Notifications) are signed with the key shown
 * on that page, which is NOT the app's API secret — hence the dedicated variable,
 * falling back to the app secret for app-created webhooks.
 *
 * Returns false rather than throwing on malformed input.
 */
export const isValidShopifySignature = (rawBody: Buffer | undefined, signature: unknown): boolean => {
  const secret = env.SHOPIFY_WEBHOOK_SECRET ?? env.SHOPIFY_APP_SECRET;
  if (!rawBody || typeof signature !== "string" || signature.length === 0 || !secret) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  // timingSafeEqual throws on length mismatch, so compare lengths first.
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

/** Convenience wrapper for an express request carrying the captured raw body. */
export const isValidShopifyRequest = (request: Request): boolean =>
  isValidShopifySignature(
    (request as RawBodyRequest).rawBody,
    request.headers["x-shopify-hmac-sha256"],
  );
