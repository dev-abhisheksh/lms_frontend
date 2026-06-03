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
  MdHelpOutline,
  MdOutlineAssignmentInd,
  MdOutlineDoneAll
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import { getAssignmentsByCourse, getAssignmentById } from "../../API/assignment.api";
import { getAllSubmissions, gradeSubmission } from "../../API/submission.api";
import { getTestsByCourse, getTestSubmissions, gradeTestSubmission } from "../../API/test.api";
import { connectSubmissionSocket, disconnectSubmissionSocket } from "../../socket/test.socket";

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

  useEffect(() => {
    if (!selectedCourse) return

    connectSubmissionSocket([selectedCourse], {
      onSubmissionReceived: (data) => {
        const isMatch = activeTab === "assignments" 
          ? data.assignmentId === selectedItem 
          : data.testId === selectedItem;

        if (!isMatch) return;
        
        setSubmissions(prev => {
          if (prev.find(s => s._id === data.submission._id)) return prev;
          return [data.submission, ...prev];
        });
        
        toast.success(`New submission from ${data.submission.student?.fullName || 'a student'}`);
      }
    })

    return () => disconnectSubmissionSocket()

  }, [selectedCourse, selectedItem, activeTab])

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

  /* ── Tab Switching ── */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItem("");
    setSubmissions([]);
    setSelectedSub(null);
    setItems([]);
  };

  /* ── Render Helper ── */
  const currentItem = items.find(i => i._id === selectedItem);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Grading Central</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Refine and evaluate student academic progress</p>
          </div>

          <div className="flex bg-white p-1 rounded-[20px] border border-slate-100 shadow-sm">
            <button
              onClick={() => handleTabChange("assignments")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "assignments" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              Assignments
            </button>
            <button
              onClick={() => handleTabChange("tests")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "tests" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              Examinations
            </button>
          </div>
        </div>

        {/* ── Navigation & Context Selectors ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
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
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              {activeTab === "assignments" ? <MdOutlineAssignment className="w-5 h-5" /> : <MdQuiz className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contextual Assessment</p>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {items.length === 0 ? <option value="">No assessments available</option> : (
                  items.map(i => (
                    <option key={i._id} value={i._id}>{i.title}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* ── Primary Workspace ── */}
        {!selectedItem ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
               <MdOutlineGrading className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Select an Assessment</h3>
            <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
              To begin the evaluation process, please define the academic context by selecting a course and an active assessment above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Master: Submission Registry (lg:col-span-4) */}
            <aside className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:h-[750px] min-h-[400px]">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Submission Log</h2>
                <button onClick={loadSubmissions} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <MdRefresh className={`w-4 h-4 text-slate-400 ${loading.submissions ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
                {submissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <MdOutlineAssignmentInd className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-400">No submissions to display</p>
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const isSelected = selectedSub?._id === sub._id;
                    const isGraded = sub.status === "graded";
                    return (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedSub(sub)}
                        className={`w-full p-6 text-left transition-all flex items-center gap-4 group ${isSelected ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50"
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm transition-colors ${isSelected ? "bg-white/20" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                          }`}>
                          <span className="font-black text-xs">{sub.student?.fullName?.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {sub.student?.fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                               isSelected 
                                 ? "bg-white/20 border-white/30 text-white" 
                                 : isGraded 
                                   ? "bg-green-50 border-green-100 text-green-600" 
                                   : "bg-amber-50 border-amber-100 text-amber-600"
                             }`}>
                               {isGraded ? "Evaluated" : "Awaiting Review"}
                             </span>
                          </div>
                        </div>
                        {isGraded && <MdOutlineDoneAll className={`w-5 h-5 shrink-0 ${isSelected ? "text-white" : "text-green-500"}`} />}
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Detail: Evaluation Studio (lg:col-span-8) */}
            <main className="lg:col-span-8 flex flex-col gap-8">
              {selectedSub ? (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:h-[750px] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Detail Header */}
                  <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 font-black text-lg">
                          {selectedSub.student?.fullName?.charAt(0)}
                       </div>
                       <div>
                         <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{selectedSub.student?.fullName}</h3>
                         <p className="text-xs font-medium text-slate-500">{selectedSub.student?.email}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</span>
                      <span className="text-sm font-bold text-slate-900">
                        {new Date(selectedSub.submittedAt || selectedSub.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Submission Content */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
                    {activeTab === "assignments" ? (
                      <>
                        {selectedSub.textAnswer && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                               <MdOutlineFeedback /> Student Narrative
                            </h4>
                            <div className="bg-slate-50 rounded-[32px] p-8 text-sm md:text-base font-medium text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
                              {selectedSub.textAnswer}
                            </div>
                          </div>
                        )}
                        {selectedSub.files?.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                               <MdOutlineAttachFile /> Supporting Documents ({selectedSub.files.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedSub.files.map((file, idx) => (
                                <a key={idx} href={file.secure_url || file.url} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[24px] hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    <MdOutlineAttachFile className="w-6 h-6" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold truncate text-slate-900">{file.original_filename || "Archive Record"}</p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{(file.bytes / 1024).toFixed(0)} KB • Download</p>
                                  </div>
                                  <MdOpenInNew className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* ── Test Content ── */
                      <div className="space-y-6">
                        {selectedSub.answers?.map((ans, idx) => {
                          const question = currentItem?.questions.find(q => q._id === ans.questionId);
                          return (
                            <div key={idx} className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-6">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                   Task {idx + 1} • {question?.type}
                                </span>
                                <div className="flex items-center gap-3">
                                  <input type="number"
                                    value={gradeData.testAnswers[idx]?.marksObtained || 0}
                                    onChange={(e) => {
                                      const newAnswers = [...gradeData.testAnswers];
                                      newAnswers[idx].marksObtained = Number(e.target.value);
                                      newAnswers[idx].isCorrect = Number(e.target.value) > 0;
                                      setGradeData(p => ({ ...p, testAnswers: newAnswers }));
                                    }}
                                    className="w-20 bg-white border-slate-200 rounded-xl p-2 text-center font-black text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                                  <span className="text-xs font-bold text-slate-400">/ {question?.marks || 0} Points</span>
                                </div>
                              </div>
                              <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">{question?.questionText}</p>
                              {ans.textAnswer && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm font-medium italic text-slate-600 leading-relaxed shadow-sm">
                                  <span className="block text-[10px] font-black uppercase text-slate-300 mb-2 tracking-widest">Student Response:</span>
                                  {ans.textAnswer}
                                </div>
                              )}
                              {ans.selectedOption !== undefined && (
                                <div className="flex items-center gap-4">
                                  <div className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 border ${ans.isCorrect ? 'bg-green-50 text-green-600 border-green-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                     Option {String.fromCharCode(65 + ans.selectedOption)}
                                     {ans.isCorrect ? <MdCheckCircle /> : <MdClose />}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Grading Studio Controls */}
                  <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                    <form onSubmit={handleGradeSubmit} className="flex flex-col md:flex-row gap-8 items-end">
                      {activeTab === "assignments" && (
                        <div className="w-full md:w-40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Evaluation Score</p>
                          <div className="relative group">
                            <input type="number" value={gradeData.grade} onChange={(e) => setGradeData(p => ({ ...p, grade: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-[24px] p-5 text-center font-black text-2xl focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-sm" required />
                            <span className="absolute right-5 bottom-7 text-[10px] font-black text-slate-300">/ {currentItem?.maxMarks}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Professional Feedback</p>
                        <div className="relative">
                           <MdOutlineFeedback className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                           <input type="text" value={gradeData.feedback} onChange={(e) => setGradeData(p => ({ ...p, feedback: e.target.value }))}
                             placeholder="Provide constructive insights..."
                             className="w-full bg-white border border-slate-200 rounded-[24px] p-5 pl-14 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-300 placeholder:font-medium" />
                        </div>
                      </div>
                      <button type="submit" disabled={isSubmitting}
                        className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                        {isSubmitting ? "Syncing..." : selectedSub.status === "graded" ? "Update Record" : "Finalize Grade"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm h-[750px] flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                    <MdOutlineGrading className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Evaluation Studio</h3>
                  <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
                    Select a student submission from the registry to launch the assessment interface and provide grades.
                  </p>
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
