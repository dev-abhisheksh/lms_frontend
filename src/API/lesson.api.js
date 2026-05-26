
import { API } from "./axiosInstance.api.js";

export const allLessons = (moduleID) => API.get(`/lessons/${moduleID}`)