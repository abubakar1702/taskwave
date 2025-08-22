import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import {
  FaPlus,
  FaFolder,
  FaArrowLeft,
  FaTriangleExclamation,
  FaRegFolder,
} from "react-icons/fa6";
import { useApi } from "../../../hooks/useApi";
import TaskCard from "../../task/TaskCard";
import TaskFilter from "../../task/TaskFilter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ProjectTasksPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    due_today: false,
    overdue: false,
  });
  const [sortBy, setSortBy] = useState("-created_at");

  const buildQuery = () => {
    const query = new URLSearchParams();
    if (filters.priority) query.append("priority", filters.priority);
    if (filters.status) query.append("status", filters.status);
    if (filters.due_today) query.append("due_today", "true");
    if (filters.overdue) query.append("overdue", "true");

    if (activeTab === "Assigned to me") query.append("assigned_to_me", "true");
    if (activeTab === "Created by me") query.append("created_by_me", "true");

    if (sortBy) query.append("ordering", sortBy);

    return query.toString();
  };

  const queryString = useMemo(() => buildQuery(), [activeTab, filters, sortBy]);

  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useApi(id ? `${API_BASE_URL}/api/project/${id}/` : null, "GET");

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useApi(
    id ? `${API_BASE_URL}/api/project/${id}/tasks/?${queryString}` : null,
    "GET",
    null,
    [queryString, id]
  );

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (value) => {
    const sortMapping = {
      priority: "-priority",
      due_date: "-due_date",
      created_at: "-created_at",
    };
    setSortBy(sortMapping[value] || `-${value}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (projectLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <ClipLoader color="#3B82F6" size={32} className="mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading project...</p>
        </div>
      </div>
    );

  if (projectError)
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
              {projectError?.message ||
                "An error occurred while loading the project"}
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaRegFolder className="w-7 h-7" />
              {projectData?.title} / Tasks
            </h1>
          </div>
          <Link to={`/new-task/?project=${id}`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FaPlus className="w-4 h-4" /> New Task
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Task Filter */}
        <TaskFilter
          activeTab={activeTab}
          onTabChange={handleTabChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy.replace(/^-/, "")}
          onSortChange={handleSortChange}
        />

        {/* Tasks List */}
        {tasksLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <ClipLoader color="#3B82F6" size={50} />
            <p className="ml-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasksError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <FaTriangleExclamation className="mx-auto h-16 w-16" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Failed to load tasks
            </h2>
            <p className="text-red-700 mb-6">
              {tasksError?.message || "An error occurred while loading tasks"}
            </p>
            <button
              onClick={refetchTasks}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : !tasksData || tasksData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 mb-6">
              {queryString
                ? "No tasks match your current filters."
                : "This project doesn't have any tasks yet."}
            </p>
            <Link to={`/new-task/?project=${id}`}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create First Task
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksData.map((task) => (
              <TaskCard key={task.id} {...task} project={projectData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTasksPage;
