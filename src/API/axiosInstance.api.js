import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";

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
