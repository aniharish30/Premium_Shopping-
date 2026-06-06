import axios from "axios";

// works locally via Vite proxy, works on Vercel via env variable
const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 35000,
});

// attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopverse_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      // network error — Render cold start
      return Promise.reject({
        response: { data: { message: "Server is starting up, please wait a moment and try again…" } },
      });
    }
    if (err.response.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("shopverse_token");
      localStorage.removeItem("shopverse_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
