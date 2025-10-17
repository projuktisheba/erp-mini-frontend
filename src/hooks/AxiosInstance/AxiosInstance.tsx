// api/axiosInstance.ts
import axios from "axios";

export const API_URL = "http://localhost:8080/api/v1";
// export const API_URL = "https://api.erp.pssoft.xyz/api/v1";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor to handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirect to login or clear token.");
      localStorage.removeItem("token");
      // Redirect to login page here if using React Router
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
