import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdArrowBack,
  MdAssignment,
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import {
  getAssignmentsByCourse,
  createAssignment,
  deleteAssignment,
  togglePublishAssignment,
} from "../../API/assignment.api";

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxMarks: 100,
    allowLate: true,
    attachments: [],
  });
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Fetch courses taught by the teacher
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await getTeacherCourses();
        setCourses(courses);
        if (courses.length > 0) {
          setSelectedCourse(courses[0]._id);
        }
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };
    loadCourses();
  }, []);

  // Fetch assignments for selected course
  useEffect(() => {
    if (!selectedCourse) return;

    const loadAssignments = async () => {
      setLoading(true);
      try {
        const response = await getAssignmentsByCourse(selectedCourse);
        setAssignments(response.data.assignments || []);
      } catch (error) {
        console.error("Error loading assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, [selectedCourse]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setAttachmentFiles(Array.from(e.target.files));
  };

  // Submit assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("dueDate", formData.dueDate);
    form.append("maxMarks", formData.maxMarks);
    form.append("allowLate", formData.allowLate);

    attachmentFiles.forEach((file) => {
      form.append("attachments", file);
    });

    try {
      await createAssignment(selectedCourse, form);
      alert("Assignment created successfully!");
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        maxMarks: 100,
        allowLate: true,
        attachments: [],
      });
      setAttachmentFiles([]);
      setShowForm(false);

      // Reload assignments
      const response = await getAssignmentsByCourse(selectedCourse);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment: " + error.message);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(assignmentId);
        setAssignments((prev) =>
          prev.filter((a) => a._id !== assignmentId)
        );
        alert("Assignment deleted successfully!");
      } catch (error) {
        console.error("Error deleting assignment:", error);
        alert("Failed to delete assignment");
      }
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (assignmentId) => {
    try {
      await togglePublishAssignment(assignmentId);
      // Reload assignments
      const response = await getAssignmentsByCourse(selectedCourse);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error("Error toggling assignment status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <MdArrowBack className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
              <p className="text-sm text-gray-500">Create and manage course assignments</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <MdAdd className="w-5 h-5" />
            {showForm ? "Cancel" : "New Assignment"}
          </button>
        </div>

        {/* Course Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* Assignment Form */}
        {showForm && selectedCourse && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Assignment</h2>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter assignment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter assignment details and instructions"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="allowLate"
                    checked={formData.allowLate}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Allow late submissions</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {attachmentFiles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {attachmentFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assignments List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              {courses.find((c) => c._id === selectedCourse)?.title || "Assignments"}
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center">
              <MdAssignment className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No assignments yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            assignment.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {assignment.isActive ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {assignment.description?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MdCalendarToday className="w-3.5 h-3.5" />
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdCheckCircle className="w-3.5 h-3.5" />
                          Max: {assignment.maxMarks} marks
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/assignments/${assignment._id}/submissions`
                          )
                        }
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                        title="View submissions"
                      >
                        <MdVisibility className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/assignments/${assignment._id}/edit`
                          )
                        }
                        className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition"
                        title="Edit"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(assignment._id)}
                        className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition"
                        title="Toggle publish status"
                      >
                        {assignment.isActive ? (
                          <MdCheckCircle className="w-4 h-4" />
                        ) : (
                          <MdPending className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                        title="Delete"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherAssignments;
