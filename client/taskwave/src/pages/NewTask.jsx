import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiCalendar,
  FiUser,
  FiTag,
  FiFileText,
  FiClock,
  FiSearch,
  FiChevronDown,
  FiAlertCircle,
  FiBriefcase,
} from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

const NewTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    dueTime: "",
    assignedTo: [],
    subtasks: [],
    project: "",
  });
  const [newSubtask, setNewSubtask] = useState("");
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef(null);
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

        const [usersResponse, projectsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/users/all/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://127.0.0.1:8000/api/projects/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (usersResponse.ok) {
          const users = await usersResponse.json();
          setAllUsers(users);
          setAvailableUsers(users);
        } else {
          setError("Failed to load users.");
        }

        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          console.log("Fetched projects:", projects);
          setProjects(projects);
        } else {
          setError((prev) =>
            prev ? `${prev} Failed to load projects.` : "Failed to load projects."
          );
        }
      } catch (error) {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

    if (projectId) {
      const selectedProject = projects.find(
        (p) => p.id === parseInt(projectId)
      );
      if (selectedProject) {
        setAvailableUsers(selectedProject.members);
      }
    } else {
      setAvailableUsers(allUsers);
    }
    setSearchQuery("");
  };

  const filteredUsers = availableUsers.filter((user) => {
    const fullName = `${user.first_name || ""} ${
      user.last_name || ""
    }`.toLowerCase();
    const username = user.username.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });

  const handleAssigneeSelect = (user) => {
    if (!formData.assignedTo.find((u) => u.id === user.id)) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, user],
      }));
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const removeAssignee = (userId) => {
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

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        newSubtask: "Subtask title is required",
      }));
      return;
    }
    const selectedUserId = parseInt(newSubtaskAssignee);
    const selectedUser = selectedUserId
      ? formData.assignedTo.find((user) => user.id === selectedUserId)
      : null;
    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        {
          title: newSubtask.trim(),
          is_completed: false,
          assignedTo: selectedUser || null,
        },
      ],
    }));
    setNewSubtask("");
    setNewSubtaskAssignee("");
    setValidationErrors((prev) => ({ ...prev, newSubtask: "" }));
  };

  const handleRemoveSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const removeSubtaskAssignee = (subtaskIndex) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, index) =>
        index === subtaskIndex ? { ...subtask, assignedTo: null } : subtask
      ),
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
        subtasks: formData.subtasks.map((subtask) => {
          const subtaskData = { title: subtask.title.trim() };
          if (subtask.assignedTo?.id) {
            subtaskData.assigned_to_id = subtask.assignedTo.id;
          }
          return subtaskData;
        }),
      };
      console.debug("Submitting taskData:", taskData);
      const response = await fetch("http://127.0.0.1:8000/api/tasks/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      console.debug("Response status:", response.status);
      if (response.ok) {
        const createdTask = await response.json();
        console.debug("Created task:", createdTask);
        window.dispatchEvent(
          new CustomEvent("taskCreated", { detail: createdTask })
        );
        navigate("/tasks", { state: { newTask: createdTask } });
      } else {
        const errorData = await response.text();
        console.debug("Error response:", errorData);
        alert(errorData);
        setError(`Failed to create task. Please try again.`);
      }
    } catch (error) {
      console.debug("Network error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderAvatar = (user) => {
    if (user?.profile_picture) {
      return (
        <img
          src={user.profile_picture}
          alt={user.username}
          className="w-6 h-6 rounded-full border border-white shadow object-cover"
        />
      );
    }
    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";
    return (
      <div className="w-6 h-6 rounded-full border border-white shadow bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full px-0 py-0 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Content */}
      <main className="w-full min-h-screen p-0 m-0">
        {/* Gradient Header */}
        <div className="w-full rounded-none bg-gradient-to-r from-blue-50 to-indigo-50 px-12 py-12 flex items-center gap-6 border-b border-gray-100">
          <FiFileText className="w-12 h-12 text-blue-500 flex-shrink-0" />
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Create New Task</h1>
            <p className="text-gray-600 text-lg">Organize your work with a new task</p>
          </div>
        </div>
        <div className="w-full bg-white shadow-none rounded-none overflow-hidden">
          {console.log("Projects in render:", projects)}
          <form onSubmit={handleSubmit} className="divide-y bg-gray-50 divide-gray-200">
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
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiFileText className="text-blue-400" />
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${validationErrors.title ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white"}`}
                      placeholder="Task title"
                    />
                  </div>
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{validationErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiFileText className="text-blue-400" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-4 text-gray-300" />
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${validationErrors.description ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white"}`}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detailed task description"
                    />
                  </div>
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{validationErrors.description}</p>
                  )}
                </div>
              </div>

              {/* Project Selection */}
              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                >
                  <FiBriefcase className="text-purple-400" /> Project
                </label>
                <select
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleProjectChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value="">Select a project (optional)</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FiTag className="text-purple-400" /> Task Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FiTag className="text-purple-400" /> Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FiCalendar className="text-blue-400" /> Due Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${validationErrors.dueDate ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white"}`}
                      />
                    </div>
                    {validationErrors.dueDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{validationErrors.dueDate}</p>
                    )}
                  </div>

                  {/* Due Time */}
                  <div>
                    <label htmlFor="dueTime" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FiClock className="text-blue-400" /> Due Time
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="time"
                        name="dueTime"
                        id="dueTime"
                        value={formData.dueTime}
                        onChange={handleInputChange}
                        className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FiUser className="text-blue-400" /> Assign Team Members</h3>
                <div className="space-y-4 relative" ref={dropdownRef}>
                  {loading ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setIsDropdownOpen(true)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm hover:bg-white"
                          placeholder="Search team members..."
                        />
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <FiChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-y-auto focus:outline-none sm:text-sm">
                          {filteredUsers.length === 0 ? (
                            <div className="px-4 py-2 text-gray-500">
                              No team members found
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleAssigneeSelect(user)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 truncate"
                              >
                                {renderAvatar(user)}
                                <span className="block truncate">
                                  {user.first_name && user.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user.username}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {formData.assignedTo.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.assignedTo.map((user) => (
                            <div
                              key={user.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {renderAvatar(user)}
                              <span className="ml-1">
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.username}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeAssignee(user.id)}
                                className="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 hover:bg-blue-200 focus:outline-none"
                              >
                                <FiX className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FiFileText className="text-purple-400" /> Subtasks</h3>
                <div className="space-y-4">
                  {formData.subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FiFileText className="text-purple-400" /> Subtask {index + 1} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                              type="text"
                              value={subtask.title}
                              onChange={(e) => {
                                const newSubtasks = [...formData.subtasks];
                                newSubtasks[index].title = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  subtasks: newSubtasks,
                                }));
                                if (validationErrors[`subtask_${index}`]) {
                                  setValidationErrors((prev) => ({
                                    ...prev,
                                    [`subtask_${index}`]: "",
                                  }));
                                }
                              }}
                              className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${validationErrors[`subtask_${index}`] ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-white"}`}
                              placeholder="Subtask description"
                            />
                          </div>
                          {validationErrors[`subtask_${index}`] && (
                            <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{validationErrors[`subtask_${index}`]}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(index)}
                          className="ml-3 inline-flex items-center p-1 border border-transparent rounded-full text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>

                      {subtask.assignedTo && (
                        <div className="mt-2">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {renderAvatar(subtask.assignedTo)}
                            <span className="ml-1">
                              {subtask.assignedTo.first_name && subtask.assignedTo.last_name
                                ? `${subtask.assignedTo.first_name} ${subtask.assignedTo.last_name}`
                                : subtask.assignedTo.username}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSubtaskAssignee(index)}
                              className="ml-1.5 inline-flex items-center justify-center rounded-full h-3 w-3 hover:bg-green-200 focus:outline-none"
                            >
                              <FiX className="h-2 w-2" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Subtask */}
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <label htmlFor="newSubtask" className="sr-only">
                          Add subtask
                        </label>
                        <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          id="newSubtask"
                          value={newSubtask}
                          onChange={(e) => {
                            setNewSubtask(e.target.value);
                            if (validationErrors.newSubtask) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                newSubtask: "",
                              }));
                            }
                          }}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddSubtask())
                          }
                          className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${validationErrors.newSubtask ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-white"}`}
                          placeholder="Add a new subtask"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        className="inline-flex items-center px-4 py-3 border border-transparent text-sm leading-4 font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaPlus className="mr-2" /> Add
                      </button>
                    </div>

                    {validationErrors.newSubtask && (
                      <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{validationErrors.newSubtask}</p>
                    )}

                    {formData.assignedTo.length > 0 && (
                      <div className="mt-3">
                        <select
                          value={newSubtaskAssignee}
                          onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                          className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white"
                        >
                          <option value="">Assign to (optional)</option>
                          {formData.assignedTo.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-12 py-8 bg-gray-50 text-right rounded-none">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="ml-4 inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewTask;