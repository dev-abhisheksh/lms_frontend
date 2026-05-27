import { API } from "./axiosInstance.api.js";

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
