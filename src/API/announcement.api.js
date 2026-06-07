import { API } from "./axiosInstance.api";

export const getCourseAnnouncements = async (courseId) => {
    const response = await API.get(`/announcements/course/${courseId}`);
    return response.data;
};

export const createAnnouncement = async (courseId, formData) => {
    const response = await API.post(`/announcements/course/${courseId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await API.delete(`/announcements/${id}`);
    return response.data;
};
