import { z } from "zod";

const dateString = z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), {
  message: "Invalid date value",
});

const sortDirectionSchema = z.coerce.number().refine((value) => value === 1 || value === -1, "Sort direction must be 1 or -1");

const statusSchema = z.union([
  z.coerce.number().int().positive(),
  z.string().trim().min(1),
]);

export const factoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const factoryAttachmentParamsSchema = z.object({
  attachmentId: z.coerce.number().int().positive(),
  factoryId: z.coerce.number().int().positive(),
});

export const factoryListQuerySchema = z.object({
  factoryCategory: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.object({
    createdAt: sortDirectionSchema.optional(),
    joinDate: sortDirectionSchema.optional(),
    name: sortDirectionSchema.optional(),
    status: sortDirectionSchema.optional(),
  }).strict().refine((value) => Object.keys(value).length > 0, "sort must include at least one field").optional(),
  status: statusSchema.optional(),
});

export const factoryMutationSchema = z.object({
  address: z.string().trim().optional().nullable(),
  bankAccountHolderName: z.string().trim().optional().nullable(),
  bankAccountNumber: z.string().trim().optional().nullable(),
  bankAccountType: z.string().trim().optional().nullable(),
  bankName: z.string().trim().optional().nullable(),
  cairoGizaShipping: z.coerce.number().min(0).optional().nullable(),
  city: z.string().trim().optional().nullable(),
  contactPersonEmail: z.string().trim().email().optional().or(z.literal("")).nullable(),
  contactPersonName: z.string().trim().optional().nullable(),
  contactPersonPhoneNumber: z.string().trim().optional().nullable(),
  contactPersonRole: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().or(z.literal("")).nullable(),
  factoryCategory: z.string().trim().optional().nullable(),
  instapayNumber: z.string().trim().optional().nullable(),
  joinDate: dateString.optional().nullable(),
  latitude: z.string().trim().optional().nullable(),
  longitude: z.string().trim().optional().nullable(),
  name: z.string().trim().min(1),
  otherCitiesShipping: z.coerce.number().min(0).optional().nullable(),
  phoneNumber: z.string().trim().optional().nullable(),
  postalCode: z.string().trim().optional().nullable(),
  responsibleEmail: z.string().trim().email().optional().or(z.literal("")).nullable(),
  responsibleName: z.string().trim().optional().nullable(),
  responsiblePhone: z.string().trim().optional().nullable(),
  responsibleRole: z.string().trim().optional().nullable(),
  status: statusSchema.optional().nullable(),
  walletNumber: z.string().trim().optional().nullable(),
  walletProvider: z.string().trim().optional().nullable(),
  website: z.string().trim().optional().nullable(),
}).passthrough();

export const factoryUpdateSchema = factoryMutationSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided",
);
