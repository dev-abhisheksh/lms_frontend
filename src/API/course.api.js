import { API } from "./axiosInstance.api.js";

export const getAllCourses = (params = {}) => API.get("/courses/", { params });
export const myCourses = () => API.get("/courses/my-courses");
export const getCourseById = (courseID) => API.get(`/courses/course/${courseID}`);

/**
 * Fetch teacher's courses and normalize the enrollment wrapper.
 * The backend returns { courses: [{ _id: enrollId, course: {...}, role, enrolledAt }] }
 * This helper unwraps each enrollment and returns plain course objects:
 * { _id, title, courseCode, department, isPublished, year, description, enrolledAt }
 */
export const getTeacherCourses = async () => {
  const res = await API.get("/courses/my-courses");
  const enrollments = res.data.courses || [];
  const courses = enrollments
    .filter((en) => en.course) // guard against null-populated course
    .map((en) => ({
      _id: en.course._id,
      title: en.course.title,
      courseCode: en.course.courseCode,
      department: en.course.department,
      isPublished: en.course.isPublished,
      year: en.course.year,
      description: en.course.description,
      thumbnail: en.course.thumbnail,
      enrolledAt: en.enrolledAt,
      enrollmentRole: en.role,
    }));
  return courses;
};

/** Fetch courses filtered by department and academic year (for batch assignment) */
export const getCoursesByDeptAndYear = (departmentId, year) =>
  API.get(`/courses/`, { params: { departmentId, year } });

// Create a new course
export const createCourse = (departmentId, data) =>
  API.post(`/courses/create/${departmentId}`, data);

// Update a course
export const updateCourse = (courseId, data) =>
  API.patch(`/courses/update/${courseId}`, data);

// Toggle course publish status
export const togglePublishCourse = (courseId) =>
  API.patch(`/courses/publish/${courseId}`);

/** Bulk-enroll an entire batch into selected courses */
export const batchEnrollCourses = (departmentId, cohortYear, courseIds) =>
  API.post(`/enrollments/batch-enroll`, { departmentId, cohortYear, courseIds });
