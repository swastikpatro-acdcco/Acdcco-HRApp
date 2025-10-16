import axios from "axios";

const baseURL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const client = axios.create({
  baseURL,
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
