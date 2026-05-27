import { NavLink } from "react-router-dom";
import { MdAssignment, MdHome, MdOutlineSmartToy } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";

const Bottombar = () => {
    return (
        <div className="flex md:hidden w-full h-16 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-[0_8px_24px_rgba(112,52,255,0.08)] rounded-2xl transition-all duration-300">
            <div className="h-full w-full flex justify-around items-center px-2">

                <NavLink 
                    to="/" 
                    end 
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center transition-all duration-300 relative py-1 px-3 rounded-xl min-w-[64px] ${
                            isActive ? "text-[#7034FF] font-semibold scale-105" : "text-gray-400 hover:text-gray-600"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <MdHome size={24} className={`transition-transform duration-300 ${isActive ? "translate-y-[-2px]" : ""}`} />
                            <span className="text-[10px] mt-0.5 font-medium tracking-wide">Home</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#7034FF] shadow-[0_0_8px_rgba(112,52,255,0.6)] animate-pulse" />
                            )}
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/assignments" 
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center transition-all duration-300 relative py-1 px-3 rounded-xl min-w-[64px] ${
                            isActive ? "text-[#7034FF] font-semibold scale-105" : "text-gray-400 hover:text-gray-600"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <MdAssignment size={22} className={`transition-transform duration-300 ${isActive ? "translate-y-[-2px]" : ""}`} />
                            <span className="text-[10px] mt-0.5 font-medium tracking-wide">Tasks</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#7034FF] shadow-[0_0_8px_rgba(112,52,255,0.6)] animate-pulse" />
                            )}
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/ai" 
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center transition-all duration-300 relative py-1 px-3 rounded-xl min-w-[64px] ${
                            isActive ? "text-[#7034FF] font-semibold scale-105" : "text-gray-400 hover:text-gray-600"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <MdOutlineSmartToy size={22} className={`transition-transform duration-300 ${isActive ? "translate-y-[-2px]" : ""}`} />
                            <span className="text-[10px] mt-0.5 font-medium tracking-wide">AI Assistant</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#7034FF] shadow-[0_0_8px_rgba(112,52,255,0.6)] animate-pulse" />
                            )}
                        </>
                    )}
                </NavLink>

                <NavLink 
                    to="/profile" 
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center transition-all duration-300 relative py-1 px-3 rounded-xl min-w-[64px] ${
                            isActive ? "text-[#7034FF] font-semibold scale-105" : "text-gray-400 hover:text-gray-600"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <FaRegUser size={18} className={`transition-transform duration-300 ${isActive ? "translate-y-[-2px]" : ""}`} />
                            <span className="text-[10px] mt-0.5 font-medium tracking-wide">Profile</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#7034FF] shadow-[0_0_8px_rgba(112,52,255,0.6)] animate-pulse" />
                            )}
                        </>
                    )}
                </NavLink>

            </div>
        </div>
    );
};

export default Bottombar;
