import { NavLink } from "react-router-dom";
import { MdAssignment, MdHome, MdOutlineSmartToy } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";

const Bottombar = () => {
    const itemClass = (isActive) =>
        `flex items-center justify-center transition-all duration-200
     ${isActive
            ? "bg-[#D5C7FF] text-[#7034FF] rounded-full px-4 py-1"
            : "text-white"
        }`;

    return (
        <div className="block md:hidden w-full h-[7vh] bg-[#7034FF] rounded-lg">
            <div className="h-full w-full flex justify-around items-center">

                <NavLink to="/" end className={({ isActive }) => itemClass(isActive)}>
                    <MdHome size={26} />
                </NavLink>

                <NavLink to="/assignments" className={({ isActive }) => itemClass(isActive)}>
                    <MdAssignment size={24} />
                </NavLink>

                <NavLink to="/ai" className={({ isActive }) => itemClass(isActive)}>
                    <MdOutlineSmartToy size={22} />
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => itemClass(isActive)}>
                    <FaRegUser size={20} />
                </NavLink>

            </div>
        </div>
    );
};

export default Bottombar;
