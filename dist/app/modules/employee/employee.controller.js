"use strict";
const EmployeeService = require("./employee.service");
const { AppError } = require("../../middlewares/errors");
const getEmployeeId = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};
class EmployeeController {
    static async create(req, res, next) {
        try {
            const employee = await EmployeeService.create(req.body);
            return res.status(201).json(employee);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create employee";
            return next(new AppError(message, 500));
        }
    }
    static async getOne(req, res, next) {
        try {
            const employee = await EmployeeService.getOne(getEmployeeId(req));
            return res.status(200).json(employee);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch employee";
            return next(new AppError(message, 500));
        }
    }
    static async getAll(_req, res, next) {
        try {
            const employees = await EmployeeService.getAll();
            return res.status(200).json(employees);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch employees";
            return next(new AppError(message, 500));
        }
    }
    static async update(req, res, next) {
        try {
            const employee = await EmployeeService.update(getEmployeeId(req), req.body);
            return res.status(200).json(employee);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update employee";
            return next(new AppError(message, 500));
        }
    }
    static async delete(req, res, next) {
        try {
            const deleted = await EmployeeService.delete(getEmployeeId(req));
            return res.status(200).json({ deleted });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete employee";
            return next(new AppError(message, 500));
        }
    }
}
module.exports = EmployeeController;
//# sourceMappingURL=employee.controller.js.map