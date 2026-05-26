import React, { useEffect, useState } from "react";
import { getBatches, updateBatchYear } from "../API/batch.api";
import { getCoursesByDeptAndYear, batchEnrollCourses } from "../API/course.api";
import { Departments } from "../API/department.api";
import { MdOutlineSchool, MdArrowForward, MdClose, MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

// ── helpers ───────────────────────────────────────────────────────────────────

const YEAR_COLORS = {
  FY: "bg-blue-100 text-blue-800",
  SY: "bg-green-100 text-green-800",
  TY: "bg-purple-100 text-purple-800",
};

const YEAR_NEXT = { FY: "SY", SY: "TY", TY: null };

// ── component ─────────────────────────────────────────────────────────────────

const AdminBatches = () => {
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // ── Promote modal ──────────────────────────────────────────────────────────
  const [promoteModal, setPromoteModal] = useState(null);
  const [promoting, setPromoting] = useState(false);

  // ── Assign Courses modal ───────────────────────────────────────────────────
  const [assignModal, setAssignModal] = useState(null);
  const [availCourses, setAvailCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [deptRes, batchRes] = await Promise.all([Departments(), getBatches()]);
        setDepartments(deptRes.data.departments || []);
        setBatches(batchRes.batches || []);
        setError(null);
      } catch {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deptBatches = batches
    .filter(b => b.department._id === activeDept?._id)
    .sort((a, b) => b.cohortYear - a.cohortYear);

  // ── Promote ────────────────────────────────────────────────────────────────
  const confirmPromote = async () => {
    if (!promoteModal) return;
    setPromoting(true);
    try {
      const res = await updateBatchYear(
        promoteModal.department._id,
        promoteModal.cohortYear,
        promoteModal.year,
        YEAR_NEXT[promoteModal.year]
      );
      setSuccessMessage(res.message);
      const batchRes = await getBatches();
      setBatches(batchRes.batches || []);
      setPromoteModal(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  // ── Assign Courses ─────────────────────────────────────────────────────────
  const openAssign = async (batch) => {
    setAssignModal(batch);
    setSelectedCourses([]);
    setEnrollResult(null);
    setLoadingCourses(true);
    try {
      const res = await getCoursesByDeptAndYear(batch.department._id, batch.year);
      setAvailCourses(res.data?.courses || []);
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
      const res = await batchEnrollCourses(assignModal.department._id, assignModal.cohortYear, selectedCourses);
      setEnrollResult(res.data);
      const batchRes = await getBatches();
      setBatches(batchRes.batches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <MdOutlineSchool className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Manage student cohorts, promote years, and assign courses by batch
          </p>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Main grid — same as Enrollments page */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent" />
              <p className="mt-3 text-sm text-gray-500">Loading batches...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Department Sidebar ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Departments ({departments.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {departments.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No departments found</div>
                  ) : (
                    departments.map(dept => (
                      <button
                        key={dept._id}
                        onClick={() => setActiveDept(dept)}
                        className={`w-full text-left p-4 transition-colors ${
                          activeDept?._id === dept._id
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{dept.name}</h3>
                        {dept.code && (
                          <p className="text-xs text-gray-500 mt-0.5">{dept.code}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {batches.filter(b => b.department._id === dept._id).length} batch(es)
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Batch Table ── */}
            <div className="lg:col-span-2">
              {!activeDept ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <MdOutlineSchool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Department</h3>
                  <p className="text-gray-500 text-sm">Choose a department from the list to view and manage its batches.</p>
                </div>
              ) : (
                <>
                  {/* Dept header card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{activeDept.name}</h2>
                    {activeDept.code && (
                      <p className="text-sm text-gray-500 mt-1">Code: {activeDept.code}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {deptBatches.length} cohort batch{deptBatches.length !== 1 ? "es" : ""}
                    </p>
                  </div>

                  {/* Batch table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {deptBatches.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                No batches found for {activeDept.name}. Add students with a cohort year to create batches.
                              </td>
                            </tr>
                          ) : (
                            deptBatches.map((batch, idx) => {
                              const batchId = `${(batch.department.code || batch.department.name).toUpperCase()}-${batch.cohortYear}`;
                              const slug = `${batchId}-${batch.year}`;
                              const nextYear = YEAR_NEXT[batch.year];
                              return (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{batchId}</div>
                                    <div className="text-xs font-mono text-purple-400 mt-0.5">{slug}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${YEAR_COLORS[batch.year] || "bg-gray-100 text-gray-800"}`}>
                                      {batch.year}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">{batch.studentCount}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => openAssign(batch)}
                                        className="text-purple-600 hover:text-purple-900 font-medium text-sm"
                                      >
                                        Assign Courses
                                      </button>
                                      {nextYear ? (
                                        <button
                                          onClick={() => setPromoteModal(batch)}
                                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                                        >
                                          Promote → {nextYear}
                                          <MdArrowForward className="w-3 h-3" />
                                        </button>
                                      ) : (
                                        <span className="text-xs text-gray-400 font-medium">Graduated</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-200">
                      {deptBatches.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No batches found.</div>
                      ) : (
                        deptBatches.map((batch, idx) => {
                          const batchId = `${(batch.department.code || batch.department.name).toUpperCase()}-${batch.cohortYear}`;
                          const nextYear = YEAR_NEXT[batch.year];
                          return (
                            <div key={idx} className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-base font-bold text-gray-900">{batchId}</h3>
                                  <p className="text-xs text-gray-500 mt-0.5">{batch.studentCount} students</p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${YEAR_COLORS[batch.year] || "bg-gray-100 text-gray-800"}`}>
                                  {batch.year}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => openAssign(batch)} className="flex-1 text-sm text-purple-600 font-medium py-2 px-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                                  Assign Courses
                                </button>
                                {nextYear && (
                                  <button onClick={() => setPromoteModal(batch)} className="flex-1 flex items-center justify-center gap-1 text-sm text-white font-medium py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
                                    Promote → {nextYear} <MdArrowForward className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ══ PROMOTE MODAL ═══════════════════════════════════════════════════ */}
      {promoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Year Promotion</h3>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                You are about to promote <strong>{promoteModal.studentCount} students</strong> in batch <strong>{(promoteModal.department.code || promoteModal.department.name).toUpperCase()}-{promoteModal.cohortYear}</strong>:
              </p>
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${YEAR_COLORS[promoteModal.year]}`}>{promoteModal.year}</span>
                <MdArrowForward className="w-5 h-5 text-gray-400" />
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${YEAR_COLORS[YEAR_NEXT[promoteModal.year]]}`}>{YEAR_NEXT[promoteModal.year]}</span>
              </div>
              <p className="text-sm text-red-600 font-medium text-center">
                ⚠️ All {promoteModal.year} course enrollments will be removed for these students.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPromoteModal(null)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium">
                Cancel
              </button>
              <button onClick={confirmPromote} disabled={promoting} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
                {promoting ? "Promoting..." : "Confirm Promotion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ASSIGN COURSES MODAL ════════════════════════════════════════════ */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Assign Courses</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Batch: <span className="font-mono text-purple-600">
                    {(assignModal.department.code || assignModal.department.name).toUpperCase()}-{assignModal.year}-{assignModal.cohortYear}
                  </span>
                  &nbsp;·&nbsp;{assignModal.studentCount} students
                </p>
              </div>
              <button onClick={() => { setAssignModal(null); setEnrollResult(null); }} className="text-gray-400 hover:text-gray-600">
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            {enrollResult && (
              <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800 mb-1">✅ Enrollment complete</p>
                {enrollResult.results?.map((r, i) => (
                  <p key={i} className="text-xs text-green-700">
                    {r.courseTitle}: {r.status === "done"
                      ? `${r.enrolled} enrolled, ${r.skipped} already enrolled`
                      : `⏭ ${r.reason}`}
                  </p>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingCourses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent" />
                  <span className="ml-3 text-sm text-gray-500">Loading courses...</span>
                </div>
              ) : availCourses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    No <strong>{assignModal.year}</strong> courses found for {assignModal.department.name}.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Create courses tagged with this department + year first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-3">
                    Showing {assignModal.year} courses for {assignModal.department.name}. Select to bulk-enroll.
                  </p>
                  {availCourses.map(course => {
                    const checked = selectedCourses.includes(course._id);
                    return (
                      <button
                        key={course._id}
                        onClick={() => toggleCourse(course._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                          checked ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:bg-gray-50"
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
                        <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${YEAR_COLORS[course.year] || "bg-gray-100 text-gray-800"}`}>
                          {course.year}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button onClick={() => { setAssignModal(null); setEnrollResult(null); }} className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium">
                Close
              </button>
              <button
                onClick={confirmEnroll}
                disabled={!selectedCourses.length || enrolling}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : `Enroll in ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBatches;
