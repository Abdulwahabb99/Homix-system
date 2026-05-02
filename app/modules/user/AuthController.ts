import type { NextFunction, Request, Response } from "express";

const { AppError } = require("../../middlewares/errors") as typeof import("../../middlewares/errors");
const UserService = require("./user.service") as typeof import("./user.service");

class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      const user = await UserService.login(email, password);
      return res.status(user.statusCode).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return next(new AppError(message, 500));
    }
  }

  public static async addUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const user = await UserService.addUser(req.body as {
        email?: string;
        firstName?: string;
        password?: string;
        userType?: string;
        vendorId?: number;
      });

      if (user.status === false) {
        return res.status(user.statusCode).json(user);
      }

      return res.status(user.statusCode).send(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add user failed";
      return next(new AppError(message, 500));
    }
  }
}

export = AuthController;
