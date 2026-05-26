import { API } from "./axiosInstance.api.js";

/** Fetch all batches (grouped by dept + cohortYear + year) */
export const getBatches = async () => {
  const response = await API.get(`/auth/batches`);
  return response.data;
};

/**
 * Promote a specific cohort batch to the next academic year.
 * Also removes old-year course enrollments on the backend.
 */
export const updateBatchYear = async (departmentId, cohortYear, currentYear, newYear) => {
  const response = await API.patch(`/auth/batches/update-year`, {
    departmentId,
    cohortYear,
    currentYear,
    newYear,
  });
  return response.data;
};
