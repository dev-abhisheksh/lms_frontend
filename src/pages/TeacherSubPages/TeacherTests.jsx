import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdArrowBack,
  MdGridView,
  MdCheckCircle,
  MdHelpOutline,
  MdClose,
  MdSend,
  MdVisibility,
  MdDelete,
  MdEdit,
  MdSchedule,
  MdBook,
  MdQuiz,
  MdSchool,
  MdPeople,
  MdErrorOutline,
  MdCheck,
  MdChevronRight,
  MdSearch,
  MdMoreVert,
  MdEmojiEvents,
  MdOutlinePublish,
  MdOutlineUnpublished
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import {
  createTest,
  getTestsByCourse,
  updateTest,
  deleteTest,
  togglePublishTest,
  getTestSubmissions,
  gradeTestSubmission,
} from "../../API/test.api";

/* ── Design System Components ───────────────────────── */

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-tight">{value ?? "—"}</p>
    </div>
  </div>
);

const Badge = ({ children, colorClass }) => (
  <span className={`px-2 py-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border ${colorClass}`}>
    {children}
  </span>
);

/* ── Helpers ────────────────────────────────────────── */

const emptyQuestion = (type) => ({
  questionText: "",
  type: type === "mixed" ? "mcq" : type,
  marks: 1,
  options:
    type === "essay"
      ? []
      : [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
});

const defaultForm = {
  title: "",
  description: "",
  type: "mcq",
  duration: 60,
  totalQuestions: 5,
  totalMarks: 100,
  passingMarks: 40,
  isPublished: false,
  questions: [],
};

const testTypesMeta = {
  mcq: { label: "MCQ", color: "bg-blue-50 text-blue-600 border-blue-100" },
  obt: { label: "Objective", color: "bg-purple-50 text-purple-600 border-purple-100" },
  essay: { label: "Essay", color: "bg-green-50 text-green-600 border-green-100" },
  mixed: { label: "Mixed", color: "bg-orange-50 text-orange-600 border-orange-100" },
};

/* ── Component ───────────────────────────────────────── */

const TeacherTests = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [step, setStep] = useState(1); // 1 = meta, 2 = questions
  const [saving, setSaving] = useState(false);

  // Submissions view state
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingData, setGradingData] = useState([]); // Array of { questionId, marksObtained, isCorrect }
  const [gradingFeedback, setGradingFeedback] = useState("");

  /* ── Calculations ── */
  const currentCourse = useMemo(() => courses.find(c => c._id === selectedCourse), [courses, selectedCourse]);
  
  useEffect(() => {
    const total = formData.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    if (total !== formData.totalMarks) {
      setFormData(p => ({ ...p, totalMarks: total }));
    }
  }, [formData.questions]);

  /* ── Load Data ── */
  useEffect(() => {
    (async () => {
      try {
        const list = await getTeacherCourses();
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0]._id);
      } catch (e) {
        console.error("Error loading courses:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getTestsByCourse(selectedCourse);
        setTests(res.data.tests || []);
        setViewingSubmissionsFor(null);
        setShowForm(false);
      } catch (e) {
        console.error("Error loading tests:", e);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCourse]);

  /* ── Handlers ── */
  const loadSubmissions = async (testId) => {
    setLoadingSubmissions(true);
    try {
      const res = await getTestSubmissions(testId);
      setSubmissions(res.data.submissions || []);
      setViewingSubmissionsFor(testId);
      setShowForm(false);
    } catch (e) {
      toast.error("Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const goToQuestions = () => {
    if (!formData.title.trim()) return toast.error("Please enter a title");
    const count = Number(formData.totalQuestions) || 1;
    const testType = formData.type;
    
    setFormData((p) => {
      let qs = [...(p.questions || [])];
      if (testType !== "mixed") {
        qs = qs.map(q => ({
          ...q,
          type: testType,
          options: testType === "essay" ? [] : (testType === "obt" ? [{ text: q.options[0]?.text || "", isCorrect: true }] : q.options)
        }));
      }
      while (qs.length < count) { qs.push(emptyQuestion(testType)); }
      qs = qs.slice(0, count);
      return { ...p, questions: qs };
    });
    setStep(2);
  };

  const updateQuestion = (idx, field, value) => {
    setFormData((p) => {
      const qs = [...p.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      return { ...p, questions: qs };
    });
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    setFormData((p) => {
      const qs = [...p.questions];
      const opts = [...qs[qIdx].options];
      const qType = qs[qIdx].type;
      if (field === "isCorrect" && (qType === "mcq" || qType === "obt")) {
        opts.forEach((o, i) => (opts[i] = { ...o, isCorrect: i === oIdx }));
      } else {
        opts[oIdx] = { ...opts[oIdx], [field]: value };
      }
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...p, questions: qs };
    });
  };

  const addOption = (qIdx) => {
    setFormData((p) => {
      const qs = [...p.questions];
      qs[qIdx] = { ...qs[qIdx], options: [...qs[qIdx].options, { text: "", isCorrect: false }] };
      return { ...p, questions: qs };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setFormData((p) => {
      const qs = [...p.questions];
      qs[qIdx] = { ...qs[qIdx], options: qs[qIdx].options.filter((_, i) => i !== oIdx) };
      return { ...p, questions: qs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return toast.error("Select a course first");
    const invalid = formData.questions.some(q => !q.questionText.trim());
    if (invalid) return toast.error("All questions must have text");

    setSaving(true);
    try {
      if (editingTestId) {
        await updateTest(editingTestId, formData);
        toast.success("Test updated!");
      } else {
        await createTest(selectedCourse, formData);
        toast.success("Test created!");
      }
      resetForm();
      const res = await getTestsByCourse(selectedCourse);
      setTests(res.data.tests || []);
    } catch (err) {
      toast.error("Failed to save: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setShowForm(false);
    setEditingTestId(null);
    setStep(1);
  };

  const handleEdit = (test) => {
    setEditingTestId(test._id);
    setFormData({
      title: test.title || "",
      description: test.description || "",
      type: test.type || "mcq",
      duration: test.duration || 60,
      totalQuestions: test.totalQuestions || 5,
      totalMarks: test.totalMarks || 100,
      passingMarks: test.passingMarks || 40,
      isPublished: test.isPublished || false,
      questions: test.questions || [],
    });
    setStep(1);
    setShowForm(true);
    setViewingSubmissionsFor(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    try {
      await deleteTest(id);
      setTests((p) => p.filter((t) => t._id !== id));
      toast.success("Test deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (id) => {
    try {
      await togglePublishTest(id);
      const res = await getTestsByCourse(selectedCourse);
      setTests(res.data.tests || []);
      toast.success("Status updated");
    } catch (e) {
      toast.error("Toggle failed");
    }
  };

  const startGrading = (sub) => {
    setGradingSubmission(sub);
    setGradingData(sub.answers.map(a => ({
      questionId: a.questionId,
      marksObtained: a.marksObtained || 0,
      isCorrect: a.isCorrect || false
    })));
    setGradingFeedback(sub.feedback || "");
  };

  const submitGrade = async () => {
    try {
      await gradeTestSubmission(gradingSubmission._id, {
        gradedAnswers: gradingData,
        feedback: gradingFeedback
      });
      toast.success("Graded successfully");
      setGradingSubmission(null);
      loadSubmissions(viewingSubmissionsFor);
    } catch (e) {
      toast.error("Grading failed");
    }
  };

  /* ── Render Parts ── */

  const renderMaster = () => (
    <div className="lg:col-span-4 space-y-4">
      {/* Course Selection */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Selected Course</label>
        <div className="relative">
          <MdBook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-900">Assessments</h3>
          <span className="text-[10px] font-bold text-gray-400">{tests.length} Total</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : tests.length === 0 ? (
            <div className="p-8 text-center">
              <MdQuiz className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">No tests created yet.</p>
            </div>
          ) : (
            tests.map((test) => {
              const meta = testTypesMeta[test.type] || testTypesMeta.mcq;
              const isActive = editingTestId === test._id || viewingSubmissionsFor === test._id;
              return (
                <div 
                  key={test._id} 
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 flex items-center gap-3 ${isActive ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => {
                    if (viewingSubmissionsFor === test._id) return;
                    setViewingSubmissionsFor(null);
                    setShowForm(false);
                    setEditingTestId(test._id);
                    handleEdit(test);
                  }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color.split(' ')[0]} ${meta.color.split(' ')[1]}`}>
                    <MdQuiz className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{test.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge colorClass={meta.color}>{meta.label}</Badge>
                      <Badge colorClass={test.isPublished ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}>
                        {test.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      loadSubmissions(test._id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${viewingSubmissionsFor === test._id ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}
                    title="View Submissions"
                  >
                    <MdPeople className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-gray-50/30 border-t border-gray-100">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-sm"
          >
            <MdAdd className="w-4 h-4" /> Create New Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Stepper */}
      <div className="flex bg-gray-50/50 border-b border-gray-100">
        <button
          onClick={() => setStep(1)}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            step === 1 ? "text-indigo-600 bg-white" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          1. Test Configuration
        </button>
        <button
          onClick={() => formData.title && goToQuestions()}
          disabled={!formData.title}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            step === 2 ? "text-indigo-600 bg-white" : "text-gray-400 hover:text-gray-600"
          } disabled:opacity-50`}
        >
          2. Question Bank ({formData.questions.length})
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {step === 1 ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Test Title</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleField} required
                  placeholder="e.g. Mid-term Physics Quiz"
                  className="w-full p-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Assessment Type</label>
                <select 
                  name="type" value={formData.type} onChange={handleField}
                  className="w-full p-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition"
                >
                  <option value="mcq">MCQ (Multiple Choice)</option>
                  <option value="obt">Objective (Exact Match)</option>
                  <option value="essay">Essay (Subjective)</option>
                  <option value="mixed">Mixed Types</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Description</label>
              <textarea 
                name="description" value={formData.description} onChange={handleField} rows="2"
                placeholder="Brief instructions for students..."
                className="w-full p-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Time Limit (Min)</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleField}
                  className="w-full p-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Questions</label>
                <input type="number" name="totalQuestions" value={formData.totalQuestions} onChange={handleField}
                  className="w-full p-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Marks</label>
                <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleField} disabled
                  className="w-full p-3 bg-gray-200 border-transparent rounded-xl text-xs font-bold opacity-50 cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Pass Mark</label>
                <input type="number" name="passingMarks" value={formData.passingMarks} onChange={handleField}
                  className="w-full p-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition">Cancel</button>
              <button 
                type="button" 
                onClick={goToQuestions}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
              >
                Proceed to Questions
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {formData.questions.map((q, qi) => (
                <div key={qi} className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-100">
                        {qi + 1}
                      </span>
                      {formData.type === "mixed" && (
                        <select 
                          value={q.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateQuestion(qi, "type", newType);
                            if (newType === "essay") updateQuestion(qi, "options", []);
                            else if (newType === "obt") updateQuestion(qi, "options", [{ text: "", isCorrect: true }]);
                            else if (newType === "mcq") updateQuestion(qi, "options", [
                              { text: "", isCorrect: true }, { text: "", isCorrect: false },
                              { text: "", isCorrect: false }, { text: "", isCorrect: false },
                            ]);
                          }}
                          className="bg-white border-transparent rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                        >
                          <option value="mcq">MCQ</option>
                          <option value="obt">Objective</option>
                          <option value="essay">Essay</option>
                        </select>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-gray-400">Weightage</span>
                      <input 
                        type="number" value={q.marks} min="1"
                        onChange={(e) => updateQuestion(qi, "marks", Number(e.target.value))}
                        className="w-16 p-1.5 bg-white border-transparent rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500/10 shadow-sm" 
                      />
                    </div>
                  </div>

                  <textarea 
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                    placeholder="Type your question here..."
                    className="w-full p-4 bg-white border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                    rows="2"
                  />

                  {/* MCQ Options */}
                  {q.type === "mcq" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateOption(qi, oi, "isCorrect", true)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${opt.isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-white text-gray-300 border border-gray-100 hover:border-green-500'}`}
                          >
                            <MdCheck className="w-3.5 h-3.5" />
                          </button>
                          <input 
                            type="text" value={opt.text}
                            onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            className={`flex-1 p-2 bg-white border-transparent rounded-lg text-xs font-medium focus:ring-2 transition shadow-sm ${opt.isCorrect ? 'focus:ring-green-500/10 border-green-200' : 'focus:ring-indigo-500/10'}`}
                          />
                          {q.options.length > 2 && (
                            <button type="button" onClick={() => removeOption(qi, oi)} className="text-gray-300 hover:text-red-500 transition"><MdClose className="w-4 h-4" /></button>
                          )}
                        </div>
                      ))}
                      {q.options.length < 6 && (
                        <button type="button" onClick={() => addOption(qi)} className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest p-2">
                          <MdAdd className="w-3 h-3" /> Add Choice
                        </button>
                      )}
                    </div>
                  )}

                  {/* Objective (OBT) */}
                  {q.type === "obt" && (
                    <div className="pl-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Correct Answer Key</label>
                      <input 
                        type="text" value={q.options[0]?.text || ""}
                        onChange={(e) => updateOption(qi, 0, "text", e.target.value)}
                        placeholder="Type exact answer for auto-matching..."
                        className="w-full p-3 bg-green-50/30 border border-green-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-green-500/10 transition"
                      />
                    </div>
                  )}

                  {q.type === "essay" && (
                    <div className="pl-2 flex items-center gap-2 text-orange-500">
                      <MdErrorOutline className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Requires Manual Grading</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition">← Back to Configuration</button>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleDelete(editingTestId)} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition"><MdDelete className="w-5 h-5" /></button>
                <button 
                  type="submit" disabled={saving}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {saving ? "Processing..." : editingTestId ? "Save Changes" : "Deploy Assessment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );

  const renderSubmissions = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-900">Student Submissions</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Test: {tests.find(t => t._id === viewingSubmissionsFor)?.title}
          </p>
        </div>
        <button 
          onClick={() => setViewingSubmissionsFor(null)}
          className="p-2 text-gray-400 hover:text-gray-900 transition"
        >
          <MdClose className="w-5 h-5" />
        </button>
      </div>

      <div className="divide-y divide-gray-50 min-h-[400px]">
        {loadingSubmissions ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Retrieving entries...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-20 text-center">
            <MdPeople className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900">No submissions yet</p>
            <p className="text-xs text-gray-400 mt-1">Once students take the test, they will appear here.</p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                  {sub.student?.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{sub.student?.fullName}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-base font-black text-indigo-600 leading-none">{sub.score} <span className="text-[10px] text-gray-400">/ {sub.totalMarks}</span></p>
                  <Badge colorClass={sub.status === "graded" ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"}>
                    {sub.status}
                  </Badge>
                </div>
                <button 
                  onClick={() => startGrading(sub)}
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Grade
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Assessment Portal</h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Manage tests, quizzes and student performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/teacher")}
              className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition shadow-sm"
            >
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div className="relative group hidden sm:block">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" placeholder="Search tests..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition shadow-sm w-48"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MdBook} label="Assigned Courses" value={courses.length} colorClass="bg-blue-50 text-blue-600" />
          <StatCard icon={MdQuiz} label="Total Tests" value={tests.length} colorClass="bg-indigo-50 text-indigo-600" />
          <StatCard icon={MdCheckCircle} label="Published" value={tests.filter(t => t.isPublished).length} colorClass="bg-green-50 text-green-600" />
          <StatCard icon={MdEmojiEvents} label="Avg Score" value={tests.length > 0 ? "72%" : "—"} colorClass="bg-orange-50 text-orange-600" />
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {renderMaster()}

          <div className="lg:col-span-8">
            {showForm ? renderForm() : viewingSubmissionsFor ? renderSubmissions() : (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-16 h-16 bg-indigo-50 rounded-[20px] flex items-center justify-center text-indigo-600 mb-6">
                  <MdGridView className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Select an Assessment</h2>
                <p className="text-xs font-medium text-gray-400 max-w-xs mx-auto">
                  Choose a test from the sidebar to edit its configuration or view student performance and grading.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
                   <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <MdQuiz className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Build Quiz</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <MdPeople className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grade Work</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <MdSend className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Publish</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Grading Modal ── */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-gray-900">Review Submission</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Student: {gradingSubmission.student?.fullName}</p>
              </div>
              <button onClick={() => setGradingSubmission(null)} className="p-2 hover:bg-white rounded-xl transition text-gray-400 hover:text-gray-900">
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {gradingSubmission.answers.map((ans, idx) => {
                const question = tests.find(t => t._id === viewingSubmissionsFor)?.questions.find(q => q._id === ans.questionId);
                return (
                  <div key={idx} className="p-5 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Question {idx + 1}</span>
                      <Badge colorClass="bg-indigo-50 text-indigo-600 border-indigo-100">{question?.marks} Marks</Badge>
                    </div>
                    <p className="text-xs font-bold text-gray-900">{question?.questionText || "Question text not available"}</p>
                    
                    {ans.textAnswer && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-xs font-medium text-gray-600 italic">
                         "{ans.textAnswer}"
                      </div>
                    )}
                    
                    {ans.selectedOption !== undefined && (
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-gray-400 uppercase">Selected:</span>
                         <span className="text-xs font-bold text-indigo-600">Option {String.fromCharCode(65 + ans.selectedOption)}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-50 mt-4">
                      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Awarded</label>
                        <input type="number" 
                          value={gradingData[idx]?.marksObtained || 0} 
                          max={question?.marks || 100}
                          onChange={(e) => {
                            const newData = [...gradingData];
                            newData[idx].marksObtained = Number(e.target.value);
                            newData[idx].isCorrect = Number(e.target.value) > 0;
                            setGradingData(newData);
                          }}
                          className="w-12 bg-transparent border-none p-0 text-xs font-black text-indigo-600 focus:ring-0" 
                        />
                        <span className="text-[10px] text-gray-300 font-bold">/ {question?.marks}</span>
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${gradingData[idx]?.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-200 group-hover:border-indigo-500'}`}
                          onClick={() => {
                            const newData = [...gradingData];
                            newData[idx].isCorrect = !newData[idx].isCorrect;
                            setGradingData(newData);
                          }}
                        >
                          {gradingData[idx]?.isCorrect && <MdCheck className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase group-hover:text-gray-900">Mark Correct</span>
                      </label>
                    </div>
                  </div>
                );
              })}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Teacher Feedback</label>
                <textarea 
                  value={gradingFeedback} onChange={(e) => setGradingFeedback(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-transparent rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 transition shadow-inner" 
                  rows="3" 
                  placeholder="Provide constructive feedback..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
              <button onClick={() => setGradingSubmission(null)} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition">Discard</button>
              <button 
                onClick={submitGrade} 
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
};

export default TeacherTests;
