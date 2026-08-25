import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncRequestHandler<Params extends ParamsDictionary> = (
  req: Request<Params>,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler<Params extends ParamsDictionary>(
  handler: AsyncRequestHandler<Params>
): RequestHandler<Params> {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}