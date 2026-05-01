import { randomUUID } from "crypto";
import type { Request } from "express";
import pinoHttp from "pino-http";

import { logger } from "./logger";

export const httpLogger = pinoHttp({
  logger,
  customProps: (request) => {
    const typedRequest = request as Request;

    return {
      operationName: typedRequest.operationName ?? `${typedRequest.method} ${typedRequest.url}`,
      requestId: typedRequest.requestId,
      userId: typedRequest.user?.id ?? null,
    };
  },
  genReqId: (request, response) => {
    const typedRequest = request as Request;
    const headerValue = typedRequest.headers["x-request-id"];
    const requestId = typeof headerValue === "string" ? headerValue : randomUUID();

    typedRequest.requestId = requestId;
    response.setHeader("x-request-id", requestId);

    return requestId;
  },
});
