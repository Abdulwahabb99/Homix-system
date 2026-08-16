import crypto from "node:crypto";

import { isValidShopifySignature } from "../../shared/shopify/webhook-signature";
import { env } from "../../config/env";

describe("isValidShopifySignature", () => {
  const body = Buffer.from(JSON.stringify({ id: 123, name: "#HX11253" }), "utf8");

  const webhookSecret = env.SHOPIFY_WEBHOOK_SECRET ?? env.SHOPIFY_APP_SECRET;

  const sign = (payload: Buffer, secret = webhookSecret): string =>
    crypto.createHmac("sha256", secret).update(payload).digest("base64");

  it("accepts a signature produced with the app secret", () => {
    expect(isValidShopifySignature(body, sign(body))).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(isValidShopifySignature(body, sign(body, "not-the-secret"))).toBe(false);
  });

  it("rejects a signature that does not match the body", () => {
    const tamperedBody = Buffer.from(JSON.stringify({ id: 123, name: "#HX99999" }), "utf8");
    expect(isValidShopifySignature(tamperedBody, sign(body))).toBe(false);
  });

  it("rejects a missing or empty signature", () => {
    expect(isValidShopifySignature(body, undefined)).toBe(false);
    expect(isValidShopifySignature(body, "")).toBe(false);
  });

  it("rejects when the raw body was not captured", () => {
    expect(isValidShopifySignature(undefined, sign(body))).toBe(false);
  });

  it("rejects a signature of a different length without throwing", () => {
    expect(isValidShopifySignature(body, "short")).toBe(false);
  });
});
