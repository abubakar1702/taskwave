import React from "react";
import { format } from "date-fns";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsListTask } from "react-icons/bs";
import { AiOutlinePaperClip } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const ProjectCard = ({ project }) => {
  const {
    title,
    description,
    creator,
    members = [],
    tasks = [],
    assets = [],
    created_at,
    updated_at,
  } = project;
  const navigate = useNavigate();

   const handleClick = () => {
    // Fixed route to match ProjectDetails component
    navigate(`/project/${project.id}`);
  };

  const formatDate = (dateStr) =>
    dateStr ? format(new Date(dateStr), "MMM dd, yyyy") : "";

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
      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
        {initial}
      </div>
    );
  };

  return (
    <div onClick={handleClick} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 ease-out min-h-[220px] flex flex-col">
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
        {description}
      </p>

      {/* Creator */}
      <div className="flex items-center gap-2 mb-4">
        {creator && (
          <>
            {renderAvatar(creator)}
            <span className="text-xs font-medium text-gray-700">
              {creator.first_name || creator.last_name
                ? `${creator.first_name} ${creator.last_name}`.trim()
                : creator.username || "Unknown"}
            </span>
          </>
        )}
      </div>

      {/* Members, tasks, assets counts */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-1">
          <HiOutlineUserGroup className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <BsListTask className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <AiOutlinePaperClip className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">
            {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Created & Updated dates */}
      <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 flex justify-between">
        <div>Created: {formatDate(created_at)}</div>
        <div>Updated: {formatDate(updated_at)}</div>
      </div>
    </div>
  );
};

export default ProjectCard;
