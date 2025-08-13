import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineFolder,
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineChartBar,
} from "react-icons/hi";
import { AiOutlinePaperClip } from "react-icons/ai";
import { MdEdit, MdDelete } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import { FiAlertCircle } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = getAccessToken();

        if (!accessToken) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await fetch(`${API_BASE_URL}/api/project/${id}/`, {
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
          throw new Error("Project not found");
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch project: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

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
          className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
        />
      );
    }

    const initial =
      user?.first_name?.[0]?.toUpperCase() ||
      user?.username?.[0]?.toUpperCase() ||
      "U";

    return (
      <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
        {initial}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "active":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "on hold":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <ClipLoader color="#3B82F6" size={32} className="mx-auto mb-4" />
          <p className="text-gray-600 text-center">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <FiAlertCircle className="mx-auto h-16 w-16" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Failed to load project
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/projects")}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const {
    title,
    description,
    creator,
    members = [],
    tasks = [],
    assets = [],
    created_at,
    updated_at,
    status,
    priority,
    due_date,
    color = "#3B82F6",
  } = project;

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;
  const progressPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <MdEdit className="w-4 h-4" />
                Edit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <MdDelete className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status and Priority Badges */}
        <div className="flex items-center gap-3 mb-6">
          {status && (
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          )}
          {priority && (
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(
                priority
              )}`}
            >
              {priority} Priority
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineFolder className="w-5 h-5" />
                Project Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {description || "No description provided for this project."}
              </p>
            </div>

            {/* Progress Section */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineChartBar className="w-5 h-5" />
                  Progress Overview
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Task Completion
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {completedTasks}/{tasks.length} ({progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Team Members with Role and Joined At */}
            {members.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineUsers className="w-5 h-5" />
                  Team Members ({members.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {renderAvatar(member.user)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {member.user.first_name || member.user.last_name
                            ? `${member.user.first_name} ${member.user.last_name}`.trim()
                            : member.user.username}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="italic">{member.role?.name}</span> |
                          Joined {format(new Date(member.joined_at), "PPP")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks list with status */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineClipboardList className="w-5 h-5" />
                  Tasks ({tasks.length})
                </h2>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">
                        {task.title}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status || "Unknown"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineClipboardList className="w-4 h-4" />
                    <span className="text-sm">Tasks</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {tasks.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineUsers className="w-4 h-4" />
                    <span className="text-sm">Members</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {members.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <AiOutlinePaperClip className="w-4 h-4" />
                    <span className="text-sm">Assets</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assets.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Creator */}
            {creator && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineUser className="w-5 h-5" />
                  Project Creator
                </h3>
                <div className="flex items-center gap-3">
                  {renderAvatar(creator)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {creator.first_name || creator.last_name
                        ? `${creator.first_name} ${creator.last_name}`.trim()
                        : creator.username}
                    </p>
                    <p className="text-sm text-gray-500">@{creator.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assets list - Moved here */}
            {assets.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AiOutlinePaperClip className="w-5 h-5" />
                  Assets ({assets.length})
                </h3>
                <ul className="list-disc list-inside space-y-2 text-blue-600">
                  {assets.map((asset) => (
                    <li key={asset.id}>
                      <a
                        href={asset.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {asset.file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineClock className="w-5 h-5" />
                Timeline
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(created_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(updated_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                {due_date && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-gray-600">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(due_date), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
