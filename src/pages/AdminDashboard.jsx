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

// ── Components ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? "—"}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, desc, onClick, colorClass }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="text-left min-w-0 flex-1">
      <p className="text-base font-bold text-gray-900 leading-tight">{title}</p>
      <p className="text-xs text-gray-500 truncate mt-1">{desc}</p>
    </div>
    <MdArrowForward className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors shrink-0" />
  </button>
);

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
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">System Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, <span className="font-bold text-indigo-600">{adminName}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm w-48"
              />
            </div>
            <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg">
              <MdNotificationsNone className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={LuUsers} label="Total Students" value={stats.students} colorClass="bg-blue-50 text-blue-600" />
          <StatCard icon={LuBookOpen} label="Active Courses" value={stats.courses} colorClass="bg-indigo-50 text-indigo-600" />
          <StatCard icon={LuGraduationCap} label="Departments" value={stats.departments} colorClass="bg-purple-50 text-purple-600" />
          <StatCard icon={LuLayers} label="Active Batches" value={stats.batches} colorClass="bg-orange-50 text-orange-600" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900">Enrollment Growth</h3>
                <p className="text-sm text-gray-500 font-medium">Monthly registration trends</p>
              </div>
              <div className="h-[300px] w-full text-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[ {name: 'Jan', s: 400}, {name: 'Feb', s: 300}, {name: 'Mar', s: 600}, {name: 'Apr', s: 800}, {name: 'May', s: 700}, {name: 'Jun', s: 900} ]}>
                    <defs>
                      <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="s" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Active Departments</h3>
                <button onClick={() => navigate("/admin/departments")} className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                  Manage Units
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {activeDepts.map(dept => (
                  <div key={dept._id} className="px-8 py-4 flex items-center justify-between hover:bg-gray-50/30 transition">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 uppercase">
                        {dept.code}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{dept.name}</p>
                        <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                          {dept.manager?.fullName || "Awaiting Manager"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                      <MdArrowForward className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <QuickAction icon={LuUsers} title="Add New User" desc="Students or Staff" onClick={() => navigate("/admin/add-user")} colorClass="bg-blue-50 text-blue-600" />
                <QuickAction icon={LuBookOpen} title="Create Course" desc="Build Curriculum" onClick={() => navigate("/admin/courses")} colorClass="bg-indigo-50 text-indigo-600" />
                <QuickAction icon={LuLayers} title="Batch Ops" desc="Promote Students" onClick={() => navigate("/admin/batches")} colorClass="bg-purple-50 text-purple-600" />
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl">
              <MdOutlineAdminPanelSettings className="w-10 h-10 text-indigo-400 mb-4" />
              <h4 className="text-lg font-bold mb-2">Admin Support</h4>
              <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">
                Manage system-wide configurations and monitor performance metrics.
              </p>
              <button className="w-full py-3.5 bg-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition">
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