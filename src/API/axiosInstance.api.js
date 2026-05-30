import axios from "axios";

const API_BASE_URL = "https://lms-67ch.onrender.com/api/v1";

// https://lms-67ch.onrender.com

const getToken = () => localStorage.getItem("accessToken");

export const API = axios.create({
    baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
