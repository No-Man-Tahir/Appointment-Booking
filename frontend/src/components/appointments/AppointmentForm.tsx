"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createAppointment,
} from "@/lib/api/appointment";

import {
  getProviderBookedSlots,
  getProviders,
} from "@/lib/api/providers";

import type {
  Provider,
} from "@/types/provider";


function generateTimeSlots() {
  const slots: string[] = [];

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {
    for (
      const minute of [0, 30]
    ) {
      const hh =
        String(hour).padStart(
          2,
          "0"
        );

      const mm =
        String(minute).padStart(
          2,
          "0"
        );

      slots.push(
        `${hh}:${mm}`
      );
    }
  }

  return slots;
}


function getTodayLocalDate() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function isPastSlot(
  date: string,
  time: string
) {
  if (!date) {
    return false;
  }

  const slotDate =
    new Date(
      `${date}T${time}:00`
    );

  return (
    slotDate.getTime() <=
    Date.now()
  );
}


export function AppointmentForm() {
  const router =
    useRouter();

  const [
    providers,
    setProviders,
  ] = useState<
    Provider[]
  >([]);

  const [
    providerId,
    setProviderId,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState("");

  const [
    selectedTime,
    setSelectedTime,
  ] = useState("");

  const [
    bookedSlots,
    setBookedSlots,
  ] = useState<
    Set<string>
  >(
    new Set()
  );

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    loadingProviders,
    setLoadingProviders,
  ] = useState(true);

  const [
    loadingSlots,
    setLoadingSlots,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const timeSlots =
    useMemo(
      () =>
        generateTimeSlots(),
      []
    );


  const today =
    useMemo(
      () =>
        getTodayLocalDate(),
      []
    );


  useEffect(() => {
    let cancelled = false;

    async function loadProviders() {
      setLoadingProviders(
        true
      );

      try {
        const response =
          await getProviders();

        if (cancelled) {
          return;
        }

        setProviders(
          response.providers
        );

        if (
          response.providers
            .length > 0
        ) {
          setProviderId(
            response.providers[0]
              .id
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load providers"
        );
      } finally {
        if (!cancelled) {
          setLoadingProviders(
            false
          );
        }
      }
    }

    loadProviders();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    if (
      !providerId ||
      !date
    ) {
      return;
    }

    let cancelled = false;

    async function loadBookedSlots() {
      setLoadingSlots(
        true
      );

      setError("");

      try {
        const response =
          await getProviderBookedSlots(
            providerId,
            date
          );

        if (cancelled) {
          return;
        }

        setBookedSlots(
          new Set(
            response.bookedSlots
          )
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setBookedSlots(
          new Set()
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load booked slots"
        );
      } finally {
        if (!cancelled) {
          setLoadingSlots(
            false
          );
        }
      }
    }

    loadBookedSlots();

    return () => {
      cancelled = true;
    };
  }, [
    providerId,
    date,
  ]);


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!providerId) {
      setError(
        "Please select a provider"
      );

      return;
    }

    if (!date) {
      setError(
        "Please select a date"
      );

      return;
    }

    if (!selectedTime) {
      setError(
        "Please select a time"
      );

      return;
    }


    if (
      bookedSlots.has(
        selectedTime
      )
    ) {
      setError(
        "That time is already booked. Please choose another slot."
      );

      return;
    }


    const appointmentDate =
      new Date(
        `${date}T${selectedTime}:00`
      );


    if (
      appointmentDate.getTime() <=
      Date.now()
    ) {
      setError(
        "Please select a future appointment time"
      );

      return;
    }


    setSubmitting(true);

    try {
      await createAppointment({
        providerId,

        scheduledAt:
          appointmentDate.toISOString(),

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


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div>
        <label
          htmlFor="provider"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Provider
        </label>

        <select
          id="provider"
          value={
            providerId
          }
          onChange={(
            event
          ) => {
            setProviderId(
              event.target.value
            );

            setSelectedTime(
              ""
            );

            setBookedSlots(
              new Set()
            );
          }}
          disabled={
            loadingProviders ||
            submitting
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
        >
          {loadingProviders ? (
            <option value="">
              Loading
              providers...
            </option>
          ) : providers.length ===
            0 ? (
            <option value="">
              No providers
              available
            </option>
          ) : (
            providers.map(
              (provider) => (
                <option
                  key={
                    provider.id
                  }
                  value={
                    provider.id
                  }
                >
                  {provider.name}

                  {provider.specialty
                    ? ` — ${provider.specialty}`
                    : ""}
                </option>
              )
            )
          )}
        </select>
      </div>


      <div>
        <label
          htmlFor="date"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Date
        </label>

        <input
          id="date"
          type="date"
          min={today}
          value={date}
          onChange={(
            event
          ) => {
            setDate(
              event.target.value
            );

            setSelectedTime(
              ""
            );

            setBookedSlots(
              new Set()
            );
          }}
          disabled={
            submitting
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
      </div>


      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">
            Time
          </label>

          <span className="text-xs text-gray-500">
            30 minute
            intervals
          </span>
        </div>


        {!date ? (
          <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Select a date
            first
          </div>
        ) : loadingSlots ? (
          <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Loading
            available slots...
          </div>
        ) : (
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-md border border-gray-200 p-3 sm:grid-cols-4 md:grid-cols-6">
            {timeSlots.map(
              (time) => {
                const past =
                  isPastSlot(
                    date,
                    time
                  );

                const booked =
                  bookedSlots.has(
                    time
                  );

                const disabled =
                  past ||
                  booked;

                const selected =
                  selectedTime ===
                  time;


                return (
                  <button
                    key={
                      time
                    }
                    type="button"
                    disabled={
                      disabled ||
                      submitting
                    }
                    onClick={() =>
                      setSelectedTime(
                        time
                      )
                    }
                    title={
                      booked
                        ? "Already booked"
                        : past
                          ? "Past time"
                          : undefined
                    }
                    className={`rounded-md border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-black bg-black text-white"
                        : disabled
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                          : "border-gray-300 bg-white text-gray-700 hover:border-black hover:bg-gray-50"
                    }`}
                  >
                    {time}
                  </button>
                );
              }
            )}
          </div>
        )}


        {selectedTime && (
          <p className="mt-2 text-sm text-gray-600">
            Selected:{" "}
            <span className="font-medium text-gray-900">
              {
                selectedTime
              }
            </span>
          </p>
        )}


        {date &&
          !loadingSlots && (
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>
                Available
              </span>

              <span>
                Booked slots
                are disabled
              </span>

              {date ===
                today && (
                <span>
                  Past slots
                  are disabled
                </span>
              )}
            </div>
          )}
      </div>


      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Notes
        </label>

        <textarea
          id="notes"
          value={notes}
          onChange={(
            event
          ) =>
            setNotes(
              event.target.value
            )
          }
          maxLength={2000}
          rows={4}
          disabled={
            submitting
          }
          placeholder="Optional notes for the appointment"
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />

        <div className="mt-1 text-right text-xs text-gray-400">
          {notes.length}
          /2000
        </div>
      </div>


      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/appointments"
            )
          }
          disabled={
            submitting
          }
          className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            loadingProviders ||
            loadingSlots ||
            providers.length ===
              0 ||
            !providerId ||
            !date ||
            !selectedTime
          }
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "Booking..."
            : "Book appointment"}
        </button>
      </div>
    </form>
  );
}