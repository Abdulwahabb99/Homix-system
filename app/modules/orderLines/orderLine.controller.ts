import type { NextFunction, Request, Response } from "express";

const { AppError } = require("../../middlewares/errors") as typeof import("../../middlewares/errors");
const OrderLineService = require("./orderLine.service") as typeof import("./orderLine.service");

const getParam = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};

class OrderLineController {
  public static async updateOrderLine(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await OrderLineService.updateOrderLine(getParam(req.params.orderLineId), {
        color: req.body.color as string | undefined,
        cost: req.body.cost as number | undefined,
        itemShipping: req.body.itemShipping as number | undefined,
        itemStatus: req.body.itemStatus as number | undefined,
        material: req.body.material as string | undefined,
        notes: req.body.notes as string | undefined,
        size: req.body.size as string | undefined,
        status: req.body.status as number | undefined,
        toBeCollected: req.body.toBeCollected as number | undefined,
      });
      return res.status(result.statusCode).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order line";
      return next(new AppError(message, 500));
    }
  }

  public static async updateNote(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await OrderLineService.updateNote(
        req.user ?? { id: 0 },
        getParam(req.params.orderLineId),
        getParam(req.params.noteId),
        String(req.body.text ?? ""),
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update note";
      return next(new AppError(message, 500));
    }
  }

  public static async addNote(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await OrderLineService.addNote(
        req.user ?? { id: 0 },
        getParam(req.params.orderLineId),
        String(req.body.text ?? ""),
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add note";
      return next(new AppError(message, 500));
    }
  }

  public static async deleteNote(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await OrderLineService.deleteNote(
        req.user ?? { id: 0 },
        getParam(req.params.orderLineId),
        getParam(req.params.noteId),
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete note";
      return next(new AppError(message, 500));
    }
  }
}

export = OrderLineController;
