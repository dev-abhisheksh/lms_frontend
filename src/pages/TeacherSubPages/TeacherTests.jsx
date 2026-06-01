import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdQuiz,
  MdCheckCircle,
  MdHelpOutline,
  MdClose,
  MdPublish,
  MdUnpublished,
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import {
  createTest,
  getTestsByCourse,
  updateTest,
  deleteTest,
  togglePublishTest,
} from "../../API/test.api";

/* ── helpers ─────────────────────────────────────────── */
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

const testTypesMeta = [
  { id: "mcq", label: "MCQ", color: "bg-blue-100 text-blue-700" },
  { id: "obt", label: "Objective", color: "bg-purple-100 text-purple-700" },
  { id: "essay", label: "Essay", color: "bg-green-100 text-green-700" },
  { id: "mixed", label: "Mixed", color: "bg-orange-100 text-orange-700" },
];

/* ── component ───────────────────────────────────────── */
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

  /* ── auto-calculate total marks ── */
  useEffect(() => {
    const total = formData.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    if (total !== formData.totalMarks) {
      setFormData(p => ({ ...p, totalMarks: total }));
    }
  }, [formData.questions]);

  /* ── load courses ── */
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

  /* ── load tests when course changes ── */
  useEffect(() => {
    if (!selectedCourse) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getTestsByCourse(selectedCourse);
        setTests(res.data.tests || []);
        setViewingSubmissionsFor(null);
      } catch (e) {
        console.error("Error loading tests:", e);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCourse]);

  /* ── load submissions ── */
  const loadSubmissions = async (testId) => {
    setLoadingSubmissions(true);
    try {
      const { getTestSubmissions } = await import("../../API/test.api");
      const res = await getTestSubmissions(testId);
      setSubmissions(res.data.submissions || []);
      setViewingSubmissionsFor(testId);
    } catch (e) {
      toast.error("Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* ── form field handler ── */
  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  /* ── go from step-1 (meta) → step-2 (questions) ── */
  const goToQuestions = () => {
    if (!formData.title.trim()) return toast.error("Please enter a title");
    const count = Number(formData.totalQuestions) || 1;
    const testType = formData.type;
    
    setFormData((p) => {
      let qs = [...(p.questions || [])];
      
      // Reconcile types if not mixed
      if (testType !== "mixed") {
        qs = qs.map(q => ({
          ...q,
          type: testType,
          options: testType === "essay" ? [] : (testType === "obt" ? [{ text: q.options[0]?.text || "", isCorrect: true }] : q.options)
        }));
      }

      // grow
      while (qs.length < count) {
        qs.push(emptyQuestion(testType));
      }
      // shrink
      qs = qs.slice(0, count);
      
      return { ...p, questions: qs };
    });
    setStep(2);
  };

  /* ── question helpers ── */
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
        // for MCQ/OBT, usually one correct. (Simplified)
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
      qs[qIdx] = {
        ...qs[qIdx],
        options: [...qs[qIdx].options, { text: "", isCorrect: false }],
      };
      return { ...p, questions: qs };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setFormData((p) => {
      const qs = [...p.questions];
      qs[qIdx] = {
        ...qs[qIdx],
        options: qs[qIdx].options.filter((_, i) => i !== oIdx),
      };
      return { ...p, questions: qs };
    });
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return toast.error("Select a course first");

    // Validation
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
      console.error("Save error:", err);
      toast.error("Failed to save test: " + (err.response?.data?.message || err.message));
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

  /* ── grading ── */
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
      const { gradeTestSubmission } = await import("../../API/test.api");
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

  /* ── edit ── */
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    try {
      await deleteTest(id);
      setTests((p) => p.filter((t) => t._id !== id));
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  /* ── toggle publish ── */
  const handleToggle = async (id) => {
    try {
      await togglePublishTest(id);
      const res = await getTestsByCourse(selectedCourse);
      setTests(res.data.tests || []);
    } catch (e) {
      console.error(e);
    }
  };

  const typeMeta = (t) => testTypesMeta.find((m) => m.id === t) || testTypesMeta[0];

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/teacher")} className="p-2 hover:bg-gray-200 rounded-lg transition">
              <MdArrowBack className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tests & Quizzes</h1>
              <p className="text-sm text-gray-500">Create and manage assessments</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else { setShowForm(true); setStep(1); }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            {showForm ? <MdClose className="w-5 h-5" /> : <MdAdd className="w-5 h-5" />}
            {showForm ? "Cancel" : "New Test"}
          </button>
        </div>

        {/* ── Course Selector ── */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">-- Select a course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* ═══════════ FORM ═══════════ */}
        {showForm && selectedCourse && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* stepper */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  step === 1 ? "bg-orange-50 text-orange-700 border-b-2 border-orange-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                1. Test Details
              </button>
              <button
                onClick={() => formData.title && goToQuestions()}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  step === 2 ? "bg-orange-50 text-orange-700 border-b-2 border-orange-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                2. Questions ({formData.questions.length}/{formData.totalQuestions || 0})
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* ── STEP 1: Meta ── */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleField} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      placeholder="e.g. Python Basics Quiz" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleField} rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      placeholder="Describe the test objectives" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                      <select name="type" value={formData.type} onChange={handleField}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                        <option value="mcq">MCQ</option>
                        <option value="obt">Objective</option>
                        <option value="essay">Essay</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
                      <input type="number" name="duration" value={formData.duration} onChange={handleField} min="1"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                      <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleField} min="1"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Pass Marks</label>
                      <input type="number" name="passingMarks" value={formData.passingMarks} onChange={handleField} min="0"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Number of Questions *</label>
                    <input type="number" name="totalQuestions" value={formData.totalQuestions} onChange={handleField} min="1" max="100"
                      className="w-full sm:w-40 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="button" onClick={goToQuestions}
                      className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                      Next → Add Questions
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 2: Questions ── */}
              {step === 2 && (
                <>
                  <p className="text-sm text-gray-500">
                    Fill in <span className="font-semibold text-gray-800">{formData.questions.length}</span> question(s)
                    for this <span className="font-semibold">{formData.type.toUpperCase()}</span> test.
                  </p>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                    {formData.questions.map((q, qi) => (
                      <div key={qi} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                            Q{qi + 1}
                          </span>
                          {formData.type === "mixed" && (
                            <select value={q.type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                updateQuestion(qi, "type", newType);
                                if (newType === "essay") {
                                  updateQuestion(qi, "options", []);
                                } else if (newType === "obt") {
                                  updateQuestion(qi, "options", [{ text: "", isCorrect: true }]);
                                } else if (newType === "mcq") {
                                  updateQuestion(qi, "options", [
                                    { text: "", isCorrect: true },
                                    { text: "", isCorrect: false },
                                    { text: "", isCorrect: false },
                                    { text: "", isCorrect: false },
                                  ]);
                                }
                              }}
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-orange-500 focus:outline-none">
                              <option value="mcq">MCQ</option>
                              <option value="obt">Objective</option>
                              <option value="essay">Essay</option>
                            </select>
                          )}
                          <input type="number" value={q.marks} min="1"
                            onChange={(e) => updateQuestion(qi, "marks", Number(e.target.value))}
                            className="w-20 text-xs border border-gray-300 rounded-lg px-2 py-1 text-right focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            title="Marks" />
                        </div>

                        {/* question text */}
                        <textarea value={q.questionText}
                          onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                          rows="2" placeholder={`Enter question ${qi + 1}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />

                        {/* options (MCQ) */}
                        {q.type === "mcq" && (
                          <div className="space-y-2 pl-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input type="radio" name={`correct-${qi}`}
                                  checked={opt.isCorrect}
                                  onChange={() => updateOption(qi, oi, "isCorrect", true)}
                                  className="w-4 h-4 text-green-600 accent-green-600" title="Mark as correct" />
                                <input type="text" value={opt.text}
                                  onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                  className={`flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                                    opt.isCorrect
                                      ? "border-green-400 bg-green-50/50 focus:ring-green-400"
                                      : "border-gray-300 focus:ring-orange-500"
                                  }`} />
                                {q.options.length > 2 && (
                                  <button type="button" onClick={() => removeOption(qi, oi)}
                                    className="p-1 text-red-400 hover:text-red-600 transition"><MdClose className="w-4 h-4" /></button>
                                )}
                              </div>
                            ))}
                            {q.options.length < 6 && (
                              <button type="button" onClick={() => addOption(qi)}
                                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 mt-1">
                                <MdAdd className="w-3.5 h-3.5" /> Add Option
                              </button>
                            )}
                          </div>
                        )}

                        {/* Objective (OBT) - Single correct answer input */}
                        {q.type === "obt" && (
                          <div className="pl-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expected Correct Answer</label>
                            <input 
                              type="text" 
                              value={q.options[0]?.text || ""}
                              onChange={(e) => updateOption(qi, 0, "text", e.target.value)}
                              placeholder="Type the exact expected answer..."
                              className="w-full px-3 py-2 border border-green-300 bg-green-50/30 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Student's answer must match this exactly (case-insensitive).</p>
                          </div>
                        )}

                        {q.type === "essay" && (
                          <p className="text-xs text-gray-400 italic pl-2">Students will type their answer freely. Manual grading required.</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => setStep(1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                      ← Back to Details
                    </button>
                    <button type="submit" disabled={saving}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50">
                      {saving ? "Saving..." : editingTestId ? "Update Test" : "Create Test"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}

        {/* ═══════════ TESTS LIST or SUBMISSIONS ═══════════ */}
        {!showForm && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              {viewingSubmissionsFor ? (
                <button onClick={() => setViewingSubmissionsFor(null)} className="flex items-center gap-1 text-sm text-orange-600 font-semibold hover:underline">
                  <MdArrowBack /> Back to Tests
                </button>
              ) : (
                <>
                  <MdQuiz className="w-5 h-5 text-gray-600" />
                  <h2 className="text-base font-semibold text-gray-900">
                    {courses.find((c) => c._id === selectedCourse)?.title || "Tests"}
                  </h2>
                  <span className="ml-auto text-xs text-gray-500">{tests.length} test(s)</span>
                </>
              )}
            </div>

            {loading || loadingSubmissions ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : viewingSubmissionsFor ? (
              /* ── Submissions List ── */
              <div className="divide-y divide-gray-100 min-h-[200px]">
                {submissions.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">No submissions found for this test.</div>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{sub.student?.fullName}</p>
                        <p className="text-xs text-gray-500">{sub.student?.email}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-600">{sub.score} / {sub.totalMarks}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${sub.status === "graded" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </div>
                        <button onClick={() => startGrading(sub)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">
                          View/Grade
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* ── Tests List ── */
              tests.length === 0 ? (
                <div className="p-10 text-center">
                  <MdQuiz className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No tests yet. Click "New Test" to create one!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tests.map((test) => {
                    const meta = typeMeta(test.type);
                    return (
                      <div key={test._id} className="p-4 hover:bg-gray-50/80 transition group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-sm font-semibold text-gray-900">{test.title}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${meta.color}`}>
                                {meta.label}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                test.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                              }`}>
                                {test.isPublished ? "Published" : "Draft"}
                              </span>
                            </div>
                            {test.description && (
                              <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{test.description}</p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              <span>{test.duration} min</span>
                              <span>{test.totalQuestions || test.questions?.length || 0} Qs</span>
                              <span>{test.totalMarks} marks</span>
                              <span>Pass: {test.passingMarks}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition">
                            <button onClick={() => loadSubmissions(test._id)}
                              className="p-2 hover:bg-orange-50 rounded-lg text-orange-600 transition" title="View Submissions">
                              <MdQuiz className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleToggle(test._id)}
                              className={`p-2 rounded-lg transition ${test.isPublished ? "hover:bg-yellow-50 text-yellow-600" : "hover:bg-green-50 text-green-600"}`}
                              title={test.isPublished ? "Unpublish" : "Publish"}>
                              {test.isPublished ? <MdUnpublished className="w-4 h-4" /> : <MdPublish className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleEdit(test)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition" title="Edit">
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(test._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition" title="Delete">
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ── Grading Modal ── */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Grade Submission: {gradingSubmission.student?.fullName}</h2>
              <button onClick={() => setGradingSubmission(null)}><MdClose className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {gradingSubmission.answers.map((ans, idx) => {
                const question = tests.find(t => t._id === viewingSubmissionsFor)?.questions.find(q => q._id === ans.questionId);
                return (
                  <div key={idx} className="border p-3 rounded-lg bg-gray-50 space-y-2">
                    <p className="text-sm font-semibold">Q{idx + 1}: {question?.questionText || "Question text not available"}</p>
                    {ans.textAnswer && (
                      <div className="bg-white p-2 border rounded text-sm italic">Student Ans: {ans.textAnswer}</div>
                    )}
                    {ans.selectedOption !== undefined && (
                      <p className="text-sm">Selected Option: {String.fromCharCode(65 + ans.selectedOption)}</p>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500">MARKS:</label>
                        <input type="number" 
                          value={gradingData[idx]?.marksObtained || 0} 
                          max={question?.marks || 100}
                          onChange={(e) => {
                            const newData = [...gradingData];
                            newData[idx].marksObtained = Number(e.target.value);
                            newData[idx].isCorrect = Number(e.target.value) > 0;
                            setGradingData(newData);
                          }}
                          className="w-16 border rounded px-2 py-1 text-sm" />
                        <span className="text-xs text-gray-400">/ {question?.marks || 0}</span>
                      </div>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" 
                          checked={gradingData[idx]?.isCorrect}
                          onChange={(e) => {
                            const newData = [...gradingData];
                            newData[idx].isCorrect = e.target.checked;
                            setGradingData(newData);
                          }} /> Correct?
                      </label>
                    </div>
                  </div>
                );
              })}
              <div>
                <label className="block text-sm font-bold mb-1">Teacher Feedback</label>
                <textarea value={gradingFeedback} onChange={(e) => setGradingFeedback(e.target.value)}
                  className="w-full border rounded p-2 text-sm" rows="3" placeholder="Add feedback..."></textarea>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={submitGrade} className="px-6 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700">Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTests;
