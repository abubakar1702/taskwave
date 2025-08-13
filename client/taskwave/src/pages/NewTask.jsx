import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiFileText, FiAlertCircle } from "react-icons/fi";
import UserSearch from "../components/new task/UserSearch";
import AddSubtasks from "../components/new task/AddSubtasks";
import FormAction from "../components/new task/FormAction";
import BasicInformation from "../components/new task/BasicInformation";
import ProjectSelection from "../components/new task/ProjectSection";
import TaskDetails from "../components/new task/TaskDetails";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const NewTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    dueTime: "",
    assignedTo: [],
    subtasks: [],
    project: "",
    creator: null,
    comments: [],
    assets: [],
  });
  const [newSubtask, setNewSubtask] = useState("");
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");
        if (!token) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }

        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          console.log("Fetched projects:", projects);
          setProjects(projects);
        } else {
          setError("Failed to load projects.");
        }
      } catch (error) {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "dueDate" && value && !formData.dueTime) {
      setFormData((prev) => ({ ...prev, [name]: value, dueTime: "23:59" }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      project: projectId,
      assignedTo: [],
      subtasks: prev.subtasks.map((st) => ({ ...st, assignedTo: null })),
    }));
  };

  const handleUserSelect = (user) => {
    if (!formData.assignedTo.find((u) => u.id === user.id)) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, user],
      }));
    }
  };

  const handleUserRemove = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((user) => user.id !== userId),
      subtasks: prev.subtasks.map((subtask) => ({
        ...subtask,
        assignedTo:
          subtask.assignedTo && subtask.assignedTo.id === userId
            ? null
            : subtask.assignedTo,
      })),
    }));
  };

  const handleAddSubtask = (newSubtask) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask],
    }));
  };

  const handleRemoveSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSubtask = (index, updatedSubtask) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st, i) =>
        i === index ? updatedSubtask : st
      ),
    }));
  };

  const handleRemoveSubtaskAssignee = (index) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index].assigned_to = null;
    setFormData((prev) => ({
      ...prev,
      subtasks: newSubtasks,
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    if (!formData.title.trim()) {
      errors.title = "Task title is required";
      isValid = false;
    } else if (formData.title.length > 200) {
      errors.title = "Title cannot exceed 200 characters";
      isValid = false;
    }
    if (!formData.description.trim()) {
      errors.description = "Task description is required";
      isValid = false;
    }
    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    if (!validPriorities.includes(formData.priority)) {
      errors.priority = "Invalid priority selected";
      isValid = false;
    }
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.dueDate = "Due date cannot be in the past";
        isValid = false;
      }
    }
    formData.subtasks.forEach((subtask, index) => {
      if (!subtask.title.trim()) {
        errors[`subtask_${index}`] = "Subtask title is required";
        isValid = false;
      } else if (subtask.title.length > 200) {
        errors[`subtask_${index}`] =
          "Subtask title cannot exceed 200 characters";
        isValid = false;
      }
      if (
        subtask.assignedTo &&
        !formData.assignedTo.some((u) => u.id === subtask.assignedTo.id)
      ) {
        errors[`subtask_assignee_${index}`] =
          "Assignee must be assigned to main task";
        isValid = false;
      }
    });
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsCreating(true);
    setError("");
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setIsCreating(false);
        return;
      }
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: "Pending",
        due_date: formData.dueDate || null,
        due_time: formData.dueTime || null,
        project: formData.project ? parseInt(formData.project) : null,
        assignees: formData.assignedTo.map((user) => user.id),
        subtasks: formData.subtasks.map((subtask) => ({
          title: subtask.title.trim(),
          assigned_to: subtask.assignedTo?.id || null,
          is_completed: false,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const createdTask = await response.json();
        const formattedTask = {
          ...createdTask,
          assignedTo: createdTask.assignees,
          subtasks: createdTask.subtasks.map((st) => ({
            ...st,
            assignedTo: st.assigned_to
              ? formData.assignedTo.find((u) => u.id === st.assigned_to)
              : null,
          })),
        };
        window.dispatchEvent(
          new CustomEvent("taskCreated", { detail: formattedTask })
        );
        navigate("/tasks", { state: { newTask: formattedTask } });
      } else {
        const errorData = await response.text();
        console.debug("Error response:", errorData);
        setError(`Failed to create task. Please try again.`);
      }
    } catch (error) {
      console.debug("Network error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderAssigneesSection = () => {
    return (
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiUser className="text-blue-400" /> Assign Team Members
        </h3>
        <UserSearch
          selectedUsers={formData.assignedTo}
          onSelectUser={handleUserSelect}
          onRemoveUser={handleUserRemove}
          projectId={formData.project || null}
          placeholder="Search team members..."
          error={validationErrors.assignedTo}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full px-0 py-0 bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="w-full min-h-screen p-0 m-0">
        <div className="w-full rounded-none bg-gradient-to-r from-blue-50 to-indigo-50 px-12 py-12 flex items-center gap-6 border-b border-gray-100">
          <FiFileText className="w-12 h-12 text-blue-500 flex-shrink-0" />
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create New Task
            </h1>
            <p className="text-gray-600 text-lg">
              Organize your work with a new task
            </p>
          </div>
        </div>
        <div className="w-full bg-white shadow-none rounded-none overflow-hidden">
          {console.log("Projects in render:", projects)}
          <form
            onSubmit={handleSubmit}
            className="divide-y bg-gray-50 divide-gray-200"
          >
            <div className="px-12 py-12 space-y-10">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <BasicInformation
                formData={formData}
                validationErrors={validationErrors}
                handleInputChange={handleInputChange}
              />

              {/* Project Selection */}
              <ProjectSelection
                formData={formData}
                projects={projects}
                handleProjectChange={handleProjectChange}
              />

              {/* Task Details */}
              <TaskDetails
                formData={formData}
                validationErrors={validationErrors}
                handleInputChange={handleInputChange}
              />

              {/* Assignees */}
              {renderAssigneesSection()}

              {/* Subtasks */}
              <AddSubtasks
                subtasks={formData.subtasks}
                onAddSubtask={handleAddSubtask}
                onRemoveSubtask={handleRemoveSubtask}
                onUpdateSubtask={handleUpdateSubtask}
                onRemoveSubtaskAssignee={handleRemoveSubtaskAssignee}
                assignedUsers={formData.assignedTo}
                validationErrors={validationErrors}
              />
            </div>

            {/* Form Actions */}
            <FormAction isCreating={isCreating} />
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewTask;
