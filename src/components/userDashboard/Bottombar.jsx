import React, { useContext, useState } from "react";
import { MdAssignment, MdHome, MdMenuBook, MdOutlineSmartToy } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { SidebarTabsContext } from "../../contexts/Sidebar";

const Bottombar = () => {
    // const [active, setActive] = useState("home");
    const { activeTab, setActiveTab } = useContext(SidebarTabsContext)

    const itemClass = (name) =>
        `flex items-center justify-center transition-all duration-200 ${activeTab === name
            ? "bg-[#D5C7FF] text-[#7034FF] rounded-full px-5 py-2"
            : "text-white"
        }`;


    return (
        <div className="block md:hidden lg:hidden w-full h-[7vh] bg-[#7034FF] rounded-lg">
            <div className="h-full w-full flex justify-around items-center">

                <button
                    className={itemClass("courses")}
                    onClick={() => setActiveTab("courses")}
                >
                    <MdHome size={26} />
                </button>

                <button
                    className={itemClass("assignments")}
                    onClick={() => setActiveTab("assignments")}
                >
                    <MdAssignment size={24} />
                </button>

                <button
                    className={itemClass("submissions")}
                    onClick={() => setActiveTab("submissions")}
                >
                    <MdMenuBook size={24} />
                </button>

                <button
                    className={itemClass("ai")}
                    onClick={() => setActiveTab("ai")}
                >
                    <MdOutlineSmartToy size={22} />
                </button>

            </div>
        </div>
    );
};

export default Bottombar;
