import axios from 'axios';

const API_BASE = 'https://api.erp.pssoft.xyz/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-Branch-ID': '1'
  },
});

export default axiosInstance;