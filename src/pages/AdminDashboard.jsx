import React, { useEffect, useState } from "react";
import { Departments } from "../API/department.api";
import { getAllUsers } from "../API/auth.api";
import { getAllCourses } from "../API/course.api";
import { getBatches } from "../API/batch.api";
import { useNavigate } from "react-router-dom";
import { 
  MdOutlineAdminPanelSettings, 
  MdSearch, 
  MdNotificationsNone,
  MdArrowForward,
} from "react-icons/md";
import { 
  LuUsers, 
  LuBookOpen, 
  LuLayers, 
  LuGraduationCap, 
  LuUserCheck,
} from "react-icons/lu";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// ── Components (Strictly Identical to Departments Page) ──────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <p className="text-3xl font-black text-gray-900 leading-tight">{value ?? "—"}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, desc, onClick, colorClass }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="text-left min-w-0 flex-1">
      <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
      <p className="text-xs text-gray-500 truncate mt-1">{desc}</p>
    </div>
    <MdArrowForward className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors shrink-0" />
  </button>
);

// ── Dummy Data for Growth ────────────────────────────────────────────────────
const chartData = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 300 },
  { name: 'Mar', students: 600 },
  { name: 'Apr', students: 800 },
  { name: 'May', students: 700 },
  { name: 'Jun', students: 900 },
];

// ── Main Dashboard Component ──────────────────────────────────────────────────

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

  const adminName = localStorage.getItem("fullName") || "Administrator";

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
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header (Perfectly Synced with Departments) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none">System Overview</h1>
            <p className="text-gray-500 mt-2 font-medium">
              Welcome back, <span className="font-bold text-indigo-600">{adminName}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm w-64 font-medium"
              />
            </div>
            <button className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition shadow-xl shadow-gray-200">
              <MdNotificationsNone className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Stats Grid (Synced Components) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={LuUsers} 
            label="Total Students" 
            value={stats.students} 
            colorClass="bg-blue-50 text-blue-600" 
          />
          <StatCard 
            icon={LuBookOpen} 
            label="Active Courses" 
            value={stats.courses} 
            colorClass="bg-indigo-50 text-indigo-600" 
          />
          <StatCard 
            icon={LuGraduationCap} 
            label="Departments" 
            value={stats.departments} 
            colorClass="bg-purple-50 text-purple-600" 
          />
          <StatCard 
            icon={LuLayers} 
            label="Active Batches" 
            value={stats.batches} 
            colorClass="bg-orange-50 text-orange-600" 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Growth & Units */}
          <div className="lg:col-span-8 space-y-8">
            {/* Growth Chart Container */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Enrollment Growth</h3>
                <p className="text-sm text-gray-500 font-medium">Monthly registration trends</p>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}} />
                    <Area type="monotone" dataKey="students" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Departments - Fixed Overflow */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Departments</h3>
                <button onClick={() => navigate("/admin/departments")} className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">
                  Manage Units
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {loading ? (
                  <div className="p-12 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing data...</div>
                ) : activeDepts.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-medium">No active departments.</div>
                ) : (
                  activeDepts.map(dept => (
                    <div key={dept._id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/30 transition group">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                          {dept.code}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate leading-tight">{dept.name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate mt-1">
                            {dept.manager?.fullName || "Awaiting Manager"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                        <MdArrowForward className="text-gray-200 group-hover:text-gray-900 transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 tracking-tight mb-8">Quick Actions</h3>
              <div className="space-y-4">
                <QuickAction 
                  icon={LuUsers} 
                  title="Add New User" 
                  desc="Students or Staff" 
                  onClick={() => navigate("/admin/add-user")}
                  colorClass="bg-blue-50 text-blue-600"
                />
                <QuickAction 
                  icon={LuBookOpen} 
                  title="Create Course" 
                  desc="Build Curriculum" 
                  onClick={() => navigate("/admin/courses")}
                  colorClass="bg-indigo-50 text-indigo-600"
                />
                <QuickAction 
                  icon={LuLayers} 
                  title="Batch Ops" 
                  desc="Promote Students" 
                  onClick={() => navigate("/admin/batches")}
                  colorClass="bg-purple-50 text-purple-600"
                />
                <QuickAction 
                  icon={LuUserCheck} 
                  title="Enrollments" 
                  desc="Assign Faculty" 
                  onClick={() => navigate("/admin/enrollments")}
                  colorClass="bg-orange-50 text-orange-600"
                />
              </div>
            </div>

            {/* Support / Help Card */}
            <div className="bg-gray-900 p-8 rounded-[32px] text-white shadow-2xl shadow-gray-200">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
                <MdOutlineAdminPanelSettings className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black mb-2 tracking-tight">Admin Support</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                Manage system-wide configurations and monitor unit performance.
              </p>
              <button className="w-full py-4 bg-indigo-600 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                Documentation
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;