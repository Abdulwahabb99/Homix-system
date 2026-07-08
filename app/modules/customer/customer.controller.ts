import type { Request, Response } from "express";

import { unwrap } from "../../../src/shared/result";
import type { CustomerUpdateInput } from "./customer.schemas";

const CustomerService = require("./customer.service") as typeof import("./customer.service");

class CustomerController {
  public static async updateCustomer(req: Request, res: Response): Promise<void> {
    const result = await CustomerService.updateCustomer(
      Number(req.params.customerId),
      req.body as CustomerUpdateInput,
    );

    res.status(200).json({
      data: unwrap(result),
      status: true,
    });
  }
}

export = CustomerController;
