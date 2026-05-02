"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const EmployeeController = require("./employee.controller");
const EmployeeRouter = express_1.default.Router();
EmployeeRouter.get("/", EmployeeController.getAll);
EmployeeRouter.get("/:id", EmployeeController.getOne);
EmployeeRouter.post("/", EmployeeController.create);
EmployeeRouter.put("/:id", EmployeeController.update);
EmployeeRouter.delete("/:id", EmployeeController.delete);
module.exports = EmployeeRouter;
//# sourceMappingURL=employee.routes.js.map