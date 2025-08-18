import React from "react";
import { FiTag, FiCalendar, FiClock, FiAlertCircle } from "react-icons/fi";

const today = new Date().toISOString().split("T")[0];

const TaskDetails = ({ formData, validationErrors, handleInputChange }) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiTag className="text-purple-400" /> Task Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <FiTag className="text-purple-400" /> Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <FiCalendar className="text-blue-400" /> Due Date
          </label>
          <div className="relative">
            <FiCalendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 "
              aria-hidden="true"
            />
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              min={today}
              className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                validationErrors.dueDate
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white"
              }`}
            />
          </div>
          {validationErrors.dueDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" />
              {validationErrors.dueDate}
            </p>
          )}
        </div>

        {/* Due Time */}
        <div>
          <label
            htmlFor="dueTime"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <FiClock className="text-blue-400" /> Due Time
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="time"
              name="dueTime"
              id="dueTime"
              value={formData.dueTime}
              onChange={handleInputChange}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
