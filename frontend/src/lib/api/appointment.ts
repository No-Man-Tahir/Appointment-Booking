import type {
  Appointment,
} from "@/types/appointment";

import {
  apiFetch,
} from "./client";

export function getAppointments() {
  return apiFetch<{
    appointments: Appointment[];
  }>("/api/appointments");
}

export function createAppointment(input: {
  providerId: string;
  scheduledAt: string;
  notes?: string;
  duration: number;
}) {
  return apiFetch<{
    appointment: Appointment;
  }>(
    "/api/appointments",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function cancelAppointment(
  id: string
) {
  return apiFetch<{
    appointment: Appointment;
  }>(
    `/api/appointments/${id}/cancel`,
    {
      method: "PATCH",
    }
  );
}