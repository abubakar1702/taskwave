import React, { useState, useRef, useEffect } from "react";
import {
  HiOutlineDotsHorizontal,
  HiPencilAlt,
  HiTrash,
  HiUserRemove,
} from "react-icons/hi";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const SubtaskActions = ({
  subtask,
  taskCreatorId,
  taskAssignees,
  onEdit,
  onDelete,
  onUnassign,
  onAssign,
}) => {
  const { currentUser } = useCurrentUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (isDropdownOpen) {
      const dropdownElement = dropdownRef.current;
      const buttonElement = buttonRef.current;

      if (!dropdownElement || !buttonElement) return;

      const viewportHeight = window.innerHeight;
      const spaceBelow =
        viewportHeight - buttonElement.getBoundingClientRect().bottom;
      const dropdownHeight = dropdownElement.offsetHeight;

      if (spaceBelow < dropdownHeight + 20) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const getUserDisplayName = (user) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return user.username;
  };

  const renderAvatar = (user, size = "6") => {
    if (!user) return null;
    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";
    return (
      <div
        className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium`}
      >
        {initial}
      </div>
    );
  };

  const assignableUsers = (() => {
    if (taskCreatorId === currentUser?.id) {
      const users = [...taskAssignees, currentUser]
        .filter(Boolean)
        .filter(
          (u, index, self) => self.findIndex((t) => t.id === u.id) === index
        );
      return users.filter((u) => u.id !== subtask.assigned_to?.id);
    } else if (!subtask.assigned_to && currentUser) {
      const isCurrentUserAssignedToParentTask = taskAssignees.some(
        (u) => u.id === currentUser.id
      );
      if (isCurrentUserAssignedToParentTask) {
        return [currentUser];
      }
      return [];
    }
    return [];
  })();

  const canEditOrDelete = taskCreatorId === currentUser?.id;
  const canUnassign = taskCreatorId === currentUser?.id && subtask.assigned_to;

  const showAssigneeActions =
    (canEditOrDelete && taskAssignees.length > 0) || assignableUsers.length > 0;
  const showDropdown = canEditOrDelete || showAssigneeActions || canUnassign;

  if (!showDropdown) {
    return null;
  }

  const dropdownClasses =
    dropdownPosition === "top"
      ? "absolute right-0 bottom-full mb-2"
      : "absolute right-0 top-full mt-2";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <HiOutlineDotsHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>

      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={closeDropdown} />
          <div
            ref={dropdownRef}
            className={`${dropdownClasses} min-w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20`}
          >
            <div className="py-1">
              {canEditOrDelete && (
                <>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      onEdit();
                      closeDropdown();
                    }}
                  >
                    <HiPencilAlt className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    onClick={() => {
                      onDelete();
                      closeDropdown();
                    }}
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
              {canUnassign && (
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-600 hover:bg-gray-50"
                  onClick={() => {
                    onUnassign();
                    closeDropdown();
                  }}
                >
                  <HiUserRemove className="w-4 h-4" />
                  Unassign
                </button>
              )}
              {showAssigneeActions && assignableUsers.length > 0 && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <h1 className="px-3 py-2 text-xs text-gray-500">
                    {subtask.assigned_to ? "Change Assignee" : "Assign to"}
                  </h1>
                  {assignableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onAssign(user.id);
                        closeDropdown();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {renderAvatar(user)}
                      <span>{getUserDisplayName(user)}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubtaskActions;
