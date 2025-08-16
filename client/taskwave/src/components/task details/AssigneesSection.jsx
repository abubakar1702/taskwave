import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import UserInitial from "../auth/UserInitial";
import AddAssigneeModal from "./AddAssigneeModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { HiOutlinePlus } from "react-icons/hi";
import { useApi } from "../../hooks/useApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const AssigneesSection = ({
  assignees,
  taskCreator,
  taskId,
  currentUser,
  onAssigneesUpdate,
  disabled = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestBody, setRequestBody] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [pendingAssignees, setPendingAssignees] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  // Add Assignees
  const {
    data: addedData,
    loading: adding,
    error: addError,
  } = useApi(
    requestBody ? `${API_BASE_URL}/api/task/${taskId}/assignees/` : null,
    "POST",
    requestBody,
    [requestBody]
  );

  useEffect(() => {
    if (addedData && pendingAssignees.length > 0) {
      const updatedAssignees = [...assignees, ...pendingAssignees];
      onAssigneesUpdate(updatedAssignees);
      setIsModalOpen(false);
      setRequestBody(null);
      setPendingAssignees([]);
    }
  }, [addedData, pendingAssignees, assignees, onAssigneesUpdate]);

  const handleAddAssignees = (selectedUsers) => {
    if (!taskId || selectedUsers.length === 0) return;

    setPendingAssignees(selectedUsers);
    const assigneeIds = selectedUsers.map((u) => u.id);
    setRequestBody({ assignees: assigneeIds });
  };

  // Remove Assignee
  const {
    data: removedData,
    loading: removing,
    error: removeError,
  } = useApi(
    deleteRequest
      ? `${API_BASE_URL}/api/task/${taskId}/assignees/${deleteRequest}/remove/`
      : null,
    "DELETE",
    null,
    [deleteRequest]
  );

  useEffect(() => {
    if (removedData && deleteRequest) {
      const updatedAssignees = assignees.filter((a) => a.id !== deleteRequest);
      onAssigneesUpdate(updatedAssignees);
      setDeleteRequest(null);
      setConfirmationModal({ isOpen: false, userId: null, userName: "" });
    }
  }, [removedData, deleteRequest, assignees, onAssigneesUpdate]);

  const handleRemoveAssignee = (userId, userName) => {
    if (!taskId) return;
    setConfirmationModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const confirmRemoveAssignee = () => {
    if (!confirmationModal.userId) return;
    setDeleteRequest(confirmationModal.userId);
  };

  const cancelRemoveAssignee = () => {
    setConfirmationModal({ isOpen: false, userId: null, userName: "" });
  };

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
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm object-cover flex-shrink-0"
        />
      );
    }
    return (
      <UserInitial
        user={user?.first_name}
        className="w-8 h-8 sm:w-10 sm:h-10"
      />
    );
  };

  const getUserDisplayName = (user) =>
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username;

  const isUpdating = adding || removing;
  const error = addError?.message || removeError?.message;

  // console.log("Task ID:",taskId)
  // console.log("Task creator's ID:", taskCreator);
  // console.log("Current User:", currentUser);
  // console.log(taskCreator === currentUser?.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Assignees ({assignees?.length || 0})
        </h3>
        {taskCreator === currentUser && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={disabled || isUpdating || !taskId}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
            ) : (
              <HiOutlinePlus className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">
              {isUpdating ? "Updating..." : "Add Assignees"}
            </span>
            <span className="sm:hidden">
              {isUpdating ? "Updating..." : "Add"}
            </span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!assignees || assignees.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 mb-2">
            <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">No assignees</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Task has not been assigned to anyone yet
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {assignees.map((assignee, index) => (
            <div
              key={assignee.id}
              className={`flex items-center gap-3 py-3 ${
                index === 0 ? "pt-0" : ""
              } ${index === assignees.length - 1 ? "pb-0" : ""}`}
            >
              {renderAvatar(assignee)}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {getUserDisplayName(assignee)}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {assignee.email}
                </p>
              </div>

              {taskCreator === currentUser && (
                <button
                  onClick={() =>
                    handleRemoveAssignee(
                      assignee.id,
                      getUserDisplayName(assignee)
                    )
                  }
                  disabled={disabled || isUpdating || !taskId}
                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove assignee"
                >
                  <IoCloseOutline className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AddAssigneeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingAssignees([]);
        }}
        onSave={handleAddAssignees}
        initialAssignees={assignees || []}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title="Remove Assignee"
        message={`Are you sure you want to remove "${confirmationModal.userName}" from this task? All the user's subtask(s) will be unassigned.`}
        onConfirm={confirmRemoveAssignee}
        onCancel={cancelRemoveAssignee}
      />
    </div>
  );
};

export default AssigneesSection;
