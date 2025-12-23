<<<<<<< HEAD
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
=======
// hr-app-landing-page/src/api/client.js
>>>>>>> parent of ea4968f7 (Merge pull request #8 from swastikpatro-acdcco/Saketh)
import axios from "axios";

const client = axios.create({
  baseURL: "/api", // <— relative, no localhost, no ports
  timeout: 15000,
});

<<<<<<< HEAD
client.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState()?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // no-op; if Zustand's not ready we simply skip
=======
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message;
    console.error("[API error]", msg);
    return Promise.reject(err);
>>>>>>> parent of ea4968f7 (Merge pull request #8 from swastikpatro-acdcco/Saketh)
  }
);

export default client;
