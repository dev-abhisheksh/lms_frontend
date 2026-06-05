import { NavLink } from "react-router-dom";
import { 
  MdAssignment, 
  MdHome, 
  MdOutlineSmartToy, 
  MdOutlineQuiz, 
  MdOutlineHistoryEdu 
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";

const Bottombar = () => {
    const menu = [
        {
            id: "home",
            label: "Home",
            icon: MdHome,
            path: "/student",
            exact: true,
        },
        {
            id: "tasks",
            label: "Tasks",
            icon: MdAssignment,
            path: "/assignments",
        },
        {
            id: "tests",
            label: "Tests",
            icon: MdOutlineQuiz,
            path: "/student/tests",
        },
        {
            id: "history",
            label: "History",
            icon: MdOutlineHistoryEdu,
            path: "/submissions",
        },
        {
            id: "ai",
            label: "AI Assistant",
            icon: MdOutlineSmartToy,
            path: "/ai",
        },
        {
            id: "profile",
            label: "Profile",
            icon: FaRegUser,
            path: "/profile",
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
                                <Icon size={id === "profile" ? 18 : 22} className={`transition-transform duration-300 ${isActive ? "translate-y-[-2px]" : ""}`} />
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

export default Bottombar;
