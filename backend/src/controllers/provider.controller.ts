import type {
  Request,
  Response,
} from "express";

import {
  getProviderBookedSlots,
} from "../services/provider-booked-slots.service.js";

import {
  getProviders,
} from "../services/provider.service.js";


export async function listProviders(
  _req: Request,
  res: Response
) {
  const providers =
    await getProviders();

  res.status(200).json({
    providers,
  });
}


export async function listProviderBookedSlots(
  req: Request,
  res: Response
) {
  const result =
    await getProviderBookedSlots({
      providerId:
        String(req.params.id),

      date:
        req.query.date as string,

      timezone:
        req.query.timezone as string,
    });

  res.status(200).json(
    result
  );
}