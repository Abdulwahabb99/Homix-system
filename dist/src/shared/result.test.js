"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const result_1 = require("./result");
describe("result helpers", () => {
    it("creates a success result", () => {
        expect((0, result_1.success)({ id: 1 })).toEqual({
            data: { id: 1 },
            ok: true,
        });
    });
    it("creates a failure result", () => {
        const error = new errors_1.AppError("boom", 500, "ERR");
        expect((0, result_1.failure)(error)).toEqual({
            error,
            ok: false,
        });
    });
});
//# sourceMappingURL=result.test.js.map