import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdQuiz,
  MdCheckCircle,
  MdHelpOutline,
  MdPlayArrow,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";

const TestTypeCard = ({ type, title, description, icon: Icon, color }) => {
  return (
    <div
      className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer group ${color}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-white group-hover:bg-opacity-80">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
};

const TeacherTests = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [testType, setTestType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mcq",
    duration: 60,
    totalQuestions: 0,
    totalMarks: 100,
    passingMarks: 40,
    isPublished: false,
    questions: [],
  });

  const testTypes = [
    {
      id: "mcq",
      title: "Multiple Choice Questions (MCQ)",
      description: "Students select one correct answer from multiple options",
      icon: MdCheckCircle,
      color: "bg-blue-50",
    },
    {
      id: "obt",
      title: "Objective Based Test (OBT)",
      description: "True/False, Multiple select, and other objective questions",
      icon: MdHelpOutline,
      color: "bg-purple-50",
    },
    {
      id: "essay",
      title: "Essay Questions",
      description: "Short or long answer text-based questions",
      icon: MdEdit,
      color: "bg-green-50",
    },
    {
      id: "mixed",
      title: "Mixed Format",
      description: "Combination of MCQ, objective, and essay questions",
      icon: MdQuiz,
      color: "bg-orange-50",
    },
  ];

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

  // Fetch tests for selected course (simulated - replace with actual API)
  useEffect(() => {
    if (!selectedCourse) return;

    const loadTests = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with actual endpoint
        const mockTests = [
          {
            _id: "1",
            title: "Python Basics Quiz",
            description: "Test your knowledge on Python fundamentals",
            type: "mcq",
            duration: 30,
            totalQuestions: 20,
            totalMarks: 20,
            passingMarks: 12,
            isPublished: true,
            createdAt: new Date(2024, 0, 15),
            questionsCount: 20,
          },
          {
            _id: "2",
            title: "OOP Concepts Assessment",
            description: "Evaluate understanding of Object-Oriented Programming",
            type: "mixed",
            duration: 60,
            totalQuestions: 15,
            totalMarks: 50,
            passingMarks: 25,
            isPublished: true,
            createdAt: new Date(2024, 0, 20),
            questionsCount: 15,
          },
          {
            _id: "3",
            title: "Data Structures Assignment",
            description: "Test on arrays, lists, stacks, and queues",
            type: "essay",
            duration: 90,
            totalQuestions: 5,
            totalMarks: 30,
            passingMarks: 15,
            isPublished: false,
            createdAt: new Date(2024, 1, 5),
            questionsCount: 5,
          },
        ];
        setTests(mockTests);
      } catch (error) {
        console.error("Error loading tests:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, [selectedCourse]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit test
  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }

    const newTest = {
      _id: Date.now().toString(),
      ...formData,
      createdAt: new Date(),
      questionsCount: formData.totalQuestions,
    };

    setTests((prev) => [newTest, ...prev]);
    alert(`${formData.type.toUpperCase()} test created successfully!`);

    setFormData({
      title: "",
      description: "",
      type: "mcq",
      duration: 60,
      totalQuestions: 0,
      totalMarks: 100,
      passingMarks: 40,
      isPublished: false,
      questions: [],
    });
    setTestType(null);
    setShowForm(false);
  };

  // Delete test
  const handleDeleteTest = (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      setTests((prev) => prev.filter((t) => t._id !== testId));
      alert("Test deleted successfully!");
    }
  };

  // Start creating test of specific type
  const startCreatingTest = (type) => {
    setTestType(type);
    setFormData((prev) => ({
      ...prev,
      type: type.id,
    }));
    setShowForm(true);
  };

  const getTestTypeLabel = (type) => {
    const t = testTypes.find((tt) => tt.id === type);
    return t ? t.title : type.toUpperCase();
  };

  const getTestTypeIcon = (type) => {
    const t = testTypes.find((tt) => tt.id === type);
    if (!t) return MdQuiz;
    return t.icon;
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
              <h1 className="text-2xl font-bold text-gray-900">Tests & Quizzes</h1>
              <p className="text-sm text-gray-500">Create and manage assessments</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setTestType(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <MdAdd className="w-5 h-5" />
            {showForm ? "Cancel" : "Create Test"}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* Test Type Selection */}
        {showForm && !testType && selectedCourse && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Test Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => startCreatingTest(type)}
                  className="text-left hover:shadow-lg transition-all"
                >
                  <TestTypeCard
                    type={type.id}
                    title={type.title}
                    description={type.description}
                    icon={type.icon}
                    color={type.color}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Test Form */}
        {showForm && testType && selectedCourse && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Create {testType.title}
            </h2>
            <form onSubmit={handleSubmitTest} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter test title"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe the test and its objectives"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Questions *
                  </label>
                  <input
                    type="number"
                    name="totalQuestions"
                    value={formData.totalQuestions}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Publish now</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setTestType(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Create Test
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tests List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <MdQuiz className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">
              {courses.find((c) => c._id === selectedCourse)?.title || "Tests"}
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="p-8 text-center">
              <MdQuiz className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No tests yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tests.map((test) => {
                const TestIcon = getTestTypeIcon(test.type);
                return (
                  <div key={test._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-orange-100 rounded-lg shrink-0 mt-0.5">
                          <TestIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {test.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                test.isPublished
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {test.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {test.description}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                            <span>{getTestTypeLabel(test.type)}</span>
                            <span>•</span>
                            <span>{test.duration} mins</span>
                            <span>•</span>
                            <span>{test.totalQuestions} Questions</span>
                            <span>•</span>
                            <span>{test.totalMarks} Marks</span>
                            <span>•</span>
                            <span>Pass: {test.passingMarks}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            navigate(`/teacher/tests/${test._id}/add-questions`)
                          }
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                          title="Add questions"
                        >
                          <MdAdd className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/teacher/tests/${test._id}/edit`)
                          }
                          className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition"
                          title="Edit"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/teacher/tests/${test._id}/preview`,
                              { state: { test } }
                            )
                          }
                          className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition"
                          title="Preview"
                        >
                          <MdPlayArrow className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                          title="Delete"
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

export default TeacherTests;
