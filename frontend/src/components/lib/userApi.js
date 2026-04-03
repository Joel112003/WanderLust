import axios from "axios";

const API_URL = import.meta?.env?.VITE_APP_API_URL || "http://localhost:8000";

const userApi = axios.create({
  baseURL: API_URL,
});

export const getAuthToken = () => localStorage.getItem("authToken");

export const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

userApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default userApi;
