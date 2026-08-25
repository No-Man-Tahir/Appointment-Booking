import Link from "next/link";

import {
  AppointmentForm,
} from "@/components/appointments/AppointmentForm";

import {
  RequireAuth,
} from "@/components/auth/RequireAuth";

import {
  Navbar,
} from "@/components/layout/Navbar";

export default function NewAppointmentPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-8">
          <Link
            href="/appointments"
            className="text-sm text-gray-500 underline"
          >
            Back to appointments
          </Link>

          <div className="mt-6">
            <h1 className="text-2xl font-semibold">
              Book Appointment
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Choose a provider and preferred appointment time.
            </p>
          </div>

          <div className="mt-6">
            <AppointmentForm />
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}