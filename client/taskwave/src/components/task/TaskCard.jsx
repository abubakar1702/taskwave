import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AiOutlinePaperClip } from "react-icons/ai";
import {
  HiOutlineCalendar,
  HiOutlineFolderOpen,
} from "react-icons/hi";

const TaskCard = ({
  id,
  title,
  priority,
  due_date,
  due_time,
  assignees = [],
  created_at,
  creator = null,
  status,
  project_title,
  assets = [],
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
  navigate(`/tasks/${id}`);
};


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

  const startDate = created_at ? format(new Date(created_at), "MMM dd") : "";

  const dueDateFmt = due_date ? format(new Date(due_date), "MMM dd") : "";

  const renderAvatar = (user) => {
    if (user?.avatar) {
      const isAbsolute = user.avatar.startsWith("http");
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const avatarUrl = isAbsolute
        ? user.avatar
        : `${API_BASE_URL}${user.avatar}`;
      return (
        <img
          src={avatarUrl}
          alt={user.username}
          className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
        />
      );
    }

    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";

    return (
      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs">
        {initial}
      </div>
    );
  };

  const isOverdue =
    due_date &&
    new Date(due_date) < new Date() &&
    status?.toLowerCase() !== "completed";

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 ease-out h-auto min-h-[200px] group"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2 flex-1">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${getPriorityColor(
              priority
            )}`}
          >
            {priority ? `${priority}` : "Normal"}
          </span>
        </div>

        {project_title && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <HiOutlineFolderOpen className="w-3 h-3" />
            <span>{project_title}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors">
          {title}
        </h3>
      </div>

      {(due_date || due_time) && (
        <div
          className={`mb-4 p-3 rounded-lg border transition-colors ${
            isOverdue
              ? "bg-red-50 border-red-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <HiOutlineCalendar
              className={`w-4 h-4 ${
                isOverdue ? "text-red-500" : "text-blue-500"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isOverdue ? "text-red-700" : "text-blue-700"
              }`}
            >
              {isOverdue ? "Overdue" : "Due"}:
            </span>
            <span
              className={`text-xs font-semibold ${
                isOverdue ? "text-red-800" : "text-blue-800"
              }`}
            >
              {dueDateFmt}
              {due_time &&
                ` at ${format(new Date(`1970-01-01T${due_time}`), "HH:mm")}`}
            </span>
          </div>
        </div>
      )}

      {assignees.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {creator && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-500">by</span>
                <span className="text-xs font-medium text-gray-700">
                  {creator.first_name || creator.last_name
                    ? `${creator.first_name} ${creator.last_name}`.trim()
                    : creator.username || "Unknown"}
                </span>
              </div>
            )}
            <div className="flex -space-x-2">
              {assignees.slice(0, 4).map((user) => (
                <div key={user.id} className="relative">
                  {renderAvatar(user)}
                </div>
              ))}
              {assignees.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-medium text-xs">
                  +{assignees.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>{startDate}</span>
            </div>
            {dueDateFmt && (
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOverdue ? "bg-red-400" : "bg-blue-400"
                  }`}
                ></span>
                <span>{dueDateFmt}</span>
              </div>
            )}
          </div>
        </div>
        {assets && assets.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 text-gray-600 text-xs">
            <AiOutlinePaperClip className="w-3.5 h-3.5" />
            <span className="font-medium">{assets.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
