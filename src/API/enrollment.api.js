import { API } from "./axiosInstance.api.js";

// Enroll a user in a course
export const enrollUserInCourse = (courseId, data) => 
    API.post(`/enrollments/new/${courseId}`, data);

// Get all enrollments for a course
export const getAllEnrollmentsForCourse = (courseId) => 
    API.get(`/enrollments/participants/${courseId}`);

// Get enrollment summary for a course
export const getCourseEnrollmentSummary = (courseId) => 
    API.get(`/enrollments/summary/${courseId}`);

// Remove user from course
export const removeUserFromCourse = (courseId, userId) => 
    API.delete(`/enrollments/remove/${courseId}`, { data: { userId } });

// Get my enrollments
export const getMyEnrollments = () => 
    API.get("/enrollments/my-enrollments");
