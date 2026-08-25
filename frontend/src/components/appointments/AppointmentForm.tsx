"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createAppointment,
} from "@/lib/api/appointment";

import {
  getProviders,
} from "@/lib/api/providers";

import type {
  Provider,
} from "@/types/provider";

export function AppointmentForm() {
  const router = useRouter();

  const [
    providers,
    setProviders,
  ] = useState<Provider[]>([]);

  const [
    providerId,
    setProviderId,
  ] = useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [
    loadingProviders,
    setLoadingProviders,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProviders() {
      try {
        const response =
          await getProviders();

        setProviders(
          response.providers
        );

        if (
          response.providers.length > 0
        ) {
          setProviderId(
            response.providers[0].id
          );
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load providers"
        );
      } finally {
        setLoadingProviders(false);
      }
    }

    loadProviders();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !providerId ||
      !date ||
      !time
    ) {
      setError(
        "Provider, date and time are required"
      );

      return;
    }

    setSubmitting(true);

    try {
      const localDate =
        new Date(
          `${date}T${time}`
        );

      if (
        Number.isNaN(
          localDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid appointment date or time"
        );
      }

      await createAppointment({
        providerId,
        scheduledAt:
          localDate.toISOString(),
        notes:
          notes.trim() ||
          undefined,
      });

      router.push(
        "/appointments"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create appointment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProviders) {
    return (
      <p>
        Loading providers...
      </p>
    );
  }

  if (
    providers.length === 0
  ) {
    return (
      <div className="rounded-md border p-4">
        No providers are currently available.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-white p-6"
    >
      <div>
        <label
          htmlFor="provider"
          className="mb-1 block text-sm font-medium"
        >
          Provider
        </label>

        <select
          id="provider"
          value={providerId}
          onChange={(event) =>
            setProviderId(
              event.target.value
            )
          }
          className="w-full rounded-md border px-3 py-2"
        >
          {providers.map(
            (provider) => (
              <option
                key={provider.id}
                value={provider.id}
              >
                {provider.name}
                {provider.specialty
                  ? ` — ${provider.specialty}`
                  : ""}
              </option>
            )
          )}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="mb-1 block text-sm font-medium"
          >
            Date
          </label>

          <input
            id="date"
            type="date"
            value={date}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="time"
            className="mb-1 block text-sm font-medium"
          >
            Time
          </label>

          <input
            id="time"
            type="time"
            value={time}
            onChange={(event) =>
              setTime(
                event.target.value
              )
            }
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-1 block text-sm font-medium"
        >
          Notes
        </label>

        <textarea
          id="notes"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Optional notes"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting
          ? "Booking..."
          : "Book appointment"}
      </button>
    </form>
  );
}