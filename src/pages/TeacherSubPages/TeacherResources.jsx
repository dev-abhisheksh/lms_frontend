import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdDelete,
  MdArrowBack,
  MdImage,
  MdAudioFile,
  MdVideoLibrary,
  MdDownload,
  MdUploadFile,
  MdFolderOpen,
  MdFileCopy,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";

const TeacherResources = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resourceType: "document",
    files: [],
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

  // Fetch resources for selected course (simulated - replace with actual API)
  useEffect(() => {
    if (!selectedCourse) return;

    const loadResources = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with actual endpoint
        const mockResources = [
          {
            _id: "1",
            title: "Introduction to Python",
            description: "Basics of Python programming",
            resourceType: "document",
            fileSize: 2500000,
            uploadedAt: new Date(2024, 0, 15),
            url: "/resources/intro-python.pdf",
          },
          {
            _id: "2",
            title: "Functions and Modules",
            description: "Understanding functions in Python",
            resourceType: "video",
            fileSize: 150000000,
            uploadedAt: new Date(2024, 0, 20),
            url: "/resources/functions.mp4",
          },
          {
            _id: "3",
            title: "Data Structures",
            description: "Lists, tuples, dictionaries",
            resourceType: "document",
            fileSize: 1800000,
            uploadedAt: new Date(2024, 1, 5),
            url: "/resources/data-structures.pdf",
          },
        ];
        setResources(mockResources);
      } catch (error) {
        console.error("Error loading resources:", error);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [selectedCourse]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      files: Array.from(e.target.files),
    }));
  };

  // Submit resource
  const handleSubmitResource = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    setUploading(true);
    try {
      // Simulate file upload - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newResource = {
        _id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        resourceType: formData.resourceType,
        fileSize: formData.files[0]?.size || 0,
        uploadedAt: new Date(),
        url: URL.createObjectURL(formData.files[0]),
      };

      setResources((prev) => [newResource, ...prev]);
      toast.success("Resource uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        resourceType: "document",
        files: [],
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast.error("Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  // Delete resource
  const handleDeleteResource = (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      setResources((prev) => prev.filter((r) => r._id !== resourceId));
      toast.success("Resource deleted successfully!");
    }
  };

  // Get icon based on resource type
  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
        return <MdVideoLibrary className="w-4 h-4" />;
      case "image":
        return <MdImage className="w-4 h-4" />;
      case "audio":
        return <MdAudioFile className="w-4 h-4" />;
      default:
        return <MdFileCopy className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
              <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
              <p className="text-sm text-gray-500">Upload and manage course materials</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <MdAdd className="w-5 h-5" />
            {showForm ? "Cancel" : "Upload Resource"}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* Upload Form */}
        {showForm && selectedCourse && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload New Resource</h2>
            <form onSubmit={handleSubmitResource} className="space-y-4">

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resource title"
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
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this resource"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type *
                </label>
                <select
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="document">Document (PDF, Word, etc.)</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {formData.files.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {formData.files[0].name}
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
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Resource"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resources List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <MdFolderOpen className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">
              {courses.find((c) => c._id === selectedCourse)?.title || "Resources"}
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center">
              <MdUploadFile className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No resources yet. Upload files to share with your students!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {resources.map((resource) => (
                <div key={resource._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2.5 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                        {getResourceIcon(resource.resourceType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                          <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">
                            {resource.resourceType}
                          </span>
                          <span>{formatFileSize(resource.fileSize)}</span>
                          <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => window.open(resource.url)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                        title="Download"
                      >
                        <MdDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource._id)}
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

export default TeacherResources;
