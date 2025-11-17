// src/services/api.js
import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: "http://localhost:8080", // your Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: attach token (if present)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Optional response interceptor: if backend returns 401/403, you can auto-logout
api.interceptors.response.use(
  response => response,
  error => {
    // If unauthorized, you might want to clear token and redirect to login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // keep it simple for now: don't auto-redirect, but you can:
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
