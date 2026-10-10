import axios from "axios";

/* Same-origin in dev (vite proxy) — set VITE_API_URL in production. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Public backend routes live outside /api. Falls back to the API origin
   (not the frontend origin) so production calls reach the backend. */
export const pub = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_API_URL || "",
});

export function apiError(err, fallback = "Something went wrong") {
  return err?.response?.data?.error || err?.response?.data?.details || fallback;
}
