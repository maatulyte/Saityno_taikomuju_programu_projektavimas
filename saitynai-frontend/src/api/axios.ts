import axios from "axios";
import { getAccessToken } from "../storage/tokenStorage";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // refresh cookie
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers?.set("Authorization", `Bearer ${token}`);
  }
  return config;
});
