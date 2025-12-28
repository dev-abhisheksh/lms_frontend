import axios from "axios";

const getToken = () => localStorage.getItem("accessToken")

const API = axios.create({
    baseURL: /*"http://localhost:4000/api/v1/auth"*/ "https://lms-67ch.onrender.com/api/courses"
})

API.interceptors.request.use((config) => {
    const token = getToken()
    // console.log("Token check:", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const myCourses = () => API.get("/my-courses")
export const getCourseById = (courseID) => API.get(`/course/${courseID}`)