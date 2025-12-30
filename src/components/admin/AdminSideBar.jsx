import { NavLink } from "react-router-dom";
import {
  MdOutlineDashboard,
  MdOutlineAccountTree,
  MdOutlineAssignmentInd,
  MdOutlineGroup,
  MdOutlineHowToReg,
} from "react-icons/md";

const AdminSideBar = () => {
  const menu = [
    {
      id: "departments",
      label: "Departments",
      icon: MdOutlineAccountTree,
      path: "/admin",
    },
    {
      id: "enrollments",
      label: "Enrollments",
      icon: MdOutlineHowToReg,
      path: "/admin/enrollments",
    },
    {
      id: "roles",
      label: "Assign Roles",
      icon: MdOutlineAssignmentInd,
      path: "/admin/roles",
    },
    {
      id: "users",
      label: "Users",
      icon: MdOutlineGroup,
      path: "/admin/users",
    },
  ];

  return (
    <aside className="hidden md:flex md:w-48 lg:w-64 h-full bg-white rounded-xl shadow-sm p-4">
      <nav className="w-full space-y-1">
        {menu.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/admin"}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2 rounded-lg
              transition-all duration-150
              ${
                isActive
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

export default AdminSideBar;
