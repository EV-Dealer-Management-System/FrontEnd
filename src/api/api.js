import axios from "axios";

const api = axios.create({
  baseURL:  'https://3509f5e8b17b.ngrok-free.app/api',
  headers: {
    'Content-Type': 'application/json',
     'ngrok-skip-browser-warning': 'true', // ✅  Bỏ qua cảnh báo trình duyệt
  },
  timeout: 60000, 
});
api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default api;
