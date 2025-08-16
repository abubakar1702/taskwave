import React, { useRef, useState, useEffect } from "react";
import {
  HiOutlineDotsVertical,
  HiPencilAlt,
  HiTrash,
  HiUserRemove,
} from "react-icons/hi";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SubtaskActions = ({
  subtask,
  task,
  currentUser,
  openDropdowns,
  setOpenDropdowns,
  handleAssignSubtask,
  setPatchUrl,
  setPatchBody,
  unassign,
}) => {
  const menuRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const canShowMenu =
    task.creator?.id === currentUser?.id || !subtask.assigned_to;

  useEffect(() => {
    if (openDropdowns[`menu-${subtask.id}`] && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 200;
      setDropdownPosition(spaceBelow < dropdownHeight ? "top" : "bottom");
    }
  }, [openDropdowns, subtask.id]);

  const toggleDropdown = () => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [`menu-${subtask.id}`]: !prev[`menu-${subtask.id}`],
    }));
  };

  const handleDelete = () => {
    setPatchUrl(`${API_BASE_URL}/api/tasks/${task.id}/subtask/${subtask.id}/`);
    setPatchBody({ _delete: true });
    setOpenDropdowns((prev) => ({ ...prev, [`menu-${subtask.id}`]: false }));
  };

  const handleEdit = () => {
    toast.info("Edit subtask feature coming soon");
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
            className={`absolute right-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 ${
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
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-600 hover:bg-gray-50"
                  onClick={() => {
                    unassign(subtask.id);
                    setOpenDropdowns((prev) => ({
                      ...prev,
                      [`menu-${subtask.id}`]: false,
                    }));
                  }}
                >
                  <HiUserRemove className="w-4 h-4" />
                  Unassign
                </button>
              </>
            )}

            {assignableUsers.length > 0 && (
              <div className="border-t border-gray-100" />
            )}
            {assignableUsers.length > 0 && (
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
                    {user.first_name} {user.last_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubtaskActions;
