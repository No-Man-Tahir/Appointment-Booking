import type {
  Provider,
} from "@/types/provider";

import {
  apiFetch,
} from "./client";

export function getProviders() {
  return apiFetch<{
    providers: Provider[];
  }>("/api/providers");
}