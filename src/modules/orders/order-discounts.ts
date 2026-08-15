type DiscountAllocation = { amount?: unknown };

export type ImportedOrderLine = Record<string, unknown> & {
  discount?: unknown;
  discount_allocations?: DiscountAllocation[];
  price?: unknown;
  quantity?: unknown;
};

type ImportedOrder = Record<string, unknown> & {
  line_items?: ImportedOrderLine[];
  total_discounts?: unknown;
};

const numberValue = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCents = (value: unknown): number => Math.max(0, Math.round(numberValue(value) * 100));

/** Distributes integer cents while preserving the exact total. */
const distributeCents = (total: number, weights: number[]): number[] => {
  if (total <= 0 || weights.length === 0) return weights.map(() => 0);
  const safeWeights = weights.map((weight) => Math.max(0, weight));
  const weightTotal = safeWeights.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal <= 0) {
    const base = Math.floor(total / weights.length);
    const remainder = total - (base * weights.length);
    return weights.map((_, index) => base + (index < remainder ? 1 : 0));
  }

  const exactShares = safeWeights.map((weight) => (total * weight) / weightTotal);
  const shares = exactShares.map(Math.floor);
  let remainder = total - shares.reduce((sum, share) => sum + share, 0);
  const remainderOrder = exactShares
    .map((share, index) => ({ fraction: share - shares[index]!, index }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index);
  for (let index = 0; index < remainder; index += 1) {
    shares[remainderOrder[index % remainderOrder.length]!.index]! += 1;
  }
  return shares;
};

const allocatedDiscountCents = (line: ImportedOrderLine): number => {
  const allocations = Array.isArray(line.discount_allocations) ? line.discount_allocations : [];
  if (allocations.length > 0) {
    return allocations.reduce((sum, allocation) => sum + toCents(allocation.amount), 0);
  }
  return toCents(line.discount);
};

/**
 * Shopify allocates order discounts to line items. We preserve those allocations,
 * fill any missing order-level remainder proportionally, then split each line into
 * quantity-one records without losing a cent to rounding.
 */
export const splitImportedOrderByUnit = (order: ImportedOrder): ImportedOrder[] => {
  const lines = Array.isArray(order.line_items) ? order.line_items : [];
  if (lines.length === 0) return [];

  const quantities = lines.map((line) => Math.max(1, Math.trunc(numberValue(line.quantity)) || 1));
  const grossCents = lines.map((line, index) => toCents(numberValue(line.price) * quantities[index]!));
  const suppliedDiscounts = lines.map((line, index) => Math.min(allocatedDiscountCents(line), grossCents[index]!));
  const suppliedTotal = suppliedDiscounts.reduce((sum, discount) => sum + discount, 0);
  const hasOrderDiscount = order.total_discounts !== undefined
    && order.total_discounts !== null
    && order.total_discounts !== "";
  const targetTotal = Math.min(
    hasOrderDiscount ? toCents(order.total_discounts) : suppliedTotal,
    grossCents.reduce((sum, gross) => sum + gross, 0),
  );

  let lineDiscounts: number[];
  if (targetTotal < suppliedTotal) {
    lineDiscounts = distributeCents(targetTotal, suppliedDiscounts);
  } else {
    const missingDiscount = targetTotal - suppliedTotal;
    const remainingCapacity = grossCents.map((gross, index) => gross - suppliedDiscounts[index]!);
    const unallocatedLineCapacity = remainingCapacity.map((capacity, index) => (
      suppliedDiscounts[index] === 0 ? capacity : 0
    ));
    const hasUnallocatedLines = unallocatedLineCapacity.some((capacity) => capacity > 0);
    const firstPassTotal = hasUnallocatedLines
      ? Math.min(missingDiscount, unallocatedLineCapacity.reduce((sum, capacity) => sum + capacity, 0))
      : missingDiscount;
    const firstPass = distributeCents(
      firstPassTotal,
      hasUnallocatedLines ? unallocatedLineCapacity : remainingCapacity,
    );
    const secondPassTotal = missingDiscount - firstPassTotal;
    const secondPassCapacity = remainingCapacity.map((capacity, index) => capacity - firstPass[index]!);
    const secondPass = distributeCents(secondPassTotal, secondPassCapacity);
    const additionalDiscounts = firstPass.map((discount, index) => discount + secondPass[index]!);
    lineDiscounts = suppliedDiscounts.map((discount, index) => discount + additionalDiscounts[index]!);
  }

  return lines.flatMap((line, lineIndex) => {
    const quantity = quantities[lineIndex]!;
    const unitDiscounts = distributeCents(lineDiscounts[lineIndex]!, Array(quantity).fill(1));
    return unitDiscounts.map((discountCents) => ({
      ...order,
      line_items: [{ ...line, discount: discountCents / 100, quantity: 1 }],
    }));
  });
};
