import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getAllCourses } from "../API/course.api";
import {
  enrollUserInCourse,
  getAllEnrollmentsForCourse,
  getCourseEnrollmentSummary,
  removeUserFromCourse,
} from "../API/enrollment.api";
import { Departments } from "../API/department.api";
import { getAllUsers } from "../API/auth.api";
import { 
  MdOutlineSchool, 
  MdAdd, 
  MdEdit, 
  MdPerson, 
  MdClose, 
  MdSearch, 
  MdNotificationsNone,
  MdDeleteOutline,
  MdFilterList,
  MdOutlinePersonAddAlt
} from "react-icons/md";
import { LuBookOpen, LuUsers, LuUserCog, LuGraduationCap, LuShieldCheck } from "react-icons/lu";

// ── Components ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? "0"}</p>
    </div>
  </div>
);

// ── Main Page Component ──────────────────────────────────────────────────────

const AdminEnrollments = () => {
  // Lists
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Filter state (sidebar)
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Selection
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Assign-teacher modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // ── Initial load ───────────────────────────────────────────────────────────
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
        
        const coursesRes = await getAllCourses({ isPublished: true });
        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        toast.error("Initialization failed");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Filtered courses for sidebar ──────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const ms = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const md = !selectedDeptId || c.department?._id === selectedDeptId;
      const my = !selectedYear || c.year === selectedYear;
      return ms && md && my;
    });
  }, [courses, searchTerm, selectedDeptId, selectedYear]);

  // ── Fetch enrollments when a course is selected ──────────────────────────
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
      } catch (err) {
        toast.error("Failed to load enrollment data");
      } finally {
        setEnrollLoading(false);
      }
    };
    fetchData();
  }, [selectedCourse]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return toast.error("Select a teacher first");
    try {
      setEnrolling(true);
      await enrollUserInCourse(selectedCourse._id, {
        userId: selectedTeacherId,
        role: "teacher",
      });
      toast.success("Teacher assigned successfully");
      setSelectedTeacherId("");
      setTeacherSearch("");
      setShowAssignModal(false);
      
      const [enrollRes, summaryRes] = await Promise.all([
        getAllEnrollmentsForCourse(selectedCourse._id),
        getCourseEnrollmentSummary(selectedCourse._id),
      ]);
      setEnrollments(enrollRes.data.enrollments || []);
      setSummary(summaryRes.data.summary || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveUser = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName}?`)) return;
    try {
      await removeUserFromCourse(selectedCourse._id, userId);
      toast.success("Personnel removed");
      const [enrollRes, summaryRes] = await Promise.all([
        getAllEnrollmentsForCourse(selectedCourse._id),
        getCourseEnrollmentSummary(selectedCourse._id),
      ]);
      setEnrollments(enrollRes.data.enrollments || []);
      setSummary(summaryRes.data.summary || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Removal failed");
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = teacherSearch.toLowerCase();
    return t.fullName?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q);
  });

  const enrolledTeacherIds = new Set(enrollments.filter(e => e.role === "teacher").map(e => e.user._id));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 font-sans text-gray-900">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header - Sizes Synced with Department */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Enrollment Management</h1>
            <p className="text-sm text-gray-500 mt-1">Assign staff and manage personnel across course units.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200">
              <MdNotificationsNone className="w-6 h-6" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT SIDEBAR ── */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                <div className="relative group">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-xs font-bold text-gray-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All Units</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.code}</option>)}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-xs font-bold text-gray-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All STDs</option>
                    <option value="FY">FY</option>
                    <option value="SY">SY</option>
                    <option value="TY">TY</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                  {filteredCourses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No units found</div>
                  ) : (
                    filteredCourses.map(course => (
                      <button
                        key={course._id}
                        onClick={() => setSelectedCourse(course)}
                        className={`w-full text-left p-5 transition-all relative ${
                          selectedCourse?._id === course._id ? "bg-gray-50" : "hover:bg-gray-50/50"
                        }`}
                      >
                        {selectedCourse?._id === course._id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900" />
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-900 truncate max-w-[200px] text-sm">{course.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase">
                            {course.courseCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                          <span>STD {course.year}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span>{course.department?.code}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* ── RIGHT PANEL ── */}
            <main className="lg:col-span-8 space-y-6">
              {!selectedCourse ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center border-dashed border-2">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                    <LuBookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Course</h3>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm">Choose a curriculum unit from the left panel to manage assignments.</p>
                </div>
              ) : (
                <>
                  {/* Hero Card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-3xl font-black text-gray-900 truncate leading-tight tracking-tight">{selectedCourse.title}</h2>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-widest">
                            {selectedCourse.courseCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
                          <LuGraduationCap className="w-4 h-4" />
                          <span>{selectedCourse.department?.name || "Academic Unit"}</span>
                          <span className="mx-1">•</span>
                          <span>Year {selectedCourse.year}</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h4>
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {selectedCourse.description || "Management of staff and faculty assignments for this curriculum unit."}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-gray-800 transition-all shrink-0"
                      >
                        <MdOutlinePersonAddAlt className="w-5 h-5" /> Assign Staff
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={LuUsers} label="Total Users" value={summary?.total} colorClass="bg-gray-50 text-gray-600" />
                    <StatCard icon={LuGraduationCap} label="Students" value={summary?.students} colorClass="bg-blue-50 text-blue-600" />
                    <StatCard icon={LuUserCog} label="Teachers" value={summary?.teachers} colorClass="bg-indigo-50 text-indigo-600" />
                    <StatCard icon={LuShieldCheck} label="Managers" value={summary?.managers} colorClass="bg-purple-50 text-purple-600" />
                  </div>

                  {/* Personnel List */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Active Personnel</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Hierarchy</p>
                    </div>
                    
                    <div className="divide-y divide-gray-50">
                      {enrollLoading ? (
                        <div className="p-12 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing...</div>
                      ) : enrollments.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 text-sm font-medium">No enrollments found.</div>
                      ) : (
                        enrollments.map(en => (
                          <div key={en._id} className="px-8 py-4 flex items-center justify-between hover:bg-gray-50/30 transition">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-black shrink-0">
                                {en.user.fullName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate text-sm">{en.user.fullName}</p>
                                <p className="text-xs text-gray-400 font-medium truncate">{en.user.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 ml-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${en.role === 'teacher' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                {en.role}
                              </span>
                              <button
                                onClick={() => handleRemoveUser(en.user._id, en.user.fullName)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <MdDeleteOutline className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showAssignModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-150">
            <button onClick={() => setShowAssignModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full"><MdClose className="w-6 h-6" /></button>
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900">Assign Faculty</h3>
              <p className="text-gray-500 mt-1 font-medium text-xs">Unit: {selectedCourse.title}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search name or email..." value={teacherSearch} onChange={(e) => { setTeacherSearch(e.target.value); setSelectedTeacherId(""); }} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium" />
              </div>

              <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-48 overflow-y-auto no-scrollbar bg-gray-50/30">
                {filteredTeachers.length === 0 ? (
                  <div className="p-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No faculty found</div>
                ) : (
                  filteredTeachers.map(t => {
                    const assigned = enrolledTeacherIds.has(t._id);
                    const selected = selectedTeacherId === t._id;
                    return (
                      <button key={t._id} disabled={assigned} onClick={() => setSelectedTeacherId(selected ? "" : t._id)} className={`w-full text-left p-3.5 flex items-center justify-between transition-all ${assigned ? "opacity-30 grayscale cursor-not-allowed" : selected ? "bg-indigo-50" : "hover:bg-white"}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate leading-none">{t.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-medium truncate mt-1">{t.email}</p>
                        </div>
                        {selected && !assigned && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200">Cancel</button>
                <button onClick={handleAssignTeacher} disabled={enrolling || !selectedTeacherId} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-gray-800 disabled:opacity-50">{enrolling ? "Syncing..." : "Assign"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;