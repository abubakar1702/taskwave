import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineUser,
  HiChevronDown,
  HiChevronRight,
  HiX,
  HiCheck,
} from "react-icons/hi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import AddSubtaskModal from "./AddSubtaskModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import SubtaskActions from "./SubtaskActions";
import { useAppDispatch } from "../../app/hooks";
import { fetchTaskDetail } from "../../features/task detail/taskDetailSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Subtasks = ({ task }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentUser();
  const [expandedCategories, setExpandedCategories] = useState({
    assignedToMe: true,
    assignedToTeam: true,
    unassigned: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshTask = () => dispatch(fetchTaskDetail({ taskId: task.id }));

  const handleAddNewSubtask = async (subtask) => {
    try {
      await axios.post(`${API_BASE_URL}/api/task/${task.id}/subtasks/`, subtask, {
        headers: getAuthHeaders(),
      });
      refreshTask();
      toast.success("Subtask added successfully");
    } catch (error) {
      toast.error("Failed to add subtask");
    }
  };

  const toggleSubtaskCompletion = async (subtaskId, currentStatus, assignedTo) => {
    if (!assignedTo || assignedTo.id !== currentUser?.id) {
      toast.error("You can only update subtasks assigned to you");
      return;
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskId}/`,
        { is_completed: !currentStatus },
        { headers: getAuthHeaders() }
      );
      refreshTask();
      toast.success("Subtask updated successfully");
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  const handleUnassign = async (subtaskId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskId}/`,
        { assigned_to: null, is_completed: false },
        { headers: getAuthHeaders() }
      );
      refreshTask();
      toast.success("Subtask unassigned successfully");
    } catch (error) {
      toast.error("Failed to unassign subtask");
    }
  };

  const handleAssignSubtask = async (subtaskId, userId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskId}/`,
        { assigned_to: userId },
        { headers: getAuthHeaders() }
      );
      refreshTask();
      toast.success("Subtask assigned successfully");
    } catch (error) {
      toast.error("Failed to assign subtask");
    }
  };

  const handleEditClick = (subtaskId) => {
    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    setEditingSubtask(subtaskId);
    setEditTitle(subtask.title);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${task.id}/subtask/${editingSubtask}/`,
        { title: editTitle.trim() },
        { headers: getAuthHeaders() }
      );
      refreshTask();
      toast.success("Subtask updated successfully");
      setEditingSubtask(null);
      setEditTitle("");
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  const handleCancelEdit = () => {
    setEditingSubtask(null);
    setEditTitle("");
  };

  const handleDeleteSubtask = (subtask) => {
    setSubtaskToDelete(subtask);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!subtaskToDelete) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskToDelete.id}/`,
        { headers: getAuthHeaders() }
      );
      refreshTask();
      toast.success("Subtask deleted successfully");
    } catch (error) {
      toast.error("Failed to delete subtask");
    } finally {
      setShowDeleteModal(false);
      setSubtaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSubtaskToDelete(null);
  };

  const renderAvatar = (user, size = "6") => {
    if (!user) return null;
    if (user.avatar) {
      const avatarUrl = user.avatar.startsWith("http") 
        ? user.avatar 
        : `${API_BASE_URL}${user.avatar}`;
      return (
        <img
          src={avatarUrl}
          alt={user.username}
          className={`w-${size} h-${size} rounded-full border border-gray-200 object-cover`}
        />
      );
    }
    const initial = user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U";
    return (
      <div className={`w-${size} h-${size} rounded-full border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium`}>
        {initial}
      </div>
    );
  };

  const getUserDisplayName = (user) => {
    if (user.first_name || user.last_name) return `${user.first_name} ${user.last_name}`.trim();
    return user.username;
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderSubtaskItem = (subtask, canToggle = false) => {
    const isEditing = editingSubtask === subtask.id;

    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
        isEditing ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 hover:border-gray-200"
      }`}>
        {canToggle && !isEditing && (
          <button
            onClick={() => toggleSubtaskCompletion(subtask.id, subtask.is_completed, subtask.assigned_to)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
              subtask.is_completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-500"
            }`}
          >
            {subtask.is_completed && <HiOutlineCheckCircle className="w-3 h-3" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 mr-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subtask title"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
              </div>
            ) : (
              <h4 className={`text-sm font-medium flex-1 ${
                subtask.is_completed ? "line-through text-gray-500" : "text-gray-900"
              }`}>
                {subtask.title}
              </h4>
            )}

            {isEditing ? (
              <div className="flex items-center gap-2">
                <button onClick={handleSaveEdit} className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <HiCheck className="w-4 h-4" />
                </button>
                <button onClick={handleCancelEdit} className="p-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <SubtaskActions
                subtask={subtask}
                task={task}
                currentUser={currentUser}
                openDropdowns={openDropdowns}
                setOpenDropdowns={setOpenDropdowns}
                handleAssignSubtask={handleAssignSubtask}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteSubtask}
                onUnassignClick={handleUnassign}
              />
            )}
          </div>

          {!isEditing && (
            <div className="flex justify-between flex-wrap gap-4 text-xs text-gray-500">
              {subtask.assigned_to ? (
                <div className="flex items-center gap-1.5">
                  {renderAvatar(subtask.assigned_to)}
                  <span className="font-medium text-gray-700">
                    {getUserDisplayName(subtask.assigned_to)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                    <HiOutlineUser className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-gray-400 italic">Unassigned</span>
                </div>
              )}
              <span className="text-[11px] text-gray-400">
                {format(new Date(subtask.created_at), "MMM dd, yyyy 'at' HH:mm")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategory = (title, subtasks, categoryKey, canToggle = false) => {
    if (!subtasks.length) return null;
    const completedCount = subtasks.filter((s) => s.is_completed).length;
    const isExpanded = expandedCategories[categoryKey];

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="flex items-center justify-between w-full px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <HiChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <HiChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {subtasks.length}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {completedCount} of {subtasks.length} completed
          </span>
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {subtasks.map((subtask) => renderSubtaskItem(subtask, canToggle))}
          </div>
        )}
      </div>
    );
  };

  const assignedToMe = task.subtasks?.filter((s) => s.assigned_to?.id === currentUser?.id) || [];
  const assignedToTeam = task.subtasks?.filter((s) => s.assigned_to && s.assigned_to.id !== currentUser?.id) || [];
  const unassigned = task.subtasks?.filter((s) => !s.assigned_to) || [];
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
  const overallProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Subtasks</h2>
          {totalSubtasks > 0 && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {totalSubtasks} total
            </span>
          )}
        </div>
        {task?.creator?.id === currentUser?.id && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Subtask
          </button>
        )}
      </div>

      {totalSubtasks > 0 ? (
        <>
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex justify-between text-sm text-gray-700 mb-2 font-medium">
              <span>Overall Progress</span>
              <span>
                {completedSubtasks} of {totalSubtasks} completed
              </span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {renderCategory("Assigned to Me", assignedToMe, "assignedToMe", true)}
          {renderCategory("Assigned to Team", assignedToTeam, "assignedToTeam", false)}
          {renderCategory("Unassigned", unassigned, "unassigned", false)}
        </>
      ) : (
        <div className="text-center py-12">
          <HiOutlineCheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subtasks yet</h3>
          <p className="text-gray-600 mb-4">Break down this task into smaller, manageable pieces</p>
          {task?.creator?.id === currentUser?.id && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Create First Subtask
            </button>
          )}
        </div>
      )}

      <AddSubtaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddNewSubtask}
        assignedUsers={task.assignees || []}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Subtask"
        message={`Are you sure you want to delete this subtask? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default Subtasks;