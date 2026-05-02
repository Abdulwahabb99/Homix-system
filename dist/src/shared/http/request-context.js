"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = void 0;
const requestContextMiddleware = (request, _response, next) => {
    request.operationName = `${request.method} ${request.originalUrl}`;
    next();
};
exports.requestContextMiddleware = requestContextMiddleware;
//# sourceMappingURL=request-context.js.map