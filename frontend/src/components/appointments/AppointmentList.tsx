"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  cancelAppointment,
  getAppointments,
} from "@/lib/api/appointment";

import type {
  Appointment,
} from "@/types/appointment";

import {
  AppointmentCard,
} from "./AppointmentCard";

export function AppointmentList() {
  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null);

  const loadAppointments =
    useCallback(async () => {
      try {
        const response =
          await getAppointments();

        setAppointments(
          response.appointments
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleCancel(
    appointmentId: string
  ) {
    setCancellingId(
      appointmentId
    );

    setError("");

    try {
      await cancelAppointment(
        appointmentId
      );

      await loadAppointments();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel appointment"
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <p>
        Loading appointments...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="font-medium">
          No appointments yet
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Book your first appointment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map(
        (appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            cancelling={
              cancellingId ===
              appointment.id
            }
            onCancel={
              handleCancel
            }
          />
        )
      )}
    </div>
  );
}