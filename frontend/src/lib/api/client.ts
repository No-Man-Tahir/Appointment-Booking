const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);

    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response =
    await fetch(
      `${path}`,
      {
        ...options,

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",

          ...options.headers,
        },
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Request failed"
    );
  }

  return data;
}