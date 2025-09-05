import axios from "axios";
const api = axios.create({
  baseURL: "https://74fa78739c29.ngrok-free.app/api",
});

export default api;
