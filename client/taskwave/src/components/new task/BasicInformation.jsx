import React from "react";
import { FiFileText, FiAlertCircle } from "react-icons/fi";

const BasicInformation = ({
  formData,
  validationErrors,
  handleInputChange,
}) => {
  const titleWordCount = formData.title
    ? formData.title.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const titleCharCount = formData.title ? formData.title.length : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex justify-between">
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <FiFileText className="text-blue-400" />
            Title <span className="text-red-500">*</span>
          </label>
          <p
            className={`mt-1 text-sm ${
              titleCharCount > 200 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {titleCharCount} / 200
          </p>
        </div>
        <div className="relative">
          <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              validationErrors.title
                ? "border-red-300 focus:ring-red-500 bg-red-50"
                : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white"
            }`}
            placeholder="Task title"
          />
        </div>

        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FiAlertCircle className="mr-1" />
            {validationErrors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
        >
          <FiFileText className="text-blue-400" />
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FiFileText className="absolute left-3 top-4 text-gray-300" />
          <textarea
            id="description"
            name="description"
            rows={3}
            className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
              validationErrors.description
                ? "border-red-300 focus:ring-red-500 bg-red-50"
                : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white"
            }`}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed task description"
          />
        </div>

        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FiAlertCircle className="mr-1" />
            {validationErrors.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default BasicInformation;
