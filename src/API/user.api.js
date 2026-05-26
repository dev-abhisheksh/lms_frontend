import { API } from "./axiosInstance.api.js";

export const registerUser = (data) => API.post("/auth/register", data);
