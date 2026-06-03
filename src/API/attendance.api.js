import { API } from "./axiosInstance.api";

export const markAttendance = async (attendanceData) => {
    try {
        const response = await API.post("/attendance/mark", attendanceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAttendanceByDate = async (courseId, date) => {
    try {
        const response = await API.get(`/attendance/course/${courseId}`, {
            params: { date }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCourseAttendanceReport = async (courseId) => {
    try {
        const response = await API.get(`/attendance/report/${courseId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyAttendance = async (courseId) => {
    try {
        const response = await API.get(`/attendance/my-attendance/${courseId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
