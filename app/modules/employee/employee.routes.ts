import express from "express";

const EmployeeController = require("./employee.controller") as typeof import("./employee.controller");
const requirePermission = require("../../middlewares/requirePermission") as (permissionKey: string) => express.RequestHandler;

const EmployeeRouter = express.Router();

EmployeeRouter.get("/", requirePermission("employees_view"), EmployeeController.getAll);
EmployeeRouter.get("/:id", requirePermission("employees_view"), EmployeeController.getOne);
EmployeeRouter.post("/", requirePermission("employees_create"), EmployeeController.create);
EmployeeRouter.put("/:id", requirePermission("employees_edit"), EmployeeController.update);
EmployeeRouter.delete("/:id", requirePermission("employees_delete"), EmployeeController.delete);

export = EmployeeRouter;
