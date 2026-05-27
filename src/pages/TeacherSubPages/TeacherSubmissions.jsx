import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  MdOutlineGrading,
  MdOutlineSchool,
  MdOutlineAssignment,
  MdCheckCircle,
  MdPending,
  MdOutlineAttachFile,
  MdOpenInNew,
  MdOutlineFeedback,
  MdRefresh,
} from "react-icons/md";
import { myCourses } from "../../API/course.api";
import { getAssignmentsByCourse, getAssignmentById } from "../../API/assignment.api";
import { getAllSubmissions, gradeSubmission } from "../../API/submission.api";

const TeacherSubmissions = () => {
  const { assignmentId } = useParams();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(assignmentId || "");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading form state
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // If assignmentId is passed in URL path, resolve the courseId and set it
  useEffect(() => {
    if (!assignmentId) return;

    const resolveAssignment = async () => {
      try {
        const response = await getAssignmentById(assignmentId);
        const assignmentObj = response.data.assignment;
        if (assignmentObj) {
          const courseId = assignmentObj.course?._id || assignmentObj.course;
          setSelectedCourse(courseId);
          setSelectedAssignment(assignmentId);
        }
      } catch (error) {
        console.error("Error resolving assignment ID:", error);
      }
    };
    resolveAssignment();
  }, [assignmentId]);

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

  // Fetch assignments when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setAssignments([]);
      setSelectedAssignment("");
      setSubmissions([]);
      setSelectedSub(null);
      return;
    }

    const loadAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const response = await getAssignmentsByCourse(selectedCourse);
        const assignmentList = response.data.assignments || [];
        setAssignments(assignmentList);
        
        // If we are looking for a specific assignmentId param
        if (assignmentId && assignmentList.some((a) => a._id === assignmentId)) {
          setSelectedAssignment(assignmentId);
        } else if (assignmentList.length > 0) {
          setSelectedAssignment(assignmentList[0]._id);
        } else {
          setSelectedAssignment("");
          setSubmissions([]);
          setSelectedSub(null);
        }
      } catch (error) {
        console.error("Error loading assignments:", error);
      } finally {
        setLoadingAssignments(false);
      }
    };
    loadAssignments();
  }, [selectedCourse, assignmentId]);

  // Fetch submissions when assignment changes
  const loadSubmissions = async () => {
    if (!selectedAssignment) {
      setSubmissions([]);
      setSelectedSub(null);
      return;
    }

    setLoadingSubmissions(true);
    try {
      const response = await getAllSubmissions(selectedAssignment);
      const subs = response.data.submissions || [];
      setSubmissions(subs);
      // Keep selection or reset
      if (selectedSub) {
        const updated = subs.find((s) => s._id === selectedSub._id);
        setSelectedSub(updated || null);
      } else if (subs.length > 0) {
        setSelectedSub(subs[0]);
      } else {
        setSelectedSub(null);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedAssignment]);

  // Reset grading fields when selected submission changes
  useEffect(() => {
    if (selectedSub) {
      setGrade(selectedSub.grade ?? "");
      setFeedback(selectedSub.feedback || "");
    } else {
      setGrade("");
      setFeedback("");
    }
  }, [selectedSub]);

  // Grade submission handler
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    if (grade === "") {
      alert("Please enter a grade");
      return;
    }

    const parsedGrade = parseFloat(grade);
    const maxMarks = selectedSub.assignment?.maxMarks || 100;
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > maxMarks) {
      alert(`Please enter a valid grade between 0 and ${maxMarks}`);
      return;
    }

    setSubmittingGrade(true);
    try {
      await gradeSubmission(selectedSub._id, parsedGrade, feedback);
      alert("Submission graded successfully!");
      await loadSubmissions();
    } catch (error) {
      console.error("Error grading submission:", error);
      alert("Failed to grade submission: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <MdOutlineGrading className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Submissions & Grading</h1>
              <p className="text-sm text-gray-500">Grade and provide feedback on student work</p>
            </div>
          </div>
          <button
            onClick={loadSubmissions}
            disabled={!selectedAssignment}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MdOutlineSchool className="w-3.5 h-3.5" />
              Select Course
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

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MdOutlineAssignment className="w-3.5 h-3.5" />
              Select Assignment
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              disabled={loadingAssignments || !selectedCourse}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            >
              {loadingAssignments ? (
                <option>Loading assignments...</option>
              ) : assignments.length === 0 ? (
                <option value="">No assignments found</option>
              ) : (
                <>
                  <option value="">-- Choose an Assignment --</option>
                  {assignments.map((assignment) => (
                    <option key={assignment._id} value={assignment._id}>
                      {assignment.title} (Max: {assignment.maxMarks}m)
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Submissions Split Screen View */}
        {!selectedAssignment ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <MdOutlineGrading className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-900">Select an Assignment</h3>
            <p className="text-sm text-gray-500 mt-1">Choose a course and assignment above to view submissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Student Submissions List - 5 cols */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Submissions ({submissions.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {loadingSubmissions ? (
                  <div className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p className="text-sm font-medium">No submissions yet for this assignment.</p>
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const isSelected = selectedSub && selectedSub._id === sub._id;
                    const isGraded = sub.status === "graded";
                    return (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedSub(sub)}
                        className={`w-full p-4 text-left transition flex items-start gap-3 hover:bg-gray-50 ${
                          isSelected ? "bg-purple-50/70 border-l-4 border-purple-600" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {sub.student?.fullName || "Student Name"}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {sub.student?.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-gray-400">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                            {sub.isLate && (
                              <span className="text-[9px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                Late
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {isGraded ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              <MdCheckCircle className="w-3.5 h-3.5" />
                              {sub.grade}m
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                              <MdPending className="w-3.5 h-3.5" />
                              Ungraded
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Grading & Details Panel - 7 cols */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col justify-between">
              {selectedSub ? (
                <div className="flex flex-col h-full flex-1">
                  
                  {/* Panel Header */}
                  <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Submission Details
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Submitted by {selectedSub.student?.fullName}
                      </p>
                    </div>
                    {selectedSub.isLate && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                        Late Submission
                      </span>
                    )}
                  </div>

                  {/* Submission Answers */}
                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    
                    {/* Text Answer */}
                    {selectedSub.textAnswer && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Text Response
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedSub.textAnswer}
                        </div>
                      </div>
                    )}

                    {/* Files List */}
                    {selectedSub.files && selectedSub.files.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Uploaded Attachments
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedSub.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.secure_url || file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/20 transition group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                  <MdOutlineAttachFile className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-700 truncate">
                                    {file.original_filename || `file_${idx + 1}`}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {(file.bytes / 1024).toFixed(1)} KB • {file.format}
                                  </p>
                                </div>
                              </div>
                              <MdOpenInNew className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* If nothing submitted */}
                    {!selectedSub.textAnswer && (!selectedSub.files || selectedSub.files.length === 0) && (
                      <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl">
                        <p className="text-sm text-gray-500">No response or file content found in submission.</p>
                      </div>
                    )}
                  </div>

                  {/* Grading Form */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <form onSubmit={handleGradeSubmit} className="space-y-4">
                      
                      <div className="flex items-start gap-4">
                        <div className="w-1/3">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Grade *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                              placeholder="0.0"
                              required
                              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">
                              / {selectedSub.assignment?.maxMarks || 100}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <MdOutlineFeedback className="w-3.5 h-3.5" />
                            Feedback
                          </label>
                          <input
                            type="text"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Great job! / Needs improvement..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={submittingGrade}
                          className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg transition"
                        >
                          {submittingGrade ? "Saving..." : selectedSub.status === "graded" ? "Update Grade" : "Submit Grade"}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                  <MdOutlineGrading className="w-14 h-14 text-gray-200 mb-2" />
                  <p className="text-sm font-semibold text-gray-500">
                    No Submission Selected
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click a student submission from the left panel to review.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherSubmissions;
