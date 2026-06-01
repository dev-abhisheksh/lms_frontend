import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
  MdQuiz,
  MdAccessTime,
  MdArrowForward,
  MdClose,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import { getAssignmentsByCourse, getAssignmentById } from "../../API/assignment.api";
import { getAllSubmissions, gradeSubmission } from "../../API/submission.api";
import { getTestsByCourse, getTestSubmissions, gradeTestSubmission } from "../../API/test.api";

const TeacherSubmissions = () => {
  const { assignmentId: paramAssignmentId } = useParams();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [activeTab, setActiveTab] = useState("assignments"); // 'assignments' | 'tests'
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  
  // Selection States
  const [items, setItems] = useState([]); // Assignments or Tests
  const [selectedItem, setSelectedItem] = useState(""); // ID of selected assignment or test
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  
  const [loading, setLoading] = useState({
    courses: true,
    items: false,
    submissions: false
  });

  // Grading State
  const [gradeData, setGradeData] = useState({
    grade: "",
    feedback: "",
    testAnswers: [] // for tests
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Load Courses ── */
  useEffect(() => {
    (async () => {
      setLoading(prev => ({ ...prev, courses: true }));
      try {
        const list = await getTeacherCourses();
        setCourses(list);
        if (list.length > 0 && !selectedCourse) setSelectedCourse(list[0]._id);
      } catch (e) {
        toast.error("Failed to load courses");
      } finally {
        setLoading(prev => ({ ...prev, courses: false }));
      }
    })();
  }, []);

  /* ── Load Items (Assignments/Tests) when Course or Tab changes ── */
  useEffect(() => {
    if (!selectedCourse) {
      setItems([]);
      setSelectedItem("");
      return;
    }

    const loadItems = async () => {
      setLoading(prev => ({ ...prev, items: true }));
      try {
        if (activeTab === "assignments") {
          const res = await getAssignmentsByCourse(selectedCourse);
          const list = res.data.assignments || [];
          setItems(list);
          if (paramAssignmentId && list.some(a => a._id === paramAssignmentId)) {
            setSelectedItem(paramAssignmentId);
          } else if (list.length > 0) {
            setSelectedItem(list[0]._id);
          }
        } else {
          const res = await getTestsByCourse(selectedCourse);
          const list = res.data.tests || [];
          setItems(list);
          if (list.length > 0) setSelectedItem(list[0]._id);
        }
      } catch (e) {
        toast.error("Failed to load list");
      } finally {
        setLoading(prev => ({ ...prev, items: false }));
      }
    };
    loadItems();
  }, [selectedCourse, activeTab, paramAssignmentId]);

  /* ── Load Submissions when selected item changes ── */
  const loadSubmissions = async () => {
    if (!selectedItem) {
      setSubmissions([]);
      setSelectedSub(null);
      return;
    }

    setLoading(prev => ({ ...prev, submissions: true }));
    try {
      let res;
      if (activeTab === "assignments") {
        res = await getAllSubmissions(selectedItem);
      } else {
        res = await getTestSubmissions(selectedItem);
      }
      const subs = res.data.submissions || [];
      setSubmissions(subs);
      if (subs.length > 0) setSelectedSub(subs[0]);
      else setSelectedSub(null);
    } catch (e) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(prev => ({ ...prev, submissions: false }));
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedItem, activeTab]);

  /* ── Sync Grading State ── */
  useEffect(() => {
    if (selectedSub) {
      if (activeTab === "assignments") {
        setGradeData({
          grade: selectedSub.grade ?? "",
          feedback: selectedSub.feedback || "",
          testAnswers: []
        });
      } else {
        setGradeData({
          grade: selectedSub.score ?? "",
          feedback: selectedSub.feedback || "",
          testAnswers: selectedSub.answers?.map(a => ({
            questionId: a.questionId,
            marksObtained: a.marksObtained || 0,
            isCorrect: a.isCorrect || false
          })) || []
        });
      }
    }
  }, [selectedSub, activeTab]);

  /* ── Handle Grade Submission ── */
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsSubmitting(true);

    try {
      if (activeTab === "assignments") {
        const parsedGrade = parseFloat(gradeData.grade);
        await gradeSubmission(selectedSub._id, parsedGrade, gradeData.feedback);
      } else {
        await gradeTestSubmission(selectedSub._id, {
          gradedAnswers: gradeData.testAnswers,
          feedback: gradeData.feedback
        });
      }
      toast.success("Graded successfully");
      loadSubmissions();
    } catch (err) {
      toast.error("Grading failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Render Helper ── */
  const currentItem = items.find(i => i._id === selectedItem);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Grading Central</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Review student submissions and provide feedback</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "assignments" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "tests" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Tests & Quizzes
            </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <MdOutlineSchool className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Course</p>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              {activeTab === "assignments" ? <MdOutlineAssignment className="w-5 h-5" /> : <MdQuiz className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Assessment</p>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
              >
                {items.length === 0 ? <option value="">No items found</option> : (
                  items.map(i => (
                    <option key={i._id} value={i._id}>{i.title}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* ── Master-Detail Layout ── */}
        {!selectedItem ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm">
             <MdOutlineGrading className="w-20 h-20 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold text-slate-900">No Assessment Selected</h3>
             <p className="text-sm font-medium text-slate-500 mt-2">Select a course and an assessment above to begin grading.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Master: Student List (lg:col-span-4) */}
            <aside className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Submissions</h2>
                <button onClick={loadSubmissions} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <MdRefresh className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {submissions.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm font-medium">No submissions yet.</div>
                ) : (
                  submissions.map((sub) => {
                    const isSelected = selectedSub?._id === sub._id;
                    const isGraded = sub.status === "graded";
                    return (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedSub(sub)}
                        className={`w-full p-6 text-left transition-all flex items-center gap-4 ${
                          isSelected ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          isSelected ? "bg-white/20" : "bg-slate-100 text-slate-600"
                        }`}>
                          <span className="font-bold text-xs">{sub.student?.fullName?.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {sub.student?.fullName}
                          </p>
                          <p className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                            {isGraded ? "Graded" : "Ungraded"}
                          </p>
                        </div>
                        {isGraded && <MdCheckCircle className={`w-5 h-5 ${isSelected ? "text-white" : "text-green-500"}`} />}
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Detail Area: Grading Panel (lg:col-span-8) */}
            <main className="lg:col-span-8 flex flex-col gap-8">
              {selectedSub ? (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
                  {/* Detail Header */}
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{selectedSub.student?.fullName}</h3>
                      <p className="text-xs font-medium text-slate-500">{selectedSub.student?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                        Submitted: {new Date(selectedSub.submittedAt || selectedSub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Submission Content */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {activeTab === "assignments" ? (
                      /* ── Assignment Specific Content ── */
                      <>
                        {selectedSub.textAnswer && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Written Response</h4>
                            <div className="bg-slate-50 rounded-[24px] p-6 text-sm font-medium text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
                              {selectedSub.textAnswer}
                            </div>
                          </div>
                        )}
                        {selectedSub.files?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attached Files</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedSub.files.map((file, idx) => (
                                <a key={idx} href={file.secure_url || file.url} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-lg transition-all group">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                    <MdOutlineAttachFile className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold truncate">{file.original_filename || "Document"}</p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{(file.bytes / 1024).toFixed(0)} KB • Open</p>
                                  </div>
                                  <MdOpenInNew className="ml-auto text-slate-300" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* ── Test Specific Content ── */
                      <div className="space-y-6">
                        {selectedSub.answers?.map((ans, idx) => {
                          const question = currentItem?.questions.find(q => q._id === ans.questionId);
                          return (
                            <div key={idx} className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white px-2 py-1 rounded border">Question {idx + 1} ({question?.type})</span>
                                <div className="flex items-center gap-2">
                                  <input type="number" 
                                    value={gradeData.testAnswers[idx]?.marksObtained || 0}
                                    onChange={(e) => {
                                      const newAnswers = [...gradeData.testAnswers];
                                      newAnswers[idx].marksObtained = Number(e.target.value);
                                      newAnswers[idx].isCorrect = Number(e.target.value) > 0;
                                      setGradeData(p => ({ ...p, testAnswers: newAnswers }));
                                    }}
                                    className="w-16 bg-white border-slate-200 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500/10" />
                                  <span className="text-xs font-bold text-slate-400">/ {question?.marks || 0}</span>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-slate-900">{question?.questionText}</p>
                              {ans.textAnswer && (
                                <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm font-medium italic text-slate-600">
                                  Student Answer: {ans.textAnswer}
                                </div>
                              )}
                              {ans.selectedOption !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-400 uppercase">Selected:</span>
                                  <span className="text-sm font-bold text-slate-900">{String.fromCharCode(65 + ans.selectedOption)}</span>
                                  {ans.isCorrect ? <MdCheckCircle className="text-green-500" /> : <MdClose className="text-red-500" />}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Grading Actions Footer */}
                  <div className="p-8 border-t border-slate-50 bg-slate-50/20">
                    <form onSubmit={handleGradeSubmit} className="flex flex-col md:flex-row gap-6 items-end">
                      {activeTab === "assignments" && (
                        <div className="w-full md:w-32">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Grade</p>
                          <div className="relative">
                            <input type="number" value={gradeData.grade} onChange={(e) => setGradeData(p => ({ ...p, grade: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-center font-bold text-xl focus:ring-4 focus:ring-indigo-500/10" required />
                            <span className="absolute right-4 bottom-5 text-[10px] font-bold text-slate-300">/ {currentItem?.maxMarks}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Teacher Feedback</p>
                        <input type="text" value={gradeData.feedback} onChange={(e) => setGradeData(p => ({ ...p, feedback: e.target.value }))}
                          placeholder="Great job! Keep up the good work..."
                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10" />
                      </div>
                      <button type="submit" disabled={isSubmitting}
                        className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:scale-105 disabled:opacity-50">
                        {isSubmitting ? "Saving..." : selectedSub.status === "graded" ? "Update Grade" : "Finalise Grade"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm h-[700px] flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
                    <MdOutlineGrading className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Select a Student</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2">Choose a submission from the list on the left to review and grade.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSubmissions;
