/**
 * Stock movements for the shipment inventory.
 *
 * Inventory rows are created by hand (search a product by code or name, then
 * enter a quantity). From that point the quantity moves on its own:
 *   - a new order consumes stock for the products it contains
 *   - a return that ends as "forfeit" puts the goods back into stock
 *
 * Stock never goes below zero: if an order asks for more than is on hand the
 * row is drained to 0 rather than going negative.
 */
import { INVENTORY_STATUS } from "./shipment.constants";

const shipmentInventoryModel = require("../../../app/modules/shipments/shipmentInventory.model");

export type InventoryMovementTarget = {
  productCode?: string | null;
  productId?: number | null;
  quantity: number;
};

const toPositiveQuantity = (value: unknown): number => {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const statusForQuantity = (quantity: number): number =>
  quantity > 0 ? INVENTORY_STATUS.IN_STOCK : INVENTORY_STATUS.OUT_OF_STOCK;

/**
 * Rows matching a product, oldest first so stock is consumed FIFO and the
 * longest-held items leave first.
 */
const findInventoryRows = async (target: InventoryMovementTarget) => {
  const productId = Number(target.productId);
  const productCode = String(target.productCode ?? "").trim();

  if (!Number.isFinite(productId) && !productCode) {
    return [];
  }

  const where = Number.isFinite(productId) && productId > 0
    ? { productId }
    : { productCode };

  return shipmentInventoryModel.findAll({
    order: [["createdAt", "ASC"]],
    where,
  });
};

/** Consumes `quantity` units, spreading across rows and stopping at zero. */
export const consumeInventory = async (target: InventoryMovementTarget): Promise<number> => {
  let remaining = toPositiveQuantity(target.quantity);
  if (remaining === 0) {
    return 0;
  }

  const rows = await findInventoryRows(target);
  let consumed = 0;

  for (const row of rows) {
    if (remaining === 0) {
      break;
    }

    const available = toPositiveQuantity(row.quantity);
    if (available === 0) {
      continue;
    }

    const take = Math.min(available, remaining);
    const nextQuantity = available - take;
    await row.update({ quantity: nextQuantity, status: statusForQuantity(nextQuantity) });

    remaining -= take;
    consumed += take;
  }

  return consumed;
};

/** Returns `quantity` units to the oldest matching row (used by forfeited returns). */
export const restockInventory = async (target: InventoryMovementTarget): Promise<number> => {
  const quantity = toPositiveQuantity(target.quantity);
  if (quantity === 0) {
    return 0;
  }

  const [row] = await findInventoryRows(target);
  if (!row) {
    // No inventory row exists for this product; nothing to restock into.
    return 0;
  }

  const nextQuantity = toPositiveQuantity(row.quantity) + quantity;
  await row.update({ quantity: nextQuantity, status: statusForQuantity(nextQuantity) });

  return quantity;
};

/** Applies one movement per order line, ignoring lines without a product. */
export const applyOrderLinesToInventory = async (
  lines: InventoryMovementTarget[],
  direction: "consume" | "restock",
): Promise<void> => {
  const apply = direction === "consume" ? consumeInventory : restockInventory;

  for (const line of lines) {
    await apply(line);
  }
};
