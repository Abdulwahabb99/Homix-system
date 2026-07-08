import { z } from "zod";

const positiveIntegerMessage = "Expected a positive integer";

const optionalCustomerString = z.union([z.string(), z.null()]).optional().transform((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
});

export const customerIdParamsSchema = z.object({
  customerId: z.coerce.number().int().positive(positiveIntegerMessage),
});

export const customerUpdateSchema = z.object({
  address: optionalCustomerString,
  address2: optionalCustomerString,
  email: optionalCustomerString,
  firstName: optionalCustomerString,
  lastName: optionalCustomerString,
  phoneNumber: optionalCustomerString,
}).refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  { message: "At least one customer field is required" },
);

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
