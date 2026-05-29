import React, { useContext, useState, useEffect } from "react";
import {
  MdOutlineDashboard,
  MdOutlineAssignment,
  MdOutlineUploadFile,
  MdOutlineSmartToy,
  MdSchool,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { SidebarTabsContext } from "../contexts/Sidebar";
import { Link, NavLink } from "react-router-dom";


const Sidebar = () => {
  const { activeTab, setActiveTab } = useContext(SidebarTabsContext)
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const menu = [
    { id: "courses", label: "Courses", icon: MdOutlineDashboard, path: "/student" },
    { id: "tests", label: "Tests & Quizzes", icon: MdSchool, path: "/student/tests" },
    { id: "assignments", label: "Assignments", icon: MdOutlineAssignment, path: "/assignments" },
    { id: "submissions", label: "Submissions", icon: MdOutlineUploadFile, path: "/submissions" },
    { id: "ai", label: "AI Assistant", icon: MdOutlineSmartToy, path: "/ai" },
    { id: "profile", label: "User Profile", icon: FaRegUser, path: "/profile" },
  ];

  // Add teacher dashboard option if user is a teacher
  const teacherMenu = userRole === "teacher" ? [
    { id: "teacher-dashboard", label: "Teacher Dashboard", icon: MdSchool, path: "/teacher" },
  ] : [];

  return (
    <aside className="hidden md:flex md:w-45 lg:w-60 h-full bg-white rounded-xl shadow-sm p-4">
      <nav className="w-full space-y-1">
        {/* Teacher Dashboard Option */}
        {teacherMenu.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `
      flex items-center gap-3 px-3 py-2 rounded-lg
      transition-all duration-150 font-medium
      ${isActive
                ? "bg-blue-100 text-blue-700"
                : "text-blue-600 hover:bg-blue-50"
              }
      `
            }
          >
            <Icon size={20} />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}

        {/* Divider */}
        {teacherMenu.length > 0 && <hr className="my-2" />}

        {/* Student Menu */}
        {menu.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `
      flex items-center gap-3 px-3 py-2 rounded-lg
      transition-all duration-150
      ${isActive
                ? "bg-[#D5C7FF] text-purple-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
              }
      `
            }
          >
            <Icon size={20} />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}

      </nav>
    </aside>
  );
};

export default Sidebar;
