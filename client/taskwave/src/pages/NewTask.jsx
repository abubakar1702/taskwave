import React, { useState, useEffect, useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { FiUser, FiFileText, FiAlertCircle } from "react-icons/fi";
import UserSearch from "../components/new task/UserSearch";
import AddSubtasks from "../components/new task/AddSubtasks";
import FormAction from "../components/new task/FormAction";
import BasicInformation from "../components/new task/BasicInformation";
import ProjectSelection from "../components/new task/ProjectSection";
import TaskDetails from "../components/new task/TaskDetails";
import { useCurrentUser } from "../hooks/useCurrentUser";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const NewTask = () => {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

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
    comments: [],
    assets: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const {
    data: projects = [],
    loading: projectsLoading,
    error: projectsError,
    makeRequest,
  } = useApi(`${API_BASE_URL}/api/projects/`, "GET");

  const {
    data: projectData,
    loading: isLoadingMembers,
    error: projectMembersError,
    refetch: refetchProjectMembers,
  } = useApi(
    formData.project ? `${API_BASE_URL}/api/project/${formData.project}` : null,
    "GET",
    null,
    [formData.project]
  );

  const selectedProjectId = formData.project;

  const projectMembers = useMemo(() => {
    return projectData?.members?.map((member) => member.user) || [];
  }, [projectData]);

  useEffect(() => {
    if (selectedProjectId && projectData) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: projectMembers,
      }));
    } else if (!selectedProjectId) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [],
      }));
    }
  }, [selectedProjectId, projectData, projectMembers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "dueDate" && value && !formData.dueTime) {
      setFormData((prev) => ({ ...prev, dueTime: "23:59" }));
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
      assignedTo: prev.assignedTo.filter((u) => u.id !== userId),
      subtasks: prev.subtasks.map((st) => ({
        ...st,
        assignedTo: st.assignedTo?.id === userId ? null : st.assignedTo,
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
    newSubtasks[index].assignedTo = null;
    setFormData((prev) => ({ ...prev, subtasks: newSubtasks }));
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

    formData.subtasks.forEach((subtask, index) => {
      if (!subtask.title.trim()) {
        errors[`subtask_${index}`] = "Subtask title is required";
        isValid = false;
      } else if (subtask.title.length > 200) {
        errors[`subtask_${index}`] =
          "Subtask title cannot exceed 200 characters";
        isValid = false;
      }

      if (subtask.assignedTo) {
        const assigneeId = subtask.assignedTo.id;
        const isCurrentUser = currentUser?.id === assigneeId;

        if (selectedProjectId) {
          const isProjectMember = projectMembers.some(
            (user) => user.id === assigneeId
          );
          if (!isProjectMember && !isCurrentUser) {
            errors[`subtask_assignee_${index}`] =
              "Subtask assignee must be a member of the selected project.";
            isValid = false;
          }
        } else {
          const isAssignedToMainTask = formData.assignedTo.some(
            (u) => u.id === assigneeId
          );
          if (!isAssignedToMainTask && !isCurrentUser) {
            errors[`subtask_assignee_${index}`] =
              "Assignee must be assigned to the main task.";
            isValid = false;
          }
        }
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
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: "Pending",
        due_date: formData.dueDate || null,
        due_time: formData.dueTime || null,
        project: formData.project || null,
        assignees: formData.assignedTo.map((user) => user.id),
        subtasks: formData.subtasks.map((subtask) => ({
          title: subtask.title.trim(),
          assigned_to: subtask.assignedTo?.id || null,
          is_completed: false,
        })),
      };

      const createdTask = await makeRequest(
        `${API_BASE_URL}/api/tasks/`,
        "POST",
        taskData
      );

      navigate("/tasks", { state: { newTask: createdTask } });
    } catch (err) {
      setError(`Failed to create task. ${err.message || err}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="w-full min-h-screen">
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
          {projectsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <p className="text-red-700 font-medium">
                  {projectsError.message || projectsError}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 px-12 py-12 space-y-10"
          >
            <BasicInformation
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
            />

            <ProjectSelection
              formData={formData}
              projects={projects || []}
              handleProjectChange={handleProjectChange}
              loading={projectsLoading}
            />

            <TaskDetails
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
            />

            {!selectedProjectId && (
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
                  showSelectedMembers={true}
                />
              </div>
            )}

            <AddSubtasks
              subtasks={formData.subtasks}
              onAddSubtask={handleAddSubtask}
              onRemoveSubtask={handleRemoveSubtask}
              onUpdateSubtask={handleUpdateSubtask}
              onRemoveSubtaskAssignee={handleRemoveSubtaskAssignee}
              assignedUsers={formData.assignedTo}
              validationErrors={validationErrors}
              projectMembers={projectMembers}
              isLoadingMembers={isLoadingMembers}
              selectedProject={formData.project}
            />

            <FormAction isCreating={isCreating || isLoadingMembers} />
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewTask;
