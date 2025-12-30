import axios from "axios";

const getToken = () => localStorage.getItem("accessToken")

const API = axios.create({
    baseURL: /*"http://localhost:4000/api/v1/departments"*/ "https://lms-67ch.onrender.com/api/v1/departments"
})

API.interceptors.request.use((config)=>{
    const token = getToken()
    console.log(token)
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const Departments = ()=> API.get("/");