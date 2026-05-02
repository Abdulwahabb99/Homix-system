import type { NextFunction, Request, Response } from "express";

const EmployeeService = require("./employee.service") as typeof import("./employee.service");
const { AppError } = require("../../middlewares/errors") as typeof import("../../middlewares/errors");

const getEmployeeId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};

class EmployeeController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const employee = await EmployeeService.create(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create employee";
      return next(new AppError(message, 500));
    }
  }

  public static async getOne(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const employee = await EmployeeService.getOne(getEmployeeId(req));
      return res.status(200).json(employee);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch employee";
      return next(new AppError(message, 500));
    }
  }

  public static async getAll(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const employees = await EmployeeService.getAll();
      return res.status(200).json(employees);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch employees";
      return next(new AppError(message, 500));
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const employee = await EmployeeService.update(getEmployeeId(req), req.body);
      return res.status(200).json(employee);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update employee";
      return next(new AppError(message, 500));
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const deleted = await EmployeeService.delete(getEmployeeId(req));
      return res.status(200).json({ deleted });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete employee";
      return next(new AppError(message, 500));
    }
  }
}

export = EmployeeController;
