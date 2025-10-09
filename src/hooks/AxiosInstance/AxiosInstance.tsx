import axios from "axios";

// export const API_URL = "https://api.erp.pssoft.xyz/api/v1";

export const API_URL = "http://localhost:8080/api/v1";
const token = localStorage.getItem("token") || ""
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
});

export default axiosInstance;
