// import axios from "axios";
// import { useAuthStore } from "../store/auth";

// const base = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

// const client = axios.create({
//   baseURL: `${base}/api`,
//   timeout: 15000,
// });

// client.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default client;

// src/api/client.js
import axios from "axios";
import { useAuthStore } from "../store/auth";

const base = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState()?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // no-op; if Zustand's not ready we simply skip
  }
  return config;
});

export default client;
