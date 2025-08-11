import React, { useState, useEffect } from "react";
import TaskCard from "../components/task/TaskCard";
import { ToastContainer, toast } from "react-toastify";
import TaskFilter from "../components/task/TaskFilter";
import { FaPlus } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    due_today: false,
    overdue: false,
  });

  const getAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
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

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setTasks(data);
      console.log("Fetched tasks:", data);

      if (data.length === 0) {
        toast.info("No tasks found");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
      toast.error(`Error loading tasks: ${err.message}`);

      if (
        err.message.includes("Authentication failed") ||
        err.message.includes("No access token")
      ) {
      }
    } finally {
      setLoading(false);
    }
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
    fetchTasksWithFilters({ ...filters, tab });
  };

  const onFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    fetchTasksWithFilters({ ...updatedFilters, tab: activeTab });
  };

  const fetchTasksWithFilters = async (filterValues) => {
    try {
      setLoading(true);
      setError(null);

      let query = new URLSearchParams();

      if (filterValues.priority)
        query.append("priority", filterValues.priority);
      if (filterValues.status) query.append("status", filterValues.status);
      if (filterValues.due_today) query.append("due_today", true);
      if (filterValues.overdue) query.append("overdue", true);
      if (filterValues.tab === "Assigned to me")
        query.append("assigned_to_me", true);
      if (filterValues.tab === "Created by me")
        query.append("created_by_me", true);

      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        throw new Error("Authentication failed. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setTasks(data);

      if (data.length === 0) {
        toast.info("No tasks found");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
      toast.error(`Error loading tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksWithFilters({ ...filters, tab: activeTab });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tasks{" "}
              {!loading && (
                <span className="text-gray-400">({tasks.length})</span>
              )}
            </h1>
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              New Task <FaPlus className="inline-block ml-1" />
            </button>
          </div>
        </div>

        <TaskFilter
          activeTab={activeTab}
          onTabChange={onTabChange}
          filters={filters}
          onFilterChange={onFilterChange}
        />

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <ClipLoader color="#2563EB" size={50} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Failed to load tasks
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first task.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create Task
            </button>
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
