import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MdOutlinePeople,
  MdOutlineSchool,
  MdMailOutline,
  MdSearch,
  MdPerson,
  MdBadge,
} from "react-icons/md";
import { myCourses } from "../../API/course.api";
import { getCourseEnrollmentSummary } from "../../API/enrollment.api";

const TeacherStudents = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [participants, setParticipants] = useState({ students: [], teachers: [] });
  const [summary, setSummary] = useState({ students: 0, teachers: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch courses taught by the teacher
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await myCourses();
        const courseList = response.data.courses || [];
        setCourses(courseList);
        if (courseList.length > 0 && !selectedCourse) {
          setSelectedCourse(courseList[0]._id);
        }
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  // Fetch student participants when course selection changes
  useEffect(() => {
    if (!selectedCourse) {
      setParticipants({ students: [], teachers: [] });
      setSummary({ students: 0, teachers: 0 });
      return;
    }

    const loadParticipants = async () => {
      setLoadingStudents(true);
      try {
        const response = await getCourseEnrollmentSummary(selectedCourse);
        const parts = response.data.participants || { students: [], teachers: [] };
        setParticipants(parts);
        setSummary(response.data.summary || { students: parts.students.length, teachers: parts.teachers.length });
      } catch (error) {
        console.error("Error loading course participants:", error);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadParticipants();
  }, [selectedCourse]);

  // Filter students based on search term
  const filteredStudents = participants.students.filter((student) => {
    const target = `${student.fullName} ${student.email} ${student.username || ""}`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <MdOutlinePeople className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Enrolled Students & Batches</h1>
            <p className="text-sm text-gray-500">View enrolled students and teaching staff for your courses</p>
          </div>
        </div>

        {/* Course Filter & Search Header */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm justify-between items-center">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MdOutlineSchool className="w-3.5 h-3.5" />
              Selected Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loadingCourses}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loadingCourses ? (
                <option>Loading courses...</option>
              ) : courses.length === 0 ? (
                <option>No courses assigned</option>
              ) : (
                <>
                  <option value="">-- Choose a Course --</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="w-full md:w-1/2 self-end">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MdSearch className="w-3.5 h-3.5" />
              Search Student
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <MdSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Participant Details */}
        {!selectedCourse ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <MdOutlinePeople className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">Select a Course</h3>
            <p className="text-sm text-gray-500 mt-1">Choose a course above to view enrolled students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Left sidebar: Course Summary & Teachers - 1 col */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course enrollment summary card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Course Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-700">{summary.students}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5">Students</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700">{summary.teachers}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5">Instructors</p>
                  </div>
                </div>
              </div>

              {/* Teachers/Instructors card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Teaching Staff
                </h3>
                {loadingStudents ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : participants.teachers.length === 0 ? (
                  <p className="text-xs text-gray-400">No instructors listed.</p>
                ) : (
                  <div className="space-y-3">
                    {participants.teachers.map((teacher) => (
                      <div key={teacher._id} className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                          <MdPerson className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {teacher.fullName}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Enrolled Students List - 3 cols */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Enrolled Students ({filteredStudents.length})
                </span>
              </div>

              {loadingStudents ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <MdOutlinePeople className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No students matched search criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <div key={student._id} className="p-4 hover:bg-gray-50/50 transition flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 font-bold text-sm flex items-center justify-center shrink-0 border border-purple-100">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {student.fullName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-0.5 truncate">
                              <MdMailOutline className="w-3.5 h-3.5 shrink-0" />
                              {student.email}
                            </span>
                            <span className="text-gray-300 hidden sm:inline">•</span>
                            <span className="flex items-center gap-0.5 truncate">
                              <MdBadge className="w-3.5 h-3.5 shrink-0" />
                              {student.username || `@${student._id.substring(18)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right text-[11px] text-gray-400">
                        {student.enrolledAt ? (
                          <>
                            <p className="font-semibold text-gray-500">Enrolled on</p>
                            <p className="mt-0.5">{new Date(student.enrolledAt).toLocaleDateString()}</p>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-semibold">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherStudents;
