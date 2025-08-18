import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { FiFileText } from "react-icons/fi";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const AddSubtaskModal = ({ isOpen, onClose, onAdd, assignedUsers }) => {
  const { currentUser } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const titleCharCount = title.length;

  const handleSubmit = (e, closeAfter = true) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedUser =
      assignedUsers.find((u) => u.id === assigneeId) ||
      (currentUser?.id === assigneeId ? currentUser : null);

    onAdd({
      title: title.trim(),
      assigned_to: selectedUser ? selectedUser.id : null,
    });

    setTitle("");
    setAssigneeId("");

    if (closeAfter) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Subtask
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-4">
          <div className="relative">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtask Title
              </label>
              <p
                className={`mt-1 text-sm ${
                  titleCharCount > 200 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {titleCharCount} / 200
              </p>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subtask title"
              autoFocus
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <FiFileText className="absolute left-3 top-12 -translate-y-1/2 text-gray-300 w-5 h-5" />
          </div>

          {/* Assignee Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To (optional)
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
            >
              <option value="">Unassigned</option>
              {currentUser && (
                <option value={currentUser.id}>
                  {currentUser.first_name || currentUser.last_name
                    ? `${currentUser.first_name || ""} ${
                        currentUser.last_name || ""
                      } - (${currentUser.email})`
                    : currentUser.username}
                </option>
              )}
              {assignedUsers
                .filter((user) => user.id !== currentUser?.id)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name || user.last_name
                      ? `${user.first_name || ""} ${user.last_name || ""} - (${
                          user.email
                        })`
                      : user.username}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 bg-gradient-to-r bg-sky-700 text-white rounded-lg hover:from-sky-700 hover:to-sky-800 transition-colors"
            >
              Add Subtask
            </button>

            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="px-4 py-2 bg-gradient-to-r bg-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors"
            >
              Add & Continue Adding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubtaskModal;
