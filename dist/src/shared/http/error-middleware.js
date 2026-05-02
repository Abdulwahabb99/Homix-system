"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const errors_1 = require("../errors");
const logger_1 = require("../logger/logger");
const INTERNAL_SERVER_ERROR = 500;
const toAppError = (error) => {
    if (error instanceof errors_1.AppError) {
        return error;
    }
    if (error instanceof zod_1.ZodError) {
        return new errors_1.ValidationError(error.issues.map((issue) => issue.message).join(", "));
    }
    if (error instanceof Error) {
        return new errors_1.AppError(error.message, INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
    }
    return new errors_1.AppError("Something went wrong!", INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
};
const errorMiddleware = (error, request, response, _next) => {
    const appError = toAppError(error);
    logger_1.logger.error({
        err: error,
        operationName: request.operationName,
        requestId: request.requestId,
        userId: request.user?.id ?? null,
    }, appError.message);
    response.status(appError.statusCode).json({
        code: appError.code,
        message: appError.message,
        status: appError.status,
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error-middleware.js.map