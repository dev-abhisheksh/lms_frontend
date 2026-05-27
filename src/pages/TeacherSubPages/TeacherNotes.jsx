import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdDescription,
  MdPublish,
  MdSchedule,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";

const TeacherNotes = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPublished: false,
  });

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

  // Fetch notes for selected course (simulated - replace with actual API)
  useEffect(() => {
    if (!selectedCourse) return;

    const loadNotes = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with actual endpoint
        const mockNotes = [
          {
            _id: "1",
            title: "Introduction to Variables",
            content:
              "Variables are containers for storing data values. In Python, you can create a variable by simply assigning a value to a name.",
            isPublished: true,
            createdAt: new Date(2024, 0, 15),
            updatedAt: new Date(2024, 0, 15),
          },
          {
            _id: "2",
            title: "Data Types in Python",
            content:
              "Python has various data types: strings, integers, floats, booleans, lists, tuples, dictionaries, and sets.",
            isPublished: true,
            createdAt: new Date(2024, 0, 20),
            updatedAt: new Date(2024, 0, 20),
          },
          {
            _id: "3",
            title: "Control Structures",
            content:
              "Control structures allow you to control the flow of your program using if/elif/else statements and loops.",
            isPublished: false,
            createdAt: new Date(2024, 1, 5),
            updatedAt: new Date(2024, 1, 5),
          },
        ];
        setNotes(mockNotes);
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

  // Submit note (create or update)
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }

    if (editingNote) {
      // Update existing note
      const updatedNotes = notes.map((note) =>
        note._id === editingNote._id
          ? {
              ...note,
              ...formData,
              updatedAt: new Date(),
            }
          : note
      );
      setNotes(updatedNotes);
      alert("Note updated successfully!");
    } else {
      // Create new note
      const newNote = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes((prev) => [newNote, ...prev]);
      alert("Note created successfully!");
    }

    setFormData({
      title: "",
      content: "",
      isPublished: false,
    });
    setEditingNote(null);
    setShowForm(false);
  };

  // Edit note
  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      isPublished: note.isPublished,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete note
  const handleDeleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      alert("Note deleted successfully!");
    }
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormData({
      title: "",
      content: "",
      isPublished: false,
    });
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
              <p className="text-sm text-gray-500">Create and manage course notes</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (editingNote) {
                handleCancelForm();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <MdAdd className="w-5 h-5" />
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
              {editingNote ? "Edit Note" : "Create New Note"}
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
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  placeholder="Write your note content here..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Publish this note for students
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {editingNote ? "Update Note" : "Create Note"}
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
                      <div className="flex items-center gap-2 mb-2">
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
                      <p className="text-xs text-gray-500">
                        Created: {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
