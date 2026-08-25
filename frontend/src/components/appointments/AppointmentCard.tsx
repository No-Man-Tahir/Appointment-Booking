"use client";

import type {
  Appointment,
} from "@/types/appointment";

type Props = {
  appointment: Appointment;
  cancelling: boolean;
  onCancel: (
    appointmentId: string
  ) => Promise<void>;
};

export function AppointmentCard({
  appointment,
  cancelling,
  onCancel,
}: Props) {
  const appointmentDate =
    new Date(
      appointment.scheduled_at
    );

  const canCancel =
    appointment.status === "pending" ||
    appointment.status === "confirmed";

  return (
    <article className="rounded-lg border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">
            {appointment.provider_name}
          </h2>

          {appointment.provider_specialty && (
            <p className="text-sm text-gray-500">
              {
                appointment.provider_specialty
              }
            </p>
          )}
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
          {appointment.status}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p>
          {appointmentDate.toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
        </p>

        <p>
          {appointmentDate.toLocaleTimeString(
            undefined,
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </p>

        {appointment.notes && (
          <p className="pt-2 text-gray-600">
            {appointment.notes}
          </p>
        )}
      </div>

      {canCancel && (
        <button
          type="button"
          disabled={cancelling}
          onClick={() =>
            onCancel(
              appointment.id
            )
          }
          className="mt-4 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
        >
          {cancelling
            ? "Cancelling..."
            : "Cancel appointment"}
        </button>
      )}
    </article>
  );
}