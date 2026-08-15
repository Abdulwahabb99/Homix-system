import type { Request, Response } from "express";

const UserService = require("../user/user.service") as typeof import("../user/user.service");
const VendorsService = require("./vendor.service") as typeof import("./vendor.service");

const getId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};

class VendorsController {
  public static async getVendors(_req: Request, res: Response): Promise<Response> {
    try {
      const vendors = await VendorsService.getAllVendors();
      return res.status(200).json(vendors);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch vendors";
      return res.status(500).json({ message });
    }
  }

  public static async changeActiveStatus(req: Request, res: Response): Promise<Response> {
    try {
      const response = await UserService.changeActiveStatus(getId(req));
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change vendor status";
      return res.status(500).json({ message });
    }
  }

  public static async createVendor(req: Request, res: Response): Promise<Response> {
    try {
      const response = await VendorsService.create(req.body as { email?: string; name: string; password?: string; shippingCost?: number | string });
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create vendor";
      return res.status(500).json({ message });
    }
  }

  public static async getOneVendor(req: Request, res: Response): Promise<Response> {
    try {
      const response = await VendorsService.getOne(getId(req));
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch vendor";
      return res.status(500).json({ message });
    }
  }

  public static async updateVendor(req: Request, res: Response): Promise<Response> {
    try {
      const response = await VendorsService.update(getId(req), req.body as { email?: string; name: string; password?: string; shippingCost?: number | string });
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update vendor";
      return res.status(500).json({ message });
    }
  }

  public static async deleteVendor(req: Request, res: Response): Promise<Response> {
    try {
      const response = await VendorsService.delete(getId(req));
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete vendor";
      return res.status(500).json({ message });
    }
  }
}

export = VendorsController;
