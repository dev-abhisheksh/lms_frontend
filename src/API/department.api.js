import { API } from "./axiosInstance.api.js";

export const Departments = ()=> API.get("/departments/");