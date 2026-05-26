import { API } from "./axiosInstance.api.js";

export const loginUser = (data) => API.post("/auth/login", data)
export const getCurrentUser = () => API.get("/auth/me")
export const logoutUser = () => API.patch("/auth/logout")