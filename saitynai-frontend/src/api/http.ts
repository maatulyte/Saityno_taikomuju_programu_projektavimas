const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type ApiOptions<TBody = unknown> = Omit<RequestInit, "body"> & {
  body?: TBody;
};

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: ApiOptions<TBody> = {}
): Promise<TResponse> {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body:
      options.body === undefined
        ? undefined
        : typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body),
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (data &&
        typeof data === "object" &&
        ("message" in data || "title" in data) &&
        ((data as any).message || (data as any).title)) ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as TResponse;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
