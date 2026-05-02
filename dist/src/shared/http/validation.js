"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return (request, _response, next) => {
        if (schema.body) {
            request.body = schema.body.parse(request.body);
        }
        if (schema.params) {
            request.params = schema.params.parse(request.params);
        }
        if (schema.query) {
            request.query = schema.query.parse(request.query);
        }
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map