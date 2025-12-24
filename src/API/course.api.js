import axios from "axios";

const getToken = () => localStorage.getItem("accessToken")

const API = axios.create({
    baseURL: "http://localhost:4000/api/v1/courses"
})

API.interceptors.request.use((config) => {
    const token = getToken()
    console.log("Token:", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const allCourses = () => API.get("/my-courses")