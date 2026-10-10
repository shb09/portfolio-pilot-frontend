import axios from "axios";

/* VITE_API_URL is the bare backend origin (no /api suffix — see .env docs).
   Same-origin "/api" in dev (vite proxy); origin + "/api" in production. */
const apiOrigin = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Public backend routes carry their own full paths (/api/…, /portfolio/…),
   so this client needs the bare origin — never the frontend origin. */
export const pub = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_URL || apiOrigin || "",
});

/** Bare backend origin for non-API links (OAuth authorize URL). */
export const backendOrigin = apiOrigin;

export function apiError(err, fallback = "Something went wrong") {
  return err?.response?.data?.error || err?.response?.data?.details || fallback;
}
