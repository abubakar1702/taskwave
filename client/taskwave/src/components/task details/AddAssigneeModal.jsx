import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  addAssignees,
  clearSelectedUsers,
  removeSelectedUser,
} from "../../features/task detail/taskDetailSlice";
import SearchUser from "../global/SearchUser";
import UserSearch from "../new task/UserSearch";

const AddAssigneeModal = ({ isOpen, onClose, onAddAssignees }) => {
  const dispatch = useAppDispatch();

  const { selectedUsers, loading, error } = useAppSelector(
    (state) => state.taskDetail
  );
  const { task } = useAppSelector((state) => state.taskDetail);

  const taskId = task?.id;

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!taskId) {
      console.warn("Task ID is missing. Save the task first.");
      return;
    }

    if (selectedUsers.length === 0) {
      onClose();
      return;
    }

    try {
      const result = await dispatch(
        addAssignees({
          taskId,
          assigneeIds: selectedUsers.map((u) => u.id),
        })
      ).unwrap();

      if (result) {
        dispatch(clearSelectedUsers());

        if (onAddAssignees) {
          onAddAssignees(selectedUsers);
        }
        onClose();
      }
    } catch (err) {
      console.error("Failed to add assignees:", err);
    }
  };

  const handleClose = () => {
    dispatch(clearSelectedUsers());
    onClose();
  };

  const handleRemoveSelectedUser = (userId) => {
    dispatch(removeSelectedUser(userId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Assignees</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
            disabled={loading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            {typeof error === "string" ? error : "Failed to add assignees"}
          </div>
        )}

        <div className="mb-4">
          <UserSearch disabled={loading} />
        </div>

        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-sm mb-2 text-blue-900">
              {selectedUsers.length} new assignee
              {selectedUsers.length > 1 ? "s" : ""} selected
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-white px-3 py-1 rounded-full text-sm border border-blue-200 shadow-sm"
                >
                  <span className="mr-2 text-gray-700">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`.trim()
                      : user.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedUser(user.id)}
                    className="text-gray-400 hover:text-red-500 ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                    disabled={loading}
                    aria-label={`Remove ${user.username}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || selectedUsers.length === 0 || !taskId}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </span>
            ) : (
              `Add (${selectedUsers.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssigneeModal;
