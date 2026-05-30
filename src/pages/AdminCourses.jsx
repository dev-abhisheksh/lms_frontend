import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllCourses, createCourse, updateCourse, togglePublishCourse } from "../API/course.api";
import { Departments } from "../API/department.api";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseCode: "",
    department: "",
    year: "", // Now generic (e.g., 10 or FY)
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch courses and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, deptsRes] = await Promise.all([
          getAllCourses(),
          Departments(),
        ]);
        setCourses(coursesRes.data.courses || []);
        setDepartments(deptsRes.data.departments || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (create or update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.courseCode.trim() || !formData.department || !formData.year) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse._id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          courseCode: formData.courseCode.trim(),
          department: formData.department,
          year: formData.year,
        });
        setSuccessMessage("Course updated successfully!");
      } else {
        // Create new course
        await createCourse(formData.department, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          courseCode: formData.courseCode.trim(),
          year: formData.year,
        });
        setSuccessMessage("Course created successfully!");
      }

      // Refresh courses
      const res = await getAllCourses();
      setCourses(res.data.courses || []);

      // Reset form
      setFormData({
        title: "",
        description: "",
        courseCode: "",
        department: "",
        year: "FY",
      });
      setEditingCourse(null);
      setShowForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save course:", err);
      toast.error(
        err.response?.data?.message || "Failed to save course. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle editing a course
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      courseCode: course.courseCode,
      department: course.department._id,
      year: course.year || "FY",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      courseCode: "",
      department: "",
      year: "FY",
    });
    setShowForm(false);
  };

  // Handle toggling publish status
  const handleTogglePublish = async (courseId) => {
    try {
      await togglePublishCourse(courseId);
      setSuccessMessage("Course status updated successfully!");

      // Refresh courses
      const res = await getAllCourses();
      setCourses(res.data.courses || []);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update course status:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to update course status. Please try again."
      );
    }
  };

  // Filter and search courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterDept === "all" ||
      (course.department && course.department._id === filterDept);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, edit, and manage all courses
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCourse(null);
              setFormData({
                title: "",
                description: "",
                courseCode: "",
                department: "",
                year: "",
              });
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "+ New Course"}
          </button>
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

        {/* Create/Edit Form */}
        {showForm && (
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingCourse ? "Edit Course" : "Create New Course"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Advanced React Development"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="courseCode"
                  placeholder="e.g., CS301"
                  value={formData.courseCode}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard / Year *
                </label>
                <input
                  type="text"
                  name="year"
                  placeholder="e.g., 10 or FY"
                  value={formData.year}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter course description..."
                value={formData.description}
                onChange={handleFormChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by course name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-sm text-gray-500">Loading courses...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Standard / Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <p className="text-gray-500">No courses found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          {course.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {course.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{course.courseCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {course.department?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {course.year || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              course.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Unpublished"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          <button
                            onClick={() => handleTogglePublish(course._id)}
                            className="text-purple-600 hover:text-purple-900 font-medium"
                          >
                            {course.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
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
              {filteredCourses.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-500">No courses found</p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Code: {course.courseCode}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          course.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-600 mb-3">
                      <span className="font-medium">Department:</span> {course.department?.name || "N/A"}
                    </div>

                    <div className="text-xs text-gray-600 mb-3">
                      <span className="font-medium">Standard / Year:</span>
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {course.year || "N/A"}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        className="flex-1 text-xs font-medium py-2 px-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 text-xs font-medium py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{filteredCourses.length}</span> course(s) found
              {filterDept !== "all" && " in selected department"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
