import { z } from "zod";

const isoDateMessage = "Expected ISO date string";

export const dashboardDateRangeSchema = z
  .object({
    endDate: z.string().datetime({ offset: true }).or(z.string().date()).or(z.string().min(1, isoDateMessage)),
    startDate: z.string().datetime({ offset: true }).or(z.string().date()).or(z.string().min(1, isoDateMessage)),
  })
  .superRefine((value, context) => {
    const startDate = new Date(value.startDate);
    const endDate = new Date(value.endDate);

    if (Number.isNaN(startDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid startDate",
        path: ["startDate"],
      });
    }

    if (Number.isNaN(endDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid endDate",
        path: ["endDate"],
      });
    }

    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate > endDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startDate must be before or equal to endDate",
        path: ["startDate"],
      });
    }
  });
