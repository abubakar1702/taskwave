import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import {
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineFolderOpen,
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";
import { AiOutlinePaperClip } from "react-icons/ai";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get access token from storage
  const getAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  // Fetch task details from API
  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        throw new Error("Authentication failed. Please log in again.");
      }

      if (response.status === 404) {
        throw new Error("Task not found.");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch task: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setTask(data);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError(err.message);
      toast.error(`Error loading task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle subtask completion
  const toggleSubtaskCompletion = async (subtaskId, currentStatus, taskId) => {
    try {
      const accessToken = getAccessToken();

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/subtask/${subtaskId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            is_completed: !currentStatus,
          }),
        }
      );

      if (response.ok) {
        setTask((prevTask) => ({
          ...prevTask,
          subtasks: prevTask.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, is_completed: !currentStatus }
              : subtask
          ),
        }));
        toast.success("Subtask updated successfully");
      } else {
        throw new Error("Failed to update subtask");
      }
    } catch (err) {
      toast.error("Failed to update subtask");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "in progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const renderAvatar = (user) => {
    if (user?.avatar) {
      const isAbsolute = user.avatar.startsWith("http");
      const avatarUrl = isAbsolute
        ? user.avatar
        : `${API_BASE_URL}${user.avatar}`;
      return (
        <img
          src={avatarUrl}
          alt={user.username}
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
        />
      );
    }

    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";

    return (
      <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
        {initial}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <HiOutlineXCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error Loading Task
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate("/tasks")}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status?.toLowerCase() !== "completed";
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back button */}
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Tasks
          </button>

          {/* Task Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {task.title}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-200 text-indigo-600 bg-indigo-50">
                    <HiOutlineFolderOpen className="w-4 h-4" />
                    {task.project}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  title="Edit task"
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <HiOutlinePencilAlt className="w-5 h-5" />
                </button>
                <button
                  title="Delete task"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* Due Date */}
            {(task.due_date || task.due_time) && (
              <div
                className={`p-4 rounded-lg border flex items-center gap-2 ${
                  isOverdue
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <HiOutlineCalendar
                  className={`w-5 h-5 ${
                    isOverdue ? "text-red-500" : "text-blue-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isOverdue ? "text-red-700" : "text-blue-700"
                  }`}
                >
                  {isOverdue ? "Overdue" : "Due"}:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isOverdue ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  {format(new Date(task.due_date), "MMMM dd, yyyy")}
                  {task.due_time &&
                    ` at ${format(
                      new Date(`1970-01-01T${task.due_time}`),
                      "HH:mm"
                    )}`}
                </span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex gap-6 mt-auto justify-end items-center pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Last Updated:{" "}
                <span className="font-medium text-gray-600">
                  {format(new Date(task.updated_at), "MMM dd, yyyy 'at' HH:mm")}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                Created:{" "}
                <span className="font-medium text-gray-600">
                  {format(new Date(task.created_at), "MMM dd, yyyy 'at' HH:mm")}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Subtasks
                  </h2>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <HiOutlinePlus className="w-4 h-4" />
                    Add Subtask
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>
                      {completedSubtasks} of {totalSubtasks} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() =>
                          toggleSubtaskCompletion(
                            subtask.id,
                            subtask.is_completed
                          )
                        }
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          subtask.is_completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {subtask.is_completed && (
                          <HiOutlineCheckCircle className="w-3 h-3" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-medium ${
                            subtask.is_completed
                              ? "line-through text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {subtask.title}
                        </h4>
                        {subtask.assigned_to && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned to:{" "}
                            {subtask.assigned_to.first_name ||
                            subtask.assigned_to.last_name
                              ? `${subtask.assigned_to.first_name} ${subtask.assigned_to.last_name}`.trim()
                              : subtask.assigned_to.username}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {task.assignees && task.assignees.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Creator */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Creator
                </h3>
                <div className="flex items-center gap-3 mb-6">
                  {renderAvatar(task.creator)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {task.creator.first_name || task.creator.last_name
                        ? `${task.creator.first_name} ${task.creator.last_name}`.trim()
                        : task.creator.username}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {task.creator.email}
                    </p>
                  </div>
                </div>

                {/* Assignees */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assignees
                </h3>
                <div className="divide-y divide-gray-200">
                  {task.assignees.map((assignee, index) => (
                    <div
                      key={assignee.id}
                      className={`flex items-center gap-3 py-3 ${
                        index === 0 ? "pt-0" : ""
                      }`}
                    >
                      {renderAvatar(assignee)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {assignee.first_name || assignee.last_name
                            ? `${assignee.first_name} ${assignee.last_name}`.trim()
                            : assignee.username}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {assignee.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default TaskDetails;
