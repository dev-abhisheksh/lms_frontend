import React, { useEffect, useState } from "react";
import { getBatches, updateBatchYear } from "../API/batch.api";
import { getCoursesByDeptAndYear, batchEnrollCourses } from "../API/course.api";
import { Departments } from "../API/department.api";
import { MdOutlineSchool, MdArrowForward, MdClose, MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

// ── helpers ──────────────────────────────────────────────────────────────────

const YEAR_COLORS = {
  FY: "bg-blue-100 text-blue-800 border-blue-200",
  SY: "bg-green-100 text-green-800 border-green-200",
  TY: "bg-purple-100 text-purple-800 border-purple-200",
};

const YEAR_NEXT = { FY: "SY", SY: "TY", TY: null };

// ── component ─────────────────────────────────────────────────────────────────

const AdminBatches = () => {
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState(null);   // selected dept object
  const [batches, setBatches] = useState([]);            // all batches (flat)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");               // success toast

  // ── Promote modal state ────────────────────────────────────────────────────
  const [promoteModal, setPromoteModal] = useState(null); // batch object
  const [promoting, setPromoting] = useState(false);

  // ── Assign Courses modal state ─────────────────────────────────────────────
  const [assignModal, setAssignModal] = useState(null);   // batch object
  const [availCourses, setAvailCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [deptRes, batchRes] = await Promise.all([Departments(), getBatches()]);
        const depts = deptRes.data.departments || [];
        setDepartments(depts);
        setBatches(batchRes.batches || []);
        if (depts.length) setActiveDept(depts[0]);
      } catch {
        setError("Failed to load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // ── Batches for active department ──────────────────────────────────────────
  const deptBatches = batches
    .filter(b => b.department._id === activeDept?._id)
    .sort((a, b) => b.cohortYear - a.cohortYear); // newest cohort first

  // ── Promote handlers ───────────────────────────────────────────────────────
  const openPromote = (batch) => setPromoteModal(batch);

  const confirmPromote = async () => {
    if (!promoteModal) return;
    setPromoting(true);
    setError("");
    try {
      const res = await updateBatchYear(
        promoteModal.department._id,
        promoteModal.cohortYear,
        promoteModal.year,
        YEAR_NEXT[promoteModal.year]
      );
      showToast(res.message);
      // Refresh batches
      const batchRes = await getBatches();
      setBatches(batchRes.batches || []);
      setPromoteModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  // ── Assign Courses handlers ────────────────────────────────────────────────
  const openAssign = async (batch) => {
    setAssignModal(batch);
    setSelectedCourses([]);
    setEnrollResult(null);
    setLoadingCourses(true);
    try {
      const res = await getCoursesByDeptAndYear(batch.department._id, batch.year);
      const courses = res.data?.courses || [];
      setAvailCourses(courses);
    } catch {
      setAvailCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const toggleCourse = (id) =>
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );

  const confirmEnroll = async () => {
    if (!assignModal || !selectedCourses.length) return;
    setEnrolling(true);
    setEnrollResult(null);
    try {
      const res = await batchEnrollCourses(
        assignModal.department._id,
        assignModal.cohortYear,
        selectedCourses
      );
      setEnrollResult(res.data);
      // Refresh batches silently
      const batchRes = await getBatches();
      setBatches(batchRes.batches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading batches…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm">
          {toast}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <MdOutlineSchool className="w-7 h-7 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Batch Management</h1>
            <p className="text-xs text-gray-500">
              Manage student cohorts · promote years · assign courses
            </p>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* ── Body: Dept list + Batch rows ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Department list */}
        <aside className="w-52 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Departments
          </p>
          {departments.map(dept => (
            <button
              key={dept._id}
              onClick={() => setActiveDept(dept)}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                activeDept?._id === dept._id
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-transparent text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="block font-semibold">{dept.code || dept.name}</span>
              <span className="block text-xs text-gray-400 truncate">{dept.name}</span>
            </button>
          ))}
        </aside>

        {/* RIGHT — Batches for active department */}
        <main className="flex-1 overflow-y-auto p-6">
          {!activeDept ? (
            <p className="text-gray-400 text-sm">Select a department</p>
          ) : deptBatches.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400 text-sm">No batches found for <strong>{activeDept.name}</strong>.</p>
              <p className="text-gray-400 text-xs mt-1">Add students with a cohort year to create batches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Department heading */}
              <h2 className="text-base font-bold text-gray-800">
                {activeDept.name}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {deptBatches.length} batch{deptBatches.length !== 1 ? "es" : ""}
                </span>
              </h2>

              {/* Batch rows */}
              {deptBatches.map((batch, idx) => {
                const batchSlug = `${(batch.department.code || batch.department.name).toUpperCase()}-${batch.year}-${batch.cohortYear}`;
                const nextYear = YEAR_NEXT[batch.year];
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">
                          {(batch.department.code || batch.department.name).toUpperCase()}-{batch.cohortYear}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${YEAR_COLORS[batch.year] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {batch.year}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-purple-400 mt-0.5">{batchSlug}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {batch.studentCount} student{batch.studentCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Assign Courses */}
                      <button
                        onClick={() => openAssign(batch)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition"
                      >
                        Assign Courses
                      </button>

                      {/* Promote */}
                      {nextYear ? (
                        <button
                          onClick={() => openPromote(batch)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                        >
                          Promote → {nextYear}
                          <MdArrowForward className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400">
                          Graduated
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PROMOTE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {promoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Promotion</h3>
              <button onClick={() => setPromoteModal(null)} className="text-gray-400 hover:text-gray-600">
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-gray-600 mb-3">
                You are promoting <strong>{promoteModal.studentCount} students</strong> in batch:
              </p>
              <p className="text-base font-bold text-gray-900">
                {(promoteModal.department.code || promoteModal.department.name).toUpperCase()}-{promoteModal.cohortYear}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${YEAR_COLORS[promoteModal.year]}`}>
                  {promoteModal.year}
                </span>
                <MdArrowForward className="text-gray-400 w-5 h-5" />
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${YEAR_COLORS[YEAR_NEXT[promoteModal.year]]}`}>
                  {YEAR_NEXT[promoteModal.year]}
                </span>
              </div>
              <p className="mt-3 text-xs text-red-600 font-medium">
                ⚠️ This will remove all {promoteModal.year} course enrollments for these students.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPromoteModal(null)}
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPromote}
                disabled={promoting}
                className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-50"
              >
                {promoting ? "Promoting…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ASSIGN COURSES MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">Assign Courses</h3>
                <p className="text-xs text-gray-500">
                  Batch: <span className="font-mono text-purple-600">
                    {(assignModal.department.code || assignModal.department.name).toUpperCase()}-{assignModal.year}-{assignModal.cohortYear}
                  </span>
                  &nbsp;·&nbsp;{assignModal.studentCount} students
                </p>
              </div>
              <button onClick={() => { setAssignModal(null); setEnrollResult(null); }} className="text-gray-400 hover:text-gray-600">
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            {/* Result Summary */}
            {enrollResult && (
              <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg shrink-0">
                <p className="text-xs font-semibold text-green-800 mb-1">✅ Enrollment complete</p>
                {enrollResult.results?.map((r, i) => (
                  <p key={i} className="text-xs text-green-700">
                    {r.courseTitle}: {r.status === "done"
                      ? `${r.enrolled} enrolled, ${r.skipped} already enrolled`
                      : `⏭ ${r.reason}`}
                  </p>
                ))}
              </div>
            )}

            {/* Course List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingCourses ? (
                <p className="text-sm text-gray-400">Loading courses…</p>
              ) : availCourses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No <strong>{assignModal.year}</strong> courses found for this department.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Create courses tagged with this department + year first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-3">
                    Showing {assignModal.year} courses for {assignModal.department.name}. Select to enroll.
                  </p>
                  {availCourses.map(course => {
                    const checked = selectedCourses.includes(course._id);
                    return (
                      <button
                        key={course._id}
                        onClick={() => toggleCourse(course._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                          checked
                            ? "border-purple-400 bg-purple-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {checked
                          ? <MdCheckBox className="w-5 h-5 text-purple-600 shrink-0" />
                          : <MdCheckBoxOutlineBlank className="w-5 h-5 text-gray-400 shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-xs text-gray-400">{course.courseCode}</p>
                        </div>
                        <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full border shrink-0 ${YEAR_COLORS[course.year]}`}>
                          {course.year}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
              <button
                onClick={() => { setAssignModal(null); setEnrollResult(null); }}
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={confirmEnroll}
                disabled={!selectedCourses.length || enrolling}
                className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-50"
              >
                {enrolling
                  ? "Enrolling…"
                  : `Enroll in ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBatches;
