export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Appointment = {
  id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  provider_id: string;
  provider_name: string;
  provider_specialty: string | null;
};