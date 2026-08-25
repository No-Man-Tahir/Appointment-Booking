import {
  createAppointment,
  findAppointmentByIdAndUser,
  findAppointmentsByUser,
  cancelAppointment,
} from "../repository/appointment.repository";
import { findProviderById } from "../repository/provider.repository";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

type PostgresError = {
  code?: string;
  constraint?: string;
};

const durationMinutes =
  env.APPOINTMENT_DURATION_MINUTES;

export async function bookAppointment(input: {
  userId: string;
  providerId: string;
  scheduledAt: string;
  notes?: string;
}) {
  const scheduledAt = new Date(
    input.scheduledAt
  );

  if (scheduledAt.getTime() <= Date.now()) {
    throw new AppError(
      400,
      "Appointment must be scheduled in the future",
      "INVALID_APPOINTMENT_TIME"
    );
  }

  const provider = await findProviderById(
    input.providerId
  );

  if (!provider) {
    throw new AppError(
      404,
      "Provider not found",
      "PROVIDER_NOT_FOUND"
    );
  }
   const start =
    new Date(input.scheduledAt);

  const end =
    new Date(
      start.getTime() +
        durationMinutes * 60_000
    );

  
  try {
    return  createAppointment({
    userId: input.userId,
    providerId: input.providerId,
    scheduledAt:
      start.toISOString(),
    notes: input.notes,
    endsAt:
      end.toISOString(),
  });
  } catch (error) {
    if (
  error &&
  typeof error === "object" &&
  "code" in error &&
  error.code === "23P01" &&
  "constraint" in error &&
  error.constraint ===
    "appointments_no_provider_overlap"
) {
  throw new AppError(
    409,
    "The provider is already booked during that time",
    "APPOINTMENT_SLOT_UNAVAILABLE"
  );
}
    

    throw error;
  }
}

export async function getUserAppointments(
  userId: string
) {
  return findAppointmentsByUser(userId);
}

export async function getUserAppointment(
  userId: string,
  appointmentId: string
) {
  const appointment =
    await findAppointmentByIdAndUser(
      appointmentId,
      userId
    );

  if (!appointment) {
    throw new AppError(
      404,
      "Appointment not found",
      "APPOINTMENT_NOT_FOUND"
    );
  }

  return appointment;
}

export async function cancelUserAppointment(
  userId: string,
  appointmentId: string
) {
  const appointment =
    await cancelAppointment(
      appointmentId,
      userId
    );

  if (!appointment) {
    throw new AppError(
      404,
      "Active appointment not found",
      "APPOINTMENT_NOT_FOUND"
    );
  }

  return appointment;
}