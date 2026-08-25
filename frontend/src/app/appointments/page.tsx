import Link from "next/link";

import {
	AppointmentList,
} from "@/components/appointments/AppointmentList";

import {
	RequireAuth,
} from "@/components/auth/RequireAuth";

import {
	Navbar,
} from "@/components/layout/Navbar";

export default function AppointmentsPage() {
	return (
		<RequireAuth>
			<div className="min-h-screen bg-gray-50">
				<Navbar />

				<main className="mx-auto max-w-3xl px-6 py-8">
					<div className="flex items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold">
								My Appointments
							</h1>

							<p className="mt-1 text-sm text-gray-500">
								View and manage your upcoming appointments.
							</p>
						</div>

						<Link
							href="/appointments/new"
							className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
						>
							Book appointment
						</Link>
					</div>

					<div className="mt-6">
						<AppointmentList />
					</div>
				</main>
			</div>
		</RequireAuth>
	);
}
