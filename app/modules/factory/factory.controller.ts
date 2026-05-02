import type { NextFunction, Request, Response } from "express";

const { AppError } = require("../../middlewares/errors") as typeof import("../../middlewares/errors");
const FactoryService = require("./factory.service") as typeof import("./factory.service");

const getParam = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};

class FactoryController {
  public static async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factory = await FactoryService.deleteAttachment(
        getParam(req.params.factoryId),
        getParam(req.params.attachmentId),
      );
      return res.status(200).json(factory);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete attachment";
      return next(new AppError(message, 500));
    }
  }

  public static async uploadFiles(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factory = await FactoryService.uploadFiles(
        getParam(req.params.id),
        req.filePaths,
        req.fileNames,
        req.descriptions,
      );
      return res.status(200).json(factory);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload files";
      return next(new AppError(message, 500));
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factory = await FactoryService.create(req.body as Record<string, unknown>);
      return res.status(201).json(factory);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create factory";
      return next(new AppError(message, 500));
    }
  }

  public static async getOne(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factory = await FactoryService.getOne(getParam(req.params.id));
      return res.status(200).json(factory);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch factory";
      return next(new AppError(message, 500));
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factories = await FactoryService.getAll(req.query as Record<string, string>);
      return res.status(200).json({
        data: factories,
        status: true,
        statusCode: 200,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch factories";
      return next(new AppError(message, 500));
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factory = await FactoryService.update(getParam(req.params.id), req.body as Record<string, unknown>);
      return res.status(200).json(factory);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update factory";
      return next(new AppError(message, 500));
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const factory = await FactoryService.delete(getParam(req.params.id));
      return res.status(200).json(factory);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete factory";
      return next(new AppError(message, 500));
    }
  }
}

export = FactoryController;
