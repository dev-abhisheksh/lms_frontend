import React, { useEffect, useState } from "react";
import { Departments } from "../API/department.api";
import { getAllUsers } from "../API/auth.api";
import { getAllCourses } from "../API/course.api";
import { getBatches } from "../API/batch.api";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineSchool,
  MdPeople,
  MdMenuBook,
  MdLayers,
  MdArrowForward,
  MdPerson,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-all group w-full`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <MdArrowForward className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition mt-1" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </button>
);

// ── Quick action card ─────────────────────────────────────────────────────────
const ActionCard = ({ icon: Icon, title, desc, href, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-all group flex items-center gap-4 w-full"
    >
      <div className={`p-2.5 rounded-lg shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <MdArrowForward className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition ml-auto shrink-0" />
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    departments: null,
    courses: null,
    students: null,
    teachers: null,
    batches: null,
    managers: null,
  });
  const [activeDepts, setActiveDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminName = localStorage.getItem("fullName") || "Admin";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [deptRes, courseRes, batchRes] = await Promise.allSettled([
          Departments(),
          getAllCourses(),
          getBatches(),
        ]);

        const depts   = deptRes.status   === "fulfilled" ? deptRes.value.data.departments   || [] : [];
        const courses = courseRes.status === "fulfilled" ? courseRes.value.data.courses || [] : [];
        const batches = batchRes.status  === "fulfilled" ? batchRes.value.batches  || [] : [];

        setActiveDepts(depts.filter(d => d.isActive).slice(0, 5));

        setStats(prev => ({
          ...prev,
          departments: depts.length,
          courses: courses.length,
          batches: batches.length,
        }));
      } catch {}

      // User counts — separate so partial failure doesn't block
      try {
        const [studRes, teachRes, manRes] = await Promise.allSettled([
          getAllUsers({ role: "student", limit: 1 }),
          getAllUsers({ role: "teacher", limit: 1 }),
          getAllUsers({ role: "manager", limit: 1 }),
        ]);
        setStats(prev => ({
          ...prev,
          students: studRes.status  === "fulfilled" ? studRes.value.data.meta?.total  ?? "—" : "—",
          teachers: teachRes.status === "fulfilled" ? teachRes.value.data.meta?.total ?? "—" : "—",
          managers: manRes.status   === "fulfilled" ? manRes.value.data.meta?.total   ?? "—" : "—",
        }));
      } catch {}

      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Welcome header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <MdOutlineAdminPanelSettings className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {adminName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here's an overview of your LMS — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* ── Stats grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={MdOutlineSchool}  label="Departments" value={stats.departments} color="bg-indigo-100 text-indigo-600" onClick={() => navigate("/admin/departments")} />
            <StatCard icon={MdMenuBook}       label="Courses"     value={stats.courses}     color="bg-blue-100 text-blue-600"   onClick={() => navigate("/admin/courses")} />
            <StatCard icon={MdLayers}         label="Batches"     value={stats.batches}     color="bg-purple-100 text-purple-600" onClick={() => navigate("/admin/batches")} />
            <StatCard icon={MdPeople}         label="Students"    value={stats.students}    color="bg-green-100 text-green-600" onClick={() => navigate("/admin/users")} />
            <StatCard icon={MdPerson}         label="Teachers"    value={stats.teachers}    color="bg-yellow-100 text-yellow-600" onClick={() => navigate("/admin/users")} />
            <StatCard icon={MdPerson}         label="Managers"    value={stats.managers}    color="bg-rose-100 text-rose-600"   onClick={() => navigate("/admin/users")} />
          </div>
        )}

        {/* ── Bottom row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Active departments list */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Active Departments</h2>
              <button onClick={() => navigate("/admin/departments")} className="text-xs text-indigo-600 hover:underline font-medium">
                Manage →
              </button>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : activeDepts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No active departments yet.</p>
                <button onClick={() => navigate("/admin/departments")} className="mt-2 text-sm text-indigo-600 hover:underline font-medium">
                  Create your first department →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeDepts.map(dept => (
                  <div key={dept._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{dept.code}</p>
                    </div>
                    {dept.manager ? (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                        <MdPerson className="w-3.5 h-3.5" />
                        {dept.manager.fullName}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No manager</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <ActionCard icon={MdPeople}       title="Add User"          desc="Register a new student or teacher"     href="/admin/add-user"    color="bg-green-100 text-green-600" />
              <ActionCard icon={MdMenuBook}     title="Create Course"     desc="Add a new course to a department"       href="/admin/courses"     color="bg-blue-100 text-blue-600" />
              <ActionCard icon={MdLayers}       title="Manage Batches"    desc="Promote or assign courses to batches"   href="/admin/batches"     color="bg-purple-100 text-purple-600" />
              <ActionCard icon={MdOutlineSchool} title="Assign Teachers"  desc="Assign teachers to courses"             href="/admin/enrollments" color="bg-yellow-100 text-yellow-600" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;