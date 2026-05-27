import React, { useEffect, useState, useCallback } from "react";
import { getAllCourses } from "../API/course.api";
import {
  enrollUserInCourse,
  getAllEnrollmentsForCourse,
  getCourseEnrollmentSummary,
  removeUserFromCourse,
} from "../API/enrollment.api";
import { Departments } from "../API/department.api";
import { getAllUsers } from "../API/auth.api";

// ─── Badge helper ────────────────────────────────────────────────────
const YearBadge = ({ year }) => {
  const colours = {
    FY: "bg-blue-100 text-blue-700",
    SY: "bg-purple-100 text-purple-700",
    TY: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
        colours[year] || "bg-gray-100 text-gray-700"
      }`}
    >
      {year || "N/A"}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const styles =
    role === "teacher"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${styles}`}
    >
      {role}
    </span>
  );
};

// ─── Component ───────────────────────────────────────────────────────
const AdminEnrollments = () => {
  // Lists
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Filter state (sidebar)
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  // Selection
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState(null);

  // has the user applied at least one filter?
  const [hasFiltered, setHasFiltered] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);           // initial mount only
  const [courseListLoading, setCourseListLoading] = useState(false); // sidebar filter
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Assign-teacher form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // ── Initial load — only departments + teachers, NO courses yet ─────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [deptRes, teacherRes] = await Promise.all([
          Departments(),
          getAllUsers({ role: "teacher", limit: 200 }),
        ]);
        setDepartments(deptRes.data.departments || []);
        setTeachers(teacherRes.data.users || []);
        setError(null);
      } catch (err) {
        console.error("Init failed:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Fetch courses only when a filter is applied ───────────────────
  useEffect(() => {
    // Do nothing until the user picks at least one filter
    if (!selectedDept && !selectedYear) {
      setCourses([]);
      setSelectedCourse(null);
      setHasFiltered(false);
      return;
    }

    const fetchFiltered = async () => {
      try {
        setCourseListLoading(true); // ← only the sidebar list, not full page
        setHasFiltered(true);
        const params = { isPublished: true };
        if (selectedDept) params.departmentId = selectedDept._id;
        if (selectedYear) params.year = selectedYear;
        const res = await getAllCourses(params);
        setCourses(res.data.courses || []);
        setSelectedCourse(null);
        setError(null);
      } catch (err) {
        console.error("Filter failed:", err);
        setError("Failed to load courses.");
      } finally {
        setCourseListLoading(false);
      }
    };

    fetchFiltered();
  }, [selectedDept, selectedYear]);

  // ── Fetch enrollments when a course is selected ──────────────────
  useEffect(() => {
    if (!selectedCourse) {
      setEnrollments([]);
      setSummary(null);
      return;
    }
    const fetchData = async () => {
      try {
        setEnrollLoading(true);
        const [enrollRes, summaryRes] = await Promise.all([
          getAllEnrollmentsForCourse(selectedCourse._id),
          getCourseEnrollmentSummary(selectedCourse._id),
        ]);
        setEnrollments(enrollRes.data.enrollments || []);
        setSummary(summaryRes.data.summary || null);
        setError(null);
      } catch (err) {
        console.error("Enrollment fetch failed:", err);
        setError("Failed to load enrollments.");
      } finally {
        setEnrollLoading(false);
      }
    };
    fetchData();
  }, [selectedCourse]);

  // ── Helpers ───────────────────────────────────────────────────────
  const flash = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const refreshEnrollments = useCallback(async () => {
    if (!selectedCourse) return;
    const [enrollRes, summaryRes] = await Promise.all([
      getAllEnrollmentsForCourse(selectedCourse._id),
      getCourseEnrollmentSummary(selectedCourse._id),
    ]);
    setEnrollments(enrollRes.data.enrollments || []);
    setSummary(summaryRes.data.summary || null);
  }, [selectedCourse]);

  // ── Assign teacher ────────────────────────────────────────────────
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return alert("Select a teacher first.");
    try {
      setEnrolling(true);
      await enrollUserInCourse(selectedCourse._id, {
        userId: selectedTeacherId,
        role: "teacher",
      });
      flash("Teacher assigned successfully!");
      setSelectedTeacherId("");
      setTeacherSearch("");
      setShowAssignForm(false);
      await refreshEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign teacher.");
    } finally {
      setEnrolling(false);
    }
  };

  // ── Remove user ───────────────────────────────────────────────────
  const handleRemoveUser = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this course?`)) return;
    try {
      await removeUserFromCourse(selectedCourse._id, userId);
      flash(`${userName} removed successfully.`);
      await refreshEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove user.");
    }
  };

  // ── Filtered teacher list for the dropdown ────────────────────────
  const filteredTeachers = teachers.filter((t) => {
    const q = teacherSearch.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.username?.toLowerCase().includes(q)
    );
  });

  // Already-enrolled teacher IDs (to gray them out)
  const enrolledTeacherIds = new Set(
    enrollments
      .filter((e) => e.role === "teacher")
      .map((e) => e.user._id)
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Teachers to Courses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Assign teachers to courses so they can manage content and view enrolled students.
            Students are enrolled in bulk via the{" "}
            <a href="/admin/batches" className="text-blue-600 underline font-medium">Batches</a> page.
          </p>
        </div>

        {/* ── Alerts ──────────────────────────────────────────── */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* ── Initial Loading ──────────────────────────────────── */}
        {loading && !selectedCourse ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
              <p className="mt-3 text-sm text-gray-500">Loading courses…</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ══ LEFT SIDEBAR ══════════════════════════════════ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">

                {/* Sidebar header with filters */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Courses{" "}
                    <span className="text-sm font-normal text-gray-500">
                      ({courses.length})
                    </span>
                  </h2>

                  {/* Department filter */}
                  <select
                    value={selectedDept?._id || ""}
                    onChange={(e) =>
                      setSelectedDept(
                        departments.find((d) => d._id === e.target.value) || null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  {/* Year filter */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Years</option>
                    <option value="FY">FY — First Year</option>
                    <option value="SY">SY — Second Year</option>
                    <option value="TY">TY — Third Year</option>
                  </select>

                  {/* Clear filters */}
                  {(selectedDept || selectedYear) && (
                    <button
                      onClick={() => {
                        setSelectedDept(null);
                        setSelectedYear("");
                      }}
                      className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
                    >
                      ✕ Clear filters
                    </button>
                  )}
                </div>

                {/* Course list */}
                <div className="divide-y divide-gray-200 max-h-[520px] overflow-y-auto">
                  {courseListLoading ? (
                    <div className="p-6 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
                      <p className="text-xs text-gray-400 mt-2">Loading courses…</p>
                    </div>
                  ) : !hasFiltered ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="text-3xl">🔍</div>
                      <p className="text-sm font-medium text-gray-700">Select a filter above</p>
                      <p className="text-xs text-gray-400">
                        Choose a department and/or year to see courses.
                      </p>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No published courses found for this filter.
                    </div>
                  ) : (
                    courses.map((course) => (
                      <button
                        key={course._id}
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowAssignForm(false);
                        }}
                        className={`w-full text-left p-4 transition-colors ${
                          selectedCourse?._id === course._id
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : "hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm truncate">
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {course.courseCode}
                            </p>
                          </div>
                          <YearBadge year={course.year} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ══ RIGHT PANEL ═══════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-5">
              {!selectedCourse ? (
                /* Empty state */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Select a course
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pick a course from the left panel to manage its teacher assignments.
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Course Header Card ───────────────────────── */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-gray-900">
                            {selectedCourse.title}
                          </h2>
                          <YearBadge year={selectedCourse.year} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Code: <span className="font-mono">{selectedCourse.courseCode}</span>
                        </p>
                        {selectedCourse.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {selectedCourse.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowAssignForm((v) => !v)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          showAssignForm
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {showAssignForm ? "✕ Cancel" : "+ Assign Teacher"}
                      </button>
                    </div>
                  </div>

                  {/* ── Assign Teacher Form ──────────────────────── */}
                  {showAssignForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Assign a Teacher
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Search for a teacher by name or email and select them from the list.
                        Only users with the <strong>teacher</strong> role are shown.
                      </p>

                      {/* Search box */}
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Search teacher by name or email…"
                          value={teacherSearch}
                          onChange={(e) => {
                            setTeacherSearch(e.target.value);
                            setSelectedTeacherId(""); // clear selection on new search
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Teacher list */}
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto mb-4">
                        {filteredTeachers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            {teachers.length === 0
                              ? "No teacher-role users found in the system."
                              : "No teachers match your search."}
                          </div>
                        ) : (
                          filteredTeachers.map((t) => {
                            const alreadyEnrolled = enrolledTeacherIds.has(t._id);
                            const isSelected = selectedTeacherId === t._id;
                            return (
                              <button
                                key={t._id}
                                type="button"
                                disabled={alreadyEnrolled}
                                onClick={() =>
                                  setSelectedTeacherId(isSelected ? "" : t._id)
                                }
                                className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm transition-colors
                                  ${alreadyEnrolled
                                    ? "opacity-40 cursor-not-allowed bg-gray-50"
                                    : isSelected
                                    ? "bg-blue-50 border-l-4 border-blue-600"
                                    : "hover:bg-gray-50"
                                  }`}
                              >
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {t.fullName}
                                  </span>
                                  <span className="ml-2 text-gray-500 text-xs">
                                    {t.email}
                                  </span>
                                </div>
                                {alreadyEnrolled && (
                                  <span className="text-xs text-gray-400 italic">
                                    Already assigned
                                  </span>
                                )}
                                {isSelected && !alreadyEnrolled && (
                                  <span className="text-blue-600 text-xs font-semibold">
                                    ✓ Selected
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Confirm button */}
                      <form onSubmit={handleAssignTeacher} className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-gray-600">
                          {selectedTeacherId ? (
                            <>
                              Assigning:{" "}
                              <strong>
                                {teachers.find((t) => t._id === selectedTeacherId)?.fullName}
                              </strong>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">No teacher selected</span>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={enrolling || !selectedTeacherId}
                          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                          {enrolling ? "Assigning…" : "Confirm Assignment"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ── Summary Stats ─────────────────────────────── */}
                  {summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Total", value: summary.total, color: "text-gray-900" },
                        { label: "Students", value: summary.students, color: "text-blue-600" },
                        { label: "Teachers", value: summary.teachers, color: "text-green-600" },
                        { label: "Managers", value: summary.managers, color: "text-purple-600" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <p className={`text-2xl font-bold ${color}`}>{value}</p>
                          <p className="text-xs text-gray-500 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Enrollments Table ─────────────────────────── */}
                  {enrollLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              {["Name", "Email", "Global Role", "Course Role", "Action"].map(
                                (col, i) => (
                                  <th
                                    key={col}
                                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                      i === 4 ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {col}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {enrollments.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">
                                  No enrollments yet. Assign a teacher to get started.
                                </td>
                              </tr>
                            ) : (
                              enrollments.map((en) => (
                                <tr key={en._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {en.user.fullName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {en.user.email}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                      {en.user.role}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <RoleBadge role={en.role} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                      onClick={() =>
                                        handleRemoveUser(en.user._id, en.user.fullName)
                                      }
                                      className="text-red-600 hover:text-red-900 font-medium text-sm"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile card view */}
                      <div className="md:hidden divide-y divide-gray-200">
                        {enrollments.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-500">
                            No enrollments yet.
                          </div>
                        ) : (
                          enrollments.map((en) => (
                            <div key={en._id} className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {en.user.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500">{en.user.email}</p>
                                </div>
                                <RoleBadge role={en.role} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Global: <strong>{en.user.role}</strong>
                                </span>
                                <button
                                  onClick={() =>
                                    handleRemoveUser(en.user._id, en.user.fullName)
                                  }
                                  className="text-xs text-red-600 font-medium hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;