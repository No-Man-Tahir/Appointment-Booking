import {
  DateTime,
} from "luxon";

import {
  findProviderBookedAppointmentsForDay,
} from "../repository/appointment.repository.js";

import {
  findProviderById,
} from "../repository/provider.repository.js";

import {
  AppError,
} from "../utils/AppError.js";
import { env } from "../config/env.js";

const durationMinutes =
  env.APPOINTMENT_DURATION_MINUTES;


function normalizeTimezone(
  timezone: string
) {
  const now =
    DateTime.now().setZone(
      timezone
    );

  if (!now.isValid) {
    throw new AppError(
      400,
      "Invalid timezone",
      "INVALID_TIMEZONE"
    );
  }

  return timezone;
}


export async function getProviderBookedSlots(
  input: {
    providerId: string;
    date: string;
    timezone: string;
  }
) {
  const provider =
    await findProviderById(
      input.providerId
    );

  if (!provider) {
    throw new AppError(
      404,
      "Provider not found",
      "PROVIDER_NOT_FOUND"
    );
  }

  const timezone =
    normalizeTimezone(
      input.timezone
    );

  const startOfDay =
    DateTime.fromISO(
      input.date,
      {
        zone: timezone,
      }
    ).startOf("day");

  if (!startOfDay.isValid) {
    throw new AppError(
      400,
      "Invalid date",
      "INVALID_DATE"
    );
  }

  const endOfDay =
    startOfDay.plus({
      days: 1,
    });

  const appointments =
    await findProviderBookedAppointmentsForDay(
      input.providerId,

      startOfDay
        .toUTC()
        .toJSDate(),

      endOfDay
        .toUTC()
        .toJSDate()
    );

  const bookedSlots: string[] =
    [];

  let slotStart =
    startOfDay;

  while (
    slotStart.toMillis() <
    endOfDay.toMillis()
  ) {
    const slotEnd =
      slotStart.plus({
        minutes:
          durationMinutes,
      });

    const slotStartMs =
      slotStart
        .toUTC()
        .toMillis();

    const slotEndMs =
      slotEnd
        .toUTC()
        .toMillis();

    const overlaps =
      appointments.some(
        (appointment) => {
          const existingStart =
            DateTime.fromJSDate(
              appointment.scheduled_at
            ).toMillis();

          const existingEnd =
            existingStart +
            appointment.duration *
              60_000;

          return (
            slotStartMs <
              existingEnd &&
            slotEndMs >
              existingStart
          );
        }
      );

    if (overlaps) {
      bookedSlots.push(
        slotStart.toFormat(
          "HH:mm"
        )
      );
    }

    slotStart =
      slotStart.plus({
        minutes:
          durationMinutes,
      });
  }

  return {
    providerId:
      input.providerId,

    date:
      input.date,

    durationMinutes:
      durationMinutes,

    bookedSlots,
  };
}