import { NavLink, useNavigate } from "react-router-dom";
import {
  FiStar,
  FiCalendar,
  FiFolder,
  FiUsers,
  FiSettings,
  FiMessageSquare,
  FiList,
} from "react-icons/fi";
import { FaRegStar, FaPlus, FaRegCalendar, FaRegFolder, FaRegMessage } from "react-icons/fa6";
import { TbActivityHeartbeat } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";

import Search from "./Search";

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen ${
        collapsed ? "w-20" : "w-64"
      } bg-white text-black flex flex-col pt-24 px-4 pb-6 space-y-6 overflow-hidden border-r border-gray-200 transition-all duration-300 ${
        isMobile ? "z-20" : "z-20"
      }`}
    >
      <div className="flex justify-center">
        <Search collapsed={collapsed} />
      </div>

      <button
        onClick={() => navigate("/new-task")}
        className={`flex items-center text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-all duration-300 ${
          collapsed ? "w-12 h-10 justify-center" : "w-full h-10 gap-2"
        }`}
      >
        <FaPlus
          size={14}
          className={`transition-transform duration-300 ${
            collapsed ? "transform scale-110" : ""
          }`}
        />
        <span
          className={`whitespace-nowrap transition-all duration-300 ${
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          }`}
        >
          New Task
        </span>
      </button>

      <nav className="space-y-1">
        <SidebarItem
          icon={<TbActivityHeartbeat />}
          label="Activity"
          to="/activity"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<FiMessageSquare />}
          label="Inbox"
          to="/inbox"
          count={5}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<FaRegStar />}
          label="Important"
          to="/important"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<GrNotes />}
          label="Notes"
          to="/notes"
          collapsed={collapsed}
        />
      </nav>

      <hr className="border-gray-200" />

      <nav className="space-y-1">
        <SidebarItem
          icon={<FiList />}
          label="Tasks"
          to="/"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<FaRegFolder />}
          label="Projects"
          to="/projects"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<FiUsers />}
          label="Team"
          to="/team"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<FiCalendar />}
          label="Calendar"
          to="/calendar"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<FiSettings />}
          label="Settings"
          to="/settings"
          collapsed={collapsed}
        />
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full text-gray-600 hover:text-blue-600 transition-colors"
        >
          {collapsed ? (
            <GoSidebarExpand size={20} />
          ) : (
            <GoSidebarCollapse size={20} />
          )}
          {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to, count, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 transform ${
        isActive
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`
    }
  >
    <div className="flex items-center gap-3 transition-all duration-300">
      <span
        className={`text-lg transition-transform duration-300 ${
          collapsed ? "transform scale-110" : ""
        }`}
      >
        {icon}
      </span>
      {!collapsed && (
        <span className="text-sm transition-opacity duration-300 opacity-100">
          {label}
        </span>
      )}
    </div>
    {!collapsed && count && (
      <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-300">
        {count}
      </span>
    )}
  </NavLink>
);

export default Sidebar;
