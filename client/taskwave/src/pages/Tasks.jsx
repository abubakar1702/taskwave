import React, { useState, useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { Link } from "react-router-dom";
import { FaPlus, FaExclamationCircle, FaClipboardList } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import TaskCard from "../components/task/TaskCard";
import { ToastContainer, toast } from "react-toastify";
import TaskFilter from "../components/task/TaskFilter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    due_today: false,
    overdue: false,
  });
  const [sortBy, setSortBy] = useState("created_at");

  const buildQuery = () => {
    const query = new URLSearchParams();
    if (filters.priority) query.append("priority", filters.priority);
    if (filters.status) query.append("status", filters.status);
    if (filters.due_today) query.append("due_today", true);
    if (filters.overdue) query.append("overdue", true);
    if (activeTab === "Assigned to me") query.append("assigned_to_me", true);
    if (activeTab === "Created by me") query.append("created_by_me", true);
    if (sortBy) query.append("ordering", sortBy);
    return query.toString();
  };

  const queryString = useMemo(() => buildQuery(), [activeTab, filters, sortBy]);

  const {
    data: tasks = [],
    loading,
    error,
  } = useApi(`${API_BASE_URL}/api/tasks/?${queryString}`, "GET", null, [
    queryString,
  ]);

  const onTabChange = (tab) => setActiveTab(tab);
  const onFilterChange = (name, value) =>
    setFilters({ ...filters, [name]: value });
  const onSortChange = (value) => setSortBy(value);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Tasks{" "}
            {!loading && (
              <span className="text-gray-400">({tasks.length})</span>
            )}
          </h1>
          <Link to="/new-task/">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              New Task <FaPlus className="inline-block ml-1" />
            </button>
          </Link>
        </div>

        <TaskFilter
          activeTab={activeTab}
          onTabChange={onTabChange}
          filters={filters}
          onFilterChange={onFilterChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <ClipLoader color="#2563EB" size={50} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Failed to load tasks
            </h3>
            <p className="text-red-700 mb-4">
              {error.response?.data?.detail || error.message}
            </p>
            <button
              onClick={() => toast.info("Try refreshing the page")}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <FaClipboardList className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first task.
            </p>
            <Link to="/new-task/">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Create Task
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        )}
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

export default Tasks;
