import { API } from "./axiosInstance.api.js";

export const registerUser = (data) => API.post("/auth/register", data)
export const loginUser = (data) => API.post("/auth/login", data)
export const getCurrentUser = () => API.get("/auth/me")
export const logoutUser = () => API.patch("/auth/logout")
export const getAllUsers = (params) => API.get("/auth/all-users", { params })
export const updateUserRole = (userId, data) => API.patch(`/auth/update-role/${userId}`, data)
export const getUserById = (userId) => API.get(`/auth/user/${userId}`)
export const updateProfile = (data) => API.patch("/auth/update-profile", data)
export const changePassword = (data) => API.patch("/auth/change-password", data)