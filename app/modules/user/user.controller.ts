import type { Request, Response } from "express";

const UserService = require("./user.service") as typeof import("./user.service");

const getId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};

class UserController {
  public static async getAllUsers(_req: Request, res: Response): Promise<Response> {
    try {
      const users = await UserService.getAdminUsers();
      return res.status(200).json(users);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch users";
      return res.status(500).json({ message });
    }
  }

  public static async getUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await UserService.getUser(getId(req));
      return res.status(200).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user";
      return res.status(500).json({ message });
    }
  }

  public static async editUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await UserService.editUser(getId(req), req.body as Record<string, unknown>);
      return res.status(200).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to edit user";
      return res.status(500).json({ message });
    }
  }

  public static async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await UserService.deleteUser(getId(req));
      return res.status(200).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      return res.status(500).json({ message });
    }
  }
}

export = UserController;
