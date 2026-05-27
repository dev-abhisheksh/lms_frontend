import { API } from "./axiosInstance.api";

export const createNote = async (courseId, formData) => {
    return await API.post(`/notes/course/${courseId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getNotesByCourse = async (courseId) => {
    return await API.get(`/notes/course/${courseId}`);
};

export const updateNote = async (noteId, formData) => {
    return await API.put(`/notes/${noteId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteNote = async (noteId) => {
    return await API.delete(`/notes/${noteId}`);
};

export const togglePublishNote = async (noteId) => {
    return await API.patch(`/notes/${noteId}/publish`);
};
