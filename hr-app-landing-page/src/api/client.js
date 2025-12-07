import axios from "axios";
import { useAuthStore } from "../store/authStore"; 

const base = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000,
});

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If unauthorized → try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        const res = await axios.post(
          `${base}/api/token/refresh/`,
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
