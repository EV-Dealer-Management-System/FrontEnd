import axios from "axios";
const api = axios.create({
  baseURL: "https://32fecc8e02fd.ngrok-free.app/api",
});

export default api;
