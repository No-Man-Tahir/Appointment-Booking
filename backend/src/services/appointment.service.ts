import {
  createAppointment,
  findAppointmentByIdAndUser,
  findAppointmentsByUser,
  cancelAppointment,
} from "../repository/appointment.repository";
import { findProviderById } from "../repository/provider.repository";
import { AppError } from "../utils/AppError.js";

type PostgresError = {
  code?: string;
  constraint?: string;
};

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

  try {
    return await createAppointment(input);
  } catch (error) {
    const dbError = error as PostgresError;

    if (
      dbError.code === "23505" &&
      dbError.constraint ===
        "uq_appointments_provider_active_slot"
    ) {
      throw new AppError(
        409,
        "The provider is already booked for this time",
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