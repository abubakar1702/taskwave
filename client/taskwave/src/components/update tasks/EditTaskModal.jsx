import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    due_date: "",
    due_time: "",
    project: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split("T")[0];

  const {
    data: projects = [],
    loading: projectsLoading,
    error: projectsError,
  } = useApi(`${API_BASE_URL}/api/projects/`, "GET");
  const { makeRequest } = useApi();

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        due_date: task.due_date || "",
        due_time: task.due_time ? task.due_time.slice(0, 5) : "",
        project: task.project?.id || "",
      });
      setErrors({});
    }
  }, [task, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Task title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.due_date && formData.due_date < today) {
      newErrors.due_date = "Due date cannot be in the past";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormChanged = () => {
    if (!task) return false;
    return (
      formData.title !== (task.title || "") ||
      formData.description !== (task.description || "") ||
      formData.priority !== (task.priority || "Medium") ||
      formData.status !== (task.status || "Pending") ||
      formData.due_date !== (task.due_date || "") ||
      formData.due_time !== (task.due_time ? task.due_time.slice(0, 5) : "") ||
      formData.project !== (task.project?.id || "")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        project: formData.project || null,
        due_date: formData.due_date || null,
        due_time: formData.due_time ? formData.due_time + ":00" : null,
      };

      const updatedTask = await makeRequest(
        `${API_BASE_URL}/api/tasks/${task.id}/`,
        "PATCH",
        updateData
      );

      if (onTaskUpdate) onTaskUpdate(updatedTask);
      toast.success("Task updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);

      let errorData = {};
      if (error.data) {
        if (typeof error.data === "object") errorData = error.data;
        else if (error.data.error) {
          try {
            errorData = JSON.parse(error.data.error.replace(/'/g, '"'));
          } catch {
            errorData = { general: error.data.error };
          }
        }
      }
      setErrors(errorData);
      toast.error("Please check the form for errors");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Task's Info
          </h2>
        </div>

        {projectsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 font-medium">
              {projectsError.message || "Failed to load projects"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <p
                className={`text-sm mt-1 ${
                  formData.title.length > 200 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {formData.title.length} / 200
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!errors.title}
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Project
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.project}
              onChange={(e) => handleInputChange("project", e.target.value)}
              disabled={isSubmitting || projectsLoading}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {projectsLoading && (
              <p className="text-gray-500 text-xs mt-1">Loading projects...</p>
            )}
            {errors.project && (
              <p className="text-red-500 text-xs mt-1">{errors.project}</p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Priority
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                disabled={isSubmitting}
              >
                {["Low", "Medium", "High", "Urgent"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                disabled={isSubmitting}
              >
                {["Pending", "In Progress", "Completed"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.due_date}
                onChange={(e) => handleInputChange("due_date", e.target.value)}
                disabled={isSubmitting}
                min={today}
              />
              {errors.due_date && (
                <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Due Time
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.due_time}
                onChange={(e) => handleInputChange("due_time", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-6 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormChanged()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <ClipLoader size={18} color="#fff" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
