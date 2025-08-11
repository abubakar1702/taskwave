import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IoChevronDown,
  IoPersonOutline,
  IoSettingsOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { logoutUser } from "../../features/auth/authSlice";
import useAuth from "../../hooks/useAuth";
import LogOutModal from "../modals/LogOutModal";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading } = useSelector((state) => state.auth);
  const { isAuthenticated } = useAuth();

  console.log("UserMenu rendered with user:", user);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    console.log("Auth state changed:", { isAuthenticated, user, isLoading });
  }, [isAuthenticated, user, isLoading]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = async (action) => {
    if (action === "Logout") {
      try {
        await dispatch(logoutUser()).unwrap();
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        navigate("/login");
      }
    } else if (action === "Profile") {
      navigate("/profile");
    } else if (action === "Settings") {
      navigate("/settings");
    }
    setIsOpen(false);
  };

  const DefaultAvatar = () => {
    const initials = user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
    );
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {isLoading && <LogOutModal />}
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className="flex items-center space-x-3 border border-gray-200 hover:border-gray-300 rounded-xl p-2 pr-3 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DefaultAvatar />
        <IoChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <DefaultAvatar />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user.firstName + " " + user.lastName || "User"}
                </span>
                <span className="text-xs text-gray-500">
                  {user.email || "No email"}
                </span>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleMenuClick("Profile")}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <IoPersonOutline className="w-4 h-4 mr-3 text-gray-400" />
              Profile
            </button>

            <button
              onClick={() => handleMenuClick("Settings")}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <IoSettingsOutline className="w-4 h-4 mr-3 text-gray-400" />
              Settings
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => handleMenuClick("Logout")}
              disabled={isLoading}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoLogOutOutline className="w-4 h-4 mr-3 text-red-500" />
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(UserMenu);
