import { API } from "./axiosInstance.api.js";

export const getBatches = async () => {
  try {
    const response = await API.get(`/auth/batches`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBatchYear = async (departmentId, currentYear, newYear) => {
  try {
    const response = await API.patch(`/auth/batches/update-year`, {
      departmentId,
      currentYear,
      newYear,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
