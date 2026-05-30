import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdDescription,
  MdPublish,
  MdSchedule,
  MdClose,
  MdAttachFile,
  MdUnpublished
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import {
  createNote,
  getNotesByCourse,
  updateNote,
  deleteNote,
  togglePublishNote
} from "../../API/note.api";

const TeacherNotes = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPublished: false,
  });
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Fetch courses taught by the teacher
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseList = await getTeacherCourses();
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0]._id);
        }
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };
    loadCourses();
  }, []);

  // Fetch notes for selected course
  useEffect(() => {
    if (!selectedCourse) return;

    const loadNotes = async () => {
      setLoading(true);
      try {
        const response = await getNotesByCourse(selectedCourse);
        setNotes(response.data.notes || []);
      } catch (error) {
        console.error("Error loading notes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [selectedCourse]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit note (create or update)
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    setSaving(true);
    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    form.append("isPublished", formData.isPublished);

    attachmentFiles.forEach((file) => {
      form.append("attachments", file);
    });

    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, form);
        toast.success("Note updated successfully!");
      } else {
        await createNote(selectedCourse, form);
        toast.success("Note created successfully!");
      }

      handleCancelForm();
      const response = await getNotesByCourse(selectedCourse);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  // Edit note
  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setFormData({
      title: note.title || "",
      content: note.content || "",
      isPublished: note.isPublished || false,
    });
    setAttachmentFiles([]); // We don't preload existing files into the input, they are just shown as already uploaded
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(noteId);
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
        toast.success("Note deleted successfully!");
      } catch (error) {
        console.error("Error deleting note", error);
        toast.error("Failed to delete note");
      }
    }
  };

  const handleTogglePublish = async (noteId) => {
    try {
        await togglePublishNote(noteId);
        const response = await getNotesByCourse(selectedCourse);
        setNotes(response.data.notes || []);
    } catch (error) {
        console.error("Error toggling publish", error);
    }
  }

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNoteId(null);
    setFormData({
      title: "",
      content: "",
      isPublished: false,
    });
    setAttachmentFiles([]);
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
              <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-500">Upload PDF, Word, and text notes for students</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                  setShowForm(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {showForm ? <MdClose className="w-5 h-5" /> : <MdAdd className="w-5 h-5" />}
            {showForm ? "Cancel" : "New Note"}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* Notes Form */}
        {showForm && selectedCourse && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingNoteId ? "Edit Note" : "Create New Note"}
            </h2>
            <form onSubmit={handleSubmitNote} className="space-y-4">

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Chapter 1: Physics Basics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content / Description
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Optional brief description of these notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (PDF, DOCX, etc.)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <MdAttachFile className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, Word, PPT up to 20MB</p>
                  </div>
                </div>

                {attachmentFiles.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <MdDescription className="flex-shrink-0 w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <MdClose className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Publish this note for students immediately
                  </span>
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingNoteId ? "Update Note" : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <MdDescription className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">
              {courses.find((c) => c._id === selectedCourse)?.title || "Notes"}
            </h2>
            <span className="ml-auto text-xs text-gray-500">{notes.length} note(s)</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center">
              <MdDescription className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notes.map((note) => (
                <div key={note._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {note.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${
                            note.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {note.isPublished ? (
                            <>
                              <MdPublish className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <MdSchedule className="w-3 h-3" /> Draft
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {note.content}
                      </p>
                      
                      {note.attachments && note.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                              {note.attachments.map((file, idx) => (
                                  <a key={idx} href={file.secure_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition">
                                      <MdAttachFile className="w-3 h-3" />
                                      <span className="truncate max-w-[150px]">{file.original_filename}</span>
                                  </a>
                              ))}
                          </div>
                      )}

                      <p className="text-xs text-gray-500 mt-3">
                        Created: {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100 transition">
                       <button
                          onClick={() => handleTogglePublish(note._id)}
                          className={`p-2 rounded-lg transition ${note.isPublished ? "hover:bg-yellow-50 text-yellow-600" : "hover:bg-green-50 text-green-600"}`}
                          title={note.isPublished ? "Unpublish" : "Publish"}
                        >
                          {note.isPublished ? <MdUnpublished className="w-4 h-4" /> : <MdPublish className="w-4 h-4" />}
                        </button>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                        title="Edit"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
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

export default TeacherNotes;
