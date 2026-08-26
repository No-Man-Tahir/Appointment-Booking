import {
  randomUUID,
} from "node:crypto";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  recordRequestEvent,
} from "../services/analytics.service.js";


function shouldTrackRequest(
  req: Request
) {
  /*
   * Docker calls /api/health repeatedly.
   * We don't want health checks filling
   * the analytics table.
   */
  return req.path !== "/api/health";
}


export async function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId =
    randomUUID();

  req.requestId =
    requestId;

  res.setHeader(
    "X-Request-Id",
    requestId
  );

  if (!shouldTrackRequest(req)) {
    next();
    return;
  }

  await recordRequestEvent({
    requestId,

    eventType:
      "request_received",

    payload: {
      method:
        req.method,

      path:
        req.originalUrl,
    },
  });


  res.on(
    "finish",
    () => {
      void recordRequestEvent({
        requestId,

        userId:
          req.user?.id ??
          null,

        eventType:
          "response_sent",

        payload: {
          method:
            req.method,

          path:
            req.originalUrl,

          statusCode:
            res.statusCode,
        },
      });
    }
  );


  next();
}