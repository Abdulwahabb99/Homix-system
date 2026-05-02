"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrap = exports.failure = exports.success = void 0;
const success = (data) => ({ data, ok: true });
exports.success = success;
const failure = (error) => ({
    error,
    ok: false,
});
exports.failure = failure;
const unwrap = (result) => {
    if (!result.ok) {
        throw result.error;
    }
    return result.data;
};
exports.unwrap = unwrap;
//# sourceMappingURL=result.js.map