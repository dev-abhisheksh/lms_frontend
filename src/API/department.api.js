import { API } from "./axiosInstance.api.js";

export const Departments         = ()            => API.get("/departments/");
export const getDepartmentById   = (id)          => API.get(`/departments/${id}`);
export const createDepartment    = (data)        => API.post("/departments/create", data);
export const updateDepartment    = (id, data)    => API.patch(`/departments/update/${id}`, data);
export const toggleDepartment    = (id)          => API.get(`/departments/toggle-department/${id}`);
export const assignManager       = (id, managerId) =>
    API.patch(`/departments/assign-manager/${id}`, { managerId });