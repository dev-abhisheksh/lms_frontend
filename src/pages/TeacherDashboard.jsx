import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdMenuBook,
  MdAssignment,
  MdNotes,
  MdQuiz,
  MdFileDownload,
  MdArrowForward,
  MdOutlineSchool,
  MdPendingActions,
  MdCheckCircle,
} from "react-icons/md";

// ── Stat card component ────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
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
  </button>
);

// ── Quick action card ──────────────────────────────────────────────────────────
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
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    coursesTaught: 0,
    assignmentsPosted: 0,
    submissionsPending: 0,
    notesCreated: 0,
  });
  const [loading, setLoading] = useState(true);
  const teacherName = localStorage.getItem("fullName") || "Teacher";

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // Placeholder data - replace with actual API calls
        // For now, simulate loading
        setTimeout(() => {
          setStats({
            coursesTaught: 5,
            assignmentsPosted: 12,
            submissionsPending: 8,
            notesCreated: 15,
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error loading stats:", error);
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Welcome header ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <MdOutlineSchool className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {teacherName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here's an overview of your teaching dashboard — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* ── Stats grid ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard 
              icon={MdMenuBook} 
              label="Courses Taught" 
              value={stats.coursesTaught} 
              color="bg-blue-100 text-blue-600"
              onClick={() => navigate("/teacher/courses")}
            />
            <StatCard 
              icon={MdAssignment} 
              label="Assignments Posted" 
              value={stats.assignmentsPosted} 
              color="bg-purple-100 text-purple-600"
              onClick={() => navigate("/teacher/assignments")}
            />
            <StatCard 
              icon={MdPendingActions} 
              label="Submissions Pending" 
              value={stats.submissionsPending} 
              color="bg-orange-100 text-orange-600"
              onClick={() => navigate("/teacher/submissions")}
            />
            <StatCard 
              icon={MdNotes} 
              label="Notes Created" 
              value={stats.notesCreated} 
              color="bg-green-100 text-green-600"
              onClick={() => navigate("/teacher/notes")}
            />
          </div>
        )}

        {/* ── Main content grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <ActionCard
                icon={MdAssignment}
                title="Post Assignment"
                desc="Create and publish new assignments"
                href="/teacher/assignments"
                color="bg-purple-100 text-purple-600"
              />
              <ActionCard
                icon={MdFileDownload}
                title="Upload Resources"
                desc="Share course materials and files"
                href="/teacher/resources"
                color="bg-blue-100 text-blue-600"
              />
              <ActionCard
                icon={MdNotes}
                title="Create Notes"
                desc="Write and manage course notes"
                href="/teacher/notes"
                color="bg-green-100 text-green-600"
              />
              <ActionCard
                icon={MdQuiz}
                title="Create Test"
                desc="Design OBT, MCQ, and other test types"
                href="/teacher/tests"
                color="bg-orange-100 text-orange-600"
              />
            </div>
          </div>

          {/* Recent Activity or Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded shrink-0 mt-0.5">
                  <MdAssignment className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Assignment Due Today</p>
                  <p className="text-xs text-gray-500 mt-0.5">Python Basics - Week 3</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-100 rounded shrink-0 mt-0.5">
                  <MdCheckCircle className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">6 New Submissions</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pending review for Math Quiz</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-green-100 rounded shrink-0 mt-0.5">
                  <MdNotes className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Note Published</p>
                  <p className="text-xs text-gray-500 mt-0.5">Database Concepts - Part 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;