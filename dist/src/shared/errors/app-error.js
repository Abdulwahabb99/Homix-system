"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    status = false;
    code;
    constructor(message, statusCode, code) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 400, "VALIDATION_ERROR");
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404, "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = "Resource conflict") {
        super(message, 409, "CONFLICT");
    }
}
exports.ConflictError = ConflictError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401, "UNAUTHORIZED");
    }
}
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=app-error.js.map