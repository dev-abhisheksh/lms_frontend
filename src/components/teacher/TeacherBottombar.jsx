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
  MdOutlineChecklist,
} from "react-icons/md";

const TeacherBottombar = () => {
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
      label: "Courses",
      icon: MdOutlineSchool,
      path: "/teacher/courses",
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: MdOutlineChecklist,
      path: "/teacher/attendance",
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
      label: "Students",
      icon: MdOutlinePeople,
      path: "/teacher/students",
    },
    {
      id: "tests",
      label: "Tests",
      icon: MdOutlineQuiz,
      path: "/teacher/tests",
    },
    {
      id: "materials",
      label: "Materials",
      icon: MdOutlineFolderOpen,
      path: "/teacher/materials",
    },
  ];

  return (
    <div className="flex md:hidden w-full h-16 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-[0_8px_24px_rgba(112,52,255,0.08)] rounded-2xl transition-all duration-300">
      {/* Scrollable container with hidden scrollbars */}
      <div className="h-full w-full flex items-center overflow-x-auto whitespace-nowrap px-6 gap-2 no-scrollbar">
        {menu.map(({ id, label, icon: Icon, path, exact }) => (
          <NavLink
            key={id}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 relative py-1 px-3 rounded-xl min-w-[72px] ${
                isActive ? "text-[#7034FF] font-semibold scale-105" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={`transition-transform duration-300 ${isActive ? "translate-y-[-2px]" : ""}`} />
                <span className="text-[9px] mt-0.5 font-medium tracking-wide">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#7034FF] shadow-[0_0_8px_rgba(112,52,255,0.6)] animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
        {/* Spacer at the end to allow clean scrolling space */}
        <div className="w-8 flex-shrink-0" />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default TeacherBottombar;
