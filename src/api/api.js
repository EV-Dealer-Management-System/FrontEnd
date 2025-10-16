import axios from "axios";

const PRODUCTION_BASE_URL = "https://api.electricvehiclesystem.click/api";
const DEVELOPMENT_BASE_URL = "http://localhost:5000/api";

const sanitizeBaseUrl = (url) =>
  typeof url === "string" ? url.trim().replace(/\/+$/, "") : undefined;

const resolveBaseUrl = () => {
  const envUrl = sanitizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return DEVELOPMENT_BASE_URL;
    }

    if (host.endsWith("electricvehiclesystem.click")) {
      return PRODUCTION_BASE_URL;
    }
  }

  return import.meta.env.DEV ? DEVELOPMENT_BASE_URL : PRODUCTION_BASE_URL;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor để tự động thêm JWT token và ngrok header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Thêm header để skip ngrok browser warning
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


// Location API đã được di chuyển sang Address.js

export default api;
