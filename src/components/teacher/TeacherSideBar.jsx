import React from "react";
import { NavLink } from "react-router-dom";
import {
  MdOutlineDashboard,
  MdOutlineSchool,
  MdOutlineAssignment,
  MdOutlineGrading,
  MdOutlinePeople,
  MdOutlineQuiz,
  MdOutlineDescription,
  MdOutlineFolderOpen,
  MdOutlineArrowBack,
} from "react-icons/md";

const TeacherSideBar = () => {
  const menu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: MdOutlineDashboard,
      path: "/teacher",
      exact: true,
    },
    {
      id: "courses",
      label: "My Courses",
      icon: MdOutlineSchool,
      path: "/teacher/courses",
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: MdOutlineAssignment,
      path: "/teacher/assignments",
    },
    {
      id: "submissions",
      label: "Submissions",
      icon: MdOutlineGrading,
      path: "/teacher/submissions",
    },
    {
      id: "students",
      label: "Students & Batches",
      icon: MdOutlinePeople,
      path: "/teacher/students",
    },
    {
      id: "tests",
      label: "Tests / Quizzes",
      icon: MdOutlineQuiz,
      path: "/teacher/tests",
    },
    {
      id: "notes",
      label: "Notes & Material",
      icon: MdOutlineDescription,
      path: "/teacher/notes",
    },
    {
      id: "resources",
      label: "Resources",
      icon: MdOutlineFolderOpen,
      path: "/teacher/resources",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col md:w-52 lg:w-64 h-full bg-white p-4 justify-between border-r border-gray-100">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-4">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            Teacher Panel
          </p>
        </div>

        <nav className="space-y-1">
          {menu.map(({ id, label, icon: Icon, path, exact }) => (
            <NavLink
              key={id}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[#D5C7FF] text-purple-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                }`
              }
            >
              <Icon size={20} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Quick toggle to Student view */}
      <div className="pt-4 border-t border-gray-100">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all font-medium"
        >
          <MdOutlineArrowBack size={18} />
          <span className="text-xs">Student Portal</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default TeacherSideBar;
