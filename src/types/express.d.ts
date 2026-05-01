import type { Request } from "express";

type AuthenticatedUser = {
  id: number;
  userType?: string;
  vendorId?: number | null;
};

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    operationName?: string;
    user?: AuthenticatedUser;
    vendorId?: number | null;
    filePaths?: string[];
    fileNames?: string[];
    descriptions?: string[];
  }
}

export type TypedRequest = Request;
