import axios from "axios";

const getToken = () => localStorage.getItem("accessToken")

const API = axios.create({
    baseURL: /*"http://localhost:4000/api/v1/auth"*/ "https://lms-67ch.onrender.com/api/v1/auth"
})

API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const loginUser = (data) => API.post("/login", data)
export const getCurrentUser = () => API.get("/me")
export const logoutUser = () => API.patch("/logout")