import React, { useEffect, useState } from "react";
import { getAllCourses, getCoursesByDeptAndYear } from "../API/course.api";
import {
  enrollUserInCourse,
  getAllEnrollmentsForCourse,
  getCourseEnrollmentSummary,
  removeUserFromCourse,
} from "../API/enrollment.api";
import { Departments } from "../API/department.api";
import { getUserById } from "../API/auth.api";

const AdminEnrollments = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  // Form states — teachers only (students are enrolled via Batches page)
  const [enrollFormData, setEnrollFormData] = useState({
    userId: "",
    role: "teacher",
  });
  const [enrolling, setEnrolling] = useState(false);

  // Fetch all courses on component mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [deptRes, courseRes] = await Promise.all([Departments(), getAllCourses()]);
        setDepartments(deptRes.data.departments || []);
        setCourses(courseRes.data.courses || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Fetch enrollments when a course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setEnrollments([]);
      setSummary(null);
      return;
    }

    const fetchEnrollmentData = async () => {
      try {
        setLoading(true);
        const [enrollRes, summaryRes] = await Promise.all([
          getAllEnrollmentsForCourse(selectedCourse._id),
          getCourseEnrollmentSummary(selectedCourse._id),
        ]);

        setEnrollments(enrollRes.data.enrollments || []);
        setSummary(summaryRes.data.summary || null);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
        setError("Failed to load enrollments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentData();
  }, [selectedCourse]);

  // Fetch courses when department/year filters change
  useEffect(() => {
    const fetchFiltered = async () => {
      if (!selectedDept && !selectedYear) return;
      try {
        setLoading(true);
        const deptId = selectedDept?._id;
        const res = await getCoursesByDeptAndYear(deptId, selectedYear);
        setCourses(res.data.courses || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch filtered courses:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, [selectedDept, selectedYear]);

  const handleFetchTeacher = async () => {
    if (!enrollFormData.userId.trim()) return alert("Enter User ID first");
    try {
      const res = await getUserById(enrollFormData.userId.trim());
      const { user, managedCourses } = res.data;
      alert(`${user.fullName} (${user.email}) — Manages ${managedCourses.length} course(s):\n${managedCourses.map(c => c.title).join('\n')}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to fetch teacher');
    }
  }

  // Handle enrollment form submission
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    if (!enrollFormData.userId.trim()) {
      alert("Please enter a User ID");
      return;
    }

    try {
      setEnrolling(true);
      await enrollUserInCourse(selectedCourse._id, {
        userId: enrollFormData.userId.trim(),
        role: enrollFormData.role,
      });

      setSuccessMessage(
        `User enrolled successfully as ${enrollFormData.role}!`
      );
      setEnrollFormData({ userId: "", role: "teacher" });
      setShowEnrollForm(false);

      // Refresh enrollments
      const [enrollRes, summaryRes] = await Promise.all([
        getAllEnrollmentsForCourse(selectedCourse._id),
        getCourseEnrollmentSummary(selectedCourse._id),
      ]);

      setEnrollments(enrollRes.data.enrollments || []);
      setSummary(summaryRes.data.summary || null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to enroll user:", err);
      alert(
        err.response?.data?.message ||
          "Failed to enroll user. Please check the User ID and try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  // Handle removing user from course
  const handleRemoveUser = async (userId, userName) => {
    if (
      !window.confirm(`Are you sure you want to remove ${userName} from this course?`)
    ) {
      return;
    }

    try {
      await removeUserFromCourse(selectedCourse._id, userId);
      setSuccessMessage(`${userName} removed from course successfully!`);

      // Refresh enrollments
      const [enrollRes, summaryRes] = await Promise.all([
        getAllEnrollmentsForCourse(selectedCourse._id),
        getCourseEnrollmentSummary(selectedCourse._id),
      ]);

      setEnrollments(enrollRes.data.enrollments || []);
      setSummary(summaryRes.data.summary || null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to remove user:", err);
      alert(
        err.response?.data?.message || "Failed to remove user. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Teachers to Courses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Assign teachers to courses so they can manage content and view enrolled students.
            Students are enrolled in bulk via the <strong>Batches</strong> page.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        {loading && !selectedCourse ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-sm text-gray-500">Loading courses...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Courses Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Courses ({courses.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {courses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No courses available
                    </div>
                  ) : (
                    courses.map((course) => (
                      <button
                        key={course._id}
                        onClick={() => setSelectedCourse(course)}
                        className={`w-full text-left p-4 transition-colors ${
                          selectedCourse?._id === course._id
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.courseCode}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Enrollments Main Area */}
            <div className="lg:col-span-2">
              {!selectedCourse ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Course
                  </h3>
                  <p className="text-gray-500">
                    Choose a course from the list to manage its enrollments
                  </p>
                </div>
              ) : (
                <>
                  {/* Course Header */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedCourse.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Code: {selectedCourse.courseCode}
                        </p>
                        {selectedCourse.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedCourse.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowEnrollForm(!showEnrollForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        {showEnrollForm ? "Cancel" : "Assign Teacher"}
                      </button>
                    </div>
                  </div>

                  {/* Enrollment Form */}
                  {showEnrollForm && (
                    <form
                      onSubmit={handleEnrollSubmit}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Assign a Teacher
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Paste the teacher's User ID. Find it on the{" "}
                        <a
                          href="/admin/users"
                          className="text-blue-600 hover:text-blue-900 font-medium underline"
                        >
                          Users
                        </a>{" "}
                        page. Only users with the <strong>teacher</strong> role can be assigned here.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="col-span-1 sm:col-span-1">
                          <select
                            value={selectedDept?._id || ""}
                            onChange={(e) => setSelectedDept(departments.find(d => d._id === e.target.value) || null)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Department</option>
                            {departments.map(d => (
                              <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1 sm:col-span-1">
                          <select
                            value={selectedYear || ""}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Year</option>
                            <option value="FY">FY</option>
                            <option value="SY">SY</option>
                            <option value="TY">TY</option>
                          </select>
                        </div>

                        <div className="col-span-1 sm:col-span-1">
                          <input
                            type="text"
                            placeholder="Paste full User ID (MongoDB ID)"
                            value={enrollFormData.userId}
                            onChange={(e) =>
                              setEnrollFormData({
                                ...enrollFormData,
                                userId: e.target.value,
                              })
                            }
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm w-full"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-1">
                          <div className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600 font-medium">
                            Role: Teacher
                          </div>
                        </div>

                        <div className="col-span-1 sm:col-span-1 flex gap-2">
                          <button
                            type="button"
                            onClick={handleFetchTeacher}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Fetch Teacher
                          </button>
                          <button
                            type="submit"
                            disabled={enrolling}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {enrolling ? "Assigning..." : "Assign Teacher"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">ℹ️ Note:</span> Only users with the global <strong>teacher</strong> role can be assigned. User ID is a 24-character MongoDB ID. Example: <code className="bg-blue-100 px-1 rounded">507f1f77bcf86cd799439011</code>
                        </p>
                      </div>
                    </form>
                  )}

                  {/* Summary Statistics */}
                  {summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {summary.total}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-blue-600">
                          {summary.students}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Students</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-green-600">
                          {summary.teachers}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Teachers</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-purple-600">
                          {summary.managers}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Managers</p>
                      </div>
                    </div>
                  )}

                  {/* Enrollments List */}
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-3 text-sm text-gray-500">
                          Loading enrollments...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Global Role
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Course Role
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {enrollments.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-8 text-center">
                                  <p className="text-gray-500">
                                    No enrollments yet. Enroll your first user!
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              enrollments.map((enrollment) => (
                                <tr
                                  key={enrollment._id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {enrollment.user.fullName}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                      {enrollment.user.email}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                      {enrollment.user.role}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        enrollment.role === "teacher"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {enrollment.role}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                      onClick={() =>
                                        handleRemoveUser(
                                          enrollment.user._id,
                                          enrollment.user.fullName
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900 font-medium text-sm"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-gray-200">
                        {enrollments.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-gray-500">
                              No enrollments yet. Enroll your first user!
                            </p>
                          </div>
                        ) : (
                          enrollments.map((enrollment) => (
                            <div
                              key={enrollment._id}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-gray-900">
                                    {enrollment.user.fullName}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {enrollment.user.email}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    enrollment.role === "teacher"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {enrollment.role}
                                </span>
                              </div>

                              <div className="text-xs text-gray-600 mb-3">
                                Global Role:{" "}
                                <span className="font-medium">
                                  {enrollment.user.role}
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  handleRemoveUser(
                                    enrollment.user._id,
                                    enrollment.user.fullName
                                  )
                                }
                                className="w-full text-sm text-red-600 hover:text-red-900 font-medium py-2 px-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;