import React, { useState, useEffect, useRef } from "react";
import { BsFilterRight } from "react-icons/bs";

const TaskFilter = ({ activeTab, onTabChange, filters, onFilterChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const priorities = ["Low", "Medium", "High"];
  const statuses = ["Pending", "In Progress", "Completed"];

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
      <div className="flex space-x-4">
        {["All", "Assigned to me", "Created by me"].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative before:absolute before:left-0 before:right-0 before:bottom-[-9px] before:h-[2px] ${
              activeTab === tab
                ? "text-blue-600 before:bg-blue-600"
                : "text-gray-700 hover:text-blue-600 before:bg-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <BsFilterRight size={24} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-200">
            <h3 className="text-sm font-semibold mb-2">Filters</h3>
            <select
              value={filters.priority || ""}
              onChange={(e) => onFilterChange("priority", e.target.value)}
              className="w-full border-gray-300 rounded-md mb-3 text-sm"
            >
              <option value="">All</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="w-full border-gray-300 rounded-md mb-3 text-sm"
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={filters.due_today || false}
                onChange={(e) => onFilterChange("due_today", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Due Today</span>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={filters.overdue || false}
                onChange={(e) => onFilterChange("overdue", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Overdue</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilter;
