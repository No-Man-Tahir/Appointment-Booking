import type {
  Provider,
} from "@/types/provider";

import {
  apiFetch,
} from "./client";


export function getProviders() {
  return apiFetch<{
    providers: Provider[];
  }>(
    "/api/providers"
  );
}


export function getProviderBookedSlots(
  providerId: string,
  date: string
) {
  const timezone =
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone;

  const params =
    new URLSearchParams({
      date,
      timezone,
    });

  return apiFetch<{
    providerId: string;
    date: string;
    bookedSlots: string[];
  }>(
    `/api/providers/${providerId}/booked-slots?${params.toString()}`
  );
}