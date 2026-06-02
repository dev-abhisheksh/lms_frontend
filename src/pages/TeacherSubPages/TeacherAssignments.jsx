import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  MdAdd,
  MdDelete,
  MdArrowBack,
  MdOutlineAssignment,
  MdOutlineCalendarToday,
  MdCheckCircle,
  MdOutlineSchedule,
  MdClose,
  MdOutlineSchool,
  MdOutlineDescription,
  MdOutlineFileUpload,
  MdOutlineModeEditOutline,
  MdOutlineSend,
  MdOutlineVisibilityOff,
  MdOutlineLibraryAdd,
  MdRefresh,
  MdOutlineAttachFile,
  MdOutlineGrading
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
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const [loading, setLoading] = useState({
    courses: true,
    assignments: false
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxMarks: 100,
    allowLate: true,
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // ─────────────────────────────────────────────
  // Fetch Courses
  // ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(prev => ({ ...prev, courses: true }));
      try {
        const list = await getTeacherCourses();
        setCourses(list);
        if (list.length > 0 && !selectedCourse) {
          setSelectedCourse(list[0]._id);
        }
      } catch (error) {
        toast.error("Failed to load courses");
      } finally {
        setLoading(prev => ({ ...prev, courses: false }));
      }
    })();
  }, []);

  // ─────────────────────────────────────────────
  // Fetch Assignments
  // ─────────────────────────────────────────────
  const loadAssignments = async () => {
    if (!selectedCourse) return;
    setLoading(prev => ({ ...prev, assignments: true }));
    try {
      const response = await getAssignmentsByCourse(selectedCourse);
      const data = response.data.assignments || [];
      setAssignments(data);
      
      // Select the first one by default if none selected or if previously selected one is not in the new list
      if (data.length > 0 && !selectedAssignment) {
        // We don't auto-select for editing, just for viewing
      }
    } catch (error) {
      toast.error("Failed to load assignments");
      setAssignments([]);
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedCourse]);

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
    });
    setAttachmentFiles([]);
    setSelectedAssignment(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setSelectedAssignment({ isNew: true });
  };

  // ─────────────────────────────────────────────
  // Submit Assignment
  // ─────────────────────────────────────────────
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return toast.error("Please select a course");
    
    setIsSubmitting(true);
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
      if (selectedAssignment && !selectedAssignment.isNew) {
        await updateAssignment(selectedAssignment._id, form);
        toast.success("Assignment updated successfully!");
      } else {
        await createAssignment(selectedCourse, form);
        toast.success("Assignment created successfully!");
      }
      resetForm();
      loadAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────
  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    
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
      allowLate: assignment.allowLate !== undefined ? assignment.allowLate : true,
    });
  };

  const handleDeleteAssignment = async (e, assignmentId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this assignment?")) return;

    try {
      setActionLoading(assignmentId);
      await deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
      if (selectedAssignment?._id === assignmentId) resetForm();
      toast.success("Assignment deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (e, assignmentId) => {
    e.stopPropagation();
    try {
      setActionLoading(assignmentId);
      const res = await togglePublishAssignment(assignmentId);
      const updated = res.data.assignment;

      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId
            ? { ...a, isPublished: updated.isPublished, publishedAt: updated.publishedAt }
            : a
        )
      );
      
      if (selectedAssignment?._id === assignmentId) {
        setSelectedAssignment(prev => ({ ...prev, isPublished: updated.isPublished, publishedAt: updated.publishedAt }));
      }
      
      toast.success(`Assignment ${updated.isPublished ? "published" : "unpublished"}`);
    } catch (error) {
      toast.error("Failed to toggle publish status");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
             <button
              onClick={() => navigate("/teacher")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Assignment Lab</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Design and distribute learning tasks</p>
            </div>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all active:scale-95"
          >
            <MdAdd className="w-5 h-5" />
            Create Assignment
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <MdOutlineSchool className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Course</p>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title} ({c.courseCode})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="flex-1 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MdOutlineAssignment className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                  <p className="text-lg font-bold text-slate-900">{assignments.length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* ── Master-Detail Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Master List (lg:col-span-4) */}
          <aside className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:h-[750px] min-h-[400px]">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Assignments</h2>
              <button onClick={loadAssignments} className="p-2 hover:bg-white rounded-xl transition-colors">
                <MdRefresh className={`w-4 h-4 text-slate-400 ${loading.assignments ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loading.assignments ? (
                <div className="p-10 space-y-4">
                   {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <div className="p-12 text-center">
                  <MdOutlineAssignment className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-400">No assignments found</p>
                </div>
              ) : (
                assignments.map((assignment) => {
                  const isSelected = selectedAssignment?._id === assignment._id;
                  const isPublished = assignment.isPublished;
                  const isLoading = actionLoading === assignment._id;

                  return (
                    <button
                      key={assignment._id}
                      onClick={() => handleEditAssignment(assignment)}
                      className={`w-full p-6 text-left transition-all flex items-center gap-4 group ${
                        isSelected ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                        isSelected ? "bg-white/20" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                      }`}>
                        <MdOutlineAssignment className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {assignment.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isSelected 
                              ? "bg-white/20 border-white/30 text-white" 
                              : isPublished 
                                ? "bg-green-50 border-green-100 text-green-600" 
                                : "bg-amber-50 border-amber-100 text-amber-600"
                          }`}>
                            {isPublished ? "Published" : "Draft"}
                          </span>
                          <span className={`text-[9px] font-medium ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                            {assignment.maxMarks} pts
                          </span>
                        </div>
                      </div>
                      
                      {!isSelected && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                              onClick={(e) => handleDeleteAssignment(e, assignment._id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                           >
                             <MdDelete className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Detail Area (lg:col-span-8) */}
          <main className="lg:col-span-8">
            {selectedAssignment ? (
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      {selectedAssignment.isNew ? "Draft New Assignment" : "Refine Assignment"}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {selectedAssignment.isNew ? "Set your expectations and parameters" : `Editing: ${selectedAssignment.title}`}
                    </p>
                  </div>
                  
                  {!selectedAssignment.isNew && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/teacher/assignments/${selectedAssignment._id}/submissions`)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <MdOutlineGrading className="w-4 h-4 text-indigo-600" />
                        Submissions
                      </button>
                      
                      <button
                        onClick={(e) => handleTogglePublish(e, selectedAssignment._id)}
                        disabled={actionLoading === selectedAssignment._id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                          selectedAssignment.isPublished 
                            ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100" 
                            : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                        }`}
                      >
                        {selectedAssignment.isPublished ? <MdOutlineVisibilityOff className="w-4 h-4" /> : <MdOutlineSend className="w-4 h-4" />}
                        {selectedAssignment.isPublished ? "Unpublish" : "Publish Now"}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitAssignment} className="p-8 space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Assignment Title</label>
                        <input
                          type="text"
                          name="title"
                          required
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Q2 Research Paper"
                          className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-900 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Instructions & Description</label>
                        <textarea
                          name="description"
                          rows="6"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Provide clear goals and requirements..."
                          className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 text-sm font-medium text-slate-600 leading-relaxed transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Deadline</label>
                        <div className="relative">
                           <MdOutlineCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                           <input
                            type="datetime-local"
                            name="dueDate"
                            required
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold text-slate-900 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Maximum Points</label>
                        <div className="relative">
                          <MdOutlineGrading className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                          <input
                            type="number"
                            name="maxMarks"
                            min="1"
                            required
                            value={formData.maxMarks}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold text-slate-900 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Options & Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                       <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                              <MdOutlineSchedule className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Late Submissions</p>
                              <p className="text-[10px] font-medium text-slate-500">Allow after deadline</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="allowLate"
                              checked={formData.allowLate}
                              onChange={handleInputChange}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                       </div>

                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Reference Materials</label>
                          <div className="relative group">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/30 rounded-3xl p-6 transition-all text-center">
                              <MdOutlineFileUpload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 mx-auto mb-2" />
                              <p className="text-xs font-bold text-slate-600">{attachmentFiles.length > 0 ? `${attachmentFiles.length} files selected` : 'Drag or click to upload'}</p>
                              <p className="text-[10px] font-medium text-slate-400 mt-1">PDF, DOCX, JPG supported</p>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Reset form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.05] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : selectedAssignment.isNew ? "Launch Assignment" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm h-[750px] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                  <MdOutlineLibraryAdd className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Task Command Center</h3>
                <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
                  Select an existing assignment from the list or create a fresh one to begin drafting your next curriculum milestone.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="mt-10 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;
