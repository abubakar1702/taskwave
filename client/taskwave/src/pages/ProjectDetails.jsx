import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ClipLoader from "react-spinners/ClipLoader";
import {
  FaTriangleExclamation,
  FaUser,
  FaRegUser,
  FaList,
  FaPaperclip,
  FaRegFolder,
  FaArrowLeft,
  FaChartLine,
  FaChartColumn,
} from "react-icons/fa6";
import { toast } from "react-toastify";

import { useApi } from "../hooks/useApi";
import ProjectAssets from "../components/project/Project Detail/ProjectAssets";
import ProjectTeam from "../components/project/Project Detail/ProjectTeam";
import ProjectTasks from "../components/project/Project Detail/ProjectTasks";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ProjectHeader from "../components/project/Project Detail/ProjectHeader";
import Avatar from "../components/common/Avatar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  const { currentUser } = useCurrentUser();

  const {
    data: projectData,
    loading,
    error: apiError,
    refetch,
    makeRequest,
  } = useApi(id ? `${API_BASE_URL}/api/project/${id}/` : null, "GET");

  useEffect(() => {
    if (projectData) {
      setProject(projectData);
    }
  }, [projectData]);

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

  const handleEdit = async (data) => {
    try {
      const updatedProject = await makeRequest(
        `${API_BASE_URL}/api/project/${id}/`,
        "PATCH",
        data
      );
      setProject(updatedProject);
      toast.success("Project updated successfully!");
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error(err.data?.message || "Failed to update project.");
    }
  };

  const handleDelete = async () => {
    try {
      await makeRequest(`${API_BASE_URL}/api/project/${id}/`, "DELETE");
      toast.success("Project deleted successfully!");
      navigate("/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error(err.data?.message || "Failed to delete project.");
    }
  };

  const handleLeave = async () => {
    try {
      await makeRequest(`${API_BASE_URL}/api/project/${id}/leave/`, "POST");
      toast.success("You have successfully left the project!");
      navigate("/projects");
    } catch (err) {
      console.error("Error leaving project:", err);
      toast.error(err.data?.detail || "Failed to leave project.");
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

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <FaTriangleExclamation className="mx-auto h-16 w-16" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Failed to load project
            </h2>
            <p className="text-red-700 mb-6">
              {apiError.message ||
                "An error occurred while loading the project"}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={refetch}
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
  } = project;

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;
  const progressPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <ProjectHeader
        title={title}
        project={project}
        onBack={() => navigate(-1)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLeave={handleLeave}
      />

      <div className="max-w-6xl mx-auto px-6 py-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaRegFolder className="w-5 h-5" />
                Project Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {description || "No description provided for this project."}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-6 justify-end items-start sm:items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Last Updated:{" "}
                  <span className="font-medium text-gray-600">
                    {format(new Date(updated_at), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </span>
                <span className="text-xs text-gray-500">
                  Created:{" "}
                  <span className="font-medium text-gray-600">
                    {format(new Date(created_at), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </span>
                {due_date && (
                  <span className="text-xs text-gray-500">
                    Due:{" "}
                    <span className="font-medium text-gray-600">
                      {format(new Date(due_date), "MMM dd, yyyy")}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Progress Section */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChartLine className="w-5 h-5" />
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

            {/* Team Members with Role */}
            <ProjectTeam
              projectId={id}
              creatorId={creator?.id}
              currentUserId={currentUser?.id}
            />

            {/* Tasks */}
            <ProjectTasks projectId={id} tasks={tasks} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FaChartColumn /> Project Stats
              </h3>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaList className="w-4 h-4" />
                    <span className="text-sm">Tasks</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {tasks.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUser className="w-4 h-4" />
                    <span className="text-sm">Members</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {members.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPaperclip className="w-4 h-4" />
                    <span className="text-sm">Assets</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assets.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Creator */}
            {creator && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaRegUser className="w-5 h-5" />
                  Project Creator
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar
                    name={creator.first_name}
                    url={creator.avatar}
                    size={10}
                  />
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

            {/* Assets */}
            <ProjectAssets projectId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
