import React, { useState } from "react";
import { MdAssignment, MdHome, MdMenuBook } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";

const Bottombar = () => {
    const [active, setActive] = useState("home");

    const itemClass = (name) =>
        `flex items-center justify-center transition-all duration-200 ${active === name
            ? "bg-[#D5C7FF] text-[#7034FF] rounded-full px-5 py-2"
            : "text-white"
        }`;

    return (
        <div className="block lg:hidden w-full h-[7vh] bg-[#7034FF] rounded-lg">
            <div className="h-full w-full flex justify-around items-center">

                <button
                    className={itemClass("home")}
                    onClick={() => setActive("home")}
                >
                    <MdHome size={26} />
                </button>

                <button
                    className={itemClass("assignments")}
                    onClick={() => setActive("assignments")}
                >
                    <MdAssignment size={24} />
                </button>

                <button
                    className={itemClass("courses")}
                    onClick={() => setActive("courses")}
                >
                    <MdMenuBook size={24} />
                </button>

                <button
                    className={itemClass("profile")}
                    onClick={() => setActive("profile")}
                >
                    <FaRegUser size={22} />
                </button>

            </div>
        </div>
    );
};

export default Bottombar;
