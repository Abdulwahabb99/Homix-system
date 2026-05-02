import express from "express";

const EmployeeController = require("./employee.controller") as typeof import("./employee.controller");

const EmployeeRouter = express.Router();

EmployeeRouter.get("/", EmployeeController.getAll);
EmployeeRouter.get("/:id", EmployeeController.getOne);
EmployeeRouter.post("/", EmployeeController.create);
EmployeeRouter.put("/:id", EmployeeController.update);
EmployeeRouter.delete("/:id", EmployeeController.delete);

export = EmployeeRouter;
