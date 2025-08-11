import React from "react";

const ProjectFilter = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
      <div className="flex space-x-4">
        {["All", "Created by me"].map((tab) => (
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
    </div>
  );
};

export default ProjectFilter;