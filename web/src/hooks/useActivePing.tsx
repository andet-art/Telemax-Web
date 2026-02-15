// src/hooks/useActivityPing.tsx
import { useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://209.38.231.125:4000";

export default function useActivityPing() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !API) return;

    const headers = { Authorization: `Bearer ${token}` };

    const ping = async () => {
      try {
        // Using /api/me (exists on your backend) as a lightweight auth-protected ping
        await axios.get(`${API}/api/me`, { headers, timeout: 5000 });
      } catch (err: any) {
        // If token is invalid/expired, clean up local auth
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          console.error("Ping failed:", err?.message || err);
        }
      }
    };

    ping(); // immediate
    const interval = setInterval(ping, 2 * 60 * 1000); // every 2 minutes
    return () => clearInterval(interval);
  }, []);
}
