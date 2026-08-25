const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

type ApiOptions = RequestInit & {
  body?: BodyInit | null;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },

      credentials: "include",
    }
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.error?.message ??
        "Something went wrong"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}