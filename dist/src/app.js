"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const app_router_1 = require("./modules/app-router");
const http_1 = require("./shared/http");
const http_logger_1 = require("./shared/logger/http-logger");
const JSON_ERROR_CODE = 400;
const JSON_LIMIT = "1mb";
const URL_ENCODED_LIMIT = "16mb";
const UPLOADS_ROUTE = "/uploads";
const applyCacheHeaders = (_request, response, next) => {
    response.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.header("Expires", "-1");
    response.header("Pragma", "no-cache");
    next();
};
const handleJsonSyntaxError = (error, _request, response, next) => {
    if (error instanceof SyntaxError) {
        response.status(JSON_ERROR_CODE).json({
            message: "Enter a valid JSON object.",
            status: false,
        });
        return;
    }
    next(error);
};
const createApp = () => {
    const app = (0, express_1.default)();
    app.disable("etag");
    app.use(http_1.requestContextMiddleware);
    app.use(http_logger_1.httpLogger);
    app.use(body_parser_1.default.json({ limit: JSON_LIMIT }));
    app.use(body_parser_1.default.urlencoded({ extended: true, limit: URL_ENCODED_LIMIT }));
    app.use((0, cors_1.default)());
    app.use(UPLOADS_ROUTE, express_1.default.static("uploads"));
    app.use(applyCacheHeaders);
    app.use((0, app_router_1.createMainRouter)());
    app.use(http_1.notFoundHandler);
    app.use(handleJsonSyntaxError);
    app.use(http_1.errorMiddleware);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map