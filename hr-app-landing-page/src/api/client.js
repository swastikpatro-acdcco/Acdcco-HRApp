import axios from "axios";
import { useAuthStore } from "../store/authStore";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: refreshToken }
        );

        useAuthStore.getState().setAccessToken(res.data.access);

        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        return client(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed → logging out");
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default client;
