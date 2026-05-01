import type { NextFunction, Request, Response } from "express";

export const requestContextMiddleware = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  request.operationName = `${request.method} ${request.originalUrl}`;
  next();
};
