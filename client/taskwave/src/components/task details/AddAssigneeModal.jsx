import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import UserSearch from "../new task/UserSearch";

const AddAssigneeModal = ({
  isOpen,
  onClose,
  onSave,
  initialAssignees = [],
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Reset selected users when modal opens/closes or initialAssignees change
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
    }
  }, [isOpen, initialAssignees]);

  if (!isOpen) return null;

  const handleSelectUser = (user) => {
    // Check if user is already in initialAssignees
    const isAlreadyAssigned = initialAssignees.some(
      (assignee) => assignee.id === user.id
    );
    if (isAlreadyAssigned) {
      return; // Don't add if already assigned
    }

    // Check if user is already selected in current session
    const isAlreadySelected = selectedUsers.some(
      (selected) => selected.id === user.id
    );
    if (isAlreadySelected) {
      return; // Don't add if already selected
    }

    setSelectedUsers((prev) => [...prev, user]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSave = async () => {
    if (selectedUsers.length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(selectedUsers); // <-- now calls the API directly
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error saving assignees:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setSelectedUsers([]);
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/16 bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Assignees</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-600 mb-4">
          Search and select team members to assign to this task. You can add
          multiple assignees.
        </p>

        {/* User Search */}
        <UserSearch
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onRemoveUser={handleRemoveUser}
          placeholder="Search by email or username..."
          disabled={isSaving}
          // Pass initialAssignees to UserSearch so it can filter them out
          excludeUsers={initialAssignees}
        />

        {/* Selected count */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {selectedUsers.length} new assignee
              {selectedUsers.length > 1 ? "s" : ""} selected
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || selectedUsers.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isSaving
              ? "Adding..."
              : `Add ${
                  selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssigneeModal;
