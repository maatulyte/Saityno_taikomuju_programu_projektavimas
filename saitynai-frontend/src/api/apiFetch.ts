import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { api } from "./axios";

export type ApiOptions<TBody = unknown> = AxiosRequestConfig & {
  body?: TBody;
};

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: ApiOptions<TBody> = {}
): Promise<TResponse> {
  try {
    const res = await api.request<TResponse>({
      url: path,
      method: options.method ?? "GET",
      headers: options.headers, // axios will handle content-type if you pass JSON
      params: options.params,
      data: options.body,
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const msg =
        (err.response?.data as any)?.message ||
        (err.response?.data as any)?.title ||
        err.message ||
        "Request failed";
      throw new Error(msg);
    }
    throw err as Error;
  }
}
