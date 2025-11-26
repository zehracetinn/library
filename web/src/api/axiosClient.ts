import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5248/api"

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Login VE Register'da token gönderme!
  if (
    config.url?.includes("/Auth/login") ||
    config.url?.includes("/Auth/register")
  ) {
    return config;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
