import type { NextFunction, Request, Response } from "express";

import { navigationCountsEvents } from "./navigation.events";

const TRACKED_PATHS = ["/orders", "/products", "/factories"];
const MUTATION_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);

export const notifyNavigationCountsChanged = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const shouldTrack = MUTATION_METHODS.has(request.method)
    && TRACKED_PATHS.some((path) => request.path === path || request.path.startsWith(`${path}/`));

  if (shouldTrack) {
    response.once("finish", () => {
      if (response.statusCode >= 200 && response.statusCode < 400) {
        navigationCountsEvents.emit("changed");
      }
    });
  }

  next();
};
