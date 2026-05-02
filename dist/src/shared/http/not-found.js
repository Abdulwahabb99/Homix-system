"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const errors_1 = require("../errors");
const notFoundHandler = (_req, _res, next) => {
    next(new errors_1.NotFoundError("Route not found"));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=not-found.js.map