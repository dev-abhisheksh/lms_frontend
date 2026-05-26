import { API } from "./axiosInstance.api.js";

export const allModules = (courseID) => API.get(`/modules/${courseID}`)
export const getModuleById = (moduleID) => API.get(`/modules/module/${moduleID}`)