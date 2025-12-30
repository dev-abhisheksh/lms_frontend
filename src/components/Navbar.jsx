import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowDown, IoMdNotificationsOutline, IoIosSearch } from "react-icons/io";
import { getCurrentUser, logoutUser } from '../API/auth.api';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [toggleProfileMenu, setToggleProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false)
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate()

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setToggleProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getCurrentUser();
        setUserData(res.data.user)
        console.log(res.data.user)
      } catch (error) {
        console.error(error)
      }
    }

    fetchUserData()
  }, [])

  const logoutFeature = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Failed to logout")
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      navigate("/login", { replace: true })
    }
  }

  return (
    <div className="flex justify-center bg-[#D7D7E3]">
      <div className="w-full bg-[#F5F7FB] rounded-xl flex justify-between items-center px-3 sm:px-5 py-2 relative">

        {/* Left */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
          LMS
        </h1>

        {/* Middle (desktop only) */}
        <div className="hidden lg:block">
          <h1 className="text-sm text-gray-700">
            Hello, {userData?.fullName}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 sm:gap-6">

          <div className={`hidden md:flex md:w-60 lg:w-80 h-8 bg-[#D5C7FF] rounded-xl border border-transparent px-3 items-center transition-all duration-200 ease-out overflow-hidden 
                            ${showSearch
              ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-x-20 pointer-events-none"
            }
                `}>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent outline-none text-black placeholder:text-gray-600"
            />
          </div>

          <div onClick={() => setShowSearch(prev => !prev)}
            className={`
                 p-2 rounded-md cursor-pointer transition-all duration-200
                ${showSearch
                ? "text-[#7034FF] drop-shadow-[0_0_8px_rgba(112,52,255,1)]"
                : ""}
           `}
          >
            <IoIosSearch size={22} className="sm:w-[26px] sm:h-[26px] cursor-pointer" />
          </div>
          <IoMdNotificationsOutline size={22} className="sm:w-[26px] sm:h-[26px]" />

          {/* Avatar + Menu */}
          <div ref={menuRef} className="relative">

            <div
              className="flex items-center gap-1 sm:gap-2 cursor-pointer"
              onClick={() => setToggleProfileMenu(prev => !prev)}
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-red-400" />

              <IoIosArrowDown
                size={12}
                className={`transition-transform duration-200 ease-out ${toggleProfileMenu ? "rotate-180" : "rotate-0"
                  }`}
              />
            </div>

            {/* Profile Menu */}
            <div
              className={`absolute top-[56px] right-0 w-[90vw] max-w-[240px] rounded-lg bg-white shadow-lg border p-4 z-50 transition-all duration-200 ease-out
                ${toggleProfileMenu
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-2 scale-95 pointer-events-none"}
                lg:top-[64px] lg:max-w-[260px]`}
            >
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800">
                  {userData?.fullName} - {userData?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {userData?.email}
                </p>
              </div>

              <hr className="my-2" />

              <button onClick={logoutFeature} className="w-full text-left text-sm text-red-600 hover:bg-red-50 px-2 py-2 rounded-md">
                Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
