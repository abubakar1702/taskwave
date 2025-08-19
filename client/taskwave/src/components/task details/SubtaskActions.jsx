import React, { useRef, useState, useEffect } from "react";
import UserInitial from "../auth/UserInitial";
import {
  HiOutlineDotsVertical,
  HiPencilAlt,
  HiTrash,
  HiUserRemove,
} from "react-icons/hi";

const SubtaskActions = ({
  subtask,
  task,
  currentUser,
  openDropdowns,
  setOpenDropdowns,
  handleAssignSubtask,
  onEditClick,
  onDeleteClick,
  onUnassignClick,
}) => {
  const menuRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const canShowMenu =
    task.creator?.id === currentUser?.id || !subtask.assigned_to;

  useEffect(() => {
    if (openDropdowns[`menu-${subtask.id}`] && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setDropdownPosition(
        window.innerHeight - rect.bottom < 200 ? "top" : "bottom"
      );
    }
  }, [openDropdowns, subtask.id]);

  const toggleDropdown = () => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [`menu-${subtask.id}`]: !prev[`menu-${subtask.id}`],
    }));
  };

  const handleDelete = () => {
    onDeleteClick(subtask);
    setOpenDropdowns((prev) => ({ ...prev, [`menu-${subtask.id}`]: false }));
  };

  const handleEdit = () => {
    onEditClick(subtask.id);
    setOpenDropdowns((prev) => ({ ...prev, [`menu-${subtask.id}`]: false }));
  };

  const assignableUsers =
    task.creator?.id === currentUser?.id
      ? [...task.assignees, task.creator].filter(
          (u, index, self) =>
            u && self.findIndex((t) => t.id === u.id) === index
        )
      : subtask.assigned_to
      ? []
      : [currentUser];

  if (!canShowMenu) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleDropdown}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <HiOutlineDotsVertical className="w-5 h-5 text-gray-500" />
      </button>

      {openDropdowns[`menu-${subtask.id}`] && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() =>
              setOpenDropdowns((prev) => ({
                ...prev,
                [`menu-${subtask.id}`]: false,
              }))
            }
          />

          <div
            className={`absolute right-0 min-w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 ${
              dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {task.creator?.id === currentUser?.id && (
              <>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={handleEdit}
                >
                  <HiPencilAlt className="w-4 h-4" />
                  Edit
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                  onClick={handleDelete}
                >
                  <HiTrash className="w-4 h-4" />
                  Delete
                </button>
                {subtask.assigned_to && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-600 hover:bg-gray-50"
                    onClick={() => {
                      onUnassignClick(subtask.id);
                      setOpenDropdowns((prev) => ({
                        ...prev,
                        [`menu-${subtask.id}`]: false,
                      }));
                    }}
                  >
                    <HiUserRemove className="w-4 h-4" />
                    Unassign
                  </button>
                )}
              </>
            )}

            {assignableUsers.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="py-1">
                  <h1 className="px-3 py-2 text-xs text-gray-500">
                    Select Assignee
                  </h1>
                  {assignableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        handleAssignSubtask(subtask.id, user.id);
                        setOpenDropdowns((prev) => ({
                          ...prev,
                          [`menu-${subtask.id}`]: false,
                        }));
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <UserInitial
                          user={user.first_name || user.username}
                          className="w-6 h-6 text-xs"
                        />
                      )}
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubtaskActions;
