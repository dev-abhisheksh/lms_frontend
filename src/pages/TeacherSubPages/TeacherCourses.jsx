import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineSchool,
  MdArrowForward,
  MdOutlineAssignment,
  MdOutlinePeople,
  MdOutlineClass,
  MdBook,
} from "react-icons/md";
import { myCourses } from "../../API/course.api";

const TeacherCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await myCourses();
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <MdOutlineSchool className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-sm text-gray-500">Manage and view the courses assigned to you</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <MdBook className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "—" : courses.length}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Courses Taught</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <MdOutlineClass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "—" : courses.filter((c) => c.isPublished).length}
              </p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Published Courses</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 col-span-2 md:col-span-1">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <MdOutlinePeople className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Active</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Teaching Status</p>
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 animate-pulse h-48" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MdOutlineSchool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Courses Found</h3>
            <p className="text-sm text-gray-500 mt-1">You are not currently assigned to teach any courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Accent colored top bar */}
                <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 w-full" />
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                        {course.code || "CRSE"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition line-clamp-2">
                      {course.title || course.name}
                    </h3>
                    
                    {course.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    {course.department && (
                      <p className="text-xs font-medium text-gray-400 mt-2">
                        Dept: {course.department.name || "Default"}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                    <button
                      onClick={() => navigate(`/teacher/assignments?courseId=${course._id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                    >
                      <span className="flex items-center gap-2">
                        <MdOutlineAssignment className="w-4 h-4 text-purple-500" />
                        Manage Assignments
                      </span>
                      <MdArrowForward className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => navigate(`/teacher/students?courseId=${course._id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition"
                    >
                      <span className="flex items-center gap-2">
                        <MdOutlinePeople className="w-4 h-4 text-indigo-500" />
                        Enrolled Students & Batches
                      </span>
                      <MdArrowForward className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherCourses;
