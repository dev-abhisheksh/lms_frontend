import React, { useContext, useState } from "react";
import {
  MdOutlineDashboard,
  MdOutlineAssignment,
  MdOutlineUploadFile,
  MdOutlineSmartToy,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { SidebarTabsContext } from "../contexts/Sidebar";
import { Link, NavLink } from "react-router-dom";


const Sidebar = () => {
  const { activeTab, setActiveTab } = useContext(SidebarTabsContext)

  const menu = [
    { id: "courses", label: "Courses", icon: MdOutlineDashboard, path: "/" },
    { id: "assignments", label: "Assignments", icon: MdOutlineAssignment, path: "/assignments" },
    { id: "ai", label: "AI Assistant", icon: MdOutlineSmartToy, path: "/ai" },
    { id: "profile", label: "User Profile", icon: FaRegUser, path: "/profile" },
  ];

  return (
    <aside className="hidden md:flex md:w-45 lg:w-60 h-full bg-white rounded-xl shadow-sm p-4">
      <nav className="w-full space-y-1">
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
