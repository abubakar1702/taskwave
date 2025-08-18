import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IoChevronDown,
  IoPersonOutline,
  IoSettingsOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { fetchCurrentUser, logoutUser } from "../../features/auth/authSlice";
import useAuth from "../../hooks/useAuth";
import LogOutModal from "../modals/LogOutModal";

const UserMenu = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading } = useSelector((state) => state.auth);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleMenuClick = async (action) => {
    setIsOpen(false);
    if (action === "Logout") {
      try {
        setLoggingOut(true);
        await dispatch(logoutUser()).unwrap();
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        navigate("/login");
      } finally {
        setLoggingOut(false);
      }
    } else if (action === "Profile") {
      navigate("/profile");
    } else if (action === "Settings") {
      navigate("/settings");
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {loggingOut && <LogOutModal />}
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className="flex items-center space-x-3 border border-gray-200 hover:border-gray-300 rounded-lg p-2 pr-3 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-full bg-blue-500 text-white font-medium w-8 h-8"
            style={{ lineHeight: 1 }}
          >
            {user.initial}
          </div>
        )}

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
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full bg-blue-500 text-white font-medium w-8 h-8"
                  style={{ lineHeight: 1 }}
                >
                  {user.initial}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user.firstName || user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "User"}
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
