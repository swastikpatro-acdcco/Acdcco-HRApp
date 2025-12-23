// hr-app-landing-page/src/api/client.js
import axios from "axios";
import { useAuthStore } from "../store/authStore"; 

const base = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message;
    console.error("[API error]", msg);
    return Promise.reject(err);
  }
);

export default client;
