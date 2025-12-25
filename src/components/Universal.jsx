import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AlertAndNoti from "./AlertAndNoti";
import { Outlet } from "react-router-dom";
import Bottombar from "./Bottombar";
import Trail from "./login/Trail";
import Grids from "./Grids";

const Universal = () => {
    return (
        <div className="h-screen w-full flex flex-col bg-[#D7D7E3] p-4 lg:pt-7 justify-between">
            <Navbar />

            <div className="flex flex-1 overflow-hidden py-4 lg:pt-5 lg:gap-5 md:gap-4">

                <aside className="w-fit h-full bg-white rounded-lg">
                    <Sidebar />
                </aside>

                <main className="flex-1 h-full overflow-y-auto ">
                    <Outlet/>
                </main>

                <aside className="w-fit h-full">
                    <AlertAndNoti />
                </aside>



            </div>
            <Bottombar />
        </div>
    );
};

export default Universal;
