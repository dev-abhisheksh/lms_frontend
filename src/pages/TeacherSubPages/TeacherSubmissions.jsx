import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "react-router-dom";
import {
  MdOutlineGrading,
  MdOutlineSchool,
  MdOutlineAssignment,
  MdCheckCircle,
  MdOutlineAttachFile,
  MdOpenInNew,
  MdOutlineFeedback,
  MdRefresh,
  MdQuiz,
  MdArrowForward,
  MdClose,
  MdOutlineAssignmentInd,
  MdOutlineDoneAll,
  MdArrowBack
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import { getAssignmentsByCourse } from "../../API/assignment.api";
import { getAllSubmissions, gradeSubmission } from "../../API/submission.api";
import { getTestsByCourse, getTestSubmissions, gradeTestSubmission } from "../../API/test.api";
import { connectSubmissionSocket, disconnectSubmissionSocket } from "../../socket/test.socket";

const TeacherSubmissions = () => {
  const { assignmentId: paramAssignmentId } = useParams();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [activeTab, setActiveTab] = useState("assignments");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState({ courses: true, items: false, submissions: false });
  const [gradeData, setGradeData] = useState({ grade: "", feedback: "", testAnswers: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(prev => ({ ...prev, courses: true }));
      try {
        const list = await getTeacherCourses();
        setCourses(list);
        if (list.length > 0 && !selectedCourse) setSelectedCourse(list[0]._id);
      } catch (e) { toast.error("Failed to load courses"); } finally { setLoading(prev => ({ ...prev, courses: false })); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setItems([]); setSelectedItem(""); return; }
    const loadItems = async () => {
      setLoading(prev => ({ ...prev, items: true }));
      try {
        if (activeTab === "assignments") {
          const res = await getAssignmentsByCourse(selectedCourse);
          const list = res.data.assignments || [];
          setItems(list);
          if (paramAssignmentId && list.some(a => a._id === paramAssignmentId)) setSelectedItem(paramAssignmentId);
          else if (list.length > 0) setSelectedItem(list[0]._id);
        } else {
          const res = await getTestsByCourse(selectedCourse);
          const list = res.data.tests || [];
          setItems(list);
          if (list.length > 0) setSelectedItem(list[0]._id);
        }
      } catch (e) { toast.error("Failed to load list"); } finally { setLoading(prev => ({ ...prev, items: false })); }
    };
    loadItems();
  }, [selectedCourse, activeTab, paramAssignmentId]);

  useEffect(() => {
    if (!selectedCourse) return;
    connectSubmissionSocket([selectedCourse], {
      onSubmissionReceived: (data) => {
        const isMatch = activeTab === "assignments" ? data.assignmentId === selectedItem : data.testId === selectedItem;
        if (!isMatch) return;
        setSubmissions(prev => prev.find(s => s._id === data.submission._id) ? prev : [data.submission, ...prev]);
        toast.success(`Submission from ${data.submission.student?.fullName || 'student'}`, { position: 'bottom-right' });
      }
    });
    return () => disconnectSubmissionSocket();
  }, [selectedCourse, selectedItem, activeTab]);

  const loadSubmissions = async () => {
    if (!selectedItem) { setSubmissions([]); setSelectedSub(null); return; }
    setLoading(prev => ({ ...prev, submissions: true }));
    try {
      const res = activeTab === "assignments" ? await getAllSubmissions(selectedItem) : await getTestSubmissions(selectedItem);
      const subs = res.data.submissions || [];
      setSubmissions(subs);
      if (subs.length > 0) setSelectedSub(subs[0]); else setSelectedSub(null);
    } catch (e) { toast.error("Failed to load submissions"); } finally { setLoading(prev => ({ ...prev, submissions: false })); }
  };

  useEffect(() => { loadSubmissions(); }, [selectedItem, activeTab]);

  useEffect(() => {
    if (selectedSub) {
      if (activeTab === "assignments") {
        setGradeData({ grade: selectedSub.grade ?? "", feedback: selectedSub.feedback || "", testAnswers: [] });
      } else {
        setGradeData({
          grade: selectedSub.score ?? "",
          feedback: selectedSub.feedback || "",
          testAnswers: selectedSub.answers?.map(a => ({ questionId: a.questionId, marksObtained: a.marksObtained || 0, isCorrect: a.isCorrect || false })) || []
        });
      }
    }
  }, [selectedSub, activeTab]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsSubmitting(true);
    try {
      if (activeTab === "assignments") await gradeSubmission(selectedSub._id, parseFloat(gradeData.grade), gradeData.feedback);
      else await gradeTestSubmission(selectedSub._id, { gradedAnswers: gradeData.testAnswers, feedback: gradeData.feedback });
      toast.success("Graded successfully");
      loadSubmissions();
    } catch (err) { toast.error("Grading failed"); } finally { setIsSubmitting(false); }
  };

  const currentItem = items.find(i => i._id === selectedItem);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 antialiased font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">Grading Central</h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Review and evaluate student academic progress</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm shrink-0">
            <button onClick={() => setActiveTab("assignments")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "assignments" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"}`}>Assignments</button>
            <button onClick={() => setActiveTab("tests")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "tests" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"}`}>Tests</button>
          </div>
        </header>

        {/* Context Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><MdOutlineSchool className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Course</p>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer truncate">
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              {activeTab === "assignments" ? <MdOutlineAssignment className="w-5 h-5" /> : <MdQuiz className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Assessment</p>
              <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer truncate">
                {items.length === 0 ? <option value="">No items available</option> : items.map(i => <option key={i._id} value={i._id}>{i.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        {!selectedItem ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6"><MdOutlineGrading className="w-8 h-8" /></div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">Define Context</h3>
            <p className="text-xs font-medium text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Select a course and assessment to begin evaluation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Master List */}
            <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:h-[700px] min-h-[400px]">
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Submissions</h2>
                <button onClick={loadSubmissions} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <MdRefresh className={`w-4 h-4 text-slate-400 ${loading.submissions ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                {submissions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-medium italic">Registry empty</div>
                ) : submissions.map((sub) => (
                  <button key={sub._id} onClick={() => setSelectedSub(sub)} className={`w-full p-4 text-left transition-all flex items-center gap-3 ${selectedSub?._id === sub._id ? "bg-indigo-600 text-white" : "hover:bg-slate-50"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] ${selectedSub?._id === sub._id ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                      {sub.student?.fullName?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold truncate ${selectedSub?._id === sub._id ? "text-white" : "text-slate-900"}`}>{sub.student?.fullName}</p>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${selectedSub?._id === sub._id ? "bg-white/20 border-white/30" : sub.status === "graded" ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                        {sub.status === "graded" ? "Evaluated" : "Pending"}
                      </span>
                    </div>
                    {sub.status === "graded" && <MdOutlineDoneAll className={`w-4 h-4 shrink-0 ${selectedSub?._id === sub._id ? "text-white" : "text-green-500"}`} />}
                  </button>
                ))}
              </div>
            </aside>

            {/* Detail View */}
            <main className="lg:col-span-8 flex flex-col gap-6 h-full min-h-[600px]">
              {selectedSub ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:h-[700px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 font-black text-base">{selectedSub.student?.fullName?.charAt(0)}</div>
                       <div>
                         <h3 className="text-lg font-black tracking-tight text-slate-900">{selectedSub.student?.fullName}</h3>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{new Date(selectedSub.submittedAt || selectedSub.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    {selectedSub.status === "graded" && (
                       <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 text-center"><span className="text-[8px] font-black text-green-600 uppercase tracking-widest block mb-0.5">Score</span><p className="text-xl font-black text-slate-900 leading-none">{selectedSub.grade || selectedSub.score} <span className="text-[10px] text-slate-400">/ {currentItem?.maxMarks || currentItem?.totalMarks}</span></p></div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    {activeTab === "assignments" ? (
                      <>
                        {selectedSub.textAnswer && (
                          <div className="space-y-2"><h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><MdOutlineFeedback /> Narrative</h4><div className="bg-slate-50 rounded-xl p-5 text-sm font-medium text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">{selectedSub.textAnswer}</div></div>
                        )}
                        {selectedSub.files?.length > 0 && (
                          <div className="space-y-2"><h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><MdOutlineAttachFile /> Assets</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedSub.files.map((file, idx) => (
                              <a key={idx} href={file.secure_url || file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-600 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all"><MdOutlineAttachFile className="w-5 h-5" /></div>
                                <div className="min-w-0 flex-1"><p className="text-xs font-bold truncate text-slate-900">{file.original_filename || "Record"}</p><p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">{(file.bytes / 1024).toFixed(0)} KB</p></div>
                                <MdOpenInNew className="w-4 h-4 text-slate-200 group-hover:text-indigo-600" />
                              </a>
                            ))}
                          </div></div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4">
                        {selectedSub.answers?.map((ans, idx) => {
                          const question = currentItem?.questions.find(q => q._id === ans.questionId);
                          return (
                            <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                              <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-slate-100">Q{idx + 1} • {question?.type}</span><div className="flex items-center gap-2"><input type="number" value={gradeData.testAnswers[idx]?.marksObtained || 0} onChange={(e) => { const nas = [...gradeData.testAnswers]; nas[idx].marksObtained = Number(e.target.value); nas[idx].isCorrect = Number(e.target.value) > 0; setGradeData(p => ({ ...p, testAnswers: nas })); }} className="w-14 bg-white border-slate-200 rounded-lg p-1 text-center font-black text-sm" /><span className="text-[10px] font-bold text-slate-400">/ {question?.marks}</span></div></div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{question?.questionText}</p>
                              {ans.textAnswer && <div className="bg-white p-3 rounded-lg border border-slate-100 text-xs font-medium italic text-slate-600 leading-relaxed">"{ans.textAnswer}"</div>}
                              {ans.selectedOption !== undefined && <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${ans.isCorrect ? 'bg-green-50 text-green-600 border-green-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>Opt {String.fromCharCode(65 + ans.selectedOption)} {ans.isCorrect ? <MdCheckCircle /> : <MdClose />}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <form onSubmit={handleGradeSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                      {activeTab === "assignments" && (
                        <div className="w-full sm:w-32"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Score</p><div className="relative"><input type="number" value={gradeData.grade} onChange={(e) => setGradeData(p => ({ ...p, grade: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-center font-black text-xl focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" required /><span className="absolute right-3 bottom-4 text-[8px] font-black text-slate-300">/ {currentItem?.maxMarks}</span></div></div>
                      )}
                      <div className="flex-1 w-full"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Commentary</p><input type="text" value={gradeData.feedback} onChange={(e) => setGradeData(p => ({ ...p, feedback: e.target.value }))} placeholder="Feedback..." className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-300" /></div>
                      <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50">{isSubmitting ? "Sync..." : "Finalize"}</button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm h-full flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6"><MdOutlineGrading className="w-8 h-8" /></div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Evaluation Studio</h3>
                  <p className="text-xs font-medium text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Select a student submission to launch assessment.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
};

export default TeacherSubmissions;
