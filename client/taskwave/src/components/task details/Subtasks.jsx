import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineUser,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import AddSubtaskModal from "./AddSubtaskModal";
import { useApi } from "../../hooks/useApi";
import SubtaskActions from "./SubtaskActions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Subtasks = ({ task, setTask }) => {
  const { currentUser } = useCurrentUser();
  const [expandedCategories, setExpandedCategories] = useState({
    assignedToMe: true,
    assignedToTeam: true,
    unassigned: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [requestBody, setRequestBody] = useState(null);
  const [patchBody, setPatchBody] = useState(null);
  const [patchUrl, setPatchUrl] = useState(null);

  const {
    data: addedSubtask,
    loading: adding,
    error: addError,
  } = useApi(
    requestBody ? `${API_BASE_URL}/api/task/${task.id}/subtasks/` : null,
    "POST",
    requestBody,
    [requestBody]
  );

  const {
    data: updatedSubtask,
    loading: patching,
    error: patchError,
  } = useApi(patchUrl, "PATCH", patchBody, [patchUrl, patchBody]);

  useEffect(() => {
    if (addedSubtask) {
      setTask((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, addedSubtask],
      }));
      toast.success("Subtask added successfully");
      setRequestBody(null);
      setIsModalOpen(false);
    }
  }, [addedSubtask, setTask]);

  useEffect(() => {
    if (updatedSubtask) {
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((subtask) =>
          subtask.id === updatedSubtask.id ? updatedSubtask : subtask
        ),
      }));
      toast.success("Subtask updated successfully");
      setPatchBody(null);
      setPatchUrl(null);
    }
  }, [updatedSubtask, setTask]);

  const handleAddNewSubtask = (subtask) => {
    setRequestBody(subtask);
  };

  const toggleSubtaskCompletion = (subtaskId, currentStatus, assignedTo) => {
    if (!assignedTo || assignedTo.id !== currentUser?.id) {
      toast.error("You can only update subtasks assigned to you");
      return;
    }
    setPatchUrl(`${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskId}/`);
    setPatchBody({ is_completed: !currentStatus });
  };

  const handleUnassign = (subtaskId) => {
    setPatchUrl(`${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskId}/`);
    setPatchBody({ assigned_to: null, is_completed: false });
  };

  const handleAssignSubtask = (subtaskId, userId) => {
    const selectedUser = [...task.assignees, task.creator].find(
      (u) => u.id === userId
    );
    setPatchUrl(`${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtaskId}/`);
    setPatchBody({ assigned_to: userId });
  };

  const toggleDropdown = (subtaskId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [subtaskId]: !prev[subtaskId],
    }));
  };

  const renderAvatar = (user, size = "6") => {
    if (!user) return null;
    if (user.avatar) {
      const isAbsolute = user.avatar.startsWith("http");
      const avatarUrl = isAbsolute
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
    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";
    return (
      <div
        className={`w-${size} h-${size} rounded-full border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium`}
      >
        {initial}
      </div>
    );
  };

  const getUserDisplayName = (user) => {
    if (user.first_name || user.last_name)
      return `${user.first_name} ${user.last_name}`.trim();
    return user.username;
  };

  const getAvailableAssignees = () => {
    const isTaskCreator = task.creator?.id === currentUser?.id;
    if (isTaskCreator) {
      const allUsers = [...task.assignees];
      if (!allUsers.find((u) => u.id === task.creator.id))
        allUsers.push(task.creator);
      return allUsers;
    } else {
      return (
        task.assignees?.filter((user) => user.id === currentUser?.id) || []
      );
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderSubtaskItem = (subtask, canToggle = false) => (
    <div
      key={subtask.id}
      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
    >
      {canToggle ? (
        <button
          onClick={() =>
            toggleSubtaskCompletion(
              subtask.id,
              subtask.is_completed,
              subtask.assigned_to
            )
          }
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
            subtask.is_completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {subtask.is_completed && <HiOutlineCheckCircle className="w-3 h-3" />}
        </button>
      ) : (
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 cursor-not-allowed ${
            subtask.is_completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 bg-gray-100"
          }`}
        >
          {subtask.is_completed && <HiOutlineCheckCircle className="w-3 h-3" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h4
            className={`text-sm font-medium flex-1 ${
              subtask.is_completed
                ? "line-through text-gray-500"
                : "text-gray-900"
            }`}
          >
            {subtask.title}
          </h4>

          <SubtaskActions
            subtask={subtask}
            task={task}
            currentUser={currentUser}
            openDropdowns={openDropdowns}
            setOpenDropdowns={setOpenDropdowns}
            handleAssignSubtask={handleAssignSubtask}
            setPatchUrl={setPatchUrl}
            setPatchBody={setPatchBody}
            unassign={handleUnassign}
          />
        </div>

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

          <div>
            <span className="text-[11px] text-gray-400">
              {format(new Date(subtask.created_at), "MMM dd, yyyy 'at' HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategory = (title, subtasks, categoryKey, canToggle = false) => {
    if (!subtasks.length) return null;
    const completedCount = subtasks.filter((s) => s.is_completed).length;
    const isExpanded = expandedCategories[categoryKey];

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
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

  const assignedToMe =
    task.subtasks?.filter((s) => s.assigned_to?.id === currentUser?.id) || [];
  const assignedToTeam =
    task.subtasks?.filter(
      (s) => s.assigned_to && s.assigned_to.id !== currentUser?.id
    ) || [];
  const unassigned = task.subtasks?.filter((s) => !s.assigned_to) || [];

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.is_completed).length || 0;
  const overallProgress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Subtask
        </button>
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
          {renderCategory(
            "Assigned to Team",
            assignedToTeam,
            "assignedToTeam",
            false
          )}
          {renderCategory("Unassigned", unassigned, "unassigned", false)}
        </>
      ) : (
        <div className="text-center py-12">
          <HiOutlineCheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No subtasks yet
          </h3>
          <p className="text-gray-600 mb-4">
            Break down this task into smaller, manageable pieces
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Create First Subtask
          </button>
        </div>
      )}

      <AddSubtaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddNewSubtask}
        assignedUsers={task.assignees || []}
      />
    </div>
  );
};

export default Subtasks;
