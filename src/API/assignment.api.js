import { API } from "./axiosInstance.api.js";

// Get all assignments for the current student (across all enrolled courses)
export const getAssignments = () =>
  API.get(`/assignments/student/all`);

// Get all assignments for a specific course
export const getAssignmentsByCourse = (courseId) =>
  API.get(`/assignments/assignments/${courseId}`);

// Get a specific assignment by ID
export const getAssignmentById = (assignmentId) =>
  API.get(`/assignments/assignment/${assignmentId}`);

// Create a new assignment
export const createAssignment = (courseId, formData) =>
  API.post(`/assignments/create/${courseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update an assignment
export const updateAssignment = (assignmentId, formData) =>
  API.patch(`/assignments/update/${assignmentId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Toggle publish/unpublish assignment
export const togglePublishAssignment = (assignmentId) =>
  API.patch(`/assignments/toggle/${assignmentId}`);

// Delete an assignment (soft delete)
export const deleteAssignment = (assignmentId) =>
  API.patch(`/assignments/delete/${assignmentId}`);

// Get assignment summary (submissions summary)
export const getAssignmentSummary = (assignmentId) =>
  API.get(`/assignments/summary/${assignmentId}`);
