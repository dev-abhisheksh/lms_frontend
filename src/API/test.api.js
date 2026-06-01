import { API } from "./axiosInstance.api";


// Create a new test
export const createTest = async (courseId, testData) => {
    return await API.post(`/tests/course/${courseId}`, testData);
};

// Get all tests for a course
export const getTestsByCourse = async (courseId) => {
    return await API.get(`/tests/course/${courseId}`);
};

// Update a test
export const updateTest = async (testId, testData) => {
    return await API.put(`/tests/${testId}`, testData);
};

// Delete a test
export const deleteTest = async (testId) => {
    return await API.delete(`/tests/${testId}`);
};

// Toggle publish status
export const togglePublishTest = async (testId) => {
    return await API.patch(`/tests/${testId}/publish`);
};

// Teacher - get submissions for a specific test
export const getTestSubmissions = async (testId) => {
    return await API.get(`/tests/${testId}/submissions`);
};

// Teacher - grade a specific test submission
export const gradeTestSubmission = async (submissionId, gradeData) => {
    return await API.post(`/tests/submission/${submissionId}/grade`, gradeData);
};

// Student APIs
export const getTestById = async (testId) => {
    return await API.get(`/tests/${testId}`);
};

export const submitTest = async (testId, answers) => {
    return await API.post(`/tests/${testId}/submit`, { answers });
};

export const getMyTestSubmissions = async () => {
    return await API.get("/tests/my-submissions");
};
