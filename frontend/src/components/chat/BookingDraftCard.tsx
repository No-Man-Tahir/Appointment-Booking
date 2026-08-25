import Link from "next/link";

import type {
  BookingDraft,
  BookedAppointment,
} from "@/types/chat";


type Props = {
  booking:
    BookingDraft | null;

  appointment:
    BookedAppointment | null;

  fallbackToForm:
    boolean;
};


export function BookingDraftCard({
  booking,
  appointment,
  fallbackToForm,
}: Props) {
  if (
    !booking &&
    !appointment
  ) {
    return null;
  }

  if (appointment) {
    return (
      <div className="mx-5 mb-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          Appointment booked
        </p>

        <p className="mt-1 text-xs text-green-700">
          Status:{" "}
          {appointment.status}
        </p>

        <Link
          href="/appointments"
          className="mt-3 inline-block text-sm font-medium text-green-800 underline"
        >
          View appointments
        </Link>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const hasInformation =
    booking.providerName ||
    booking.date ||
    booking.time;

  if (!hasInformation) {
    return null;
  }

  return (
    <div className="mx-5 mb-3 rounded-lg border bg-white p-4">
      <p className="text-sm font-medium">
        Booking details
      </p>

      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <p>
          Provider:{" "}
          {booking.providerName ??
            "Not selected"}
        </p>

        <p>
          Date:{" "}
          {booking.date ??
            "Not selected"}
        </p>

        <p>
          Time:{" "}
          {booking.time ??
            "Not selected"}
        </p>
      </div>

      {booking.missingFields
        .length > 0 && (
        <p className="mt-3 text-xs text-amber-700">
          Still needed:{" "}
          {booking.missingFields.join(
            ", "
          )}
        </p>
      )}

      {fallbackToForm && (
        <Link
          href="/appointments/new"
          className="mt-3 inline-block text-sm font-medium underline"
        >
          Use booking form instead
        </Link>
      )}
    </div>
  );
}