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
  MdPublish,
  MdUnpublished,
  MdSchedule,
  MdClose,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  togglePublishAssignment,
} from "../../API/assignment.api";

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // tracks which assignment action is loading
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
        const data = response.data.assignments;
        setAssignments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading assignments:", error);
        setAssignments([]);
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

  // Reset form
  const resetForm = () => {
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
    setEditingAssignmentId(null);
  };

  // Submit assignment (create or update)
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
      if (editingAssignmentId) {
        await updateAssignment(editingAssignmentId, form);
      } else {
        await createAssignment(selectedCourse, form);
      }

      resetForm();

      // Reload assignments
      const response = await getAssignmentsByCourse(selectedCourse);
      const data = response.data.assignments;
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error saving assignment:", error);
      alert(
        "Failed to save assignment: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Edit assignment — populate form
  const handleEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment._id);
    let formattedDate = "";
    if (assignment.dueDate) {
      const date = new Date(assignment.dueDate);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      formattedDate = date.toISOString().slice(0, 16);
    }

    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      dueDate: formattedDate,
      maxMarks: assignment.maxMarks || 100,
      allowLate:
        assignment.allowLate !== undefined ? assignment.allowLate : true,
      attachments: [],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete assignment (soft delete)
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        setActionLoading(assignmentId);
        await deleteAssignment(assignmentId);
        setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
      } catch (error) {
        console.error("Error deleting assignment:", error);
        alert(
          "Failed to delete: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (assignmentId) => {
    try {
      setActionLoading(assignmentId);
      const res = await togglePublishAssignment(assignmentId);
      const updated = res.data.assignment;

      // Update local state with the response
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId
            ? {
                ...a,
                isPublished: updated.isPublished,
                publishedAt: updated.publishedAt,
              }
            : a
        )
      );
    } catch (error) {
      console.error("Error toggling assignment status:", error);
      alert(
        "Failed to toggle: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Helpers
  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────── */}
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
              <p className="text-sm text-gray-500">
                Create and manage course assignments
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setEditingAssignmentId(null);
                setFormData({
                  title: "",
                  description: "",
                  dueDate: "",
                  maxMarks: 100,
                  allowLate: true,
                  attachments: [],
                });
                setShowForm(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${
              showForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {showForm ? (
              <>
                <MdClose className="w-5 h-5" /> Cancel
              </>
            ) : (
              <>
                <MdAdd className="w-5 h-5" /> New Assignment
              </>
            )}
          </button>
        </div>

        {/* ── Course Selector ────────────────────────────────── */}
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

        {/* ── Assignment Form ────────────────────────────────── */}
        {showForm && selectedCourse && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingAssignmentId
                ? "Edit Assignment"
                : "Create New Assignment"}
            </h2>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              {/* Title */}
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

              {/* Description */}
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

              {/* Due Date + Max Marks */}
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
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Allow Late Submissions */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowLate"
                    checked={formData.allowLate}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Allow Late Submissions
                  </span>
                  <p className="text-xs text-gray-500">
                    {formData.allowLate
                      ? "Students can submit after the due date"
                      : "Submissions blocked after due date"}
                  </p>
                </div>
              </div>

              {/* Note about publish */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 flex items-center gap-1.5">
                  <MdUnpublished className="w-4 h-4 shrink-0" />
                  Assignments are created as <strong>Draft (Private)</strong>.
                  You can publish them to students after creation.
                </p>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                {attachmentFiles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {attachmentFiles.length} file(s) selected
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                  {editingAssignmentId
                    ? "Update Assignment"
                    : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Assignments List ───────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {courses.find((c) => c._id === selectedCourse)?.title ||
                "Assignments"}
            </h2>
            {!loading && (
              <span className="text-xs text-gray-500">
                {assignments.length} assignment
                {assignments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-10 text-center">
              <MdAssignment className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1 font-medium">
                No assignments yet
              </p>
              <p className="text-xs text-gray-400">
                Create one to get started!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {assignments.map((assignment) => {
                const overdue = isOverdue(assignment.dueDate);
                const isPublished = assignment.isPublished;
                const isLoading = actionLoading === assignment._id;

                return (
                  <div
                    key={assignment._id}
                    className={`p-4 hover:bg-gray-50 transition ${
                      isLoading ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left — Info */}
                      <div className="flex-1 min-w-0">
                        {/* Title + Badges */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {assignment.title}
                          </h3>

                          {/* Publish badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                              isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <MdCheckCircle className="w-3 h-3" /> Published
                              </>
                            ) : (
                              <>
                                <MdPending className="w-3 h-3" /> Draft
                              </>
                            )}
                          </span>

                          {/* Late submissions badge */}
                          {assignment.allowLate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                              <MdSchedule className="w-3 h-3" /> Late OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">
                              <MdSchedule className="w-3 h-3" /> No Late
                            </span>
                          )}

                          {/* Overdue indicator */}
                          {overdue && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {assignment.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}

                        {/* Meta row */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span
                            className={`flex items-center gap-1 ${
                              overdue ? "text-red-500 font-medium" : ""
                            }`}
                          >
                            <MdCalendarToday className="w-3.5 h-3.5" />
                            Due: {formatDate(assignment.dueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MdCheckCircle className="w-3.5 h-3.5" />
                            {assignment.maxMarks} marks
                          </span>
                          {assignment.attachments?.length > 0 && (
                            <span className="text-blue-600">
                              📎 {assignment.attachments.length} file(s)
                            </span>
                          )}
                          {isPublished && assignment.publishedAt && (
                            <span className="text-green-600">
                              Published: {formatDate(assignment.publishedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right — Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* View Submissions */}
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

                        {/* Edit */}
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition"
                          title="Edit assignment"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>

                        {/* Publish / Unpublish toggle */}
                        <button
                          onClick={() => handleTogglePublish(assignment._id)}
                          className={`p-2 rounded-lg transition ${
                            isPublished
                              ? "hover:bg-orange-50 text-orange-600"
                              : "hover:bg-green-50 text-green-600"
                          }`}
                          title={
                            isPublished
                              ? "Unpublish (hide from students)"
                              : "Publish (visible to students)"
                          }
                        >
                          {isPublished ? (
                            <MdUnpublished className="w-4 h-4" />
                          ) : (
                            <MdPublish className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            handleDeleteAssignment(assignment._id)
                          }
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition"
                          title="Delete assignment"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;
