import React from "react";
import { FiBriefcase } from "react-icons/fi";

const ProjectSelection = ({ formData, projects, handleProjectChange }) => {
  return (
    <div>
      <label
        htmlFor="project"
        className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
      >
        <FiBriefcase className="text-purple-400" /> Project
      </label>
      <select
        id="project"
        name="project"
        value={formData.project}
        onChange={handleProjectChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
      >
        <option value="">Select a project (optional)</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelection;