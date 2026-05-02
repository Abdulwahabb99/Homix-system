"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardDateRangeSchema = void 0;
const zod_1 = require("zod");
const isoDateMessage = "Expected ISO date string";
exports.dashboardDateRangeSchema = zod_1.z
    .object({
    endDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().date()).or(zod_1.z.string().min(1, isoDateMessage)),
    startDate: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().date()).or(zod_1.z.string().min(1, isoDateMessage)),
})
    .superRefine((value, context) => {
    const startDate = new Date(value.startDate);
    const endDate = new Date(value.endDate);
    if (Number.isNaN(startDate.getTime())) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Invalid startDate",
            path: ["startDate"],
        });
    }
    if (Number.isNaN(endDate.getTime())) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Invalid endDate",
            path: ["endDate"],
        });
    }
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate > endDate) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "startDate must be before or equal to endDate",
            path: ["startDate"],
        });
    }
});
//# sourceMappingURL=dashboard.schemas.js.map