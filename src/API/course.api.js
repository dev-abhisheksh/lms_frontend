import { API } from "./axiosInstance.api.js";

export const getAllCourses = () => API.get("/courses/");
export const myCourses = () => API.get("/courses/my-courses")
export const getCourseById = (courseID) => API.get(`/courses/course/${courseID}`);

// Create a new course
export const createCourse = (departmentId, data) => 
    API.post(`/courses/create/${departmentId}`, data);

// Update a course
export const updateCourse = (courseId, data) => 
    API.patch(`/courses/update/${courseId}`, data);

// Toggle course publish status
export const togglePublishCourse = (courseId) => 
    API.patch(`/courses/publish/${courseId}`);