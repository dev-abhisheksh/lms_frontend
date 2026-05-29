import { API } from "./axiosInstance.api.js";

// Create a new submission (supports multipart/form-data)
export const createSubmission = (assignmentId, formData) =>
  API.post(`/submissions/create/${assignmentId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Fetch all submissions for an assignment
export const getAllSubmissions = (assignmentId) =>
  API.get(`/submissions/submissions/${assignmentId}`);

// Grade a student's submission
export const gradeSubmission = (submissionId, grade, feedback) =>
  API.post(`/submissions/grade/${submissionId}`, { grade, feedback });

// Get status status details (all enrolled students and their submissions) for an assignment
export const getSubmissionStatusForAssignment = (assignmentId) =>
  API.get(`/submissions/submission-status/${assignmentId}`);

// Get a single submission details
export const getSingleSubmission = (submissionId) =>
  API.get(`/submissions/submission/${submissionId}`);

// Update a submission (supports multipart/form-data)
export const updateSubmission = (submissionId, formData) =>
  API.patch(`/submissions/update/${submissionId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete a submission
export const deleteSubmission = (submissionId) =>
  API.patch(`/submissions/delete/${submissionId}`);

// Get current student's submissions
export const mySubmissions = () =>
  API.get(`/submissions/my-submissions`);
