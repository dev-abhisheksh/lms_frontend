import { API } from "./axiosInstance.api.js";

export const getAllCourses = () => API.get("/courses/");
export const myCourses = () => API.get("/courses/my-courses")
export const getCourseById = (courseID) => API.get(`/courses/course/${courseID}`)