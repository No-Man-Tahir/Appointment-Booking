import type {
  Request,
  Response,
} from "express";

import {
  bookAppointment,
  cancelUserAppointment,
  getUserAppointment,
  getUserAppointments,
} from "../services/appointment.service.js";

export async function create(
  req: Request,
  res: Response
) {
  const appointment = await bookAppointment({
    userId: req.user!.id,
    providerId: req.body.providerId,
    scheduledAt: req.body.scheduledAt,
    notes: req.body.notes,
    duration: req.body.duration,
  });

  res.status(201).json({
    appointment,
  });
}

export async function list(
  req: Request,
  res: Response
) {
  const appointments =
    await getUserAppointments(req.user!.id);

  res.status(200).json({
    appointments,
  });
}

export async function getById(
  req: Request<{ id: string }>,
  res: Response
) {
  const appointment =
    await getUserAppointment(
      req.user!.id,
      req.params.id
    );

  res.status(200).json({
    appointment,
  });
}

export async function cancel(
  req: Request<{ id: string }>,
  res: Response
) {
  const appointment =
    await cancelUserAppointment(
      req.user!.id,
      req.params.id
    );

  res.status(200).json({
    appointment,
  });
}