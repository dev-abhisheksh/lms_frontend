import React from "react";
import Navbar from "../Navbar";
import TeacherSideBar from "./TeacherSideBar";
import TeacherBottombar from "./TeacherBottombar";
import { Outlet } from "react-router-dom";

const TeacherUniversal = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-[#D7D7E3] p-4 lg:pt-7 justify-between">
      <Navbar />

      <div className="flex flex-1 overflow-hidden py-4 lg:pt-5 lg:gap-5 md:gap-4">
        {/* Desktop Sidebar — hidden on mobile, TeacherBottombar handles mobile nav */}
        <aside className="hidden md:block w-fit h-full bg-white rounded-lg overflow-hidden shrink-0">
          <TeacherSideBar />
        </aside>

        {/* Main page content area */}
        <main className="flex-1 h-full overflow-y-auto bg-gray-50 rounded-xl border border-gray-200/50 shadow-sm">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottombar */}
      <TeacherBottombar />
    </div>
  );
};

export default TeacherUniversal;
