"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const crypto_1 = require("crypto");
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("./logger");
exports.httpLogger = (0, pino_http_1.default)({
    logger: logger_1.logger,
    customProps: (request) => {
        const typedRequest = request;
        return {
            operationName: typedRequest.operationName ?? `${typedRequest.method} ${typedRequest.url}`,
            requestId: typedRequest.requestId,
            userId: typedRequest.user?.id ?? null,
        };
    },
    genReqId: (request, response) => {
        const typedRequest = request;
        const headerValue = typedRequest.headers["x-request-id"];
        const requestId = typeof headerValue === "string" ? headerValue : (0, crypto_1.randomUUID)();
        typedRequest.requestId = requestId;
        response.setHeader("x-request-id", requestId);
        return requestId;
    },
});
//# sourceMappingURL=http-logger.js.map