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
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",
        ...options.headers,
      },

      credentials: "include",
    }
  );

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(() => null);

    throw new ApiError(
      response.status,
      data?.error?.code ??
        "REQUEST_FAILED",
      data?.error?.message ??
        "Something went wrong"
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return response.json();
}