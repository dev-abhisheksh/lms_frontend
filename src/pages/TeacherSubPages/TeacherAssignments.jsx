import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdDelete,
  MdArrowBack,
  MdAssignment,
  MdCalendarToday,
  MdCheckCircle,
  MdSchedule,
  MdClose,
} from "react-icons/md";

import {
  Eye,
  Pencil,
  Trash2,
  Send,
  EyeOff,
  Clock3,
  Plus,
} from "lucide-react";

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
  const [actionLoading, setActionLoading] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxMarks: 100,
    allowLate: true,
    attachments: [],
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // ─────────────────────────────────────────────
  // Fetch Courses
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Fetch Assignments
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Form Handlers
  // ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setAttachmentFiles(Array.from(e.target.files));
  };

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

  // ─────────────────────────────────────────────
  // Submit Assignment
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Edit
  // ─────────────────────────────────────────────
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      setActionLoading(assignmentId);

      await deleteAssignment(assignmentId);

      setAssignments((prev) =>
        prev.filter((a) => a._id !== assignmentId)
      );
    } catch (error) {
      console.error("Error deleting assignment:", error);

      alert(
        "Failed to delete: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ─────────────────────────────────────────────
  // Publish Toggle
  // ─────────────────────────────────────────────
  const handleTogglePublish = async (assignmentId) => {
    try {
      setActionLoading(assignmentId);

      const res = await togglePublishAssignment(assignmentId);

      const updated = res.data.assignment;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/teacher")}
              className="w-11 h-11 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center transition-all hover:-translate-y-0.5"
            >
              <MdArrowBack className="w-5 h-5 text-gray-700" />
            </button>

            <div className="w-14 h-14 rounded-3xl bg-purple-100 flex items-center justify-center shadow-sm">
              <MdAssignment className="w-7 h-7 text-purple-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Assignments
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Create and manage assignments professionally
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
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${showForm
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200"
              }`}
          >
            {showForm ? (
              <>
                <MdClose className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                New Assignment
              </>
            )}
          </button>
        </div>

        {/* COURSE SELECTOR */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/70 shadow-lg shadow-gray-100/50 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Course
          </label>

          <select
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all"
          >
            <option value="">-- Select a course --</option>

            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* FORM */}
        {showForm && selectedCourse && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/70 shadow-xl shadow-purple-100/20 p-8">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAssignmentId
                ? "Edit Assignment"
                : "Create Assignment"}
            </h2>

            <form
              onSubmit={handleSubmitAssignment}
              className="space-y-5"
            >

              {/* TITLE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter assignment title"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:bg-white transition-all"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  rows="5"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write assignment instructions..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:bg-white transition-all"
                />
              </div>

              {/* DATE + MARKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date
                  </label>

                  <input
                    type="datetime-local"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Marks
                  </label>

                  <input
                    type="number"
                    name="maxMarks"
                    min="1"
                    required
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* ALLOW LATE */}
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-200 rounded-2xl p-4">

                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Allow Late Submission
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Students can submit after due date
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowLate"
                    checked={formData.allowLate}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />

                  <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-6"></div>
                </label>
              </div>

              {/* FILE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachments
                </label>

                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm"
                />

                {attachmentFiles.length > 0 && (
                  <p className="text-xs text-purple-600 mt-2 font-medium">
                    {attachmentFiles.length} file(s) selected
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-medium hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all"
                >
                  {editingAssignmentId
                    ? "Update Assignment"
                    : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ASSIGNMENT LIST */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/70 overflow-hidden shadow-xl shadow-gray-100/40">

          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-purple-50/40">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {courses.find((c) => c._id === selectedCourse)?.title ||
                  "Assignments"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage all assignments efficiently
              </p>
            </div>

            {!loading && (
              <div className="px-4 py-2 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold">
                {assignments.length} Assignment
                {assignments.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-gray-100 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : assignments.length === 0 ? (

            <div className="p-16 text-center">

              <div className="w-24 h-24 rounded-3xl bg-purple-50 flex items-center justify-center mx-auto mb-5">
                <MdAssignment className="w-12 h-12 text-purple-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No assignments yet
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Create your first assignment to get started
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
                    className={`group p-6 transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/40 hover:border-l-4 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-100/20 ${isLoading
                      ? "opacity-60 pointer-events-none"
                      : ""
                      }`}
                  >

                    <div className="flex items-start justify-between gap-6">

                      {/* LEFT */}
                      <div className="flex-1 min-w-0">

                        {/* TITLE */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">

                          <h3 className="text-lg font-semibold text-gray-900">
                            {assignment.title}
                          </h3>

                          {/* PUBLISHED */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                          >
                            {isPublished ? (
                              <>
                                <MdCheckCircle className="w-3.5 h-3.5" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock3 className="w-3.5 h-3.5" />
                                Draft
                              </>
                            )}
                          </span>

                          {/* LATE */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${assignment.allowLate
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-red-50 text-red-700 border-red-200"
                              }`}
                          >
                            <MdSchedule className="w-3.5 h-3.5" />

                            {assignment.allowLate
                              ? "Late Allowed"
                              : "No Late"}
                          </span>

                          {/* OVERDUE */}
                          {overdue && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border bg-red-50 text-red-700 border-red-200">
                              Overdue
                            </span>
                          )}
                        </div>

                        {/* DESCRIPTION */}
                        {assignment.description && (
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}

                        {/* META */}
                        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">

                          <span
                            className={`flex items-center gap-2 ${overdue
                              ? "text-red-500 font-medium"
                              : ""
                              }`}
                          >
                            <MdCalendarToday className="w-4 h-4" />

                            {formatDate(assignment.dueDate)}
                          </span>

                          <span className="flex items-center gap-2">
                            <MdCheckCircle className="w-4 h-4" />

                            {assignment.maxMarks} Marks
                          </span>

                          {assignment.attachments?.length > 0 && (
                            <span className="text-purple-600 font-medium">
                              📎 {assignment.attachments.length} files
                            </span>
                          )}

                          {isPublished && assignment.publishedAt && (
                            <span className="text-emerald-600 font-medium">
                              Published {formatDate(assignment.publishedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 shadow-sm">

                        {/* VIEW */}
                        <button
                          onClick={() =>
                            navigate(
                              `/teacher/assignments/${assignment._id}/submissions`
                            )
                          }
                          className="group/action w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <Eye className="w-4 h-4 text-blue-600 group-hover/action:scale-110 transition-transform" />
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() =>
                            handleEditAssignment(assignment)
                          }
                          className="group/action w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <Pencil className="w-4 h-4 text-amber-500 group-hover/action:scale-110 transition-transform" />
                        </button>

                        {/* PUBLISH */}
                        <button
                          onClick={() =>
                            handleTogglePublish(assignment._id)
                          }
                          className="group/action w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          {isPublished ? (
                            <EyeOff className="w-4 h-4 text-orange-500 group-hover/action:scale-110 transition-transform" />
                          ) : (
                            <Send className="w-4 h-4 text-green-600 group-hover/action:scale-110 transition-transform" />
                          )}
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleDeleteAssignment(assignment._id)
                          }
                          className="group/action w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 group-hover/action:scale-110 transition-transform" />
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