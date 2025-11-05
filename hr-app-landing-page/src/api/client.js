// hr-app-landing-page/src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL: "/api", // <— relative, no localhost, no ports
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
