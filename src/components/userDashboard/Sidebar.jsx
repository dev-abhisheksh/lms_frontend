import React, { useContext, useState } from "react";
import {
  MdOutlineDashboard,
  MdOutlineAssignment,
  MdOutlineUploadFile,
  MdOutlineSmartToy,
} from "react-icons/md";
import { SidebarTabsContext } from "../../contexts/Sidebar";


const Sidebar = () => {
  const { activeTab, setActiveTab } = useContext(SidebarTabsContext)

  const menu = [
    { id: "courses", label: "Courses", icon: MdOutlineDashboard },
    { id: "assignments", label: "Assignments", icon: MdOutlineAssignment },
    { id: "submissions", label: "Submissions", icon: MdOutlineUploadFile },
    { id: "ai", label: "AI Assistant", icon: MdOutlineSmartToy },
  ];

  return (
    <aside className="hidden md:flex md:w-45 lg:w-60 h-full bg-white rounded-xl shadow-sm p-4">
      <nav className="w-full space-y-1">
        {menu.map(({ id, label, icon: Icon }) => (
          <button
            key={id} onClick={() => setActiveTab(id)}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
              transition-all duration-150
              ${activeTab === id
                ? "bg-[#D5C7FF] text-purple-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <Icon size={20} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
