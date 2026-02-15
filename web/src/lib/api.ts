import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://127.0.0.1:4000");

export const api = axios.create({
  baseURL: BASE,
});
